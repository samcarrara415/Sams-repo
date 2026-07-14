'use strict';

// ===========================================================================
// Claude Studio (static edition) — 100% client-side, hostable on GitHub Pages.
//
// Differences from the server edition:
//   * AI runs from the browser using YOUR Anthropic API key (stored locally),
//     because the Claude *subscription* OAuth login can't work on static hosting.
//   * C++ runs in-browser via JSCPP (a C++ interpreter) instead of real g++.
//   * Projects are saved to localStorage; previews are built with iframe srcdoc.
// ===========================================================================

const $ = (s) => document.querySelector(s);

const LS = { key: 'cs_apikey', projects: 'cs_projects', model: 'cs_model', active: 'cs_active' };
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODELS = [
  { id: 'claude-sonnet-5', label: 'Sonnet 5 — balanced (default)' },
  { id: 'claude-opus-4-8', label: 'Opus 4.8 — most capable' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — fastest' },
];

const WEB_INSTRUCTIONS = `You are the code-generation engine for Claude Studio, an in-browser app builder.
Given a user request and the current project files, produce a complete, working front-end web app.
Rules:
- Static app running in a sandboxed iframe. Only HTML, CSS, and JavaScript.
- The entry point MUST be "index.html". Split into files (index.html, style.css, script.js) and reference them by RELATIVE path.
- You may load libraries from public CDNs. No build step, no server, no npm.
- Always output the FULL, FINAL content of every file you create or change. Only include files that changed or are new.
Output format — a short plain-text explanation (1-3 sentences), then each file wrapped exactly like:
<file path="index.html">
...full contents...
</file>
Do not put anything after the last </file> tag. No markdown code fences.`;

const CPP_INSTRUCTIONS = `You are the code-generation engine for Claude Studio, an in-browser C++ IDE that runs code with the JSCPP interpreter. JSCPP supports only a SUBSET of C++ — follow these constraints exactly so the program runs:
- ONE source file named "main.cpp" containing int main().
- Put "using namespace std;" after the includes and DO NOT use the "std::" prefix anywhere (JSCPP's parser rejects qualified names like std::cout — write cout, cin, endl).
- Only these headers are available: <iostream>, <cmath>, <cstdio>, <cstdlib>, <cstring>, <ctime>, <cctype>, <iomanip>.
- NO STL containers or std::string. Do not use <vector>, <string>, <map>, <set>, <algorithm>. Use fixed-size C arrays and char[] C-strings (with <cstring>) instead.
- Read input from cin (the user supplies stdin in the console).
- Keep to standard control flow, functions, recursion, arrays, pointers, structs, and math.
- Always output the FULL, FINAL content of main.cpp.
Output format — a short plain-text explanation (1-3 sentences), then:
<file path="main.cpp">
...full contents...
</file>
Do not put anything after the last </file> tag. No markdown code fences.`;

const state = {
  apiKey: null,
  model: MODELS[0].id,
  projects: {},        // id -> project
  project: null,
  activeFile: null,
  openFiles: [],
  editor: null,
  editorReady: false,
  isMonaco: false,
  saveTimer: null,
  mview: 'code',
  running: false,
};

const EXT_LANG = {
  html: 'html', htm: 'html', css: 'css', js: 'javascript', json: 'json', ts: 'typescript',
  md: 'markdown', svg: 'xml', xml: 'xml', txt: 'plaintext',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'cpp', hh: 'cpp', c: 'cpp',
};
const langOf = (p) => EXT_LANG[p.split('.').pop().toLowerCase()] || 'plaintext';
const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'p' + Date.now() + Math.random().toString(16).slice(2));

// ---------------------------------------------------------------------------
// Persistence (localStorage)
// ---------------------------------------------------------------------------
function loadStore() {
  state.apiKey = localStorage.getItem(LS.key) || null;
  state.model = localStorage.getItem(LS.model) || MODELS[0].id;
  try { state.projects = JSON.parse(localStorage.getItem(LS.projects) || '{}'); }
  catch { state.projects = {}; }
}
function persistProjects() { localStorage.setItem(LS.projects, JSON.stringify(state.projects)); }

function defaultFiles() {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main>
    <h1>Your app starts here</h1>
    <p>Describe what you want to build in the chat, and Claude will write it.</p>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
    'style.css': `:root { color-scheme: light dark; }
body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; text-align: center; }
`,
    'script.js': `console.log('App loaded');\n`,
  };
}
function defaultCppFiles() {
  // Written in JSCPP's dialect: "using namespace std;", no "std::" prefix.
  return {
    'main.cpp': `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;

    // Try me: read two numbers from stdin and add them.
    // int a, b;
    // cin >> a >> b;
    // cout << "sum = " << (a + b) << endl;

    return 0;
}
`,
  };
}

