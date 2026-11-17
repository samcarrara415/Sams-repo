const EXT = {
  js: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript', jsx: 'JavaScript',
  ts: 'TypeScript', tsx: 'TypeScript', mts: 'TypeScript', cts: 'TypeScript',
  py: 'Python', pyi: 'Python', ipynb: 'Jupyter',
  rb: 'Ruby', erb: 'Ruby',
  go: 'Go',
  rs: 'Rust',
  java: 'Java', kt: 'Kotlin', kts: 'Kotlin', scala: 'Scala', groovy: 'Groovy', gradle: 'Groovy',
  c: 'C', h: 'C',
  cc: 'C++', cpp: 'C++', cxx: 'C++', hpp: 'C++', hh: 'C++', hxx: 'C++',
  cs: 'C#', fs: 'F#',
  swift: 'Swift', m: 'Objective-C', mm: 'Objective-C',
  php: 'PHP',
  dart: 'Dart',
  lua: 'Lua',
  r: 'R',
  jl: 'Julia',
  ex: 'Elixir', exs: 'Elixir', erl: 'Erlang',
  hs: 'Haskell', elm: 'Elm', ml: 'OCaml', clj: 'Clojure', cljs: 'Clojure',
  zig: 'Zig', nim: 'Nim', v: 'V', sol: 'Solidity',
  sh: 'Shell', bash: 'Shell', zsh: 'Shell', fish: 'Shell', ps1: 'PowerShell',
  html: 'HTML', htm: 'HTML',
  css: 'CSS', scss: 'SCSS', sass: 'SCSS', less: 'CSS',
  vue: 'Vue', svelte: 'Svelte', astro: 'Astro',
  sql: 'SQL',
  md: 'Markdown', mdx: 'Markdown', rst: 'reStructuredText',
  json: 'JSON', yaml: 'YAML', yml: 'YAML', toml: 'TOML',
  tf: 'Terraform', hcl: 'Terraform', nix: 'Nix',
  gd: 'GDScript', glsl: 'GLSL', wgsl: 'WGSL', hlsl: 'HLSL',
  vim: 'Vim Script',
  luau: 'Luau',
};

const NAMES = {
  dockerfile: 'Dockerfile',
  makefile: 'Makefile',
  'cmakelists.txt': 'CMake',
  rakefile: 'Ruby',
  gemfile: 'Ruby',
  justfile: 'Just',
};

export function languageFor(path) {
  const file = path.slice(path.lastIndexOf('/') + 1).toLowerCase();
  if (NAMES[file]) return NAMES[file];
  if (file.startsWith('dockerfile')) return 'Dockerfile';
  const dot = file.lastIndexOf('.');
  if (dot <= 0) return null;
  return EXT[file.slice(dot + 1)] ?? null;
}

const NOISE_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock',
  'cargo.lock', 'poetry.lock', 'pipfile.lock', 'uv.lock', 'gemfile.lock',
  'composer.lock', 'go.sum', 'flake.lock', 'podfile.lock', 'package.resolved',
]);

const NOISE_DIRS = /(^|\/)(node_modules|vendor|dist|build|out|target|\.next|coverage|__snapshots__|third_party)\//;

/** Lockfiles, build output and minified bundles shouldn't count as "lines you wrote". */
export function isNoise(path) {
  const lower = path.toLowerCase();
  const file = lower.slice(lower.lastIndexOf('/') + 1);
  return (
    NOISE_FILES.has(file) ||
    NOISE_DIRS.test(lower) ||
    /\.min\.(js|css)$/.test(file) ||
    file.endsWith('.map') ||
    file.endsWith('.snap')
  );
}
