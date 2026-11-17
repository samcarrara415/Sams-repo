import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { analyze, heatmap, longestStreak } from '../src/analyze.js';
import { authorMatcher, collect, parseLog } from '../src/collect.js';
import { demoCommits } from '../src/demo.js';
import { isNoise, languageFor } from '../src/languages.js';
import { renderSvg } from '../src/render-svg.js';
import { renderTerminal } from '../src/render-terminal.js';

const RS = '\x1e';
const US = '\x1f';

test('parseLog reads headers, numstat and binary files', () => {
  const raw = [
    `${RS}abc${US}Ada${US}ada@example.com${US}2026-03-04T23:15:00-08:00${US}fix: tabs\tand | pipes`,
    '10\t2\tsrc/a.ts',
    '-\t-\tlogo.png',
    '',
    `${RS}def${US}Bob${US}bob@example.com${US}2026-03-05T09:00:00+00:00${US}empty commit`,
  ].join('\n');
  const commits = parseLog(raw, 'repo');
  assert.equal(commits.length, 2);
  assert.equal(commits[0].subject, 'fix: tabs\tand | pipes');
  assert.equal(commits[0].hour, 23, 'uses author-local hour');
  assert.equal(commits[0].date, '2026-03-04');
  assert.deepEqual(commits[0].files[1], { path: 'logo.png', added: 0, deleted: 0, binary: true });
  assert.equal(commits[1].files.length, 0);
});

test('authorMatcher matches name or email substrings, case-insensitively', () => {
  const m = authorMatcher(['ADA@example.com']);
  assert.ok(m({ name: 'Ada', email: 'ada@example.com' }));
  assert.ok(!m({ name: 'Bob', email: 'bob@example.com' }));
  assert.ok(authorMatcher([])({ name: 'x', email: 'y' }));
});

test('longestStreak finds the longest run of consecutive days, across month ends', () => {
  const s = longestStreak(['2026-01-30', '2026-01-31', '2026-02-01', '2026-02-03', '2026-02-01']);
  assert.deepEqual(s, { length: 3, start: '2026-01-30', end: '2026-02-01' });
  assert.equal(longestStreak([]).length, 0);
});

test('heatmap covers the whole year in Sunday-first weeks', () => {
  const grid = heatmap(new Map([['2026-01-01', 3]]), 2026);
  assert.equal(grid[0][4].date, '2026-01-01'); // Jan 1 2026 is a Thursday
  assert.equal(grid[0][3].level, -1); // Dec 31 2025 is outside the year
  assert.equal(grid[0][4].level, 1);
  const days = grid.flat().filter((d) => d.level >= 0);
  assert.equal(days.length, 365);
});

test('languages and noise filtering', () => {
  assert.equal(languageFor('src/App.tsx'), 'TypeScript');
  assert.equal(languageFor('Dockerfile.prod'), 'Dockerfile');
  assert.equal(languageFor('LICENSE'), null);
  assert.ok(isNoise('package-lock.json'));
  assert.ok(isNoise('web/dist/app.js'));
  assert.ok(isNoise('vendor/lib.min.js'));
  assert.ok(!isNoise('src/distance.js'));
});

test('analyze produces a persona and sensible totals for demo data', () => {
  const stats = analyze(demoCommits(2026), { year: 2026 });
  assert.ok(stats.totals.commits > 100);
  assert.ok(stats.totals.activeDays <= 365);
  assert.ok(stats.persona.title);
  assert.equal(stats.byHour.reduce((a, b) => a + b), stats.totals.commits);
  const shareSum = stats.languages.reduce((a, l) => a + l.share, 0);
  assert.ok(shareSum <= 1.0001);
});

test('empty year renders without crashing', () => {
  const stats = analyze([], { year: 2026 });
  assert.equal(stats.persona, null);
  const text = renderTerminal(stats, { color: false }).flat().join('\n');
  assert.match(text, /No commits found/);
  assert.match(renderSvg(stats), /<svg/);
});

test('SVG escapes user-controlled text', () => {
  const stats = analyze(demoCommits(2026), { year: 2026 });
  const svg = renderSvg(stats, { name: '<script>alert(1)</script>' });
  assert.ok(!svg.includes('<script>'));
  assert.ok(svg.includes('&lt;script&gt;'));
});

test('collect reads a real repository, filtering by author and year', () => {
  const dir = mkdtempSync(join(tmpdir(), 'git-wrapped-'));
  try {
    const run = (args, env = {}) =>
      execFileSync('git', args, { cwd: dir, env: { ...process.env, ...env }, stdio: 'pipe' });
    run(['init', '-q']);
    const commit = (who, date, file, body) => {
      writeFileSync(join(dir, file), body);
      run(['add', file]);
      run(['-c', `user.name=${who}`, '-c', `user.email=${who}@example.com`, 'commit', '-q', '-m', `edit ${file}`], {
        GIT_AUTHOR_DATE: date,
        GIT_COMMITTER_DATE: date,
      });
    };
    commit('ada', '2025-12-31T23:00:00+00:00', 'old.py', 'x\n');
    commit('ada', '2026-02-10T22:30:00+00:00', 'main.py', 'a\nb\nc\n');
    commit('bob', '2026-02-11T10:00:00+00:00', 'bob.go', 'x\n');
    commit('ada', '2026-02-11T23:59:00+00:00', 'main.py', 'a\n');

    const mine = collect([dir], { year: 2026, authors: ['ada@example.com'] });
    assert.equal(mine.length, 2);
    const stats = analyze(mine, { year: 2026 });
    assert.equal(stats.totals.added, 3);
    assert.equal(stats.totals.deleted, 2);
    assert.equal(stats.streak.length, 2);
    assert.equal(stats.languages[0].name, 'Python');

    assert.equal(collect([dir], { year: 2026, authors: [] }).length, 3);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
