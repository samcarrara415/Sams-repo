import { isNoise, languageFor } from './languages.js';

const DAY_MS = 86_400_000;

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const dayNumber = (date) =>
  Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))) / DAY_MS;
export const fromDayNumber = (n) => new Date(n * DAY_MS).toISOString().slice(0, 10);
const weekdayOf = (date) => new Date(dayNumber(date) * DAY_MS).getUTCDay();

const STOPWORDS = new Set(
  ('the and for with from into onto that this then than when where what which while '
    + 'add adds added use used uses using update updates updated make makes made '
    + 'some more less not but all any are was were has have had its it\'s new now '
    + 'also just via out off per too can will should would could them they there '
    + 'our your you one two get set got been being does did done only very').split(' '),
);

const argmax = (arr) => arr.reduce((best, v, i) => (v > arr[best] ? i : best), 0);
const inc = (map, key, by = 1) => map.set(key, (map.get(key) ?? 0) + by);
const topEntries = (map, n) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

export function longestStreak(dates) {
  const days = [...new Set(dates)].map(dayNumber).sort((a, b) => a - b);
  let best = { length: 0, start: null, end: null };
  let runStart = null;
  let runLen = 0;
  let prev = null;
  for (const d of days) {
    if (prev !== null && d === prev + 1) runLen += 1;
    else {
      runLen = 1;
      runStart = d;
    }
    if (runLen > best.length) best = { length: runLen, start: fromDayNumber(runStart), end: fromDayNumber(d) };
    prev = d;
  }
  return best;
}

/** GitHub-style contribution grid: weeks × 7 weekdays, levels 0–4 by quartile. */
export function heatmap(byDate, year) {
  const jan1 = dayNumber(`${year}-01-01`);
  const dec31 = dayNumber(`${year}-12-31`);
  const start = jan1 - new Date(jan1 * DAY_MS).getUTCDay();
  const weeks = Math.ceil((dec31 - start + 1) / 7);

  const nonzero = [...byDate.values()].filter(Boolean).sort((a, b) => a - b);
  const q = (p) => nonzero[Math.min(nonzero.length - 1, Math.floor(p * nonzero.length))] ?? 0;
  const thresholds = [q(0.25), q(0.5), q(0.75)];
  const level = (n) => (n === 0 ? 0 : 1 + thresholds.filter((t) => n > t).length);

  const grid = [];
  for (let w = 0; w < weeks; w += 1) {
    const col = [];
    for (let d = 0; d < 7; d += 1) {
      const day = start + w * 7 + d;
      const date = fromDayNumber(day);
      const inYear = day >= jan1 && day <= dec31;
      const count = inYear ? byDate.get(date) ?? 0 : 0;
      col.push({ date, count, level: inYear ? level(count) : -1 });
    }
    grid.push(col);
  }
  return grid;
}

function pickPersona(s) {
  const pct = (n) => Math.round(n * 100);
  const candidates = [
    {
      score: s.nightShare / 0.3,
      emoji: '🦉',
      title: 'The Night Owl',
      blurb: `${pct(s.nightShare)}% of your commits landed between 10 PM and 4 AM. Sleep is merely a suggestion.`,
    },
    {
      score: s.morningShare / 0.25,
      emoji: '🌅',
      title: 'The Early Bird',
      blurb: `${pct(s.morningShare)}% of your commits shipped before 9 AM. Coffee-powered and unstoppable.`,
    },
    {
      score: s.weekendShare / 0.3,
      emoji: '🏕️',
      title: 'The Weekend Warrior',
      blurb: `${pct(s.weekendShare)}% of your commits happened on Saturdays and Sundays. Side projects don't build themselves.`,
    },
    {
      score: s.fixShare / 0.3,
      emoji: '🐛',
      title: 'The Bug Hunter',
      blurb: `${pct(s.fixShare)}% of your commit messages were fixes. Somebody has to clean up, and it was you.`,
    },
    {
      score: s.deleted > s.added && s.deleted > 1000 ? 1.25 : 0,
      emoji: '🧹',
      title: 'The Declutterer',
      blurb: `You deleted more code than you wrote. The best code is no code, and you know it.`,
    },
    {
      score: s.streak / 30,
      emoji: '🏃',
      title: 'The Marathoner',
      blurb: `A ${s.streak}-day commit streak. Consistency is your superpower.`,
    },
    {
      score: s.perActiveDay / 10,
      emoji: '⚡',
      title: 'The Sprinter',
      blurb: `When you code, you go all in: ${s.perActiveDay.toFixed(1)} commits per active day.`,
    },
    {
      score: s.languageCount >= 6 ? s.languageCount / 7 : 0,
      emoji: '🌍',
      title: 'The Polyglot',
      blurb: `You wrote real code in ${s.languageCount} languages this year. Your brain is a compiler zoo.`,
    },
  ];
  const best = candidates.reduce((a, b) => (b.score > a.score ? b : a));
  if (best.score >= 1) return best;
  return {
    emoji: '🚢',
    title: 'The Steady Shipper',
    blurb: 'No drama, no all-nighters. Just shipping, week after week.',
  };
}

