'use strict';

// ===========================================================================
// Claude Studio — front-end
// ===========================================================================

const $ = (sel) => document.querySelector(sel);
const state = {
  authed: false,
  mode: null,
  models: [],
  project: null,      // { id, name, kind, files, messages }
  activeFile: null,
  openFiles: [],
  editor: null,       // { getValue, setValue, getModel?, onChange, layout }
  editorReady: false,
  isMonaco: false,
  saveTimer: null,
  mview: 'code',
  running: false,
};

const EXT_LANG = {
  html: 'html', htm: 'html', css: 'css', js: 'javascript', mjs: 'javascript',
  json: 'json', ts: 'typescript', md: 'markdown', svg: 'xml', xml: 'xml', txt: 'plaintext',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'cpp', hh: 'cpp', c: 'cpp',
};
function langOf(path) {
  const ext = path.split('.').pop().toLowerCase();
  return EXT_LANG[ext] || 'plaintext';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function boot() {
  setupLoginUI();
  setupAppUI();
  // Reveal the app shell immediately — it must not depend on the editor CDN.
  $('#app').classList.remove('hidden');
  setMobileView('code');
  initEditor();

  const status = await api('/api/auth/status');
  state.models = status.models;
  populateModels(status.model);
  applyAuthUI(status);
  await loadProjects(true);
}

// Wire the editor's change handler once, whichever backend we end up using.
function attachEditorChange() {
  state.editor.onChange(() => {
    if (!state.activeFile || !state.project) return;
    state.project.files[state.activeFile] = state.editor.getValue();
    scheduleSave(state.activeFile);
  });
}

// Try Monaco (from CDN); fall back to a plain textarea if it can't load, so
// the editor works offline / on blocked networks / on constrained mobile.
function initEditor() {
  const finishMonaco = () => {
    const ed = monaco.editor.create($('#editor'), {
      value: '', language: 'html', theme: 'vs-dark', automaticLayout: true,
      minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false,
    });
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (state.project && state.project.kind === 'cpp') runCpp();
    });
    state.editor = {
      getValue: () => ed.getValue(),
      setValue: (v) => ed.setValue(v),
      getModel: () => ed.getModel(),
      onChange: (cb) => ed.onDidChangeModelContent(cb),
      layout: () => ed.layout(),
    };
    state.isMonaco = true;
    state.editorReady = true;
    attachEditorChange();
    if (state.project && state.activeFile) openFile(state.activeFile);
  };

  if (typeof require === 'undefined') return initFallbackEditor();
  try {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });
    require(['vs/editor/editor.main'], finishMonaco, initFallbackEditor);
    // Safety net: if Monaco hasn't loaded shortly, use the fallback.
    setTimeout(() => { if (!state.editorReady) initFallbackEditor(); }, 8000);
  } catch (e) {
    initFallbackEditor();
  }
}

function initFallbackEditor() {
  if (state.editorReady) return;
  const host = $('#editor');
  host.innerHTML = '';
  const ta = document.createElement('textarea');
  ta.className = 'editor-fallback';
  ta.spellcheck = false;
  host.appendChild(ta);
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (state.project && state.project.kind === 'cpp') runCpp();
    }
  });
  state.editor = {
    getValue: () => ta.value,
    setValue: (v) => { ta.value = v; },
    onChange: (cb) => ta.addEventListener('input', cb),
    layout: () => {},
  };
  state.isMonaco = false;
  state.editorReady = true;
  attachEditorChange();
  if (state.project && state.activeFile) openFile(state.activeFile);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
function setupLoginUI() {
  document.querySelectorAll('.tab').forEach((t) => {
    t.onclick = () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
      $(`[data-panel="${t.dataset.tab}"]`).classList.remove('hidden');
    };
  });

  $('#login-close').onclick = () => $('#login').classList.add('hidden');

  $('#btn-authorize').onclick = async () => {
    loginError('');
    try {
      const { authUrl } = await api('/api/auth/claude/start', { method: 'POST' });
      window.open(authUrl, '_blank', 'noopener');
      $('#claude-code').focus();
    } catch (e) { loginError(e.message); }
  };

  $('#claude-code').oninput = (e) => { $('#btn-connect').disabled = e.target.value.trim().length < 4; };

  $('#btn-connect').onclick = async () => {
    loginError('');
    const code = $('#claude-code').value.trim();
    $('#btn-connect').disabled = true;
    try {
      await api('/api/auth/claude/finish', { method: 'POST', body: JSON.stringify({ code }) });
      await afterLogin();
    } catch (e) { loginError(e.message); $('#btn-connect').disabled = false; }
  };

  $('#btn-apikey').onclick = async () => {
    loginError('');
    try {
      await api('/api/auth/apikey', { method: 'POST', body: JSON.stringify({ apiKey: $('#api-key').value.trim() }) });
      await afterLogin();
    } catch (e) { loginError(e.message); }
  };
}