function createProject(kind) {
  const isCpp = kind === 'cpp';
  const id = uid();
  const project = {
    id, kind: isCpp ? 'cpp' : 'web',
    name: isCpp ? 'Untitled C++' : 'Untitled App',
    files: isCpp ? defaultCppFiles() : defaultFiles(),
    messages: [], updatedAt: Date.now(),
  };
  state.projects[id] = project;
  persistProjects();
  loadProjectData(project);
  renderProjectList();
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
function boot() {
  loadStore();
  setupLoginUI();
  setupAppUI();
  populateModels();
  $('#app').classList.remove('hidden');
  setMobileView('code');
  initEditor();
  applyAuthUI();

  const ids = Object.keys(state.projects);
  if (ids.length) {
    const last = localStorage.getItem(LS.active);
    loadProjectData(state.projects[last] || state.projects[ids[0]]);
  } else {
    createProject('web');
  }
  renderProjectList();
  // No API key needed to just code: open straight into the IDE. The AI chat is
  // optional and only prompts for a key if/when it's actually used.
}

// ---------------------------------------------------------------------------
// Editor (Monaco with textarea fallback)
// ---------------------------------------------------------------------------
function attachEditorChange() {
  state.editor.onChange(() => {
    if (!state.activeFile || !state.project) return;
    state.project.files[state.activeFile] = state.editor.getValue();
    scheduleSave();
  });
}
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
      getValue: () => ed.getValue(), setValue: (v) => ed.setValue(v),
      getModel: () => ed.getModel(), onChange: (cb) => ed.onDidChangeModelContent(cb), layout: () => ed.layout(),
    };
    state.isMonaco = true; state.editorReady = true;
    attachEditorChange();
    if (state.project && state.activeFile) openFile(state.activeFile);
  };
  if (typeof require === 'undefined') return initFallbackEditor();
  try {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });
    require(['vs/editor/editor.main'], finishMonaco, initFallbackEditor);
    setTimeout(() => { if (!state.editorReady) initFallbackEditor(); }, 8000);
  } catch { initFallbackEditor(); }
}
function initFallbackEditor() {
  if (state.editorReady) return;
  const host = $('#editor'); host.innerHTML = '';
  const ta = document.createElement('textarea');
  ta.className = 'editor-fallback'; ta.spellcheck = false;
  host.appendChild(ta);
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (state.project && state.project.kind === 'cpp') runCpp(); }
  });
  state.editor = { getValue: () => ta.value, setValue: (v) => { ta.value = v; }, onChange: (cb) => ta.addEventListener('input', cb), layout: () => {} };
  state.isMonaco = false; state.editorReady = true;
  attachEditorChange();
  if (state.project && state.activeFile) openFile(state.activeFile);
}

