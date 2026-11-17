#!/usr/bin/env node
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyze } from '../src/analyze.js';
import { collect, findRepos, gitConfig, repoRoot } from '../src/collect.js';
import { demoCommits } from '../src/demo.js';
import { printSections, renderTerminal } from '../src/render-terminal.js';
import { renderSvg } from '../src/render-svg.js';

const HELP = `
git-wrapped — your year in git, wrapped.

Usage
  git-wrapped [repo...] [options]
  git wrapped              (works as a git subcommand once installed)

Options
  --year <yyyy>        Year to wrap (default: this year)
  --scan <dir>         Find every git repo under <dir> and wrap them together
  --author <pattern>   Count commits whose "Name <email>" contains <pattern>
                       (repeatable; default: your git user.name and user.email)
  --everyone           Count commits from every author
  --all                Include all local/remote branches and tags, not just HEAD
  --name <name>        Name to show on the card (default: git user.name)
  --svg <file>         Write a shareable 1200×630 SVG card
  --json               Print raw stats as JSON
  --demo               Use a generated demo history (no git needed)
  --no-anim            Print instantly
  --no-color           Disable colors (NO_COLOR is respected too)
  -h, --help           Show help
  -v, --version        Show version

Examples
  git-wrapped
  git-wrapped --scan ~/code --svg wrapped.svg
  git-wrapped --year 2025 --author octocat
`;

function parseArgs(argv) {
  const opts = { repos: [], authors: [], scan: [], color: !process.env.NO_COLOR, anim: true };
  const needValue = (flag, i) => {
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) fail(`${flag} needs a value`);
    return v;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    switch (a) {
      case '--year': opts.year = Number(needValue(a, i)); i += 1; break;
      case '--scan': opts.scan.push(needValue(a, i)); i += 1; break;
      case '--author': opts.authors.push(needValue(a, i)); i += 1; break;
      case '--name': opts.name = needValue(a, i); i += 1; break;
      case '--svg': opts.svg = needValue(a, i); i += 1; break;
      case '--everyone': opts.everyone = true; break;
      case '--all': opts.all = true; break;
      case '--json': opts.json = true; break;
      case '--demo': opts.demo = true; break;
      case '--no-anim': opts.anim = false; break;
      case '--no-color': opts.color = false; break;
      case '-h': case '--help': opts.help = true; break;
      case '-v': case '--version': opts.version = true; break;
      default:
        if (a.startsWith('-')) fail(`unknown option ${a}`);
        opts.repos.push(a);
    }
  }
  if (opts.year !== undefined && !(Number.isInteger(opts.year) && opts.year > 1970 && opts.year < 3000)) {
    fail('--year must be a four-digit year');
  }
  return opts;
}

function fail(message) {
  process.stderr.write(`git-wrapped: ${message}\nRun git-wrapped --help for usage.\n`);
  process.exit(1);
}

// Quietly stop when piped into something like `head`.
process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0);
  throw err;
});

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return void process.stdout.write(HELP);
  if (opts.version) {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    return void process.stdout.write(`${pkg.version}\n`);
  }

  const year = opts.year ?? new Date().getFullYear();
  let commits;
  let name = opts.name;

  if (opts.demo) {
    commits = demoCommits(year);
    name ??= 'demo';
  } else {
    const repos = new Set();
    for (const dir of opts.scan) for (const r of findRepos(dir)) repos.add(resolve(r));
    const explicit = opts.repos.length ? opts.repos : opts.scan.length ? [] : ['.'];
    for (const r of explicit) {
      const root = repoRoot(r);
      if (!root) fail(`${r} is not inside a git repository`);
      repos.add(root);
    }
    if (repos.size === 0) fail('no git repositories found');

    let authors = opts.authors;
    if (!opts.everyone && authors.length === 0) {
      authors = [gitConfig('user.email'), gitConfig('user.name')].filter(Boolean);
      if (authors.length === 0) {
        process.stderr.write('git-wrapped: no git user configured; counting every author.\n');
      }
    }
    name ??= opts.everyone ? undefined : gitConfig('user.name') ?? undefined;
    commits = collect([...repos], { year, allBranches: opts.all, authors: opts.everyone ? [] : authors });
  }

  const stats = analyze(commits, { year });

  if (opts.json) {
    const { heatmap, ...rest } = stats;
    process.stdout.write(`${JSON.stringify(rest, null, 2)}\n`);
  } else {
    const tty = Boolean(process.stdout.isTTY);
    await printSections(renderTerminal(stats, { color: opts.color && tty, name }), { animate: opts.anim && tty });
  }

  if (opts.svg) {
    writeFileSync(opts.svg, renderSvg(stats, { name }));
    if (!opts.json) process.stdout.write(`  Card saved to ${opts.svg} — share it, or drop it in your profile README.\n\n`);
  }
}

main().catch((err) => fail(err.message));
