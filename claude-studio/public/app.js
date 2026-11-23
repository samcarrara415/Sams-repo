'use strict';

const $ = (sel) => document.querySelector(sel);
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const MONACO_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs';
const SAVE_DELAY_MS = 500;

const state = {
  settings: { hasKey: false, serverKey: false, model: null, models: [] },
  project: null,
  openFiles: [],
  activeFile: null,
  editor: null,
  pendingSaves: new Map(), // path -> { timer, project }
  generating: false,
  running: false,
};

const EXT_LANG = {
  html: 'html', htm: 'html', css: 'css', js: 'javascript', mjs: 'javascript',
  json: 'json', ts: 'typescript', md: 'markdown', svg: 'xml', xml: 'xml',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'cpp', hh: 'cpp', hxx: 'cpp', ipp: 'cpp', tpp: 'cpp', inl: 'cpp',
};
const langOf = (path) => EXT_LANG[path.split('.').pop().toLowerCase()] || 'plaintext';

// Mirrors the server's check so obvious mistakes don't need a round trip.
function validFileName(name) {
  const parts = name.replace(/\\/g, '/').split('/');
  return name.length <= 200 && !name.startsWith('/') && !/[\0<>"]/.test(name)
    && parts.every((p) => p && p !== '.' && p !== '..' && p !== '__proto__');
}

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not reach the Claude Studio server.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data;
}

// ---------------------------------------------------------------------------
// Editor: Monaco from the CDN, or a plain textarea if it can't load.
// ---------------------------------------------------------------------------

function createMonacoEditor(host) {
  const ed = monaco.editor.create(host, {
    theme: 'vs-dark', automaticLayout: true, minimap: { enabled: false },
    fontSize: 13, scrollBeyondLastLine: false, tabSize: 2,
  });
  ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCpp);
  // One model per file keeps undo history per file; view state keeps the
  // cursor and scroll position when switching tabs.
  const models = new Map();
  const viewStates = new Map();
  let shownPath = null;
  let silent = false;
  return {
    show(path, content) {
      if (shownPath && models.has(shownPath)) viewStates.set(shownPath, ed.saveViewState());
      let model = models.get(path);
      if (!model) {
        model = monaco.editor.createModel(content, langOf(path));
        models.set(path, model);
      } else if (model.getValue() !== content) {
        silent = true;
        model.setValue(content);
        silent = false;
      }
      ed.setModel(model);
      if (viewStates.has(path)) ed.restoreViewState(viewStates.get(path));
      shownPath = path;
    },
    clear() { ed.setModel(null); shownPath = null; },
    forget(path) {
      const model = models.get(path);
      if (model) { model.dispose(); models.delete(path); }
      viewStates.delete(path);
      if (shownPath === path) shownPath = null;
    },
    reset() {
      ed.setModel(null);
      models.forEach((m) => m.dispose());
      models.clear();
      viewStates.clear();
      shownPath = null;
    },
    getValue: () => ed.getValue(),
    onChange(cb) { ed.onDidChangeModelContent(() => { if (!silent) cb(); }); },
    setReadOnly(ro) { ed.updateOptions({ readOnly: ro }); },
    layout: () => ed.layout(),
  };
}

function createTextareaEditor(host) {
  host.innerHTML = '';
  const ta = document.createElement('textarea');
  ta.className = 'editor-fallback';
  ta.spellcheck = false;
  ta.wrap = 'off';
  ta.setAttribute('autocapitalize', 'off');
  ta.setAttribute('autocomplete', 'off');
  ta.setAttribute('aria-label', 'Code editor');
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCpp(); }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input'));
    }
  });
  host.appendChild(ta);
  return {
    show(path, content) { ta.value = content; ta.disabled = false; },
    clear() { ta.value = ''; ta.disabled = true; },
    forget() {},
    reset() {},
    getValue: () => ta.value,
    onChange(cb) { ta.addEventListener('input', cb); },
    setReadOnly(ro) { ta.readOnly = ro; },
    layout() {},
  };
}

