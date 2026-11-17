import { compact, hour12, num, wrap } from './format.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const FONT = `ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif`;
const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

const W = 1200;
const H = 630;
const PAD = 60;

function tile(x, y, w, value, label) {
  return `
  <g transform="translate(${x} ${y})">
    <rect width="${w}" height="92" rx="16" fill="#ffffff" fill-opacity="0.045" stroke="#ffffff" stroke-opacity="0.08"/>
    <text x="22" y="46" font-size="32" font-weight="700" fill="#f0f6fc">${esc(value)}</text>
    <text x="22" y="74" font-size="14" font-weight="600" letter-spacing="1.5" fill="#8b949e">${esc(label.toUpperCase())}</text>
  </g>`;
}

export function renderSvg(stats, { name } = {}) {
  const t = stats.totals;
  const p = stats.persona ?? { emoji: '🌱', title: 'Just Getting Started', blurb: 'No commits yet this year. Plenty of time to change that.' };

  const cell = 16;
  const gap = 4;
  const gridWidth = stats.heatmap.length * (cell + gap) - gap;
  const gridX = (W - gridWidth) / 2;
  const gridY = 462;
  const cells = stats.heatmap
    .flatMap((week, w) =>
      week.map((d, i) =>
        d.level < 0
          ? ''
          : `<rect x="${gridX + w * (cell + gap)}" y="${gridY + i * (cell + gap)}" width="${cell}" height="${cell}" rx="3.5" fill="${LEVEL_COLORS[d.level]}"><title>${d.date}: ${d.count}</title></rect>`,
      ),
    )
    .join('');

  const tileW = (W - PAD * 2 - 3 * 20) / 4;
  const topLang = stats.languages[0]?.name ?? '—';
  const tiles = [
    [num(t.activeDays), 'Active days'],
    [`${num(stats.streak.length)} day${stats.streak.length === 1 ? '' : 's'}`, 'Longest streak'],
    [stats.peakHour === null ? '—' : hour12(stats.peakHour), 'Peak hour'],
    [topLang, 'Top language'],
  ]
    .map(([v, l], i) => tile(PAD + i * (tileW + 20), 344, tileW, v, l))
    .join('');

  const blurb = wrap(p.blurb, 44)
    .slice(0, 3)
    .map((line, i) => `<text x="${664}" y="${248 + i * 26}" font-size="18" fill="#c9d1d9">${esc(line)}</text>`)
    .join('');

  const who = name ? `${name} · ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${esc(FONT)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d1117"/>
      <stop offset="1" stop-color="#1b1035"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.1" r="0.6">
      <stop offset="0" stop-color="#f778ba" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#f778ba" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a371f7"/>
      <stop offset="1" stop-color="#f778ba"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <text x="${PAD}" y="76" font-size="18" font-weight="800" letter-spacing="4" fill="#8b949e">GIT WRAPPED <tspan fill="url(#accent)">${stats.year}</tspan></text>
  <text x="${W - PAD}" y="76" font-size="18" font-weight="600" text-anchor="end" fill="#8b949e">${esc(who)}${esc(num(t.repos))} repo${t.repos === 1 ? '' : 's'}</text>

  <text x="${PAD - 4}" y="214" font-size="120" font-weight="800" letter-spacing="-4" fill="url(#accent)">${esc(num(t.commits))}</text>
  <text x="${PAD}" y="260" font-size="28" font-weight="600" fill="#f0f6fc">commits this year</text>
  <text x="${PAD}" y="300" font-size="22" font-weight="600"><tspan fill="#3fb950">+${esc(compact(t.added))}</tspan><tspan fill="#8b949e"> / </tspan><tspan fill="#f85149">−${esc(compact(t.deleted))}</tspan><tspan fill="#8b949e"> lines · ${esc(num(t.files))} files</tspan></text>

  <g>
    <rect x="636" y="112" width="${W - PAD - 636}" height="210" rx="20" fill="#ffffff" fill-opacity="0.045" stroke="url(#accent)" stroke-opacity="0.6"/>
    <text x="664" y="152" font-size="14" font-weight="700" letter-spacing="2" fill="#8b949e">YOUR CODING PERSONALITY</text>
    <text x="664" y="204" font-size="38" font-weight="800" fill="#f0f6fc">${esc(p.emoji)} ${esc(p.title)}</text>
    ${blurb}
  </g>
  ${tiles}
  ${cells}
</svg>
`;
}