async function afterLogin() {
  const status = await api('/api/auth/status');
  applyAuthUI(status);
  $('#login').classList.add('hidden');
}

function openLogin() {
  loginError('');
  $('#login').classList.remove('hidden');
}

function applyAuthUI(status) {
  state.authed = !!status.authed;
  state.mode = status.mode;
  const badge = $('#auth-badge');
  if (status.authed) {
    badge.textContent = status.mode === 'oauth' ? 'Claude subscription' : 'API key';
    badge.classList.remove('hidden');
    $('#btn-logout').classList.remove('hidden');
    $('#btn-login').classList.add('hidden');
  } else {
    badge.classList.add('hidden');
    $('#btn-logout').classList.add('hidden');
    $('#btn-login').classList.remove('hidden');
  }
}

function loginError(msg) {
  const el = $('#login-error');
  if (!msg) return el.classList.add('hidden');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// App shell wiring
// ---------------------------------------------------------------------------
function populateModels(selected) {
  const sel = $('#model-select');
  sel.innerHTML = '';
  state.models.forEach((m) => {
    const o = document.createElement('option');
    o.value = m.id; o.textContent = m.label;
    if (m.id === selected) o.selected = true;
    sel.appendChild(o);
  });
}

function setupAppUI() {
  $('#model-select').onchange = (e) =>
    api('/api/settings/model', { method: 'POST', body: JSON.stringify({ model: e.target.value }) }).catch(() => {});
  $('#btn-login').onclick = openLogin;
  $('#btn-logout').onclick = async () => { await api('/api/auth/logout', { method: 'POST' }); applyAuthUI({ authed: false }); };

  // New-project menu (web vs C++).
  $('#btn-new-project').onclick = (e) => { e.stopPropagation(); $('#new-menu').classList.toggle('hidden'); };
  document.querySelectorAll('#new-menu button').forEach((b) => {
    b.onclick = () => { $('#new-menu').classList.add('hidden'); createProject(b.dataset.kind); };
  });
  document.addEventListener('click', () => $('#new-menu').classList.add('hidden'));

  $('#btn-new-file').onclick = newFile;
  $('#btn-refresh').onclick = refreshPreview;
  $('#btn-open').onclick = () => { if (state.project) window.open(`/preview/${state.project.id}/index.html`, '_blank'); };
  $('#btn-run').onclick = runCpp;
  $('#btn-clear-console').onclick = () => { $('#cpp-output').innerHTML = '<span class="console-dim">Press ▶ Run to compile and execute with g++.</span>'; };

  $('#chat-form').onsubmit = onChatSubmit;
  $('#chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChatSubmit(e); }
  });

  // Mobile nav.
  document.querySelectorAll('.mobile-nav button').forEach((b) => {
    b.onclick = () => setMobileView(b.dataset.mview);
  });
  $('#btn-menu').onclick = () => setMobileView('files');
}

