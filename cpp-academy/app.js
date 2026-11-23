(function () {
  'use strict';

  const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
  const COMPILER = 'gcc-13.2.0';
  // Wandbox itself kills a program after roughly 30 seconds; stop waiting a bit sooner.
  const RUN_TIMEOUT_MS = 25000;
  const MAX_OUTPUT_CHARS = 50000;
  const STORAGE_KEY = 'cpp-academy:v1';

  const OFFLINE_MESSAGE = 'You are offline. Lessons and your saved code still work, but running code needs a connection to the compiler.';

  // ---------------------------------------------------------------------------
  // Saved state
  // ---------------------------------------------------------------------------

  function freshState() {
    return {
      completed: {},     // lesson id -> true
      practiceDone: {},  // practice id -> true
      drafts: {},        // exercise id -> code the learner has typed
      ideCode: '',
      ideStdin: '',
      streakDays: 0,
      lastActive: null   // 'YYYY-MM-DD', local time
    };
  }

  function loadState() {
    const state = freshState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      Object.assign(state, saved);
      // Older versions stored the editor contents as `snippet` and kept an XP total.
      if (saved.snippet && !saved.ideCode) state.ideCode = saved.snippet;
      delete state.snippet;
      delete state.xp;
    } catch (e) {
      // Corrupt or unavailable storage: start fresh.
    }
    return state;
  }

  let state = loadState();
  let saveTimer = null;

  function saveNow() {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Private mode or storage full; progress just won't persist.
    }
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 400);
  }

  window.addEventListener('pagehide', saveNow);

  function localDate(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function daysBetween(a, b) {
    const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    return Math.round((parse(b) - parse(a)) / 86400000);
  }

  function recordActivity() {
    const today = localDate(new Date());
    if (state.lastActive === today) return;
    const gap = state.lastActive ? daysBetween(state.lastActive, today) : null;
    state.streakDays = gap === 1 ? (state.streakDays || 0) + 1 : 1;
    state.lastActive = today;
    saveNow();
  }

  function currentStreak() {
    if (!state.lastActive) return 0;
    return daysBetween(state.lastActive, localDate(new Date())) <= 1 ? state.streakDays || 0 : 0;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const $ = (sel, root) => (root || document).querySelector(sel);

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'class') node.className = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of [].concat(children || [])) {
      if (c != null) node.append(c);
    }
    return node;
  }

  function icon(name, cls) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.append(use);
    return svg;
  }

  function toast(message) {
    const t = $('#toast');
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // Compare program output line by line, ignoring trailing spaces and blank lines at the end.
  function normalizeOutput(s) {
    return (s || '').replace(/\r/g, '').split('\n').map((line) => line.trimEnd()).join('\n').replace(/\n+$/, '');
  }

  function setBusy(button, busy) {
    if (busy) {
      button.dataset.label = button.innerHTML;
      button.disabled = true;
      button.textContent = 'Running…';
    } else if (button.dataset.label) {
      button.innerHTML = button.dataset.label;
      button.disabled = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Editors
  // ---------------------------------------------------------------------------

  // iOS "smart punctuation" turns typed quotes and "--" into characters the
  // compiler rejects. Undo that for typed input; pasted text is left alone.
  const SMART_PUNCTUATION = [[/[\u201C\u201D\u201E\u201F]/g, '"'], [/[\u2018\u2019\u201A\u201B]/g, "'"], [/\u2014/g, '--'], [/\u2026/g, '...']];

  function makeEditor(textarea, value) {
    textarea.value = value || '';
    const cm = CodeMirror.fromTextArea(textarea, {
      mode: 'text/x-c++src',
      theme: 'academy',
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 4,
      tabSize: 4,
      matchBrackets: true,
      viewportMargin: Infinity,
      spellcheck: false,
      autocorrect: false,
      autocapitalize: false,
      extraKeys: {
        Tab: (ed) => (ed.somethingSelected() ? ed.indentSelection('add') : ed.replaceSelection('    ')),
        'Shift-Tab': (ed) => ed.indentSelection('subtract')
      }
    });
    cm.on('beforeChange', (ed, change) => {
      if (change.origin !== '+input' && change.origin !== '*compose') return;
      const fixed = change.text.map((line) => SMART_PUNCTUATION.reduce((s, [re, rep]) => s.replace(re, rep), line));
      if (fixed.join('\n') !== change.text.join('\n')) change.update(change.from, change.to, fixed);
    });
    return cm;
  }

  // ---------------------------------------------------------------------------
  // Running code on Wandbox
  // ---------------------------------------------------------------------------

  const SIGNAL_MESSAGES = {
    134: 'The program aborted. This usually means an exception was thrown and not caught, or an assertion failed.',
    136: 'Arithmetic error, such as an integer division by zero.',
    137: 'The program was stopped because it ran too long or used too much memory. Check for an infinite loop.',
    139: 'Segmentation fault: the program accessed memory it doesn\'t own, for example through a null or dangling pointer or an index past the end of an array.'
  };

  function clip(s) {
    return s.length > MAX_OUTPUT_CHARS ? s.slice(0, MAX_OUTPUT_CHARS) + '\n[output cut off after ' + MAX_OUTPUT_CHARS + ' characters]' : s;
  }

  // Resolves to { phase, title, output, stderr, diagnostics, message }.
  // phase is 'ok', 'compile', 'runtime', or 'unavailable' (offline, timeout, service error).
  async function runCpp(code, stdin) {
    if (navigator.onLine === false) {
      return { phase: 'unavailable', title: 'Offline', message: OFFLINE_MESSAGE };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RUN_TIMEOUT_MS);
    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: COMPILER,
        code: code,
        stdin: stdin || '',
        options: 'warning,c++20',
        'compiler-option-raw': '',
        'runtime-option-raw': ''
      }),
      signal: controller.signal
    };
    let data;
    try {
      // Wandbox sometimes refuses work for a moment: HTTP 429 when it gets too
      // many requests, or a sandbox error ("OCI runtime error") when it is out
      // of capacity. Both usually clear within seconds, so retry twice.
      for (let attempt = 0; ; attempt++) {
        const res = await fetch(WANDBOX_URL, request);
        const busy = res.status === 429 || res.status === 503;
        data = busy || !res.ok ? null : await res.json();
        const sandboxFailed = data && /OCI runtime error|crun:/.test((data.compiler_error || '') + (data.program_error || ''));
        if (!busy && !sandboxFailed) {
          if (!res.ok) {
            return { phase: 'unavailable', title: 'Compiler unavailable', message: 'The compiler service returned an error (HTTP ' + res.status + '). Try again in a minute.' };
          }
          break;
        }
        if (attempt === 2) {
          return { phase: 'unavailable', title: 'Compiler busy', message: 'The compiler service at wandbox.org is overloaded right now. Wait a little and try again.' };
        }
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        return { phase: 'unavailable', title: 'Timed out', message: 'No result after ' + RUN_TIMEOUT_MS / 1000 + ' seconds. The program may be stuck in an infinite loop, or the compiler service is slow right now.' };
      }
      return {
        phase: 'unavailable',
        title: navigator.onLine === false ? 'Offline' : 'Couldn\'t reach the compiler',
        message: navigator.onLine === false ? OFFLINE_MESSAGE : 'The request to wandbox.org failed. Check your connection and try again.'
      };
    } finally {
      clearTimeout(timer);
    }

    const diagnostics = (data.compiler_error || '').replace(/prog\.cc/g, 'main.cpp').trimEnd();
    const output = clip(data.program_output || '');
    const stderr = clip((data.program_error || '').trimEnd());
    const status = parseInt(data.status, 10) || 0;

    if (/(^|\s)(fatal )?error:/m.test(diagnostics) && !output && !stderr) {
      return { phase: 'compile', title: 'Didn\'t compile', diagnostics: diagnostics, message: 'Fix the first error listed; later ones are often caused by it.' };
    }
    if (data.signal || status !== 0) {
      return {
        phase: 'runtime',
        title: data.signal ? 'Stopped by ' + data.signal : 'Exited with code ' + status,
        output, stderr, diagnostics,
        message: SIGNAL_MESSAGES[status] || (data.signal ? '' : 'A non-zero exit code means main returned something other than 0, or the program called exit() with an error code.')
      };
    }
    return { phase: 'ok', title: 'Finished', output, stderr, diagnostics };
  }

  // ---------------------------------------------------------------------------
  // Output panels
  // ---------------------------------------------------------------------------

  function outputSection(label, text, cls) {
    const pre = el('pre', { class: cls || null, text: text });
    return label ? [el('div', { class: 'sub', text: label }), pre] : [pre];
  }

  function showPlaceholder(panel, text) {
    panel.className = 'output';
    panel.replaceChildren(el('div', { class: 'placeholder', text: text }));
  }

  function showBusy(panel) {
    panel.className = 'output busy';
    panel.replaceChildren(el('div', { class: 'status', text: 'Compiling and running…' }));
  }

  function showRun(panel, r) {
    const ok = r.phase === 'ok';
    panel.className = 'output ' + (ok ? 'ok' : 'err');
    const parts = [el('div', { class: 'status', text: r.title })];
    if (r.phase === 'compile') {
      parts.push(...outputSection('', r.diagnostics, 'diag'));
    } else if (r.phase !== 'unavailable') {
      if (r.diagnostics) parts.push(...outputSection('Compiler warnings', r.diagnostics, 'diag'));
      const label = r.diagnostics || r.stderr ? 'Output' : '';
      parts.push(...outputSection(label, r.output || (r.stderr ? '' : '(no output)')));
      if (r.stderr) parts.push(...outputSection('Error output (stderr)', r.stderr));
    }
    if (r.message) parts.push(el('div', { class: 'note', text: r.message }));
    panel.replaceChildren(...parts);
  }

  // ---------------------------------------------------------------------------
  // Exercises (shared by lessons and practice problems)
  // ---------------------------------------------------------------------------

  function trimNewline(s) {
    return (s || '').replace(/\n+$/, '');
  }

  function showExpected(panel, test) {
    panel.className = 'output';
    const parts = [el('div', { class: 'status', text: 'Not checked yet' })];
    if (test.stdin) parts.push(...outputSection('Input', trimNewline(test.stdin)));
    parts.push(...outputSection('Expected output', trimNewline(test.expected)));
    panel.replaceChildren(...parts);
  }

  function passes(result, test) {
    return result.phase === 'ok' && normalizeOutput(result.output) === normalizeOutput(test.expected);
  }

  function showFailure(panel, tests, i, r) {
    const which = tests.length > 1 ? 'Test ' + (i + 1) + ' of ' + tests.length + ': ' : '';
    const t = tests[i];
    panel.className = 'output err';
    const parts = [el('div', { class: 'status', text: which + (r.phase === 'runtime' ? r.title.toLowerCase() : 'output doesn\'t match') })];
    if (t.stdin) parts.push(...outputSection('Input', trimNewline(t.stdin)));
    parts.push(...outputSection('Expected output', trimNewline(t.expected)));
    parts.push(...outputSection('Your output', trimNewline(r.output) || '(no output)'));
    if (r.stderr) parts.push(...outputSection('Error output (stderr)', r.stderr));
    if (r.phase === 'runtime' && r.message) parts.push(el('div', { class: 'note', text: r.message }));
    panel.replaceChildren(...parts);
  }

  // Runs the first test on its own so that a wrong attempt costs a single
  // request; the remaining tests run in parallel once it passes.
  async function checkSolution(item, code, panel) {
    const tests = item.tests;
    const results = [await runCpp(code, tests[0].stdin || '')];
    if (passes(results[0], tests[0]) && tests.length > 1) {
      results.push(...await Promise.all(tests.slice(1).map((t) => runCpp(code, t.stdin || ''))));
    }

    const blocking = results.find((r) => r.phase === 'unavailable' || r.phase === 'compile');
    if (blocking) {
      showRun(panel, blocking);
      return false;
    }
    const failed = results.findIndex((r, i) => !passes(r, tests[i]));
    if (failed !== -1) {
      showFailure(panel, tests, failed, results[failed]);
      return false;
    }

    panel.className = 'output ok';
    const parts = [el('div', { class: 'status', text: tests.length > 1 ? 'Passed all ' + tests.length + ' tests' : 'Correct' })];
    if (results[0].diagnostics) parts.push(...outputSection('Compiler warnings', results[0].diagnostics, 'diag'));
    parts.push(...outputSection('Your output', trimNewline(results[0].output)));
    panel.replaceChildren(...parts);
    return true;
  }

  // Builds the editor, buttons, and result panel for one exercise.
  // `onPass` runs after every successful check.
  function mountExercise(container, item, opts) {
    const draft = state.drafts[item.id];
    const textarea = el('textarea');
    const checkBtn = el('button', { class: 'btn' }, [icon('check'), 'Check']);
    const hintBtn = el('button', { class: 'btn secondary', text: 'Hint' });
    const resetBtn = el('button', { class: 'btn secondary', text: 'Reset' });
    const solutionBtn = el('button', { class: 'btn secondary', text: 'Solution' });
    const hintBox = el('div', { class: 'hint', hidden: true });
    const panel = el('div', { class: 'output' });

    container.replaceChildren(el('div', { class: opts.heading ? 'exercise' : '' }, [
      opts.heading ? el('h3', { text: opts.heading }) : null,
      el('p', { class: 'prompt', html: item.prompt }),
      el('div', { class: 'editor' }, textarea),
      el('div', { class: 'btn-row' }, [checkBtn, hintBtn, el('span', { class: 'spacer' }), resetBtn, solutionBtn]),
      hintBox,
      panel
    ]));

    const cm = makeEditor(textarea, draft != null ? draft : item.starter);
    cm.on('change', () => {
      const code = cm.getValue();
      if (code === item.starter) delete state.drafts[item.id];
      else state.drafts[item.id] = code;
      saveSoon();
    });

    showExpected(panel, item.tests[0]);

    checkBtn.addEventListener('click', async () => {
      setBusy(checkBtn, true);
      showBusy(panel);
      const passed = await checkSolution(item, cm.getValue(), panel);
      setBusy(checkBtn, false);
      if (passed) {
        recordActivity();
        opts.onPass();
      }
    });

    hintBtn.addEventListener('click', () => {
      hintBox.hidden = !hintBox.hidden;
      hintBox.replaceChildren(el('strong', { text: 'Hint: ' }), el('code', { text: item.hint }));
      hintBtn.setAttribute('aria-expanded', String(!hintBox.hidden));
    });

    resetBtn.addEventListener('click', () => {
      if (cm.getValue() !== item.starter && !confirm('Discard your code and start again from the starter code?')) return;
      cm.setValue(item.starter);
      showExpected(panel, item.tests[0]);
    });

    solutionBtn.addEventListener('click', () => {
      if (!confirm('Replace your code with the solution?')) return;
      cm.setValue(item.solution);
    });

    return cm;
  }

  // ---------------------------------------------------------------------------
  // Routing
  // ---------------------------------------------------------------------------

  const allLessons = MODULES.flatMap((m, mi) => m.lessons.map((l, li) => Object.assign({ module: m, moduleIndex: mi, lessonIndex: li }, l)));
  const lessonById = new Map(allLessons.map((l) => [l.id, l]));
  const practiceById = new Map(PRACTICE.map((p) => [p.id, p]));

  const scrollPositions = {};
  let currentView = null;

  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const [section, id] = parts;
    if (section === 'lesson' && lessonById.has(id)) return { view: 'lesson', tab: 'learn', id };
    if (section === 'practice' && id && practiceById.has(id)) return { view: 'problem', tab: 'practice', id };
    if (section === 'practice') return { view: 'practice', tab: 'practice' };
    if (section === 'code') return { view: 'code', tab: 'code' };
    if (section === 'reference') return { view: 'ref', tab: 'ref' };
    if (section === 'progress') return { view: 'progress', tab: 'progress' };
    return { view: 'learn', tab: 'learn' };
  }

  const TITLES = { learn: 'C++ Academy', practice: 'Practice', code: 'Code', ref: 'Reference', progress: 'Progress' };

  function route() {
    const r = parseRoute();
    const main = $('#main');
    if (currentView) scrollPositions[currentView] = main.scrollTop;

    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + r.view));
    document.querySelectorAll('#tabs a').forEach((a) => {
      const on = a.dataset.tab === r.tab;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    const detail = r.view === 'lesson' || r.view === 'problem';
    $('#backBtn').hidden = !detail;
    $('#mark').hidden = detail;
    $('#backBtn').onclick = () => { location.hash = r.view === 'lesson' ? '#/learn' : '#/practice'; };

    if (r.view === 'lesson') showLesson(r.id);
    else if (r.view === 'problem') showProblem(r.id);
    else {
      $('#topTitle').textContent = TITLES[r.view];
      if (r.view === 'learn') renderLearn();
      if (r.view === 'practice') renderPractice();
      if (r.view === 'code') showIde();
      if (r.view === 'ref') renderReference();
      if (r.view === 'progress') renderProgress();
    }

    main.scrollTop = detail ? 0 : scrollPositions[r.view] || 0;
    currentView = detail ? null : r.view;
    document.title = detail ? $('#topTitle').textContent + ' · C++ Academy' : 'C++ Academy';
  }

  window.addEventListener('hashchange', route);

  // ---------------------------------------------------------------------------
  // Learn
  // ---------------------------------------------------------------------------

  const openModules = new Set();

  function nextLesson() {
    return allLessons.find((l) => !state.completed[l.id]) || null;
  }

  function renderLearn() {
    const doneCount = allLessons.filter((l) => state.completed[l.id]).length;
    const next = nextLesson();

    if (next) {
      $('#continueLabel').textContent = (doneCount ? 'Continue' : 'Start here') + ' · ' + next.module.title;
      $('#continueTitle').textContent = next.title;
      $('#continueBtn').textContent = doneCount ? 'Continue' : 'Start';
      $('#continueBtn').href = '#/lesson/' + next.id;
      if (openModules.size === 0) openModules.add(next.module.id);
    } else {
      $('#continueLabel').textContent = 'All lessons complete';
      $('#continueTitle').textContent = 'Try the practice problems';
      $('#continueBtn').textContent = 'Practice';
      $('#continueBtn').href = '#/practice';
    }
    $('#overallBar').style.width = Math.round(doneCount / allLessons.length * 100) + '%';
    $('#overallText').textContent = doneCount + ' of ' + allLessons.length + ' lessons complete';

    renderModuleList();
  }

  function renderModuleList() {
    const query = $('#lessonSearch').value.trim().toLowerCase();
    const root = $('#moduleList');
    const nodes = [];

    MODULES.forEach((mod, mi) => {
      const lessons = query
        ? mod.lessons.filter((l) => (l.title + ' ' + mod.title).toLowerCase().includes(query))
        : mod.lessons;
      if (lessons.length === 0) return;

      const done = mod.lessons.filter((l) => state.completed[l.id]).length;
      const open = query ? true : openModules.has(mod.id);
      const head = el('button', { class: 'module-head', 'aria-expanded': String(open) }, [
        el('span', { class: 'num', text: String(mi + 1) }),
        el('span', { class: 'meta' }, [
          el('span', { class: 'title', text: mod.title }),
          el('span', { class: 'sub', text: mod.sub })
        ]),
        el('span', { class: 'count', text: done + '/' + mod.lessons.length }),
        icon('chevron', 'sm chev')
      ]);
      const body = el('div', { class: 'module-body' }, lessons.map((les) => {
        const isDone = !!state.completed[les.id];
        return el('a', { class: 'row' + (isDone ? ' done' : ''), href: '#/lesson/' + les.id }, [
          el('span', { class: 'status', 'aria-label': isDone ? 'Completed' : 'Not completed' }, icon('check')),
          el('span', { class: 'label', text: les.title }),
          el('span', { class: 'tag', text: (mi + 1) + '.' + (mod.lessons.indexOf(les) + 1) })
        ]);
      }));
      const card = el('div', { class: 'module' + (open ? ' open' : '') + (done === mod.lessons.length ? ' complete' : '') }, [head, body]);
      head.addEventListener('click', () => {
        const nowOpen = card.classList.toggle('open');
        head.setAttribute('aria-expanded', String(nowOpen));
        if (nowOpen) openModules.add(mod.id); else openModules.delete(mod.id);
      });
      nodes.push(card);
    });

    root.replaceChildren(...(nodes.length ? nodes : [el('p', { class: 'empty', text: 'No lessons match "' + query + '".' })]));
  }

  $('#lessonSearch').addEventListener('input', renderModuleList);

  // ---------------------------------------------------------------------------
  // Lesson
  // ---------------------------------------------------------------------------

  let exampleCM = null;
  let currentLesson = null;
  let exampleRunId = 0;

  function showLesson(id) {
    const lesson = lessonById.get(id);
    currentLesson = lesson;
    exampleRunId++;
    const mod = lesson.module;

    $('#topTitle').textContent = lesson.title;
    $('#lessonCrumbs').textContent = 'Module ' + (lesson.moduleIndex + 1) + ': ' + mod.title + ' · Lesson ' + (lesson.lessonIndex + 1) + ' of ' + mod.lessons.length;
    $('#lessonTitle').textContent = lesson.title;
    $('#lessonBody').innerHTML = lesson.body;

    if (!exampleCM) exampleCM = makeEditor($('#exampleEditor'), lesson.example);
    else exampleCM.setValue(lesson.example);
    exampleCM.clearHistory();
    exampleCM.refresh();

    $('#exampleStdinWrap').hidden = !lesson.exampleStdin;
    $('#exampleStdin').value = lesson.exampleStdin || '';
    showPlaceholder($('#exampleOutput'), 'Press Run to compile and run the example. You can edit it first.');

    mountExercise($('#lessonExercise'), lesson.exercise, {
      heading: 'Exercise',
      onPass: () => {
        if (!state.completed[lesson.id]) {
          state.completed[lesson.id] = true;
          saveNow();
          toast('Lesson complete');
        }
      }
    });

    const i = allLessons.indexOf(lesson);
    const prev = allLessons[i - 1];
    const next = allLessons[i + 1];
    const prevLink = $('#lessonPrev');
    prevLink.style.visibility = prev ? '' : 'hidden';
    prevLink.href = prev ? '#/lesson/' + prev.id : '#/learn';
    const nextLink = $('#lessonNext');
    nextLink.textContent = next ? 'Next lesson' : 'Practice problems';
    nextLink.href = next ? '#/lesson/' + next.id : '#/practice';
  }

  $('#exampleRun').addEventListener('click', async () => {
    const runId = exampleRunId;
    const button = $('#exampleRun');
    const panel = $('#exampleOutput');
    setBusy(button, true);
    showBusy(panel);
    const stdin = currentLesson.exampleStdin ? $('#exampleStdin').value : '';
    const result = await runCpp(exampleCM.getValue(), stdin);
    setBusy(button, false);
    if (runId !== exampleRunId) return;  // the learner moved to another lesson
    showRun(panel, result);
    if (result.phase === 'ok') recordActivity();
  });

  $('#exampleReset').addEventListener('click', () => {
    exampleCM.setValue(currentLesson.example);
    $('#exampleStdin').value = currentLesson.exampleStdin || '';
    showPlaceholder($('#exampleOutput'), 'Press Run to compile and run the example. You can edit it first.');
  });

  // ---------------------------------------------------------------------------
  // Practice
  // ---------------------------------------------------------------------------

  function renderPractice() {
    $('#practiceList').replaceChildren(...PRACTICE.map((p) => {
      const done = !!state.practiceDone[p.id];
      return el('a', { class: 'row' + (done ? ' done' : ''), href: '#/practice/' + p.id }, [
        el('span', { class: 'status', 'aria-label': done ? 'Solved' : 'Not solved' }, icon('check')),
        el('span', { class: 'label', text: p.title }),
        el('span', { class: 'tag', text: p.level })
      ]);
    }));
  }

  function showProblem(id) {
    const p = practiceById.get(id);
    $('#topTitle').textContent = p.title;
    $('#problemLevel').textContent = 'Practice · ' + p.level;
    $('#problemTitle').textContent = p.title;
    mountExercise($('#problemExercise'), p, {
      onPass: () => {
        if (!state.practiceDone[p.id]) {
          state.practiceDone[p.id] = true;
          saveNow();
          toast('Solved');
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Code (free-form editor)
  // ---------------------------------------------------------------------------

  let ideCM = null;

  function showIde() {
    if (ideCM) {
      ideCM.refresh();
      return;
    }
    ideCM = makeEditor($('#ideEditor'), state.ideCode || TEMPLATES[0].code);
    ideCM.on('change', () => { state.ideCode = ideCM.getValue(); saveSoon(); });
    $('#ideStdin').value = state.ideStdin || '';
  }

  const templateSelect = $('#ideTemplate');
  TEMPLATES.forEach((t) => templateSelect.append(el('option', { value: t.id, text: t.label })));

  templateSelect.addEventListener('change', () => {
    const t = TEMPLATES.find((x) => x.id === templateSelect.value);
    templateSelect.value = '';
    if (!t) return;
    const current = ideCM.getValue();
    const unchanged = !current.trim() || TEMPLATES.some((x) => x.code === current);
    if (!unchanged && !confirm('Replace the code in the editor with "' + t.label + '"?')) return;
    ideCM.setValue(t.code);
    $('#ideStdin').value = t.stdin || '';
    state.ideStdin = $('#ideStdin').value;
    saveSoon();
    showPlaceholder($('#ideOutput'), 'Press Run to compile and run your code.');
  });

  $('#ideStdin').addEventListener('input', (e) => { state.ideStdin = e.target.value; saveSoon(); });

  $('#ideRun').addEventListener('click', async () => {
    const button = $('#ideRun');
    const panel = $('#ideOutput');
    setBusy(button, true);
    showBusy(panel);
    const result = await runCpp(ideCM.getValue(), $('#ideStdin').value);
    setBusy(button, false);
    showRun(panel, result);
    if (result.phase === 'ok') recordActivity();
  });

  showPlaceholder($('#ideOutput'), 'Press Run to compile and run your code.');

  // ---------------------------------------------------------------------------
  // Reference
  // ---------------------------------------------------------------------------

  function renderReference() {
    const root = $('#refContent');
    if (root.childElementCount) return;
    REFERENCE.forEach((section) => {
      root.append(el('h3', { text: section.title }));
      root.append(el('div', { class: 'list' }, section.items.map((item) => {
        const button = el('button', { class: 'ref-item' }, [el('code', { text: item.code }), el('span', { text: item.desc })]);
        button.addEventListener('click', () => copyText(item.code));
        return button;
      })));
    });
  }

  function copyText(text) {
    if (!navigator.clipboard) {
      toast('Copying isn\'t available here. Long-press the text instead.');
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast('Copied'),
      () => toast('Couldn\'t copy. Long-press the text instead.')
    );
  }

  // ---------------------------------------------------------------------------
  // Progress
  // ---------------------------------------------------------------------------

  function renderProgress() {
    const lessonsDone = allLessons.filter((l) => state.completed[l.id]).length;
    const practiceDone = PRACTICE.filter((p) => state.practiceDone[p.id]).length;
    $('#statLessons').textContent = lessonsDone + '/' + allLessons.length;
    $('#statPractice').textContent = practiceDone + '/' + PRACTICE.length;
    $('#statStreak').textContent = currentStreak();

    $('#moduleProgress').replaceChildren(...MODULES.map((m, i) => {
      const done = m.lessons.filter((l) => state.completed[l.id]).length;
      return el('div', { class: 'mod-progress' }, [
        el('span', { text: (i + 1) + '. ' + m.title }),
        el('span', { class: 'small', text: done + '/' + m.lessons.length }),
        el('div', { class: 'bar' }, el('span', { style: 'width:' + Math.round(done / m.lessons.length * 100) + '%' }))
      ]);
    }));
  }

  $('#resetProgress').addEventListener('click', () => {
    if (!confirm('Erase all progress and saved code on this device? This can\'t be undone.')) return;
    state = freshState();
    saveNow();
    if (ideCM) ideCM.setValue(TEMPLATES[0].code);
    $('#ideStdin').value = '';
    openModules.clear();
    renderProgress();
    toast('Progress reset');
  });

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  route();
})();