// ---------------------------------------------------------------------------
// Auth (API key)
// ---------------------------------------------------------------------------
function setupLoginUI() {
  $('#login-close').onclick = () => $('#login').classList.add('hidden');
  $('#btn-apikey').onclick = saveKey;
  $('#api-key').addEventListener('keydown', (e) => { if (e.key === 'Enter') saveKey(); });
}
function saveKey() {
  const key = $('#api-key').value.trim();
  if (!/^sk-/.test(key)) { loginError('That does not look like an Anthropic API key (starts with sk-).'); return; }
  state.apiKey = key;
  localStorage.setItem(LS.key, key);
  loginError('');
  $('#login').classList.add('hidden');
  applyAuthUI();
}
function openLogin() { loginError(''); $('#api-key').value = state.apiKey || ''; $('#login').classList.remove('hidden'); }
function applyAuthUI() {
  const badge = $('#auth-badge');
  if (state.apiKey) {
    badge.textContent = 'API key'; badge.classList.remove('hidden');
    $('#btn-logout').classList.remove('hidden'); $('#btn-login').classList.add('hidden');
  } else {
    badge.classList.add('hidden'); $('#btn-logout').classList.add('hidden'); $('#btn-login').classList.remove('hidden');
  }
}
function loginError(msg) {
  const el = $('#login-error');
  if (!msg) return el.classList.add('hidden');
  el.textContent = msg; el.classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// App shell wiring
// ---------------------------------------------------------------------------
function populateModels() {
  const sel = $('#model-select'); sel.innerHTML = '';
  MODELS.forEach((m) => {
    const o = document.createElement('option'); o.value = m.id; o.textContent = m.label;
    if (m.id === state.model) o.selected = true; sel.appendChild(o);
  });
}
function setupAppUI() {
  $('#model-select').onchange = (e) => { state.model = e.target.value; localStorage.setItem(LS.model, state.model); };
  $('#btn-login').onclick = openLogin;
  $('#btn-logout').onclick = () => { state.apiKey = null; localStorage.removeItem(LS.key); applyAuthUI(); };

  $('#btn-new-project').onclick = (e) => { e.stopPropagation(); $('#new-menu').classList.toggle('hidden'); };
  document.querySelectorAll('#new-menu button').forEach((b) => {
    b.onclick = () => { $('#new-menu').classList.add('hidden'); createProject(b.dataset.kind); };
  });
  document.addEventListener('click', () => $('#new-menu').classList.add('hidden'));

  $('#btn-new-file').onclick = newFile;
  $('#btn-refresh').onclick = refreshPreview;
  $('#btn-run').onclick = runCpp;
  $('#btn-clear-console').onclick = () => { $('#cpp-output').innerHTML = '<span class="console-dim">Press ▶ Run to compile &amp; execute in your browser (JSCPP).</span>'; };

  $('#chat-form').onsubmit = onChatSubmit;
  $('#chat-input').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChatSubmit(e); } });

  document.querySelectorAll('.mobile-nav button').forEach((b) => { b.onclick = () => setMobileView(b.dataset.mview); });
  $('#btn-menu').onclick = () => setMobileView('files');
}
function setMobileView(v) {
  state.mview = v; document.body.dataset.mview = v;
  document.querySelectorAll('.mobile-nav button').forEach((b) => b.classList.toggle('active', b.dataset.mview === v));
  if (v === 'code' && state.editor) setTimeout(() => state.editor.layout(), 0);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
function renderProjectList() {
  const ul = $('#project-list'); ul.innerHTML = '';
  Object.values(state.projects).sort((a, b) => b.updatedAt - a.updatedAt).forEach((p) => {
    const li = document.createElement('li');
    li.textContent = (p.kind === 'cpp' ? '🔧 ' : '🌐 ') + p.name;
    li.title = p.name;
    if (state.project && p.id === state.project.id) li.classList.add('active');
    li.onclick = () => { loadProjectData(p); renderProjectList(); };
    ul.appendChild(li);
  });
}
function loadProjectData(project) {
  state.project = project;
  localStorage.setItem(LS.active, project.id);
  $('#project-name').textContent = project.name;
  state.openFiles = []; state.activeFile = null;

  const isCpp = project.kind === 'cpp';
  document.body.classList.toggle('kind-cpp', isCpp);
  document.body.classList.toggle('kind-web', !isCpp);
  $('#mnav-run-label').textContent = isCpp ? 'Run' : 'Preview';
  $('#cpp-output').innerHTML = '<span class="console-dim">Press ▶ Run to compile &amp; execute in your browser (JSCPP).</span>';

  renderFileList();
  renderChat(project.messages);

  const entry = project.files['main.cpp'] ? 'main.cpp' : project.files['index.html'] ? 'index.html' : Object.keys(project.files)[0];
  if (entry) openFile(entry);
  if (!isCpp) refreshPreview();
}

// ---------------------------------------------------------------------------
// Files + editor
// ---------------------------------------------------------------------------
function renderFileList() {
  const ul = $('#file-list'); ul.innerHTML = '';
  Object.keys(state.project.files).sort().forEach((path) => {
    const li = document.createElement('li');
    li.textContent = '📄 ' + path; li.title = path;
    if (path === state.activeFile) li.classList.add('active');
    li.onclick = () => { openFile(path); setMobileView('code'); };
    ul.appendChild(li);
  });
}
function openFile(path) {
  if (!state.project || state.project.files[path] === undefined) return;
  state.activeFile = path;
  if (!state.openFiles.includes(path)) state.openFiles.push(path);
  renderTabs(); renderFileList();
  if (state.editorReady) {
    if (state.isMonaco) monaco.editor.setModelLanguage(state.editor.getModel(), langOf(path));
    state.editor.setValue(state.project.files[path]);
  }
}
function renderTabs() {
  const bar = $('#tabbar'); bar.innerHTML = '';
  state.openFiles.forEach((path) => {
    const el = document.createElement('div');
    el.className = 'tab-item' + (path === state.activeFile ? ' active' : '');
    el.textContent = path; el.onclick = () => openFile(path);
    bar.appendChild(el);
  });
}
function newFile() {
  if (!state.project) return;
  const suggested = state.project.kind === 'cpp' ? 'helper.cpp' : 'new.js';
  const name = (prompt('New file name:', suggested) || '').trim();
  if (!name) return;
  if (state.project.files[name] !== undefined) { openFile(name); return; }
  state.project.files[name] = '';
  state.project.updatedAt = Date.now(); persistProjects();
  renderFileList(); openFile(name);
}
function scheduleSave() {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => {
    if (!state.project) return;
    state.project.updatedAt = Date.now(); persistProjects();
    if (state.project.kind !== 'cpp') refreshPreview();
  }, 500);
}

