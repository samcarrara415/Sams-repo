// Synthetic, deterministic commit history used by `--demo` (screenshots, trying it out).

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REPOS = ['api-server', 'web-app', 'cli-tools', 'dotfiles', 'side-quest', 'ml-experiments'];
const FILES = [
  ['src/server.ts', 6], ['src/routes/users.ts', 4], ['web/components/App.tsx', 5],
  ['crates/core/src/lib.rs', 3], ['scripts/train.py', 3], ['cmd/root.go', 2],
  ['README.md', 1], ['.github/workflows/ci.yml', 1], ['styles/main.css', 1], ['install.sh', 1],
];
const SUBJECTS = [
  'fix', 'wip', 'fix typo', 'add rate limiting to auth endpoints', 'refactor user service',
  'fix flaky test', 'bump deps', 'implement dark mode', 'fix: handle empty payloads',
  'feat: streaming responses', 'make it faster', 'cleanup', 'add caching layer',
  'fix off-by-one in pagination', 'initial commit', 'ship it', 'docs: update readme',
  'perf: avoid n+1 queries', 'rewrite parser', 'please work',
];

export function demoCommits(year, seed = 2026) {
  const rand = rng(seed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const weighted = (pairs) => {
    const total = pairs.reduce((a, [, w]) => a + w, 0);
    let r = rand() * total;
    for (const [v, w] of pairs) if ((r -= w) < 0) return v;
    return pairs[0][0];
  };
  // Night-owl leaning hour distribution.
  const hours = Array.from({ length: 24 }, (_, h) => [h, h >= 21 || h <= 1 ? 9 : h >= 10 && h <= 18 ? 4 : h <= 6 ? 0.4 : 2]);

  const commits = [];
  const start = Date.UTC(year, 0, 1);
  let n = 0;
  for (let day = 0; day < 365; day += 1) {
    const date = new Date(start + day * 86_400_000).toISOString().slice(0, 10);
    const weekend = [0, 6].includes(new Date(start + day * 86_400_000).getUTCDay());
    const season = 0.6 + 0.4 * Math.sin((day / 365) * Math.PI * 2 - 1);
    if (rand() > (weekend ? 0.45 : 0.8) * season + 0.1) continue;
    const count = 1 + Math.floor(rand() ** 2 * 9);
    for (let i = 0; i < count; i += 1) {
      const hour = weighted(hours);
      const files = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => {
        const path = weighted(FILES.map(([p, w]) => [p, w]));
        const added = Math.floor(rand() ** 2 * 120) + 1;
        return { path, added, deleted: Math.floor(added * rand() * 0.7), binary: false };
      });
      n += 1;
      commits.push({
        hash: `demo${n.toString(16).padStart(8, '0')}`,
        repo: pick(REPOS),
        name: 'Demo Dev',
        email: 'demo@example.com',
        iso: `${date}T${String(hour).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}:00Z`,
        date,
        hour,
        subject: pick(SUBJECTS),
        files,
      });
    }
  }
  return commits;
}
