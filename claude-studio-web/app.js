'use strict';

// mcode: edit C++ in the browser, compile and run it with gcc on Wandbox
// (https://wandbox.org), which accepts cross-origin requests.

const $ = (s) => document.querySelector(s);

// Storage keys predate the mcode name; keep them so saved code survives.
const LS_CODE = 'cpp_playground_code';
const LS_STD = 'cpp_playground_std';
const LS_NAME = 'cpp_playground_name';

const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
const COMPILER = 'gcc-13.2.0';
const STD_LABELS = { 'c++17': 'C++17', 'c++2a': 'C++20', 'c++2b': 'C++23' };
const DEFAULT_STD = 'c++2a';
// Wandbox kills a program after roughly 30 s, so give the whole request a
// little longer than that before giving up on the service.
const REQUEST_TIMEOUT_MS = 60000;
// Wandbox stops a program once it has written this much output.
const OUTPUT_LIMIT = 128 * 1024;

const MONACO_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs';

const STARTER = `#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, world!\\n";

    // Echo lines from the stdin box.
    std::string line;
    while (std::getline(std::cin, line)) {
        std::cout << line << '\\n';
    }
}
`;

const EMPTY_OUTPUT = '<span class="dim">Output appears here.</span>';

// Signals a program can die from, keyed by the shell-style exit status
// (128 + signal number) that Wandbox reports.
const SIGNAL_EXITS = {
  134: 'aborted (SIGABRT)',
  136: 'floating-point exception (SIGFPE)',
  137: 'killed, time or memory limit reached (SIGKILL)',
  139: 'segmentation fault (SIGSEGV)',
};

const state = {
  editor: null,
  ready: false,
  run: null, // { controller, timer } while a request is in flight
  saveTimer: null,
  filename: 'main.cpp',
};

const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const currentStd = () => $('#std').value;
const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------
// Monaco on desktop. On touch devices Monaco doesn't use native text selection,
// so selecting, cutting and pasting are painful; a plain <textarea> keeps the
// iOS selection handles, magnifier and edit menu.
function initEditor(initialValue) {
  if (isTouchDevice()) return initNativeEditor(initialValue);

  const fallback = () => initNativeEditor(initialValue);
  const loader = document.createElement('script');
  loader.src = MONACO_BASE + '/loader.js';
  loader.onerror = fallback;
  loader.onload = () => {
    window.require.config({ paths: { vs: MONACO_BASE } });
    window.require(['vs/editor/editor.main'], () => initMonaco(initialValue), fallback);
  };
  document.head.appendChild(loader);
  // Don't leave the user without an editor on a slow connection.
  setTimeout(() => { if (!state.ready) fallback(); }, 8000);
}

function initMonaco(initialValue) {
  if (state.ready) return; // the native editor already took over
  monaco.editor.defineTheme('mcode', {
    base: 'vs-dark', inherit: true, rules: [],
    colors: {
      'editor.background': '#0e1116',
      'editorGutter.background': '#0e1116',
      'editor.lineHighlightBackground': '#161a21',
      'editor.lineHighlightBorder': '#00000000',
    },
  });
  const ed = monaco.editor.create($('#editor'), {
    value: initialValue, language: 'cpp', theme: 'mcode', automaticLayout: true,
    minimap: { enabled: false }, fontSize: 14, tabSize: 4, scrollBeyondLastLine: false,
    padding: { top: 12 }, overviewRulerBorder: false, hideCursorInOverviewRuler: true,
  });
  ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, toggleRun);
  ed.onDidChangeModelContent(scheduleSave);
  state.editor = { getValue: () => ed.getValue(), setValue: (v) => ed.setValue(v) };
  state.ready = true;
}

function initNativeEditor(initialValue) {
  if (state.ready) return;
  const host = $('#editor');
  host.innerHTML = '';
  const ta = document.createElement('textarea');
  ta.className = 'editor-native';
  ta.value = initialValue;
  ta.setAttribute('wrap', 'off');
  ta.setAttribute('aria-label', 'Code editor');
  // Stop iOS from capitalising and autocorrecting code.
  ta.spellcheck = false;
  ta.setAttribute('autocapitalize', 'off');
  ta.setAttribute('autocorrect', 'off');
  ta.setAttribute('autocomplete', 'off');
  host.appendChild(ta);
  ta.addEventListener('input', scheduleSave);
  ta.addEventListener('focus', () => document.body.classList.add('editing'));
  ta.addEventListener('blur', () => document.body.classList.remove('editing'));
  attachEditingKeys(ta);
  state.editor = { getValue: () => ta.value, setValue: (v) => { ta.value = v; } };
  state.ready = true;
}