function setMobileView(v) {
  state.mview = v;
  document.body.dataset.mview = v;
  document.querySelectorAll('.mobile-nav button').forEach((b) =>
    b.classList.toggle('active', b.dataset.mview === v));
  if (v === 'code' && state.editor) setTimeout(() => state.editor.layout(), 0);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
async function loadProjects(selectFirst) {
  const { projects } = await api('/api/projects');
  renderProjectList(projects);
  if (selectFirst) {
    if (projects.length) selectProject(projects[0].id);
    else await createProject('web');
  }
}

function renderProjectList(projects) {
  const ul = $('#project-list');
  ul.innerHTML = '';
  projects.forEach((p) => {
    const li = document.createElement('li');
    li.textContent = (p.kind === 'cpp' ? '🔧 ' : '🌐 ') + p.name;
    li.title = p.name;
    if (state.project && p.id === state.project.id) li.classList.add('active');
    li.onclick = () => selectProject(p.id);
    ul.appendChild(li);
  });
}

async function createProject(kind) {
  const name = kind === 'cpp' ? 'Untitled C++' : 'Untitled App';
  const { project } = await api('/api/projects', { method: 'POST', body: JSON.stringify({ name, kind }) });
  await loadProjectData(project);
  await refreshProjectList();
}

async function selectProject(id) {
  const { project } = await api('/api/projects/' + id);
  await loadProjectData(project);
  await refreshProjectList();
}

async function refreshProjectList() {
  const { projects } = await api('/api/projects');
  renderProjectList(projects);
}

async function loadProjectData(project) {
  state.project = project;
  $('#project-name').textContent = project.name;
  state.openFiles = [];
  state.activeFile = null;

  const isCpp = project.kind === 'cpp';
  document.body.classList.toggle('kind-cpp', isCpp);
  document.body.classList.toggle('kind-web', !isCpp);
  $('#mnav-run-label').textContent = isCpp ? 'Run' : 'Preview';
  $('#cpp-output').innerHTML = '<span class="console-dim">Press ▶ Run to compile and execute with g++.</span>';

  renderFileList();
  renderChat(project.messages);

  const entry = project.files['main.cpp'] ? 'main.cpp'
    : project.files['index.html'] ? 'index.html'
    : Object.keys(project.files)[0];
  if (entry) openFile(entry);
  if (!isCpp) refreshPreview();
}

// ---------------------------------------------------------------------------
// Files + editor
// ---------------------------------------------------------------------------
function renderFileList() {
  const ul = $('#file-list');
  ul.innerHTML = '';
  Object.keys(state.project.files).sort().forEach((path) => {
    const li = document.createElement('li');
    li.textContent = '📄 ' + path;
    li.title = path;
    if (path === state.activeFile) li.classList.add('active');
    li.onclick = () => { openFile(path); setMobileView('code'); };
    ul.appendChild(li);
  });
}

function openFile(path) {
  if (!state.project || state.project.files[path] === undefined) return;
  state.activeFile = path;
  if (!state.openFiles.includes(path)) state.openFiles.push(path);
  renderTabs();
  renderFileList();
  if (state.editorReady) {
    if (state.isMonaco) monaco.editor.setModelLanguage(state.editor.getModel(), langOf(path));
    state.editor.setValue(state.project.files[path]);
  }
}

function renderTabs() {
  const bar = $('#tabbar');
  bar.innerHTML = '';
  state.openFiles.forEach((path) => {
    const el = document.createElement('div');
    el.className = 'tab-item' + (path === state.activeFile ? ' active' : '');
    el.textContent = path;
    el.onclick = () => openFile(path);
    bar.appendChild(el);
  });
}

async function newFile() {
  if (!state.project) return;
  const suggested = state.project.kind === 'cpp' ? 'helper.cpp' : 'new.js';
  const name = (prompt('New file name:', suggested) || '').trim();
  if (!name) return;
  if (state.project.files[name] !== undefined) { openFile(name); return; }
  state.project.files[name] = '';
  await api(`/api/projects/${state.project.id}/file`, { method: 'PUT', body: JSON.stringify({ path: name, content: '' }) }).catch(() => {});
  renderFileList();
  openFile(name);
}

function scheduleSave(path) {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => saveFile(path).then(() => {
    if (state.project && state.project.kind !== 'cpp') refreshPreview();
  }), 600);
}

async function saveFile(path) {
  if (!state.project) return;
  try {
    await api(`/api/projects/${state.project.id}/file`, {
      method: 'PUT',
      body: JSON.stringify({ path, content: state.project.files[path] }),
    });
  } catch (e) { /* transient */ }
}

// Ensure the server has the latest content of the active file (before Run).
async function flushActiveFile() {
  if (!state.activeFile) return;
  clearTimeout(state.saveTimer);
  await saveFile(state.activeFile);
}

function refreshPreview() {
  if (!state.project) return;
  $('#preview').src = `/preview/${state.project.id}/index.html?t=${Date.now()}`;
}

