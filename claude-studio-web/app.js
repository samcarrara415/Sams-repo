'use strict';

// ===========================================================================
// C++ Playground — write C++, hit Run, see output in the terminal.
// Runs entirely in the browser via JSCPP (a C++ interpreter). No server,
// no account, works offline once loaded.
// ===========================================================================

const $ = (s) => document.querySelector(s);
const LS_CODE = 'cpp_playground_code';

const STARTER = `#include <iostream>

int main() {
    std::cout << "Hello, Sam!" << std::endl;

    // Read input from the stdin box, then run:
    // int n;
    // std::cin >> n;
    // std::cout << "n * 2 = " << (n * 2) << std::endl;

    return 0;
}
`;

const state = { editor: null, ready: false, isMonaco: false, running: false, saveTimer: null };

const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// JSCPP supports a C++ subset: it needs "using namespace std;" and rejects the
// "std::" prefix. Make normal C++ "just work" by stripping std:: and ensuring
// the using-directive is present before running.
function prepareForJscpp(src) {
  let s = src.replace(/\bstd::/g, '');
  if (!/using\s+namespace\s+std\s*;/.test(s)) {
    const lines = s.split('\n');
    let lastInclude = -1;
    for (let i = 0; i < lines.length; i++) if (/^\s*#\s*include/.test(lines[i])) lastInclude = i;
    lines.splice(lastInclude + 1, 0, 'using namespace std;');
    s = lines.join('\n');
  }
  return s;
}

// ---------------------------------------------------------------------------
// Editor (Monaco with a textarea fallback)
// ---------------------------------------------------------------------------
function initEditor(initialValue) {
  const finishMonaco = () => {
    const ed = monaco.editor.create($('#editor'), {
      value: initialValue,
      language: 'cpp',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      tabSize: 4,
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
    // basic tab support
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
  state.saveTimer = setTimeout(() => {
    try { localStorage.setItem(LS_CODE, state.editor.getValue()); } catch {}
  }, 400);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
function runJscpp(code, stdin) {
  if (typeof JSCPP === 'undefined') return { error: 'C++ runtime failed to load. Try reloading the page.' };
  let out = '';
  const config = { stdio: { write: (s) => { out += s; } }, unsigned_overflow: 'warn', maxTimeout: 5000, maxExecutionSteps: 5_000_000 };
  try {
    const exitCode = JSCPP.run(prepareForJscpp(code), stdin || '', config);
    return { output: out, exitCode };
  } catch (e) {
    return { output: out, error: String((e && e.message) || e) };
  }
}

function run() {
  if (!state.ready || state.running) return;
  state.running = true;
  const btn = $('#btn-run'); btn.disabled = true;
  const out = $('#output');
  out.innerHTML = '<span class="dim">Running…</span>';

  // let the "Running…" paint before the (synchronous) interpreter blocks
  setTimeout(() => {
    const res = runJscpp(state.editor.getValue(), $('#stdin').value);
    let html = '';
    if (res.output) html += escapeHtml(res.output);
    if (res.error) html += `${res.output ? '\n' : ''}<span class="err">${escapeHtml(res.error)}</span>`;
    if (!res.output && !res.error) html += '<span class="dim">(no output)</span>';
    const ok = !res.error;
    html += `<span class="meta ${ok ? 'ok' : 'bad'}">${ok ? '✓ finished — exit code ' + (res.exitCode ?? 0) : '✗ error'}</span>`;
    out.innerHTML = html;
    out.scrollTop = out.scrollHeight;
    state.running = false; btn.disabled = false;
  }, 20);
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------
function boot() {
  let saved = STARTER;
  try { saved = localStorage.getItem(LS_CODE) || STARTER; } catch {}
  initEditor(saved);

  $('#btn-run').onclick = run;
  $('#btn-clear').onclick = () => { $('#output').innerHTML = '<span class="dim">Press ▶ Run to compile &amp; run. Output appears here.</span>'; };
  $('#btn-reset').onclick = () => {
    if (state.ready) { state.editor.setValue(STARTER); scheduleSave(); }
    if (state.isMonaco) setTimeout(() => state.editor.layout(), 0);
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