// Editor-style typing for the textarea: auto-close brackets and quotes, wrap
// a selection, type over closers, keep indentation on Enter, and delete empty
// pairs. Edits go through execCommand so the browser's undo stack still works.
function attachEditingKeys(ta) {
  const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  const CLOSERS = new Set([')', ']', '}', '"', "'"]);
  const BLOCK = { '{': '}', '(': ')', '[': ']' };

  const insert = (text, caret, caretEnd) => {
    document.execCommand('insertText', false, text);
    if (caret != null) ta.setSelectionRange(caret, caretEnd == null ? caret : caretEnd);
  };

  ta.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;

    const val = ta.value;
    const s = ta.selectionStart, en = ta.selectionEnd;

    if (e.key === 'Tab') { e.preventDefault(); insert('    '); return; }

    if (PAIRS[e.key]) {
      const open = e.key, close = PAIRS[e.key];
      const isQuote = open === '"' || open === "'";
      if (s !== en) {
        e.preventDefault();
        const sel = val.slice(s, en);
        insert(open + sel + close, s + 1, s + 1 + sel.length);
      } else if (isQuote && val[s] === open) {
        e.preventDefault();
        ta.setSelectionRange(s + 1, s + 1);
      } else if (isQuote && /\w/.test(val[s - 1] || '')) {
        // An apostrophe after a word (it's, 1'000'000) shouldn't open a pair.
      } else {
        e.preventDefault();
        insert(open + close, s + 1, s + 1);
      }
      return;
    }

    if (CLOSERS.has(e.key) && s === en && val[s] === e.key) {
      e.preventDefault(); ta.setSelectionRange(s + 1, s + 1); return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = val.lastIndexOf('\n', s - 1) + 1;
      const indent = (val.slice(lineStart, s).match(/^[ \t]*/) || [''])[0];
      const prev = val[s - 1], next = val[s];
      if (BLOCK[prev] && s === en) {
        const inner = indent + '    ';
        const caret = s + 1 + inner.length;
        insert(next === BLOCK[prev] ? '\n' + inner + '\n' + indent : '\n' + inner, caret);
      } else {
        insert('\n' + indent);
      }
      return;
    }

    if (e.key === 'Backspace' && s === en && s > 0 && PAIRS[val[s - 1]] === val[s]) {
      e.preventDefault();
      ta.setSelectionRange(s - 1, s + 1);
      document.execCommand('delete');
    }
  });
}

function saveNow() {
  clearTimeout(state.saveTimer);
  if (!state.ready) return;
  try { localStorage.setItem(LS_CODE, state.editor.getValue()); } catch {}
}
function scheduleSave() {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(saveNow, 400);
}

// ---------------------------------------------------------------------------
// Running code
// ---------------------------------------------------------------------------
function setStatus(kind, text) {
  $('#status-dot').className = 'status-dot' + (kind ? ' ' + kind : '');
  $('#term-status').textContent = text;
}

function toggleRun() {
  if (state.run) stopRun();
  else run();
}

function stopRun() {
  if (state.run) state.run.controller.abort('stopped');
}

async function run() {
  if (!state.ready || state.run) return;
  // On a phone, close the keyboard so the terminal is visible.
  if (isTouchDevice() && document.activeElement) document.activeElement.blur();

  const out = $('#output');
  const btn = $('#btn-run');
  const std = currentStd();
  const controller = new AbortController();
  const started = Date.now();
  const tick = () => setStatus('running', `Running… ${Math.floor((Date.now() - started) / 1000)} s`);
  state.run = { controller, timer: setInterval(tick, 1000) };
  const timeout = setTimeout(() => controller.abort('timeout'), REQUEST_TIMEOUT_MS);

  btn.classList.add('busy');
  btn.querySelector('.run-label').textContent = 'Stop';
  btn.title = 'Stop waiting for this run';
  tick();
  out.innerHTML = `<span class="dim">Compiling with gcc 13.2 (${STD_LABELS[std]})…</span>`;

  try {
    const res = await fetch(WANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: state.editor.getValue(),
        compiler: COMPILER,
        stdin: $('#stdin').value,
        options: 'warning,' + std,
      }),
      signal: controller.signal,
    });
    if (res.ok) renderResult(await res.json());
    else renderHttpError(res.status);
  } catch (err) {
    renderFailure(controller.signal.aborted ? controller.signal.reason : null, err);
  } finally {
    clearTimeout(timeout);
    clearInterval(state.run.timer);
    state.run = null;
    btn.classList.remove('busy');
    btn.querySelector('.run-label').textContent = 'Run';
    btn.title = 'Run (Ctrl+Enter)';
  }
}