function initEditor() {
  return new Promise((resolve) => {
    let settled = false;
    // Whichever editor is ready first wins; the other is never created.
    const use = (create) => {
      if (settled) return;
      settled = true;
      state.editor = create($('#editor'));
      state.editor.onChange(onEditorChange);
      resolve();
    };
    const fallback = () => use(createTextareaEditor);
    // Monaco has no real touch support (no selection handles, unreliable
    // mobile keyboards), so touch-first devices get the plain editor.
    if (typeof window.require !== 'function' || matchMedia('(pointer: coarse)').matches) return fallback();
    window.require.config({ paths: { vs: MONACO_BASE } });
    window.require(['vs/editor/editor.main'], () => use(createMonacoEditor), fallback);
    setTimeout(fallback, 8000);
  });
}

function onEditorChange() {
  const { project, activeFile } = state;
  if (!project || !activeFile) return;
  project.files[activeFile] = state.editor.getValue();
  scheduleSave(project, activeFile);
}

// ---------------------------------------------------------------------------
// Autosave
// ---------------------------------------------------------------------------

function setSaveStatus(text, isError) {
  const el = $('#save-status');
  el.textContent = text;
  el.classList.toggle('error', !!isError);
}

function scheduleSave(project, path) {
  const pending = state.pendingSaves.get(path);
  if (pending) clearTimeout(pending.timer);
  setSaveStatus('Unsaved changes');
  const timer = setTimeout(() => saveFile(project, path), SAVE_DELAY_MS);
  state.pendingSaves.set(path, { timer, project });
}

async function saveFile(project, path) {
  state.pendingSaves.delete(path);
  if (!has(project.files, path)) return;
  setSaveStatus('Saving...');
  try {
    await api(`/projects/${project.id}/files`, { method: 'PUT', body: { path, content: project.files[path] } });
    if (!state.pendingSaves.size) setSaveStatus('Saved');
    if (project === state.project && project.kind === 'web') refreshPreview();
  } catch (e) {
    setSaveStatus(`Not saved: ${e.message}`, true);
  }
}

