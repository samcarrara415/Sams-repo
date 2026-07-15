'use strict';

// ===========================================================================
// C++ Playground — write C++, hit Run, see output in the terminal.
// Compiles & runs on a REAL gcc compiler via the Wandbox API (browser-direct,
// CORS-enabled). Full C++ standard library; no local interpreter.
// ===========================================================================

const $ = (s) => document.querySelector(s);
const LS_CODE = 'cpp_playground_code';
const LS_STD = 'cpp_playground_std';
const LS_NAME = 'cpp_playground_name';

const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
const COMPILER = 'gcc-13.2.0';
const STD_LABELS = { 'c++17': 'C++17', 'c++2a': 'C++20', 'gnu++2b': 'C++23' };

const STARTER = `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    cout << "Hello, Sam!" << endl;

    // Full C++ standard library works here.
    vector<string> langs = {"C", "C++", "Rust"};
    for (const string& s : langs) cout << s << " ";
    cout << endl;

    // Read from the stdin box:
    // int n;
    // cin >> n;
    // cout << "n * 2 = " << n * 2 << endl;

    return 0;
}
`;

const state = { editor: null, ready: false, isMonaco: false, running: false, saveTimer: null, filename: 'main.cpp' };

const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function currentStd() { return $('#std').value; }

// ---------------------------------------------------------------------------
// Editor (Monaco with a textarea fallback)
// ---------------------------------------------------------------------------
function initEditor(initialValue) {
  const finishMonaco = () => {
    const ed = monaco.editor.create($('#editor'), {
      value: initialValue, language: 'cpp', theme: 'vs-dark', automaticLayout: true,
      minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, tabSize: 4,
      padding: { top: 12 }, smoothScrolling: true, cursorBlinking: 'smooth',
    });
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
    ed.onDidChangeModelContent(scheduleSave);
    state.editor = { getValue: () => ed.getValue(), setValue: (v) => ed.setValue(v), layout: () => ed.layout() };
    state.isMonaco = true; state.ready = true;
  };
  if (typeof require === 'undefined') return initFallback(initialValue);
  try {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });
    require(['vs/editor/editor.main'], finishMonaco, () => initFallback(initialValue));
    setTimeout(() => { if (!state.ready) initFallback(initialValue); }, 8000);
  } catch { initFallback(initialValue); }
}
function initFallback(initialValue) {
  if (state.ready) return;
  const host = $('#editor'); host.innerHTML = '';
  const ta = document.createElement('textarea');
  ta.className = 'editor-fallback'; ta.spellcheck = false; ta.value = initialValue;
  host.appendChild(ta);
  ta.addEventListener('input', scheduleSave);
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 4;
    }
  });
  state.editor = { getValue: () => ta.value, setValue: (v) => { ta.value = v; }, layout: () => {} };
  state.isMonaco = false; state.ready = true;
}

function scheduleSave() {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => { try { localStorage.setItem(LS_CODE, state.editor.getValue()); } catch {} }, 400);
}

// ---------------------------------------------------------------------------
// Run (Wandbox: real gcc)
// ---------------------------------------------------------------------------
function setStatus(kind, text) {
  const dot = $('#status-dot');
  dot.className = 'status-dot' + (kind ? ' ' + kind : '');
  $('#term-status').textContent = text;
}

async function run() {
  if (!state.ready || state.running) return;
  state.running = true;
  const btn = $('#btn-run'); btn.classList.add('busy');
  const out = $('#output');
  const std = currentStd();

  setStatus('running', 'Compiling…');
  out.innerHTML = `<span class="dim">Compiling &amp; running on gcc 13.2 (${STD_LABELS[std] || std})…</span>`;

  const started = performance.now ? performance.now() : 0;
  try {
    const res = await fetch(WANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: state.editor.getValue(),
        compiler: COMPILER,
        stdin: $('#stdin').value || '',
        options: 'warning,' + std,
        'compiler-option-raw': '',
        'runtime-option-raw': '',
      }),
    });
    if (!res.ok) throw new Error('Compiler service returned ' + res.status);
    const data = await res.json();
    renderResult(data, started);
  } catch (err) {
    const offline = (typeof navigator !== 'undefined' && navigator.onLine === false);
    out.innerHTML = `<span class="err">${escapeHtml(
      offline ? 'You appear to be offline. The compiler runs online — reconnect and try again.'
              : 'Could not reach the compiler: ' + err.message
    )}</span><span class="meta bad">✗ could not run</span>`;
    setStatus('err', 'Connection error');
  } finally {
    state.running = false; btn.classList.remove('busy');
  }
}

