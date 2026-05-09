/* C++ Academy app shell.
 * Router, lesson rendering, in-browser C++ runner (JSCPP), progress tracking.
 */

(function () {
  'use strict';

  // ----- State ---------------------------------------------------------------
  const STORAGE_KEY = 'cpp-academy:v1';
  const defaultState = {
    completed: {},        // { lessonId: true }
    practiceDone: {},     // { practiceId: true }
    xp: 0,
    streakDays: 0,
    lastActive: null,     // ISO date
    snippet: ''           // saved IDE code
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, defaultState);
      const parsed = JSON.parse(raw);
      return Object.assign({}, defaultState, parsed);
    } catch (e) {
      return Object.assign({}, defaultState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  let state = loadState();

  // bump streak
  (function bumpStreak() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastActive !== today) {
      const prev = state.lastActive ? new Date(state.lastActive) : null;
      const todayDate = new Date(today);
      const diffDays = prev ? Math.round((todayDate - prev) / 86400000) : null;
      if (diffDays === 1) state.streakDays = (state.streakDays || 0) + 1;
      else state.streakDays = 1;
      state.lastActive = today;
      saveState();
    }
  })();

  // ----- DOM helpers ---------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function toast(msg, kind) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toast._tid);
    toast._tid = setTimeout(() => { t.className = 'toast'; }, 2400);
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ----- Routing -------------------------------------------------------------
  const TAB_TITLES = {
    learn: 'C++ Academy',
    code: 'In-browser IDE',
    practice: 'Practice arena',
    ref: 'Quick reference',
    progress: 'Your progress',
    lesson: 'Lesson'
  };

  function showTab(tab) {
    $$('.view').forEach((v) => v.classList.remove('active'));
    const target = document.getElementById('view-' + tab);
    if (target) target.classList.add('active');
    $$('#nav button').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    if (TAB_TITLES[tab]) $('#topTitle').textContent = TAB_TITLES[tab];
    $('#main').scrollTop = 0;

    if (tab === 'learn') renderModuleList();
    if (tab === 'practice') renderPractice();
    if (tab === 'ref') renderReference();
    if (tab === 'progress') renderProgress();
    if (tab === 'code') ensureIde();
  }

  $$('#nav button').forEach((b) => {
    b.addEventListener('click', () => showTab(b.dataset.tab));
  });

  // ----- CodeMirror helpers --------------------------------------------------
  function makeEditor(textarea, opts) {
    const cm = CodeMirror.fromTextArea(textarea, Object.assign({
      mode: 'text/x-c++src',
      theme: 'dracula',
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      smartIndent: true,
      lineWrapping: true,
      autoCloseBrackets: false,
      viewportMargin: Infinity
    }, opts || {}));
    cm.setSize('100%', 'auto');
    return cm;
  }

  // ----- C++ runner ----------------------------------------------------------
  function runCpp(code, stdin) {
    return new Promise((resolve) => {
      let out = '';
      let err = '';
      try {
        if (typeof JSCPP === 'undefined') {
          err = 'C++ runtime not loaded yet — check your internet connection.';
          resolve({ output: '', error: err });
          return;
        }
        const config = {
          stdio: {
            write: function (s) { out += s; }
          },
          unsigned_overflow: 'warn',
          maxTimeout: 5000,
          maxExecutionSteps: 5_000_000
        };
        const exitCode = JSCPP.run(code, stdin || '', config);
        resolve({ output: out, error: '', exitCode: exitCode });
      } catch (e) {
        err = String((e && e.message) || e);
        resolve({ output: out, error: err });
      }
    });
  }

  function showResult(blockEl, res) {
    if (res.error) {
      blockEl.className = 'io-block bad';
      blockEl.textContent = (res.output ? res.output + '\n' : '') + '⚠ ' + res.error;
    } else if (!res.output) {
      blockEl.className = 'io-block';
      blockEl.textContent = '(no output)';
    } else {
      blockEl.className = 'io-block';
      blockEl.textContent = res.output;
    }
  }

  // ----- Learn (module list) -------------------------------------------------
  const allLessons = MODULES.flatMap((m) => m.lessons.map((l) => ({ moduleId: m.id, ...l })));
  const totalLessons = allLessons.length;

  function moduleProgress(mod) {
    const done = mod.lessons.filter((l) => state.completed[l.id]).length;
    return { done, total: mod.lessons.length };
  }

  function renderModuleList() {
    const q = ($('#lessonSearch').value || '').trim().toLowerCase();
    const root = $('#moduleList');
    root.innerHTML = '';
    let totalDone = 0;

    MODULES.forEach((mod, mi) => {
      const { done, total } = moduleProgress(mod);
      totalDone += done;

      const filteredLessons = q
        ? mod.lessons.filter((l) => l.title.toLowerCase().includes(q))
        : mod.lessons;
      if (q && filteredLessons.length === 0) return;

      const wasOpen = root.querySelector('[data-mod="' + mod.id + '"].open') != null;

      const el = document.createElement('div');
      el.className = 'module' + (q || wasOpen || done === 0 && mi === 0 ? ' open' : '');
      el.dataset.mod = mod.id;

      el.innerHTML = `
        <div class="module-head">
          <div class="num">${mi + 1}</div>
          <div class="meta">
            <div class="title">${escapeHtml(mod.title)}</div>
            <div class="sub">${escapeHtml(mod.sub)} · ${done}/${total}</div>
          </div>
          <div class="chev">▶</div>
        </div>
        <div class="module-body"></div>
      `;
      el.querySelector('.module-head').addEventListener('click', () => {
        el.classList.toggle('open');
      });

      const body = el.querySelector('.module-body');
      filteredLessons.forEach((les, li) => {
        const row = document.createElement('div');
        row.className = 'lesson-row' + (state.completed[les.id] ? ' done' : '');
        row.innerHTML = `
          <div class="check">${state.completed[les.id] ? '✓' : ''}</div>
          <div class="ltitle">${escapeHtml(les.title)}</div>
          <div class="lbadge">+10 XP</div>
        `;
        row.addEventListener('click', () => openLesson(les.id));
        body.appendChild(row);
      });

      root.appendChild(el);
    });

    const overall = $('#overallBar');
    overall.style.width = (totalLessons === 0 ? 0 : Math.round(totalDone / totalLessons * 100)) + '%';
    $('#overallText').textContent = totalDone + ' of ' + totalLessons + ' lessons complete';

    if (totalDone === 0) {
      $('#greetTitle').textContent = 'Welcome, future C++ wizard';
      $('#greetText').textContent = 'Tap a lesson to start. Each one ends with a runnable challenge.';
    } else if (totalDone < totalLessons) {
      $('#greetTitle').textContent = 'Welcome back!';
      $('#greetText').textContent = `${totalDone} done — ${totalLessons - totalDone} to go. You're on a ${state.streakDays}-day streak.`;
    } else {
      $('#greetTitle').textContent = '🎓 Course complete!';
      $('#greetText').textContent = 'Replay any lesson, or sharpen up in Practice.';
    }
  }

  $('#lessonSearch').addEventListener('input', renderModuleList);

  // ----- Lesson view ---------------------------------------------------------
  let lessonExampleCM = null;
  let lessonExerciseCM = null;
  let currentLessonId = null;
  let hintShown = false;

  function findLesson(id) {
    for (const m of MODULES) {
      const idx = m.lessons.findIndex((l) => l.id === id);
      if (idx >= 0) {
        return {
          module: m,
          lesson: m.lessons[idx],
          index: idx,
          flatIndex: allLessons.findIndex((l) => l.id === id)
        };
      }
    }
    return null;
  }

  function openLesson(id) {
    const found = findLesson(id);
    if (!found) return;
    const { module: mod, lesson } = found;
    currentLessonId = id;
    hintShown = false;

    showTab('lesson');
    $('#topTitle').textContent = lesson.title;

    $('#lessonCrumbs').textContent = mod.title + ' › ' + lesson.title;
    $('#lessonTitle').textContent = lesson.title;
    $('#lessonBody').innerHTML = lesson.body;

    // example editor
    const exTa = $('#lessonExample');
    exTa.value = lesson.example || '// no example';
    if (lessonExampleCM) lessonExampleCM.toTextArea();
    lessonExampleCM = makeEditor(exTa, { readOnly: false });

    $('#lessonOutput').textContent = '—';
    $('#lessonOutput').className = 'io-block';

    // exercise
    const exBox = $('#lessonExerciseBox');
    if (lesson.exercise) {
      exBox.style.display = 'block';
      $('#lessonPrompt').innerHTML = lesson.exercise.prompt;
      const stTa = $('#lessonExerciseEditor');
      stTa.value = lesson.exercise.starter;
      if (lessonExerciseCM) lessonExerciseCM.toTextArea();
      lessonExerciseCM = makeEditor(stTa);

      const stdinLbl = $('#stdinLbl');
      const stdin = $('#lessonStdin');
      if (lesson.exercise.stdin) {
        stdinLbl.style.display = 'block';
        stdin.style.display = 'block';
        stdin.value = lesson.exercise.stdin;
      } else {
        stdinLbl.style.display = 'none';
        stdin.style.display = 'none';
        stdin.value = '';
      }
      $('#lessonExOut').textContent = '—';
      $('#lessonExOut').className = 'io-block';
      $('#lessonExExpected').textContent = lesson.exercise.expected;
    } else {
      exBox.style.display = 'none';
    }

    // prev / next
    const flat = allLessons;
    const idx = flat.findIndex((l) => l.id === id);
    $('#lessonPrev').disabled = idx <= 0;
    $('#lessonNext').disabled = idx >= flat.length - 1;
  }

  $('#lessonBack').addEventListener('click', () => showTab('learn'));
  $('#lessonPrev').addEventListener('click', () => {
    const idx = allLessons.findIndex((l) => l.id === currentLessonId);
    if (idx > 0) openLesson(allLessons[idx - 1].id);
  });
  $('#lessonNext').addEventListener('click', () => {
    const idx = allLessons.findIndex((l) => l.id === currentLessonId);
    if (idx >= 0 && idx < allLessons.length - 1) openLesson(allLessons[idx + 1].id);
  });

  $('#lessonRun').addEventListener('click', async () => {
    const code = lessonExampleCM ? lessonExampleCM.getValue() : '';
    $('#lessonOutput').textContent = 'Running…';
    const res = await runCpp(code, '');
    showResult($('#lessonOutput'), res);
  });
  $('#lessonReset').addEventListener('click', () => {
    const found = findLesson(currentLessonId);
    if (!found || !lessonExampleCM) return;
    lessonExampleCM.setValue(found.lesson.example || '');
    $('#lessonOutput').textContent = '—';
    $('#lessonOutput').className = 'io-block';
  });

  $('#lessonCheck').addEventListener('click', async () => {
    const found = findLesson(currentLessonId);
    if (!found || !found.lesson.exercise) return;
    const code = lessonExerciseCM.getValue();
    const stdin = $('#lessonStdin').value || '';
    $('#lessonExOut').textContent = 'Running…';
    const res = await runCpp(code, stdin);
    showResult($('#lessonExOut'), res);

    const expected = found.lesson.exercise.expected;
    const got = res.output || '';
    if (!res.error && normalize(got) === normalize(expected)) {
      $('#lessonExOut').className = 'io-block good';
      if (!state.completed[currentLessonId]) {
        state.completed[currentLessonId] = true;
        state.xp = (state.xp || 0) + 10;
        saveState();
        toast('+10 XP — lesson complete!', 'good');
      } else {
        toast('Correct again! ✨', 'good');
      }
      updateXpBadge();
    } else if (!res.error) {
      $('#lessonExOut').className = 'io-block bad';
      toast('Output didn\'t match. Compare with Expected.', 'bad');
    }
  });

  $('#lessonHint').addEventListener('click', () => {
    const found = findLesson(currentLessonId);
    if (!found || !found.lesson.exercise) return;
    toast('💡 ' + (found.lesson.exercise.hint || 'No hint available.'));
  });

  $('#lessonShowSol').addEventListener('click', () => {
    const found = findLesson(currentLessonId);
    if (!found || !found.lesson.exercise) return;
    if (!confirm('Show the full solution?')) return;
    lessonExerciseCM.setValue(found.lesson.exercise.solution);
  });

  function normalize(s) {
    return (s || '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n+$/, '\n');
  }

  // ----- IDE -----------------------------------------------------------------
  let ideCM = null;
  function ensureIde() {
    if (ideCM) return;
    const ta = $('#ideEditor');
    ta.value = state.snippet || TEMPLATES.hello;
    ideCM = makeEditor(ta);
    ideCM.setSize('100%', '60vh');
  }

  $('#ideTemplate').addEventListener('change', (e) => {
    const v = e.target.value;
    if (!v) return;
    if (TEMPLATES[v] && ideCM) {
      if (!confirm('Replace your code with this template?')) {
        e.target.value = '';
        return;
      }
      ideCM.setValue(TEMPLATES[v]);
    }
    e.target.value = '';
  });

  $('#ideRun').addEventListener('click', async () => {
    const code = ideCM ? ideCM.getValue() : '';
    const stdin = $('#ideStdin').value || '';
    $('#ideOutput').textContent = 'Compiling & running…';
    const res = await runCpp(code, stdin);
    showResult($('#ideOutput'), res);
  });

  $('#ideClear').addEventListener('click', () => {
    $('#ideOutput').textContent = '—';
    $('#ideOutput').className = 'io-block';
  });

  $('#ideSave').addEventListener('click', () => {
    if (!ideCM) return;
    state.snippet = ideCM.getValue();
    saveState();
    toast('Snippet saved locally', 'good');
  });

  // ----- Practice ------------------------------------------------------------
  let practiceCMs = {}; // id -> CodeMirror

  function renderPractice() {
    const root = $('#practiceList');
    root.innerHTML = '';
    PRACTICE.forEach((p) => {
      const done = !!state.practiceDone[p.id];
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h2>${escapeHtml(p.title)} <span style="font-size:0.7rem;color:var(--muted);font-weight:500;">[${p.diff}] ${done ? '✓ solved' : ''}</span></h2>
        <p>${p.prompt}</p>
        <div class="editor-wrap" style="margin-top:10px;"><textarea data-pid="${p.id}"></textarea></div>
        ${p.stdin ? `<div class="io-label" style="margin-top:8px;">Stdin</div><div class="io-block" style="white-space:pre;">${escapeHtml(p.stdin)}</div>` : ''}
        <div class="btn-row">
          <button class="btn" data-act="run" data-pid="${p.id}">▶ Run &amp; check</button>
          <button class="btn secondary" data-act="reset" data-pid="${p.id}">Reset</button>
          <button class="btn secondary" data-act="sol" data-pid="${p.id}">Show solution</button>
        </div>
        <div class="io-label">Output</div>
        <div class="io-block" data-out="${p.id}">—</div>
        <div class="io-label" style="margin-top:6px;">Expected</div>
        <div class="io-block" style="white-space:pre;">${escapeHtml(p.expected)}</div>
      `;
      root.appendChild(card);

      const ta = card.querySelector('textarea');
      ta.value = p.starter;
      const cm = makeEditor(ta);
      practiceCMs[p.id] = cm;
    });

    root.querySelectorAll('button[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => onPracticeAction(btn.dataset.act, btn.dataset.pid));
    });
  }

  async function onPracticeAction(act, pid) {
    const p = PRACTICE.find((x) => x.id === pid);
    if (!p) return;
    const cm = practiceCMs[pid];
    if (!cm) return;
    const outEl = document.querySelector('[data-out="' + pid + '"]');

    if (act === 'reset') {
      cm.setValue(p.starter);
      outEl.textContent = '—';
      outEl.className = 'io-block';
      return;
    }
    if (act === 'sol') {
      if (!confirm('Show the full solution?')) return;
      cm.setValue(p.solution);
      return;
    }
    if (act === 'run') {
      outEl.textContent = 'Running…';
      const res = await runCpp(cm.getValue(), p.stdin || '');
      showResult(outEl, res);
      if (!res.error && normalize(res.output) === normalize(p.expected)) {
        outEl.className = 'io-block good';
        if (!state.practiceDone[pid]) {
          state.practiceDone[pid] = true;
          state.xp = (state.xp || 0) + 15;
          saveState();
          toast('+15 XP — challenge solved!', 'good');
          updateXpBadge();
          // refresh status badge text
          renderPractice();
        } else {
          toast('Solved (already credited).', 'good');
        }
      } else if (!res.error) {
        outEl.className = 'io-block bad';
        toast('Not quite — compare with Expected.', 'bad');
      }
    }
  }

  // ----- Reference -----------------------------------------------------------
  function renderReference() {
    const root = $('#refContent');
    root.innerHTML = '';
    REFERENCE.forEach((sec) => {
      const div = document.createElement('div');
      div.className = 'ref-section';
      div.innerHTML = `<h3>${escapeHtml(sec.title)}</h3>` + sec.items.map((it) => `
        <div class="pair" data-copy="${escapeHtml(it.code)}">
          <code>${escapeHtml(it.code)}</code>
          <div class="desc">${escapeHtml(it.desc)}</div>
        </div>
      `).join('');
      root.appendChild(div);
    });
    root.querySelectorAll('.pair').forEach((el) => {
      el.addEventListener('click', () => {
        const txt = el.dataset.copy;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(txt).then(
            () => toast('Copied: ' + txt.slice(0, 40), 'good'),
            () => toast('Copy failed (try long-press the code).', 'bad')
          );
        } else {
          toast('Clipboard unavailable.');
        }
      });
    });
  }

  // ----- Progress ------------------------------------------------------------
  function renderProgress() {
    const lessonsDone = Object.keys(state.completed).length;
    const practiceDone = Object.keys(state.practiceDone).length;
    let modulesDone = 0;
    MODULES.forEach((m) => {
      if (m.lessons.every((l) => state.completed[l.id])) modulesDone++;
    });
    const pct = totalLessons === 0 ? 0 : Math.round(lessonsDone / totalLessons * 100);

    $('#pXp').textContent = state.xp || 0;
    $('#pLessons').textContent = lessonsDone + '/' + totalLessons;
    $('#pStreak').textContent = state.streakDays || 0;
    $('#pSolved').textContent = practiceDone + '/' + PRACTICE.length;
    $('#pBar').style.width = pct + '%';
    $('#pBarText').textContent = pct + '% complete';

    const grid = $('#badgeGrid');
    grid.innerHTML = '';
    const stats = { lessonsDone, practiceDone, modulesDone };
    BADGES.forEach((b) => {
      const earned = b.test(stats);
      const div = document.createElement('div');
      div.className = 'badge' + (earned ? '' : ' locked');
      div.innerHTML = `<div class="ico">${b.icon}</div><div class="nm">${escapeHtml(b.name)}</div>`;
      grid.appendChild(div);
    });
  }

  $('#resetProgress').addEventListener('click', () => {
    if (!confirm('Erase all saved progress and snippets? This cannot be undone.')) return;
    state = Object.assign({}, defaultState);
    state.lastActive = new Date().toISOString().slice(0, 10);
    state.streakDays = 1;
    saveState();
    updateXpBadge();
    renderProgress();
    renderModuleList();
    toast('Progress reset.', 'good');
  });

  // ----- Top-bar XP badge ----------------------------------------------------
  function updateXpBadge() {
    $('#xpBadge').textContent = (state.xp || 0) + ' XP';
  }

  // ----- Service worker ------------------------------------------------------
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // ----- Init ----------------------------------------------------------------
  updateXpBadge();
  renderModuleList();
})();
