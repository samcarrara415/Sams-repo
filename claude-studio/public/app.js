'use strict';

// ===========================================================================
// Claude Studio — front-end
// ===========================================================================

const $ = (sel) => document.querySelector(sel);
const state = {
  authed: false,
  mode: null,
  models: [],
  project: null,      // { id, name, files, messages }
  activeFile: null,
  openFiles: [],
  editor: null,
  monacoReady: false,
  saveTimer: null,
};

const EXT_LANG = {
  html: 'html', htm: 'html', css: 'css', js: 'javascript', mjs: 'javascript',
  json: 'json', ts: 'typescript', md: 'markdown', svg: 'xml', xml: 'xml', txt: 'plaintext',
};
function langOf(path) {
  const ext = path.split('.').pop().toLowerCase();
  return EXT_LANG[ext] || 'plaintext';
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function boot() {
  setupLoginUI();
  bootMonaco();
  const status = await api('/api/auth/status');
  state.models = status.models;
  populateModels(status.model);
  if (status.authed) {
    onAuthed(status);
  } else {
    $('#login').classList.remove('hidden');
  }
}

function bootMonaco() {
  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });
  require(['vs/editor/editor.main'], () => {
    state.editor = monaco.editor.create($('#editor'), {
      value: '',
      language: 'html',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      scrollBeyondLastLine: false,
    });
    state.editor.onDidChangeModelContent(() => {
      if (!state.activeFile || !state.project) return;
      state.project.files[state.activeFile] = state.editor.getValue();
      scheduleSave(state.activeFile);
    });
    state.monacoReady = true;
    if (state.project) openFile(state.activeFile);
  });
}

// ---------------------------------------------------------------------------
// Login
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

  $('#btn-authorize').onclick = async () => {
    loginError('');
    try {
      const { authUrl } = await api('/api/auth/claude/start', { method: 'POST' });
      window.open(authUrl, '_blank', 'noopener');
      $('#claude-code').focus();
    } catch (e) { loginError(e.message); }
  };

  $('#claude-code').oninput = (e) => {
    $('#btn-connect').disabled = e.target.value.trim().length < 4;
  };

  $('#btn-connect').onclick = async () => {
    loginError('');
    const code = $('#claude-code').value.trim();
    $('#btn-connect').disabled = true;
    try {
      await api('/api/auth/claude/finish', { method: 'POST', body: JSON.stringify({ code }) });
      const status = await api('/api/auth/status');
      onAuthed(status);
    } catch (e) {
      loginError(e.message);
      $('#btn-connect').disabled = false;
    }
  };

  $('#btn-apikey').onclick = async () => {
    loginError('');
    const apiKey = $('#api-key').value.trim();
    try {
      await api('/api/auth/apikey', { method: 'POST', body: JSON.stringify({ apiKey }) });
      const status = await api('/api/auth/status');
      onAuthed(status);
    } catch (e) { loginError(e.message); }
  };
}

function loginError(msg) {
  const el = $('#login-error');
  if (!msg) return el.classList.add('hidden');
  el.textContent = msg;
  el.classList.remove('hidden');
}

async function onAuthed(status) {
  state.authed = true;
  state.mode = status.mode;
  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#auth-badge').textContent = status.mode === 'oauth' ? 'Claude subscription' : 'API key';
  setupAppUI();
  await loadProjects(true);
}

// ---------------------------------------------------------------------------
// App shell
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
  $('#btn-logout').onclick = async () => { await api('/api/auth/logout', { method: 'POST' }); location.reload(); };
  $('#btn-new-project').onclick = () => createProject();
  $('#btn-refresh').onclick = refreshPreview;
  $('#btn-open').onclick = () => { if (state.project) window.open(`/preview/${state.project.id}/index.html`, '_blank'); };
  $('#chat-form').onsubmit = onChatSubmit;
  $('#chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChatSubmit(e); }
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
async function loadProjects(selectFirst) {
  const { projects } = await api('/api/projects');
  renderProjectList(projects);
  if (selectFirst) {
    if (projects.length) selectProject(projects[0].id);
    else await createProject();
  }
}

function renderProjectList(projects) {
  const ul = $('#project-list');
  ul.innerHTML = '';
  projects.forEach((p) => {
    const li = document.createElement('li');
    li.textContent = '📦 ' + p.name;
    li.title = p.name;
    if (state.project && p.id === state.project.id) li.classList.add('active');
    li.onclick = () => selectProject(p.id);
    ul.appendChild(li);
  });
}

async function createProject() {
  const { project } = await api('/api/projects', { method: 'POST', body: JSON.stringify({ name: 'Untitled App' }) });
  await loadProjectData(project);
  await loadProjects(false);
}

async function selectProject(id) {
  const { project } = await api('/api/projects/' + id);
  await loadProjectData(project);
  const { projects } = await api('/api/projects');
  renderProjectList(projects);
}

async function loadProjectData(project) {
  state.project = project;
  $('#project-name').textContent = project.name;
  state.openFiles = [];
  state.activeFile = null;
  renderFileList();
  renderChat(project.messages);
  // open index.html by default
  const first = project.files['index.html'] ? 'index.html' : Object.keys(project.files)[0];
  if (first) openFile(first);
  refreshPreview();
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
    li.onclick = () => openFile(path);
    ul.appendChild(li);
  });
}

function openFile(path) {
  if (!state.project || state.project.files[path] === undefined) return;
  state.activeFile = path;
  if (!state.openFiles.includes(path)) state.openFiles.push(path);
  renderTabs();
  renderFileList();
  if (state.monacoReady) {
    const model = state.editor.getModel();
    monaco.editor.setModelLanguage(model, langOf(path));
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

function scheduleSave(path) {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(async () => {
    try {
      await api(`/api/projects/${state.project.id}/file`, {
        method: 'PUT',
        body: JSON.stringify({ path, content: state.project.files[path] }),
      });
      refreshPreview();
    } catch (e) { /* transient */ }
  }, 600);
}

function refreshPreview() {
  if (!state.project) return;
  $('#preview').src = `/preview/${state.project.id}/index.html?t=${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Chat / AI generation
// ---------------------------------------------------------------------------
function renderChat(messages) {
  const chat = $('#chat');
  chat.innerHTML = '';
  if (!messages || !messages.length) {
    const hint = document.createElement('div');
    hint.className = 'empty-hint';
    hint.innerHTML = 'Describe an app and Claude will build it.<br/>Try: <i>“a pomodoro timer with a circular progress ring”</i>';
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
        // Only show the human-readable part (hide raw <file> blocks while streaming).
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
  // Reopen the current file if it still exists, else prefer index.html.
  const focus = (changed && changed.includes(state.activeFile) && state.activeFile) ||
    (files['index.html'] ? 'index.html' : Object.keys(files)[0]);
  if (focus) openFile(focus);
  refreshPreview();
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
      if (data) {
        try { onEvent(event, JSON.parse(data)); } catch { /* ignore */ }
      }
    }
  }
}

boot().catch((e) => { console.error(e); loginError(e.message); $('#login').classList.remove('hidden'); });