// ---------------------------------------------------------------------------
// C++ run
// ---------------------------------------------------------------------------
async function runCpp() {
  if (!state.project || state.running) return;
  if (state.project.kind !== 'cpp') return;
  setMobileView('preview'); // show the console on mobile
  const out = $('#cpp-output');
  out.innerHTML = '<span class="console-dim">Compiling &amp; running…</span>';
  state.running = true;
  $('#btn-run').disabled = true;
  try {
    await flushActiveFile();
    const res = await fetch(`/api/projects/${state.project.id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stdin: $('#cpp-stdin').value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Run failed');
    renderConsole(data);
  } catch (e) {
    out.innerHTML = `<span class="out-err">${escapeHtml(e.message)}</span>`;
  } finally {
    state.running = false;
    $('#btn-run').disabled = false;
  }
}

function renderConsole(data) {
  const out = $('#cpp-output');
  let html = '';
  if (!data.ok && data.stage === 'compile') {
    html += `<span class="out-err">${escapeHtml(data.stderr || 'Compilation failed.')}</span>`;
    html += `<span class="out-meta bad">✗ Compilation failed${data.exitCode != null ? ` (g++ exit ${data.exitCode})` : ''}</span>`;
  } else {
    if (data.stdout) html += escapeHtml(data.stdout);
    if (data.stderr) html += `${data.stdout ? '\n' : ''}<span class="out-err">${escapeHtml(data.stderr)}</span>`;
    if (!data.stdout && !data.stderr) html += '<span class="console-dim">(no output)</span>';
    const ok = !!data.ok;
    const codeStr = data.exitCode != null ? data.exitCode : (data.signal || '?');
    html += `<span class="out-meta ${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✗'} Program exited with code ${codeStr}${data.timedOut ? ' — timed out' : ''}</span>`;
  }
  out.innerHTML = html;
  out.scrollTop = 0;
}

// ---------------------------------------------------------------------------
// Chat / AI generation
// ---------------------------------------------------------------------------
function renderChat(messages) {
  const chat = $('#chat');
  chat.innerHTML = '';
  if (!messages || !messages.length) {
    const cpp = state.project && state.project.kind === 'cpp';
    const hint = document.createElement('div');
    hint.className = 'empty-hint';
    hint.innerHTML = cpp
      ? 'Describe a C++ program and Claude will write it — then press ▶ Run.<br/>Try: <i>“a program that prints the first 20 Fibonacci numbers”</i>'
      : 'Describe an app and Claude will build it.<br/>Try: <i>“a pomodoro timer with a circular progress ring”</i>';
    chat.appendChild(hint);
    return;
  }
  messages.forEach((m) => addBubble(m.role, m.content));
}

function addBubble(role, text) {
  const chat = $('#chat');
  const hint = chat.querySelector('.empty-hint');
  if (hint) hint.remove();
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + role;
  wrap.innerHTML = `<div class="who">${role === 'user' ? 'You' : 'Claude'}</div><div class="bubble"></div>`;
  wrap.querySelector('.bubble').textContent = text;
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
  return wrap.querySelector('.bubble');
}

async function onChatSubmit(e) {
  e.preventDefault();
  const input = $('#chat-input');
  const message = input.value.trim();
  if (!message || !state.project) return;

  if (!state.authed) { openLogin(); return; } // AI needs a login; editing/running don't

  input.value = '';
  $('#chat-send').disabled = true;
  addBubble('user', message);
  const bubble = addBubble('assistant', '');
  bubble.classList.add('streaming');
  let acc = '';

  try {
    const res = await fetch(`/api/projects/${state.project.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed');

    await consumeSSE(res.body, (event, data) => {
      if (event === 'delta') {
        acc += data.text;
        const cut = acc.indexOf('<file ');
        bubble.textContent = (cut === -1 ? acc : acc.slice(0, cut)).trim() || 'Writing code…';
        $('#chat').scrollTop = $('#chat').scrollHeight;
      } else if (event === 'done') {
        bubble.classList.remove('streaming');
        bubble.textContent = data.explanation || 'Done.';
        if (data.changedFiles && data.changedFiles.length) {
          const chips = document.createElement('div');
          data.changedFiles.forEach((f) => {
            const c = document.createElement('span');
            c.className = 'chip'; c.textContent = f; chips.appendChild(c);
          });
          bubble.parentElement.appendChild(chips);
        }
        applyGeneratedFiles(data.files, data.changedFiles);
      } else if (event === 'error') {
        bubble.classList.remove('streaming');
        bubble.textContent = '⚠ ' + data.error;
        if (/log in|login/i.test(data.error)) { applyAuthUI({ authed: false }); }
      }
    });
  } catch (err) {
    bubble.classList.remove('streaming');
    bubble.textContent = '⚠ ' + err.message;
  } finally {
    $('#chat-send').disabled = false;
  }
}

function applyGeneratedFiles(files, changed) {
  if (!files) return;
  state.project.files = files;
  renderFileList();
  const focus = (changed && changed.includes(state.activeFile) && state.activeFile) ||
    (files['main.cpp'] ? 'main.cpp' : files['index.html'] ? 'index.html' : Object.keys(files)[0]);
  if (focus) openFile(focus);
  if (state.project.kind === 'cpp') {
    setMobileView('code');
  } else {
    refreshPreview();
  }
}

// Parse an SSE stream from a fetch ReadableStream.
async function consumeSSE(body, onEvent) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let sep;
    while ((sep = buf.indexOf('\n\n')) !== -1) {
      const raw = buf.slice(0, sep);
      buf = buf.slice(sep + 2);
      let event = 'message', data = '';
      raw.split('\n').forEach((line) => {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      });
      if (data) { try { onEvent(event, JSON.parse(data)); } catch { /* ignore */ } }
    }
  }
}

boot().catch((e) => { console.error(e); loginError(e.message); openLogin(); });
