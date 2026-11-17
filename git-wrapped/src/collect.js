import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

// ASCII record/unit separators keep commit subjects with tabs, pipes, etc. safe.
const RS = '\x1e';
const US = '\x1f';

export function git(cwd, args) {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 30,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

export function repoRoot(dir) {
  try {
    return git(dir, ['rev-parse', '--show-toplevel']).trim();
  } catch {
    return null;
  }
}

export function gitConfig(key, cwd = process.cwd()) {
  try {
    return git(cwd, ['config', '--get', key]).trim() || null;
  } catch {
    return null;
  }
}

const SKIP_DIRS = new Set([
  'node_modules', 'vendor', 'dist', 'build', 'target', 'venv', '.venv',
  'Library', 'Applications', 'Pods', 'DerivedData', '__pycache__',
]);

/** Recursively find git repositories below `root` (does not descend into repos). */
export function findRepos(root, maxDepth = 4) {
  const found = [];
  const walk = (dir, depth) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((e) => e.name === '.git')) {
      found.push(dir);
      return;
    }
    if (depth >= maxDepth) return;
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
      walk(join(dir, e.name), depth + 1);
    }
  };
  walk(resolve(root), 0);
  return found;
}

/** Parse the output of `git log --pretty=<RS>%H<US>%an<US>%ae<US>%aI<US>%s --numstat`. */
export function parseLog(raw, repo) {
  const commits = [];
  for (const chunk of raw.split(RS)) {
    if (!chunk.trim()) continue;
    const nl = chunk.indexOf('\n');
    const header = nl === -1 ? chunk : chunk.slice(0, nl);
    const body = nl === -1 ? '' : chunk.slice(nl + 1);
    const [hash, name = '', email = '', iso, subject = ''] = header.split(US);
    if (!hash || !iso) continue;

    const files = [];
    for (const line of body.split('\n')) {
      const m = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(line);
      if (!m) continue;
      const binary = m[1] === '-';
      files.push({
        path: m[3],
        added: binary ? 0 : Number(m[1]),
        deleted: binary ? 0 : Number(m[2]),
        binary,
      });
    }

    commits.push({
      hash,
      repo,
      name,
      email,
      iso,
      // Author-local date and hour: 11 PM for the author is 11 PM, wherever they were.
      date: iso.slice(0, 10),
      hour: Number(iso.slice(11, 13)),
      subject,
      files,
    });
  }
  return commits;
}

/** Read every commit in `repoPath` authored during `year`. */
export function readCommits(repoPath, { year, allBranches = false }) {
  const args = [
    'log',
    '--no-merges',
    '--no-renames',
    // git filters on committer date; widen the window and filter on author date below.
    `--since=${year - 1}-12-31`,
    `--until=${year + 1}-01-31`,
    `--pretty=format:${RS}%H${US}%an${US}%ae${US}%aI${US}%s`,
    '--numstat',
  ];
  if (allBranches) args.push('--branches', '--remotes', '--tags');

  let raw;
  try {
    raw = git(repoPath, args);
  } catch {
    return []; // empty repo, no HEAD, etc.
  }
  const prefix = `${year}-`;
  return parseLog(raw, basename(repoPath)).filter((c) => c.date.startsWith(prefix));
}

/**
 * Build a predicate that decides whether a commit belongs to "you".
 * `patterns` are case-insensitive substrings matched against "Name <email>".
 */
export function authorMatcher(patterns) {
  const needles = patterns.filter(Boolean).map((p) => p.toLowerCase());
  if (needles.length === 0) return () => true;
  return (c) => {
    const who = `${c.name} <${c.email}>`.toLowerCase();
    return needles.some((n) => who.includes(n));
  };
}

export function collect(repoPaths, { year, allBranches, authors }) {
  const matches = authorMatcher(authors);
  const seen = new Set();
  const commits = [];
  for (const path of repoPaths) {
    for (const c of readCommits(path, { year, allBranches })) {
      if (seen.has(c.hash) || !matches(c)) continue;
      seen.add(c.hash);
      commits.push(c);
    }
  }
  return commits;
}