function renderFailure(abortReason, err) {
  const out = $('#output');
  let msg, status;
  if (abortReason === 'stopped') {
    msg = 'Stopped. The program may still finish on the server, but its output is discarded.';
    status = 'Stopped';
  } else if (abortReason === 'timeout') {
    msg = `No response from the compiler service after ${REQUEST_TIMEOUT_MS / 1000} s.`;
    status = 'Timed out';
  } else if (navigator.onLine === false) {
    msg = 'You are offline. Running code needs a connection to wandbox.org.';
    status = 'Offline';
  } else {
    msg = `Could not reach wandbox.org (${err && err.message ? err.message : err}).`;
    status = 'Connection error';
  }
  out.innerHTML = `<span class="err">${escapeHtml(msg)}</span>`;
  setStatus('err', status);
}

function renderHttpError(code) {
  const msg = code === 429
    ? 'Wandbox is rate-limiting requests after many runs in a short time. Wait a minute and try again.'
    : `The compiler service returned HTTP ${code}. Try again in a moment.`;
  $('#output').innerHTML = `<span class="err">${escapeHtml(msg)}</span>`;
  setStatus('err', code === 429 ? 'Rate limited' : 'Service error');
}

function renderResult(data) {
  const out = $('#output');
  const diag = (data.compiler_error || '').trimEnd();
  const stdout = data.program_output || '';
  const stderr = (data.program_error || '').trimEnd();
  const compileFailed = /error:/.test(diag) && data.status !== '0' && !data.program_message;

  let html = '';
  if (diag) html += `<span class="warn">${escapeHtml(diag)}</span>\n`;
  if (stdout) html += escapeHtml(stdout);
  if (stderr) html += `${stdout && !stdout.endsWith('\n') ? '\n' : ''}<span class="err">${escapeHtml(stderr)}</span>`;
  if (!diag && !stdout && !stderr) html += '<span class="dim">(no output)</span>';

  let summary, ok = false, status;
  if (compileFailed) {
    summary = 'Compilation failed';
    status = 'Compile error';
  } else if (data.status === '0') {
    summary = 'Exited with code 0';
    ok = true;
    status = 'Finished';
  } else if (data.status) {
    const reason = SIGNAL_EXITS[data.status];
    summary = `Exited with code ${data.status}` + (reason ? `: ${reason}` : '');
    status = data.status === '137' ? 'Killed' : reason ? 'Crashed' : `Exit code ${data.status}`;
  } else if (data.signal) {
    summary = `Terminated by signal: ${data.signal}`;
    status = 'Terminated';
  } else if (stdout.length >= OUTPUT_LIMIT) {
    summary = 'Stopped: output limit reached (128 KB)';
    status = 'Output limit';
  } else {
    summary = 'Stopped without an exit code';
    status = 'Stopped';
  }

  html += `<span class="meta ${ok ? 'ok' : 'bad'}">${escapeHtml(summary)}</span>`;
  setStatus(ok ? 'ok' : 'err', status);
  out.innerHTML = html;
  // The first compiler error is the useful one; for a run, show the end.
  out.scrollTop = compileFailed ? 0 : out.scrollHeight;
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------
const withExtension = (name) => (/\.[a-z0-9]+$/i.test(name) ? name : name + '.cpp');

function setFilename(name) {
  state.filename = (name || '').trim() || 'untitled.cpp';
  $('#filename').textContent = state.filename;
  try { localStorage.setItem(LS_NAME, state.filename); } catch {}
}

function renameFile() {
  const name = (prompt('Rename file', state.filename) || '').trim();
  if (name) setFilename(withExtension(name));
}

function newFile() {
  if (!confirm('Start a new file? The current code will be replaced.')) return;
  state.editor.setValue(STARTER);
  setFilename('untitled.cpp');
  saveNow();
}

function openFile() {
  const input = $('#file-input');
  input.value = '';
  input.click();
}

function onFilePicked(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.editor.setValue(String(reader.result || ''));
    setFilename(file.name);
    saveNow();
    setStatus('', 'Opened ' + file.name);
  };
  reader.onerror = () => setStatus('err', 'Could not read ' + file.name);
  reader.readAsText(file);
}

