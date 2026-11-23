const Anthropic = require('@anthropic-ai/sdk');

const MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5' },
];
const DEFAULT_MODEL = MODELS.some((m) => m.id === process.env.DEFAULT_MODEL)
  ? process.env.DEFAULT_MODEL
  : MODELS[0].id;

// Opus and Sonnet can retry a safety-classifier refusal on another model
// server-side. Haiku has no server-side fallback, so it gets no `fallbacks`.
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-sonnet-5-5']);

// Only the most recent turns are sent back; the current files are always
// included in full, so older chat adds cost without adding much context.
const MAX_HISTORY_MESSAGES = 20;

const OUTPUT_FORMAT = `Reply with one to three plain sentences describing what you built or changed, then every new or changed file in this exact form:

<file path="relative/path.ext">
full file contents
</file>

Always write the complete file, never a diff or a placeholder such as "rest unchanged". Leave out files that did not change. Do not wrap file blocks in markdown fences and do not write anything after the last </file>.`;

const WEB_INSTRUCTIONS = `You write code for Claude Studio, a browser IDE. The user describes a web app and you write or update its files.

- The app is static and runs in a sandboxed iframe: HTML, CSS and JavaScript only, no server and no build step.
- The entry point is index.html. Reference other project files by relative path.
- Libraries may be loaded from public CDNs with <script> or <link> tags.

${OUTPUT_FORMAT}`;

const CPP_INSTRUCTIONS = `You write code for Claude Studio, a browser IDE that compiles C++ with g++ -std=c++20 and runs the program with the user's stdin. The user describes a program and you write or update its files.

- Use only the C++ standard library. There is no build system: every .cpp file in the project is compiled and linked together.
- int main() lives in main.cpp. Headers are included by relative path.
- Read input from std::cin. The program has a few seconds to finish and its output is capped, so avoid unbounded loops and very large output.

${OUTPUT_FORMAT}`;

function createClient(apiKey) {
  return new Anthropic({
    apiKey,
    // Unset means the real API. Setting it is only useful for testing against
    // a local stand-in.
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  });
}

// Cheap authenticated request used to check a key before saving it.
async function verifyKey(apiKey) {
  await createClient(apiKey).models.list({ limit: 1 });
}

function buildUserTurn(project, message) {
  const files = Object.entries(project.files)
    .map(([path, content]) => `<file path="${path}">\n${content}\n</file>`)
    .join('\n');
  return `Current project files:\n${files || '(none)'}\n\nRequest: ${message}`;
}

// Streams a generation. onText receives each text delta as it arrives. Resolves
// with { text, stopReason }, where text excludes any partial output that was
// discarded by a server-side fallback.
async function generate({ apiKey, model, project, message, history, onText, signal }) {
  const messages = (history || [])
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: m.files && m.files.length ? `${m.content}\n\n(Files written: ${m.files.join(', ')})` : m.content,
    }));
  messages.push({ role: 'user', content: buildUserTurn(project, message) });

  const params = {
    model,
    max_tokens: 64000,
    system: project.kind === 'cpp' ? CPP_INSTRUCTIONS : WEB_INSTRUCTIONS,
    messages,
    output_config: { effort: 'medium' },
  };
  if (FALLBACK_MODELS.has(model)) {
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }

  const stream = createClient(apiKey).beta.messages.stream(params, { signal });
  stream.on('text', (delta) => onText && onText(delta));
  const final = await stream.finalMessage();

  // After a mid-stream fallback the declined partial stays in `content`, ahead
  // of the last fallback block. Only the text after it is the finished answer.
  let start = 0;
  final.content.forEach((block, i) => { if (block.type === 'fallback') start = i + 1; });
  const text = final.content
    .slice(start)
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return { text, stopReason: final.stop_reason };
}

// Turns an SDK error into a short message for the chat panel.
function describeError(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'The API key was rejected (401). Enter a valid Anthropic API key.';
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return 'This API key does not have access to that model (403).';
  }
  if (err instanceof Anthropic.NotFoundError) {
    return 'Model not found (404). Pick a different model.';
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Rate limited by the Anthropic API (429). Wait a moment and try again.';
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Could not reach the Anthropic API. Check your network connection and try again.';
  }
  if (err instanceof Anthropic.APIError && err.status) {
    const detail = err.error && err.error.error && err.error.error.message;
    return `Anthropic API error ${err.status}${detail ? `: ${detail}` : '.'}`;
  }
  return 'Generation failed.';
}

function parseFiles(text) {
  const files = {};
  const re = /<file\s+path="([^"]+)">\n?([\s\S]*?)\n?<\/file>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const path = m[1].trim();
    if (path) files[path] = m[2];
  }
  return files;
}

// The explanation is whatever the model wrote before the first file block.
function parseExplanation(text) {
  const idx = text.indexOf('<file ');
  return (idx === -1 ? text : text.slice(0, idx)).trim();
}

module.exports = {
  MODELS,
  DEFAULT_MODEL,
  verifyKey,
  generate,
  describeError,
  isApiError: (err) => err instanceof Anthropic.APIError,
  isAuthError: (err) => err instanceof Anthropic.AuthenticationError,
  isAbort: (err) => err instanceof Anthropic.APIUserAbortError,
  parseFiles,
  parseExplanation,
};