function renderResult(data, started) {
  const out = $('#output');
  const diag = (data.compiler_error || '').trim();      // gcc warnings + errors
  const stdout = data.program_output || '';
  const stderr = (data.program_error || '').trim();     // runtime stderr
  const compileFailed = /error:/i.test(diag) && !stdout && !data.program_message;
  const ms = started ? Math.round((performance.now() - started)) : 0;

  let html = '';
  if (diag) html += `<span class="warn">${escapeHtml(diag)}</span>\n`;
  if (stdout) html += escapeHtml(stdout);
  if (stderr) html += `${stdout ? '\n' : ''}<span class="err">${escapeHtml(stderr)}</span>`;
  if (!diag && !stdout && !stderr) html += '<span class="dim">(no output)</span>';

  if (compileFailed) {
    html += `<span class="meta bad">✗ Compilation failed</span>`;
    setStatus('err', 'Compile error');
  } else {
    const code = data.status != null ? data.status : '0';
    const ok = String(code) === '0';
    html += `<span class="meta ${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✗'} finished · exit ${code}${ms ? ' · ' + ms + ' ms' : ''}</span>`;
    setStatus(ok ? 'ok' : 'err', ok ? 'Finished' : 'Runtime error');
  }
  out.innerHTML = html;
  out.scrollTop = out.scrollHeight;
}

// ---------------------------------------------------------------------------
// File operations (New / Open from Files / Save to Files)
// ---------------------------------------------------------------------------
function setFilename(name) {
  state.filename = (name || 'untitled.cpp').trim() || 'untitled.cpp';
  $('#filename').textContent = state.filename;
  try { localStorage.setItem(LS_NAME, state.filename); } catch {}
}

function newFile() {
  if (!confirm('Start a new file? Unsaved changes to the current one will be replaced.')) return;
  state.editor.setValue(STARTER);
  setFilename('untitled.cpp');
  scheduleSave();
  if (state.isMonaco) setTimeout(() => state.editor.layout(), 0);
}

function openFromFiles() {
  $('#file-input').value = '';
  $('#file-input').click();
}
function onFilePicked(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.editor.setValue(String(reader.result || ''));
    setFilename(file.name);
    scheduleSave();
    setStatus('', 'Opened ' + file.name);
  };
  reader.onerror = () => setStatus('err', 'Could not read file');
  reader.readAsText(file);
}

async function saveToFiles() {
  const name = (prompt('Save as:', state.filename) || '').trim();
  if (!name) return;
  const finalName = /\.[a-z0-9]+$/i.test(name) ? name : name + '.cpp';
  setFilename(finalName);
  const code = state.editor.getValue();

  // Preferred on iOS: share sheet → "Save to Files".
  try {
    const file = new File([code], finalName, { type: 'text/plain' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: finalName });
      return;
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return; // user cancelled the share sheet
  }

  // Fallback: trigger a download (Safari's download manager also offers "Save to Files").
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = finalName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function closeFileMenu() {
  $('#file-menu').classList.add('hidden');
  $('#menu-backdrop').classList.add('hidden');
}
function openFileMenu() {
  $('#file-menu').classList.remove('hidden');
  $('#menu-backdrop').classList.remove('hidden');
}
function toggleFileMenu() {
  if ($('#file-menu').classList.contains('hidden')) openFileMenu();
  else closeFileMenu();
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------
function updateEnvLabel() { $('#term-env').textContent = 'gcc 13.2 · ' + (STD_LABELS[currentStd()] || currentStd()); }

function boot() {
  let saved = STARTER, savedStd = 'c++2a', savedName = 'main.cpp';
  try { saved = localStorage.getItem(LS_CODE) || STARTER; } catch {}
  try { savedStd = localStorage.getItem(LS_STD) || 'c++2a'; } catch {}
  try { savedName = localStorage.getItem(LS_NAME) || 'main.cpp'; } catch {}
  if (STD_LABELS[savedStd]) $('#std').value = savedStd;
  setFilename(savedName);
  updateEnvLabel();
  initEditor(saved);

  $('#btn-run').onclick = run;
  $('#std').onchange = () => { updateEnvLabel(); try { localStorage.setItem(LS_STD, currentStd()); } catch {} };
  $('#btn-clear').onclick = () => {
    $('#output').innerHTML = '<span class="dim">Press <b>▶ Run</b> to compile &amp; run on a real gcc compiler. Output appears here.</span>';
    setStatus('', 'Ready');
  };

  // File menu. Use pointer events — iOS Safari doesn't reliably fire `click`
  // on non-interactive elements like the backdrop.
  $('#btn-file').addEventListener('pointerup', (e) => { e.preventDefault(); e.stopPropagation(); toggleFileMenu(); });
  $('#file-menu').addEventListener('pointerup', (e) => {
    const act = e.target && e.target.dataset ? e.target.dataset.act : null;
    if (!act) return;
    e.preventDefault();
    closeFileMenu();
    if (act === 'new') newFile();
    else if (act === 'open') openFromFiles();
    else if (act === 'save') saveToFiles();
  });
  // Tap anywhere off the menu (backdrop) to dismiss.
  $('#menu-backdrop').addEventListener('pointerdown', (e) => { e.preventDefault(); closeFileMenu(); });
  $('#file-input').onchange = onFilePicked;

  // Rename by tapping the filename
  $('#filename').onclick = () => {
    const name = (prompt('Rename file:', state.filename) || '').trim();
    if (name) setFilename(/\.[a-z0-9]+$/i.test(name) ? name : name + '.cpp');
  };
}

// Service worker: installability + auto-reload on new deploys.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || !hadController) return;
    refreshing = true; window.location.reload();
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

boot();
