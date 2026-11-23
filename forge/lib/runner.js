// Compiles a project's C++ sources with g++ and runs the binary.
//
// Each run gets its own temp directory, which is removed afterwards. Compile
// and run are time-limited and output is capped. This is NOT a sandbox: the
// program runs as the server's user with full access to the machine.

const { spawn } = require('child_process');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');

const COMPILE_TIMEOUT_MS = 15000;
const RUN_TIMEOUT_MS = 5000;
const MAX_OUTPUT_BYTES = 64 * 1024;

const SOURCE_EXT = new Set(['.cpp', '.cc', '.cxx']);
const HEADER_EXT = new Set(['.h', '.hpp', '.hh', '.hxx', '.ipp', '.tpp', '.inl']);

function exec(cmd, args, { cwd, timeoutMs, input = '' }) {
  return new Promise((resolve) => {
    // detached puts the child in its own process group, so a timeout can kill
    // anything it forked as well.
    const child = spawn(cmd, args, { cwd, detached: true });
    let stdout = '';
    let stderr = '';
    let bytes = 0;
    let timedOut = false;
    let truncated = false;

    const killGroup = () => {
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already gone */ }
    };
    const timer = setTimeout(() => { timedOut = true; killGroup(); }, timeoutMs);

    const collect = (append) => (chunk) => {
      if (truncated) return;
      const room = MAX_OUTPUT_BYTES - bytes;
      bytes += chunk.length;
      if (chunk.length > room) {
        append(chunk.subarray(0, room).toString());
        truncated = true;
        killGroup();
      } else {
        append(chunk.toString());
      }
    };
    child.stdout.on('data', collect((s) => { stdout += s; }));
    child.stderr.on('data', collect((s) => { stderr += s; }));

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ spawnError: err.message, stdout, stderr });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr, timedOut, truncated });
    });

    // The program may exit without reading its input.
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}

async function writeSources(dir, files) {
  const sources = [];
  for (const [name, content] of Object.entries(files)) {
    const ext = path.extname(name).toLowerCase();
    if (!SOURCE_EXT.has(ext) && !HEADER_EXT.has(ext)) continue;
    // Project paths are already normalized; this is a second check that
    // nothing is written outside the run directory.
    const target = path.resolve(dir, name);
    if (!target.startsWith(dir + path.sep)) continue;
    await fsp.mkdir(path.dirname(target), { recursive: true });
    await fsp.writeFile(target, String(content));
    if (SOURCE_EXT.has(ext)) sources.push(name);
  }
  return sources;
}

async function compileAndRunCpp(files, stdin) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'forge-'));
  try {
    const sources = await writeSources(dir, files);
    if (!sources.length) {
      return { stage: 'compile', ok: false, stderr: 'No .cpp files in this project.' };
    }

    const compile = await exec('g++', ['-std=c++20', '-O2', '-pipe', ...sources, '-o', 'program'], {
      cwd: dir,
      timeoutMs: COMPILE_TIMEOUT_MS,
    });
    if (compile.spawnError) {
      return { stage: 'compile', ok: false, stderr: `Could not start g++: ${compile.spawnError}` };
    }
    if (compile.timedOut) {
      return { stage: 'compile', ok: false, stderr: `Compilation took longer than ${COMPILE_TIMEOUT_MS / 1000}s.` };
    }
    if (compile.code !== 0) {
      return { stage: 'compile', ok: false, stderr: compile.stderr || compile.stdout || 'Compilation failed.' };
    }

    const run = await exec('./program', [], { cwd: dir, timeoutMs: RUN_TIMEOUT_MS, input: stdin });
    if (run.spawnError) {
      return { stage: 'run', ok: false, stderr: `Could not start the program: ${run.spawnError}` };
    }
    return {
      stage: 'run',
      ok: run.code === 0 && !run.timedOut && !run.truncated,
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code,
      // A truncation kill is our doing, so don't report it as a crash signal.
      signal: run.timedOut || run.truncated ? null : run.signal,
      timedOut: run.timedOut,
      truncated: run.truncated,
      timeLimitSec: RUN_TIMEOUT_MS / 1000,
      outputLimitKb: MAX_OUTPUT_BYTES / 1024,
    };
  } finally {
    await fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

module.exports = { compileAndRunCpp };
