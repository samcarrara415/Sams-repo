// ---------------------------------------------------------------------------
// Server-side C++ compile-and-run.
//
// Writes the project's C++ sources to a scratch directory, compiles them with
// g++, then runs the resulting binary with a stdin feed and hard timeouts.
// This is what gives Claude Studio a real "Run" button — a full toolchain,
// not a JavaScript interpreter.
// ---------------------------------------------------------------------------

const { spawn } = require('child_process');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const COMPILE_TIMEOUT_MS = 15000;
const RUN_TIMEOUT_MS = 8000;
const MAX_OUTPUT = 256 * 1024; // 256 KB cap per stream
const CXX_STD = 'c++20';

const SOURCE_EXT = new Set(['.cpp', '.cc', '.cxx', '.c++', '.c']);
const HEADER_EXT = new Set(['.h', '.hpp', '.hh', '.hxx', '.ipp', '.tpp']);

// Spawn a process, feed it stdin, and collect capped output with a timeout.
function exec(cmd, args, { cwd, timeoutMs, input }) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(cmd, args, { cwd });
    } catch (e) {
      return resolve({ error: e.message, stdout: '', stderr: '', code: null });
    }
    let stdout = '';
    let stderr = '';
    let outLen = 0;
    let errLen = 0;
    let timedOut = false;
    let truncated = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (d) => {
      outLen += d.length;
      if (outLen <= MAX_OUTPUT) stdout += d;
      else if (!truncated) { truncated = true; child.kill('SIGKILL'); }
    });
    child.stderr.on('data', (d) => {
      errLen += d.length;
      if (errLen <= MAX_OUTPUT) stderr += d;
    });
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ error: e.message, stdout, stderr, code: null });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr, timedOut, truncated });
    });

    if (input) {
      child.stdin.on('error', () => {}); // ignore EPIPE if program exits early
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

async function compileAndRunCpp(files, stdin) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'cljstudio-cpp-'));
  try {
    const sources = [];
    // Write only recognized C/C++ files, guarding against path traversal.
    for (const [rawName, content] of Object.entries(files || {})) {
      const base = path.basename(rawName);
      const ext = path.extname(base).toLowerCase();
      if (!SOURCE_EXT.has(ext) && !HEADER_EXT.has(ext)) continue;
      await fsp.writeFile(path.join(dir, base), String(content ?? ''));
      if (SOURCE_EXT.has(ext)) sources.push(base);
    }

    if (sources.length === 0) {
      return {
        ok: false,
        stage: 'compile',
        stdout: '',
        stderr: 'No C/C++ source files found. Create a file ending in .cpp (e.g. main.cpp).',
        exitCode: null,
      };
    }

    // Compile.
    const compile = await exec(
      'g++',
      [`-std=${CXX_STD}`, '-O2', '-pipe', ...sources, '-o', 'program'],
      { cwd: dir, timeoutMs: COMPILE_TIMEOUT_MS }
    );
    if (compile.error) {
      return { ok: false, stage: 'compile', stdout: '', stderr: `Compiler unavailable: ${compile.error}`, exitCode: null };
    }
    if (compile.timedOut) {
      return { ok: false, stage: 'compile', stdout: '', stderr: 'Compilation timed out.', exitCode: null };
    }
    if (compile.code !== 0) {
      return { ok: false, stage: 'compile', stdout: compile.stdout, stderr: compile.stderr || 'Compilation failed.', exitCode: compile.code };
    }

    // Run.
    const run = await exec('./program', [], { cwd: dir, timeoutMs: RUN_TIMEOUT_MS, input: stdin || '' });
    if (run.error) {
      return { ok: false, stage: 'run', stdout: run.stdout, stderr: run.error, exitCode: null };
    }
    let stderr = run.stderr || '';
    if (run.timedOut) stderr += `\n[Killed: exceeded ${RUN_TIMEOUT_MS / 1000}s time limit]`;
    if (run.truncated) stderr += `\n[Output truncated at ${Math.round(MAX_OUTPUT / 1024)} KB]`;

    return {
      ok: !run.timedOut && run.code === 0,
      stage: 'run',
      stdout: run.stdout,
      stderr: stderr.trim(),
      exitCode: run.code,
      timedOut: run.timedOut,
      signal: run.signal || null,
    };
  } finally {
    fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

module.exports = { compileAndRunCpp };