async function saveFile() {
  const name = (prompt('Save as', state.filename) || '').trim();
  if (!name) return;
  setFilename(withExtension(name));
  const code = state.editor.getValue();

  // On a phone the share sheet is the way to reach "Save to Files". Desktop
  // browsers that support sharing files would show a share dialog instead of
  // downloading, so only use it on touch devices.
  if (isTouchDevice() && navigator.canShare) {
    const file = new File([code], state.filename, { type: 'text/plain' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return; // share sheet dismissed
      }
    }
  }

  const url = URL.createObjectURL(new Blob([code], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = state.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function setMenuOpen(open) {
  $('#file-menu').classList.toggle('hidden', !open);
  $('#menu-backdrop').classList.toggle('hidden', !open);
  $('#btn-file').setAttribute('aria-expanded', String(open));
  if (open) $('#file-menu button').focus({ preventScroll: true });
}
const menuIsOpen = () => !$('#file-menu').classList.contains('hidden');

// ---------------------------------------------------------------------------
// Phone keyboard
// ---------------------------------------------------------------------------
// iOS Safari doesn't resize the layout when the keyboard opens; it scrolls the
// page instead, which pushes the top bar (and the Run button) off screen. Size
// the app to the visual viewport and keep the page scrolled to the top.
function trackVisualViewport() {
  const vv = window.visualViewport;
  if (!vv) return;
  const update = () => {
    if (vv.scale > 1.01) return; // pinch-zoomed: leave the layout alone
    document.documentElement.style.setProperty('--app-height', vv.height + 'px');
    document.body.classList.toggle('keyboard-open', window.innerHeight - vv.height > 120);
    if (window.scrollY || vv.offsetTop) window.scrollTo(0, 0);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
function updateEnvLabel() { $('#term-env').textContent = 'gcc 13.2, ' + STD_LABELS[currentStd()]; }

function autoGrowStdin() {
  const el = $('#stdin');
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 2 + 'px';
}

function boot() {
  let code = STARTER, std = DEFAULT_STD, name = 'main.cpp';
  try {
    code = localStorage.getItem(LS_CODE) ?? STARTER;
    std = localStorage.getItem(LS_STD) || DEFAULT_STD;
    name = localStorage.getItem(LS_NAME) || name;
  } catch {}
  if (std === 'gnu++2b') std = 'c++2b'; // value used by earlier versions
  $('#std').value = STD_LABELS[std] ? std : DEFAULT_STD;
  setFilename(name);
  updateEnvLabel();
  $('#output').innerHTML = EMPTY_OUTPUT;
  initEditor(code);
  trackVisualViewport();

  $('#btn-run').addEventListener('click', toggleRun);
  $('#std').addEventListener('change', () => {
    updateEnvLabel();
    try { localStorage.setItem(LS_STD, currentStd()); } catch {}
  });
  $('#btn-clear').addEventListener('click', () => {
    $('#output').innerHTML = EMPTY_OUTPUT;
    if (!state.run) setStatus('', 'Ready');
  });
  $('#filename').addEventListener('click', renameFile);
  $('#stdin').addEventListener('input', autoGrowStdin);

  // Buttons get reliable click events on iOS; the backdrop is a plain div,
  // which iOS Safari doesn't send clicks to, so it listens for pointerdown.
  $('#btn-file').addEventListener('click', () => setMenuOpen(!menuIsOpen()));
  $('#menu-backdrop').addEventListener('pointerdown', (e) => { e.preventDefault(); setMenuOpen(false); });
  $('#file-menu').addEventListener('click', (e) => {
    const item = e.target.closest('button[data-act]');
    if (!item) return;
    setMenuOpen(false);
    ({ new: newFile, open: openFile, save: saveFile })[item.dataset.act]();
  });
  $('#file-input').addEventListener('change', onFilePicked);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuIsOpen()) { setMenuOpen(false); $('#btn-file').focus(); return; }
    // Monaco handles its own Ctrl+Enter; this covers the textarea and stdin.
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.target.closest('.monaco-editor')) {
      e.preventDefault();
      toggleRun();
    }
  });

  // The debounced save can be lost if the tab is closed or the app is
  // backgrounded on iOS, so flush it whenever the page is hidden.
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });
  window.addEventListener('pagehide', saveNow);
}

// Service worker: offline app shell, and reload once when a new version takes
// over so the page doesn't keep running stale code.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !hadController) return;
    reloading = true;
    saveNow();
    window.location.reload();
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

boot();