// Writes any pending edits now. Called before anything that reads files on
// the server (run, chat) or changes which files exist.
function flushSaves() {
  const saves = [...state.pendingSaves.entries()].map(([path, { timer, project }]) => {
    clearTimeout(timer);
    return saveFile(project, path);
  });
  return Promise.all(saves);
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

function ask({ title, text = '', value = '', okLabel = 'OK', danger = false, input = true }) {
  const dialog = $('#ask-dialog');
  $('#ask-title').textContent = title;
  $('#ask-text').textContent = text;
  $('#ask-text').hidden = !text;
  const field = $('#ask-input');
  field.hidden = !input;
  field.value = value;
  const ok = $('#ask-ok');
  ok.textContent = okLabel;
  ok.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
  dialog.returnValue = '';
  dialog.showModal();
  if (input) { field.focus(); field.select(); }
  return new Promise((resolve) => {
    dialog.addEventListener('close', () => {
      if (dialog.returnValue !== 'ok') return resolve(null);
      resolve(input ? field.value.trim() || null : true);
    }, { once: true });
  });
}

function setupDialogs() {
  document.querySelectorAll('dialog [data-close]').forEach((b) => {
    b.onclick = () => b.closest('dialog').close();
  });
  $('#ask-form').onsubmit = (e) => { e.preventDefault(); $('#ask-dialog').close('ok'); };

  $('#key-form').onsubmit = async (e) => {
    e.preventDefault();
    const apiKey = $('#api-key').value.trim();
    if (!/^sk-ant-\S+$/.test(apiKey)) return showKeyError('Anthropic API keys start with "sk-ant-".');
    const btn = $('#btn-save-key');
    btn.disabled = true;
    btn.textContent = 'Checking...';
    showKeyError('');
    try {
      await api('/settings/key', { method: 'POST', body: { apiKey } });
      $('#api-key').value = '';
      $('#key-dialog').close();
      await loadSettings();
    } catch (err) {
      showKeyError(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save key';
    }
  };

  $('#btn-remove-key').onclick = async () => {
    await api('/settings/key', { method: 'DELETE' }).catch(() => {});
    $('#key-dialog').close();
    await loadSettings();
  };
}

function showKeyError(msg) {
  const el = $('#key-error');
  el.textContent = msg;
  el.hidden = !msg;
}

function openKeyDialog(message) {
  const { hasKey, serverKey } = state.settings;
  $('#key-intro').textContent = hasKey
    ? 'A key is saved for this session. Paste a new one to replace it.'
    : serverKey
      ? 'This server has a default key. You can use your own instead.'
      : 'Chat needs an Anthropic API key. Editing and running code work without one.';
  $('#btn-remove-key').hidden = !hasKey;
  showKeyError(message || '');
  $('#key-dialog').showModal();
  $('#api-key').focus();
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

async function loadSettings() {
  state.settings = await api('/settings');
  const { hasKey, serverKey, model, models } = state.settings;
  $('#key-label').textContent = hasKey ? 'Key saved' : serverKey ? 'Server key' : 'Add API key';
  $('#btn-key').classList.toggle('needs-key', !hasKey && !serverKey);

  const sel = $('#model-select');
  sel.innerHTML = '';
  models.forEach((m) => sel.add(new Option(m.label, m.id, false, m.id === model)));
}

const canChat = () => state.settings.hasKey || state.settings.serverKey;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function setMobileView(view) {
  document.body.dataset.mview = view;
  document.querySelectorAll('.mobile-nav button').forEach((b) =>
    b.classList.toggle('active', b.dataset.mview === view));
  if (view === 'code' && state.editor) requestAnimationFrame(() => state.editor.layout());
}

function setupLayout() {
  document.querySelectorAll('.mobile-nav button').forEach((b) => {
    b.onclick = () => setMobileView(b.dataset.mview);
  });

  const menu = $('#new-menu');
  const toggle = $('#btn-new-project');
  const setMenu = (open) => { menu.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); };
  toggle.onclick = (e) => { e.stopPropagation(); setMenu(menu.hidden); };
  menu.querySelectorAll('button').forEach((b) => {
    b.onclick = () => { setMenu(false); createProject(b.dataset.kind); };
  });
  document.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  $('#btn-key').onclick = () => openKeyDialog();
  $('#model-select').onchange = async (e) => {
    try {
      await api('/settings/model', { method: 'POST', body: { model: e.target.value } });
      state.settings.model = e.target.value;
    } catch (err) {
      e.target.value = state.settings.model;
      addNotice(err.message);
    }
  };
  $('#btn-new-file').onclick = newFile;
  $('#btn-refresh').onclick = refreshPreview;
  $('#btn-open').onclick = () => {
    if (state.project) window.open(`/preview/${state.project.id}/index.html`, '_blank', 'noopener');
  };
  $('#btn-run').onclick = runCpp;
  $('#btn-clear-console').onclick = clearConsole;
  $('#chat-form').onsubmit = (e) => { e.preventDefault(); sendChat(); };
  $('#chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendChat(); }
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

async function refreshProjectList() {
  const { projects } = await api('/projects');
  const ul = $('#project-list');
  ul.innerHTML = '';
  projects.forEach((p) => {
    const li = document.createElement('li');
    li.className = state.project && p.id === state.project.id ? 'active' : '';
    li.innerHTML = `
      <button class="row-main" title="${escapeHtml(p.name)}">
        ${icon(p.kind === 'cpp' ? 'terminal' : 'web')}<span class="row-label">${escapeHtml(p.name)}</span>
      </button>
      <span class="row-actions">
        <button class="icon-btn" data-act="rename" title="Rename project">${icon('pencil')}</button>
        <button class="icon-btn" data-act="delete" title="Delete project">${icon('trash')}</button>
      </span>`;
    li.querySelector('.row-main').onclick = () => selectProject(p.id);
    li.querySelector('[data-act="rename"]').onclick = () => renameProject(p);
    li.querySelector('[data-act="delete"]').onclick = () => deleteProject(p);
    ul.appendChild(li);
  });
  return projects;
}

async function createProject(kind) {
  const { project } = await api('/projects', { method: 'POST', body: { kind } });
  await showProject(project);
  setMobileView('code');
}

async function selectProject(id) {
  if (state.project && state.project.id === id) { setMobileView('code'); return; }
  const { project } = await api('/projects/' + id);
  await showProject(project);
  setMobileView('code');
}

async function renameProject(p) {
  const name = await ask({ title: 'Rename project', value: p.name, okLabel: 'Rename' });
  if (!name || name === p.name) return;
  await api(`/projects/${p.id}`, { method: 'PATCH', body: { name } });
  if (state.project && state.project.id === p.id) {
    state.project.name = name;
    $('#project-name').textContent = name;
  }
  await refreshProjectList();
}

async function deleteProject(p) {
  const ok = await ask({
    title: 'Delete project',
    text: `Delete "${p.name}" and all of its files? This cannot be undone.`,
    okLabel: 'Delete', danger: true, input: false,
  });
  if (!ok) return;
  await flushSaves();
  await api(`/projects/${p.id}`, { method: 'DELETE' });
  if (state.project && state.project.id === p.id) {
    state.project = null;
    const remaining = await refreshProjectList();
    if (remaining.length) await selectProject(remaining[0].id);
    else await createProject('web');
  } else {
    await refreshProjectList();
  }
}

async function showProject(project) {
  await flushSaves();
  state.project = project;
  state.openFiles = [];
  state.activeFile = null;
  state.editor.reset();
  setSaveStatus('');

  const isCpp = project.kind === 'cpp';
  document.body.classList.toggle('kind-cpp', isCpp);
  document.body.classList.toggle('kind-web', !isCpp);
  $('#project-name').textContent = project.name;
  $('#mnav-output-label').textContent = isCpp ? 'Console' : 'Preview';
  $('#mnav-output-icon').innerHTML = `<use href="#i-${isCpp ? 'terminal' : 'web'}"/>`;
  $('#chat-input').placeholder = isCpp
    ? 'Describe a C++ program, or a change to this one'
    : 'Describe a web app, or a change to this one';
  clearConsole();

  renderChat();
  const entry = defaultFile(project.files);
  if (entry) openFile(entry);
  else renderFiles();
  if (!isCpp) refreshPreview();
  await refreshProjectList();
}

function defaultFile(files) {
  if (has(files, 'main.cpp')) return 'main.cpp';
  if (has(files, 'index.html')) return 'index.html';
  return Object.keys(files).sort()[0] || null;
}

// ---------------------------------------------------------------------------
// Files and tabs
// ---------------------------------------------------------------------------

function renderFiles() {
  const ul = $('#file-list');
  ul.innerHTML = '';
  Object.keys(state.project.files).sort().forEach((path) => {
    const li = document.createElement('li');
    li.className = path === state.activeFile ? 'active' : '';
    li.innerHTML = `
      <button class="row-main" title="${escapeHtml(path)}">
        ${icon('file')}<span class="row-label">${escapeHtml(path)}</span>
      </button>
      <span class="row-actions">
        <button class="icon-btn" data-act="rename" title="Rename file">${icon('pencil')}</button>
        <button class="icon-btn" data-act="delete" title="Delete file">${icon('trash')}</button>
      </span>`;
    li.querySelector('.row-main').onclick = () => { openFile(path); setMobileView('code'); };
    li.querySelector('[data-act="rename"]').onclick = () => renameFile(path);
    li.querySelector('[data-act="delete"]').onclick = () => deleteFile(path);
    ul.appendChild(li);
  });
  if (!ul.children.length) ul.innerHTML = '<li class="list-empty">No files</li>';
}

function renderTabs() {
  const bar = $('#tabbar');
  bar.innerHTML = '';
  state.openFiles.forEach((path) => {
    const tab = document.createElement('div');
    tab.className = 'tab' + (path === state.activeFile ? ' active' : '');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(path === state.activeFile));
    tab.innerHTML = `<button class="tab-label" title="${escapeHtml(path)}">${escapeHtml(path.split('/').pop())}</button>
      <button class="tab-close" title="Close ${escapeHtml(path)}">${icon('close')}</button>`;
    tab.querySelector('.tab-label').onclick = () => openFile(path);
    tab.querySelector('.tab-close').onclick = () => closeTab(path);
    tab.addEventListener('auxclick', (e) => { if (e.button === 1) closeTab(path); });
    bar.appendChild(tab);
  });
}

function openFile(path) {
  if (!state.project || !has(state.project.files, path)) return;
  state.activeFile = path;
  if (!state.openFiles.includes(path)) state.openFiles.push(path);
  state.editor.show(path, state.project.files[path]);
  renderTabs();
  renderFiles();
}

function closeTab(path) {
  const i = state.openFiles.indexOf(path);
  if (i === -1) return;
  state.openFiles.splice(i, 1);
  if (state.activeFile === path) {
    const next = state.openFiles[i] || state.openFiles[i - 1];
    if (next) return openFile(next);
    state.activeFile = null;
    state.editor.clear();
  }
  renderTabs();
  renderFiles();
}

async function newFile() {
  if (!state.project) return;
  const project = state.project;
  const name = await ask({
    title: 'New file',
    value: project.kind === 'cpp' ? 'util.hpp' : 'app.js',
    okLabel: 'Create',
  });
  if (!name) return;
  if (!validFileName(name)) return addNotice(`"${name}" is not a valid file name.`);
  if (has(project.files, name)) return openFile(name);
  try {
    const { path } = await api(`/projects/${project.id}/files`, { method: 'PUT', body: { path: name, content: '' } });
    project.files[path] = '';
    openFile(path);
    setMobileView('code');
  } catch (e) {
    addNotice(e.message);
  }
}

async function renameFile(from) {
  const project = state.project;
  const to = await ask({ title: 'Rename file', value: from, okLabel: 'Rename' });
  if (!to || to === from) return;
  if (!validFileName(to)) return addNotice(`"${to}" is not a valid file name.`);
  try {
    await flushSaves();
    const { path } = await api(`/projects/${project.id}/files/rename`, { method: 'POST', body: { from, to } });
    project.files[path] = project.files[from];
    delete project.files[from];
    state.editor.forget(from);
    state.openFiles = state.openFiles.map((p) => (p === from ? path : p));
    if (state.activeFile === from) openFile(path);
    else { renderTabs(); renderFiles(); }
    if (project.kind === 'web') refreshPreview();
  } catch (e) {
    addNotice(e.message);
  }
}

async function deleteFile(path) {
  const project = state.project;
  const ok = await ask({ title: 'Delete file', text: `Delete ${path}?`, okLabel: 'Delete', danger: true, input: false });
  if (!ok) return;
  const pending = state.pendingSaves.get(path);
  if (pending) { clearTimeout(pending.timer); state.pendingSaves.delete(path); }
  try {
    await api(`/projects/${project.id}/files`, { method: 'DELETE', body: { path } });
    delete project.files[path];
    state.editor.forget(path);
    closeTab(path);
    renderFiles();
    if (project.kind === 'web') refreshPreview();
  } catch (e) {
    addNotice(e.message);
  }
}

function refreshPreview() {
  if (!state.project || state.project.kind !== 'web') return;
  $('#preview').src = `/preview/${state.project.id}/index.html?v=${Date.now()}`;
}

// ---------------------------------------------------------------------------
// C++ console
// ---------------------------------------------------------------------------

const SIGNAL_NAMES = {
  SIGSEGV: 'segmentation fault',
  SIGABRT: 'aborted',
  SIGFPE: 'arithmetic error',
  SIGILL: 'illegal instruction',
  SIGBUS: 'bus error',
};

function clearConsole() {
  $('#cpp-output').innerHTML = '<span class="dim">Press Run or Ctrl+Enter to compile with g++ and run the program.</span>';
}

async function runCpp() {
  const project = state.project;
  if (!project || project.kind !== 'cpp' || state.running) return;
  setMobileView('output');
  const out = $('#cpp-output');
  out.innerHTML = '<span class="dim">Compiling...</span>';
  state.running = true;
  $('#btn-run').disabled = true;
  try {
    await flushSaves();
    const result = await api(`/projects/${project.id}/run`, { method: 'POST', body: { stdin: $('#cpp-stdin').value } });
    if (project === state.project) renderRunResult(result);
  } catch (e) {
    out.innerHTML = `<span class="err">${escapeHtml(e.message)}</span>`;
  } finally {
    state.running = false;
    $('#btn-run').disabled = false;
  }
}

function renderRunResult(r) {
  let html = '';
  let status;
  if (r.stage === 'compile') {
    html = `<span class="err">${escapeHtml(r.stderr)}</span>`;
    status = 'Compilation failed';
  } else {
    if (r.stdout) html += escapeHtml(r.stdout);
    if (r.stderr) html += `${r.stdout && !r.stdout.endsWith('\n') ? '\n' : ''}<span class="err">${escapeHtml(r.stderr)}</span>`;
    if (!r.stdout && !r.stderr) html = '<span class="dim">(no output)</span>';
    if (r.timedOut) status = `Stopped: exceeded the ${r.timeLimitSec}s time limit`;
    else if (r.truncated) status = `Stopped: output exceeded ${r.outputLimitKb} KB`;
    else if (r.signal) status = `Terminated by ${r.signal}${SIGNAL_NAMES[r.signal] ? ` (${SIGNAL_NAMES[r.signal]})` : ''}`;
    else status = `Exited with code ${r.exitCode}`;
  }
  html += `<span class="status ${r.ok ? 'ok' : 'bad'}">${escapeHtml(status)}</span>`;
  const out = $('#cpp-output');
  out.innerHTML = html;
  out.scrollTop = 0;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

function renderChat() {
  const chat = $('#chat');
  chat.innerHTML = '';
  const { messages, kind } = state.project;
  if (messages.length) {
    messages.forEach((m) => addMessage(m.role, m.content, m.files));
    return;
  }
  const example = kind === 'cpp'
    ? 'A program that reads numbers from stdin and prints their mean, median and mode'
    : 'A pomodoro timer with start, pause and reset, and a ring that shows time left';
  chat.innerHTML = `<div class="chat-empty">
    <p>Describe ${kind === 'cpp' ? 'a C++ program' : 'a web app'} and Claude will write the files. Follow-up messages edit the current project.</p>
    <button class="example">${escapeHtml(example)}</button>
  </div>`;
  chat.querySelector('.example').onclick = () => {
    $('#chat-input').value = example;
    $('#chat-input').focus();
  };
}

function addMessage(role, text, files) {
  const chat = $('#chat');
  const empty = chat.querySelector('.chat-empty');
  if (empty) empty.remove();
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.innerHTML = `<div class="msg-who">${role === 'user' ? 'You' : 'Claude'}</div><div class="msg-body"></div>`;
  el.querySelector('.msg-body').textContent = text;
  if (files && files.length) addFileList(el, files);
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

function addFileList(el, files) {
  const div = document.createElement('div');
  div.className = 'msg-files';
  div.textContent = 'Files written: ' + files.join(', ');
  el.appendChild(div);
}

function addNotice(text) {
  const el = addMessage('assistant', text);
  el.classList.add('error');
  return el;
}

// While streaming, show the explanation and which files are being written.
function describeProgress(acc) {
  const cut = acc.indexOf('<file ');
  const explanation = (cut === -1 ? acc : acc.slice(0, cut)).trim();
  const paths = [...acc.matchAll(/<file\s+path="([^"]+)">/g)].map((m) => m[1]);
  const lines = [explanation || 'Thinking...'];
  if (paths.length) lines.push(`Writing ${paths.join(', ')}...`);
  return lines.join('\n\n');
}

async function sendChat() {
  const input = $('#chat-input');
  const message = input.value.trim();
  const project = state.project;
  if (!message || !project || state.generating) return;
  if (!canChat()) return openKeyDialog();

  state.generating = true;
  $('#chat-send').disabled = true;
  state.editor.setReadOnly(true);
  input.value = '';
  addMessage('user', message);
  const reply = addMessage('assistant', 'Thinking...');
  const body = reply.querySelector('.msg-body');
  reply.classList.add('streaming');
  let acc = '';

  const fail = (msg) => {
    reply.classList.add('error');
    body.textContent = msg;
  };

  try {
    await flushSaves();
    const res = await fetch(`/api/projects/${project.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      fail(data.error || `Request failed (${res.status}).`);
      if (data.needsKey) openKeyDialog(data.error);
      return;
    }
    let finished = false;
    await readEvents(res.body, (event, data) => {
      if (event === 'delta') {
        acc += data.text;
        body.textContent = describeProgress(acc);
        $('#chat').scrollTop = $('#chat').scrollHeight;
      } else if (event === 'done') {
        finished = true;
        body.textContent = data.explanation;
        if (data.changedFiles.length) addFileList(reply, data.changedFiles);
        if (project === state.project) applyGeneratedFiles(data.files, data.changedFiles);
        refreshProjectList();
      } else if (event === 'error') {
        finished = true;
        fail(data.error);
        if (data.needsKey) loadSettings().then(() => openKeyDialog(data.error));
      }
    });
    if (!finished) fail('The connection closed before the response finished.');
  } catch {
    fail('Lost the connection to the Claude Studio server.');
  } finally {
    reply.classList.remove('streaming');
    state.generating = false;
    $('#chat-send').disabled = false;
    state.editor.setReadOnly(false);
  }
}

function applyGeneratedFiles(files, changed) {
  const project = state.project;
  project.files = files;
  // Open every changed file in a tab so the edits are easy to find.
  state.openFiles = state.openFiles.filter((p) => has(files, p));
  changed.forEach((p) => { if (!state.openFiles.includes(p)) state.openFiles.push(p); });
  const focus = (changed.includes(state.activeFile) && state.activeFile)
    || changed.find((p) => p === 'main.cpp' || p === 'index.html')
    || changed[0]
    || (has(files, state.activeFile) && state.activeFile)
    || defaultFile(files);
  if (focus) openFile(focus);
  else renderFiles();
  if (project.kind === 'web') refreshPreview();
}

// Minimal Server-Sent Events parser for a fetch() body.
async function readEvents(stream, onEvent) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let sep;
    while ((sep = buf.indexOf('\n\n')) !== -1) {
      const raw = buf.slice(0, sep);
      buf = buf.slice(sep + 2);
      let event = 'message';
      let data = '';
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (data) onEvent(event, JSON.parse(data));
    }
  }
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function boot() {
  setupLayout();
  setupDialogs();
  setMobileView('code');
  await Promise.all([initEditor(), loadSettings()]);
  const projects = await refreshProjectList();
  if (projects.length) await selectProject(projects[0].id);
  else await createProject('web');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

boot().catch((err) => {
  document.body.insertAdjacentHTML('afterbegin',
    `<div class="boot-error">Claude Studio failed to start: ${escapeHtml(err.message)}</div>`);
});