export function analyze(commits, { year }) {
  const byHour = Array(24).fill(0);
  const byWeekday = Array(7).fill(0);
  const byMonth = Array(12).fill(0);
  const byDate = new Map();
  const repos = new Map();
  const files = new Set();
  const langLines = new Map();
  const messages = new Map();
  const words = new Map();

  let added = 0;
  let deleted = 0;
  let fixes = 0;
  let biggest = null;
  let first = null;
  let last = null;

  for (const c of commits) {
    byHour[c.hour] += 1;
    byWeekday[weekdayOf(c.date)] += 1;
    byMonth[Number(c.date.slice(5, 7)) - 1] += 1;
    inc(byDate, c.date);
    inc(repos, c.repo);

    let cAdded = 0;
    let cDeleted = 0;
    for (const f of c.files) {
      files.add(`${c.repo}\0${f.path}`);
      if (f.binary || isNoise(f.path)) continue;
      cAdded += f.added;
      cDeleted += f.deleted;
      const lang = languageFor(f.path);
      if (lang) inc(langLines, lang, f.added + f.deleted);
    }
    added += cAdded;
    deleted += cDeleted;
    if (!biggest || cAdded + cDeleted > biggest.lines) {
      biggest = { subject: c.subject, repo: c.repo, hash: c.hash, date: c.date, added: cAdded, deleted: cDeleted, lines: cAdded + cDeleted };
    }

    const subject = c.subject.trim();
    const norm = subject.toLowerCase();
    if (norm) inc(messages, norm);
    if (/\b(fix(e[sd])?|bug|bugfix|hotfix|patch)\b/.test(norm)) fixes += 1;
    for (const w of norm.match(/[a-z][a-z'-]{2,}/g) ?? []) if (!STOPWORDS.has(w)) inc(words, w);

    const ts = Date.parse(c.iso);
    if (!first || ts < first.ts) first = { ts, subject, date: c.date, repo: c.repo };
    if (!last || ts > last.ts) last = { ts, subject, date: c.date, repo: c.repo };
  }

  const total = commits.length;
  const share = (n) => (total ? n / total : 0);
  const streak = longestStreak([...byDate.keys()]);
  const busiest = topEntries(byDate, 1)[0];
  const langTotal = [...langLines.values()].reduce((a, b) => a + b, 0);
  const languages = topEntries(langLines, 8).map(([name, lines]) => ({
    name,
    lines,
    share: langTotal ? lines / langTotal : 0,
  }));
  const topMessage = topEntries(messages, 1)[0];
  const nightShare = share([22, 23, 0, 1, 2, 3].reduce((a, h) => a + byHour[h], 0));
  const morningShare = share([5, 6, 7, 8].reduce((a, h) => a + byHour[h], 0));
  const weekendShare = share(byWeekday[0] + byWeekday[6]);

  return {
    year,
    totals: {
      commits: total,
      added,
      deleted,
      files: files.size,
      repos: repos.size,
      activeDays: byDate.size,
    },
    repos: topEntries(repos, 10).map(([name, commits]) => ({ name, commits })),
    streak,
    busiestDay: busiest ? { date: busiest[0], commits: busiest[1] } : null,
    peakHour: total ? argmax(byHour) : null,
    favoriteWeekday: total ? WEEKDAYS[argmax(byWeekday)] : null,
    topMonth: total ? MONTHS[argmax(byMonth)] : null,
    byHour,
    byWeekday,
    byMonth,
    languages,
    biggestCommit: biggest,
    firstCommit: first && { date: first.date, subject: first.subject, repo: first.repo },
    lastCommit: last && { date: last.date, subject: last.subject, repo: last.repo },
    messages: {
      top: topMessage ? { text: topMessage[0], count: topMessage[1] } : null,
      topWords: topEntries(words, 5).map(([word, count]) => ({ word, count })),
      fixes,
    },
    shares: { night: nightShare, morning: morningShare, weekend: weekendShare },
    persona: total
      ? pickPersona({
        nightShare,
        morningShare,
        weekendShare,
        fixShare: share(fixes),
        added,
        deleted,
        streak: streak.length,
        perActiveDay: byDate.size ? total / byDate.size : 0,
        languageCount: [...langLines.values()].filter((n) => n >= 200).length,
      })
      : null,
    heatmap: heatmap(byDate, year),
  };
}
