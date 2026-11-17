import { SHORT_MONTH_NAMES, compact, hour12, num, plural, shortDate, truncate, wrap } from './format.js';

const SPARK = '▁▂▃▄▅▆▇█';

function palette(color) {
  const wrapCode = (open) => (s) => (color ? `\x1b[${open}m${s}\x1b[0m` : String(s));
  return {
    bold: wrapCode('1'),
    dim: wrapCode('2'),
    green: wrapCode('32'),
    red: wrapCode('31'),
    yellow: wrapCode('33'),
    magenta: wrapCode('35'),
    cyan: wrapCode('36'),
    accent: wrapCode('1;38;5;213'),
    cell: (level) => {
      if (!color) return ' ░▒▓█'[level];
      const shades = [236, 22, 28, 34, 46];
      return `\x1b[38;5;${shades[level]}m■\x1b[0m`;
    },
  };
}

const sparkline = (values) => {
  const max = Math.max(...values, 1);
  return values.map((v) => SPARK[Math.round((v / max) * (SPARK.length - 1))]).join('');
};

const bar = (share, width) => {
  const filled = Math.max(1, Math.round(share * width));
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};

function heatmapLines(grid, c) {
  // Month labels above the week columns.
  let labels = '';
  grid.forEach((week, i) => {
    const firstOfMonth = week.find((d) => d.level >= 0 && d.date.endsWith('-01'));
    if (firstOfMonth && labels.length <= i) {
      labels = labels.padEnd(i) + SHORT_MONTH_NAMES[Number(firstOfMonth.date.slice(5, 7)) - 1];
    }
  });
  const rows = [`      ${c.dim(labels)}`];
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  for (let d = 0; d < 7; d += 1) {
    const cells = grid.map((week) => (week[d].level < 0 ? ' ' : c.cell(week[d].level))).join('');
    rows.push(`  ${c.dim(dayLabels[d].padEnd(4))}${cells}`);
  }
  return rows;
}

export function renderTerminal(stats, { color = true, name } = {}) {
  const c = palette(color);
  const t = stats.totals;
  const sections = [];

  const title = `${name ? `${name}'s ` : 'your '}${stats.year} in git`;
  const inner = `  ${title.toUpperCase()}  ·  WRAPPED  `;
  sections.push([
    '',
    `  ${c.magenta(`╭${'─'.repeat(inner.length)}╮`)}`,
    `  ${c.magenta('│')}${c.accent(inner)}${c.magenta('│')}`,
    `  ${c.magenta(`╰${'─'.repeat(inner.length)}╯`)}`,
  ]);

  if (t.commits === 0) {
    sections.push([
      '',
      `  No commits found for ${stats.year}.`,
      c.dim('  Try --everyone, --author <you>, --all, or --scan ~/code to look further.'),
      '',
    ]);
    return sections;
  }

  sections.push([
    '',
    `  ${c.accent(num(t.commits))} ${c.bold(t.commits === 1 ? 'commit' : 'commits')}  across ${c.bold(plural(t.repos, 'repo'))}`,
    `  ${c.green(`+${num(t.added)}`)} ${c.dim('/')} ${c.red(`−${num(t.deleted)}`)} lines  ${c.dim('·')}  ${num(t.files)} files touched`,
    `  ${c.bold(num(t.activeDays))} active days  ${c.dim('·')}  longest streak ${c.yellow(plural(stats.streak.length, 'day'))}`
      + (stats.streak.length > 1 ? c.dim(` (${shortDate(stats.streak.start)} → ${shortDate(stats.streak.end)})`) : ''),
  ]);

  sections.push(['', ...heatmapLines(stats.heatmap, c)]);

  const rhythm = [
    '',
    `  ${c.bold('Rhythm')}`,
    `    Peak hour       ${c.cyan(hour12(stats.peakHour))}   ${c.dim('12a')} ${c.magenta(sparkline(stats.byHour))} ${c.dim('11p')}`,
    `    Favorite day    ${c.cyan(stats.favoriteWeekday)}`,
    `    Biggest month   ${c.cyan(stats.topMonth)}`,
  ];
  if (stats.busiestDay) {
    rhythm.push(`    Busiest day     ${c.cyan(shortDate(stats.busiestDay.date))} ${c.dim(`— ${plural(stats.busiestDay.commits, 'commit')}`)}`);
  }
  sections.push(rhythm);

  if (stats.languages.length) {
    const langs = stats.languages.slice(0, 5);
    const widest = Math.max(...langs.map((l) => l.name.length));
    sections.push([
      '',
      `  ${c.bold('Top languages')}`,
      ...langs.map((l) => `    ${l.name.padEnd(widest)}  ${c.magenta(bar(l.share, 24))} ${String(Math.round(l.share * 100)).padStart(3)}%`),
    ]);
  }

  const msg = ['', `  ${c.bold('Commit messages')}`];
  if (stats.messages.top && stats.messages.top.count > 1) {
    msg.push(`    Most repeated   "${truncate(stats.messages.top.text, 40)}" ${c.dim(`×${stats.messages.top.count}`)}`);
  }
  if (stats.messages.topWords.length) {
    msg.push(`    Favorite words  ${stats.messages.topWords.slice(0, 4).map((w) => `${w.word} ${c.dim(`×${w.count}`)}`).join(c.dim(' · '))}`);
  }
  msg.push(`    Bug fixes       ${num(stats.messages.fixes)}`);
  sections.push(msg);

  const moments = ['', `  ${c.bold('Moments')}`];
  if (stats.firstCommit) moments.push(`    First commit    ${c.dim(shortDate(stats.firstCommit.date))}  "${truncate(stats.firstCommit.subject, 48)}"`);
  if (stats.biggestCommit && stats.biggestCommit.lines > 0) {
    const b = stats.biggestCommit;
    moments.push(`    Biggest commit  ${c.green(`+${compact(b.added)}`)}${c.dim('/')}${c.red(`−${compact(b.deleted)}`)}  "${truncate(b.subject, 40)}" ${c.dim(`in ${b.repo}`)}`);
  }
  if (stats.lastCommit) moments.push(`    Latest commit   ${c.dim(shortDate(stats.lastCommit.date))}  "${truncate(stats.lastCommit.subject, 48)}"`);
  if (stats.repos.length > 1) {
    moments.push(`    Top repos       ${stats.repos.slice(0, 3).map((r) => `${r.name} ${c.dim(`(${num(r.commits)})`)}`).join(c.dim(' · '))}`);
  }
  sections.push(moments);

  const p = stats.persona;
  sections.push([
    '',
    `  ${p.emoji}  ${c.dim('Your coding personality:')} ${c.accent(p.title.toUpperCase())}`,
    ...wrap(p.blurb, 66).map((l) => `      ${c.dim(l)}`),
    '',
  ]);

  return sections;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function printSections(sections, { animate }) {
  for (const section of sections) {
    for (const line of section) {
      process.stdout.write(`${line}\n`);
      if (animate) await sleep(18);
    }
    if (animate) await sleep(220);
  }
}