// Build a single self-contained HTML doc by inlining sibling css/js files.
function buildPreviewDoc(files) {
  let html = files['index.html'] || '<!doctype html><meta charset="utf-8"><body></body>';
  html = html.replace(/<link\b[^>]*\bhref=["']([^"']+\.css)["'][^>]*>/gi, (m, href) => {
    const key = href.replace(/^\.?\//, '');
    return files[key] !== undefined ? `<style>\n${files[key]}\n</style>` : m;
  });
  html = html.replace(/<script\b[^>]*\bsrc=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi, (m, src) => {
    const key = src.replace(/^\.?\//, '');
    return files[key] !== undefined ? `<script>\n${files[key]}\n<\/script>` : m;
  });
  return html;
}
function refreshPreview() {
  if (!state.project) return;
  $('#preview').srcdoc = buildPreviewDoc(state.project.files);
}

// ---------------------------------------------------------------------------
// C++ run (JSCPP, in-browser)
// ---------------------------------------------------------------------------
function runCppLocal(code, stdin) {
  return new Promise((resolve) => {
    if (typeof JSCPP === 'undefined') return resolve({ error: 'C++ runtime not loaded (offline or CDN blocked).' });
    let out = '';
    const config = { stdio: { write: (s) => { out += s; } }, unsigned_overflow: 'warn', maxTimeout: 5000, maxExecutionSteps: 5_000_000 };
    try { const exitCode = JSCPP.run(code, stdin || '', config); resolve({ output: out, exitCode }); }
    catch (e) { resolve({ output: out, error: String((e && e.message) || e) }); }
  });
}
async function runCpp() {
  if (!state.project || state.running || state.project.kind !== 'cpp') return;
  setMobileView('preview');
  const out = $('#cpp-output');
  out.innerHTML = '<span class="console-dim">Running…</span>';
  state.running = true; $('#btn-run').disabled = true;
  // ensure latest editor content is captured
  if (state.activeFile) { state.project.files[state.activeFile] = state.editor.getValue(); persistProjects(); }
  const code = state.project.files['main.cpp'] || '';
  const res = await runCppLocal(code, $('#cpp-stdin').value);
  let html = '';
  if (res.output) html += escapeHtml(res.output);
  if (res.error) html += `${res.output ? '\n' : ''}<span class="out-err">⚠ ${escapeHtml(res.error)}</span>`;
  if (!res.output && !res.error) html += '<span class="console-dim">(no output)</span>';
  const ok = !res.error;
  html += `<span class="out-meta ${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✗'} ${ok ? 'Program exited with code ' + (res.exitCode ?? 0) : 'Runtime/parse error'}</span>`;
  out.innerHTML = html; out.scrollTop = 0;
  state.running = false; $('#btn-run').disabled = false;
}

// ---------------------------------------------------------------------------
// Chat / AI generation (direct to Anthropic)
// ---------------------------------------------------------------------------
function renderChat(messages) {
  const chat = $('#chat'); chat.innerHTML = '';
  if (!messages || !messages.length) {
    const cpp = state.project && state.project.kind === 'cpp';
    const hint = document.createElement('div'); hint.className = 'empty-hint';
    hint.innerHTML = cpp
      ? 'Describe a C++ program and Claude will write it — then press ▶ Run.<br/>Try: <i>“print the first 20 Fibonacci numbers”</i>'
      : 'Describe an app and Claude will build it.<br/>Try: <i>“a pomodoro timer with a circular progress ring”</i>';
    chat.appendChild(hint); return;
  }
  messages.forEach((m) => addBubble(m.role, m.content));
}
function addBubble(role, text) {
  const chat = $('#chat');
  const hint = chat.querySelector('.empty-hint'); if (hint) hint.remove();
  const wrap = document.createElement('div'); wrap.className = 'msg ' + role;
  wrap.innerHTML = `<div class="who">${role === 'user' ? 'You' : 'Claude'}</div><div class="bubble"></div>`;
  wrap.querySelector('.bubble').textContent = text;
  chat.appendChild(wrap); chat.scrollTop = chat.scrollHeight;
  return wrap.querySelector('.bubble');
}

function buildUserTurn(project, message) {
  const list = Object.entries(project.files).map(([p, c]) => `<file path="${p}">\n${c}\n</file>`).join('\n');
  return `Current project files:\n${list || '(empty project)'}\n\n---\n\nRequest: ${message}`;
}
function parseFiles(text) {
  const files = {}; const re = /<file\s+path="([^"]+)">\n?([\s\S]*?)\n?<\/file>/g; let m;
  while ((m = re.exec(text)) !== null) { const p = m[1].trim(); if (p) files[p] = m[2]; }
  return files;
}
function parseExplanation(text) { const i = text.indexOf('<file '); return (i === -1 ? text : text.slice(0, i)).trim(); }

async function onChatSubmit(e) {
  e.preventDefault();
  const input = $('#chat-input'); const message = input.value.trim();
  if (!message || !state.project) return;
  if (!state.apiKey) { openLogin(); return; }

  input.value = ''; $('#chat-send').disabled = true;
  addBubble('user', message);
  const bubble = addBubble('assistant', ''); bubble.classList.add('streaming');
  let acc = '';

  const system = state.project.kind === 'cpp' ? CPP_INSTRUCTIONS : WEB_INSTRUCTIONS;
  const messages = [];
  for (const m of state.project.messages) messages.push({ role: m.role, content: m.content });
  messages.push({ role: 'user', content: buildUserTurn(state.project, message) });

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': state.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: state.model, max_tokens: 16000, system, messages, stream: true }),
    });
    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => '');
      let msg = `API error ${res.status}`;
      try { msg = JSON.parse(errText).error.message || msg; } catch {}
      if (res.status === 401) msg = 'Your API key was rejected. Click “Add API key” to fix it.';
      throw new Error(msg);
    }

    await consumeSSE(res.body, (evt) => {
      if (evt.type === 'content_block_delta' && evt.delta && evt.delta.type === 'text_delta') {
        acc += evt.delta.text;
        const cut = acc.indexOf('<file ');
        bubble.textContent = (cut === -1 ? acc : acc.slice(0, cut)).trim() || 'Writing code…';
        $('#chat').scrollTop = $('#chat').scrollHeight;
      }
    });

    bubble.classList.remove('streaming');
    const explanation = parseExplanation(acc);
    const changed = parseFiles(acc);
    const changedPaths = Object.keys(changed);
    bubble.textContent = explanation || 'Done.';
    if (changedPaths.length) {
      const chips = document.createElement('div');
      changedPaths.forEach((f) => { const c = document.createElement('span'); c.className = 'chip'; c.textContent = f; chips.appendChild(c); });
      bubble.parentElement.appendChild(chips);
    }

    for (const [p, c] of Object.entries(changed)) state.project.files[p] = c;
    state.project.messages.push({ role: 'user', content: message });
    state.project.messages.push({ role: 'assistant', content: explanation + (changedPaths.length ? `\n\n(updated files: ${changedPaths.join(', ')})` : '') });
    state.project.updatedAt = Date.now(); persistProjects();

    renderFileList();
    const focus = (changedPaths.includes(state.activeFile) && state.activeFile) ||
      (state.project.files['main.cpp'] ? 'main.cpp' : state.project.files['index.html'] ? 'index.html' : Object.keys(state.project.files)[0]);
    if (focus) openFile(focus);
    if (state.project.kind === 'cpp') setMobileView('code'); else refreshPreview();
  } catch (err) {
    bubble.classList.remove('streaming');
    bubble.textContent = '⚠ ' + err.message;
  } finally {
    $('#chat-send').disabled = false;
  }
}

// Parse Anthropic's SSE stream (event JSON per "data:" line).
async function consumeSSE(body, onEvent) {
  const reader = body.getReader(); const decoder = new TextDecoder(); let buf = '';
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += decoder.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') continue;
      try { onEvent(JSON.parse(payload)); } catch {}
    }
  }
}

// Register service worker for installability, and auto-reload once when a new
// version takes control so deploys show up without a manual hard-refresh.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || !hadController) return; // don't reload on first-ever install
    refreshing = true;
    window.location.reload();
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

boot();
