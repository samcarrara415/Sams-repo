// ---------------------------------------------------------------------------
// Anthropic Messages API client.
//
// Supports two auth modes:
//   * oauth  — subscription-backed inference using the user's "Login with
//              Claude" access token. Requires the Claude Code identity as the
//              first system block and the oauth beta header.
//   * apikey — a standard x-api-key call.
// ---------------------------------------------------------------------------

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Required first system block for subscription-backed (OAuth) inference.
const CLAUDE_CODE_IDENTITY = "You are Claude Code, Anthropic's official CLI for Claude.";

const SUPPORTED_MODELS = [
  { id: 'claude-sonnet-5', label: 'Sonnet 5 — balanced (default)' },
  { id: 'claude-opus-4-8', label: 'Opus 4.8 — most capable' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — fastest' },
];

const BUILDER_INSTRUCTIONS = `You are the code-generation engine for Claude Studio, an in-browser app builder (like Replit's AI).

Your job: given a user request and the current project files, produce a complete, working front-end web app.

Rules:
- The app is static and runs in a sandboxed iframe. Use only HTML, CSS, and JavaScript.
- The entry point MUST be a file named "index.html".
- You may split code across files (e.g. index.html, style.css, script.js) and reference them by RELATIVE path.
- You may load libraries from public CDNs via <script>/<link> tags. No build step, no server, no npm.
- Always output the FULL, FINAL content of every file you create or change — never diffs, never "// unchanged" placeholders.
- Only include files that changed or are new. Unchanged files can be omitted.

Output format — respond with a short plain-text explanation (1-3 sentences) of what you built or changed, then each file wrapped exactly like this:

<file path="index.html">
...full file contents...
</file>
<file path="style.css">
...full file contents...
</file>

Do not put anything after the last </file> tag. Do not use markdown code fences around the file blocks.`;

function buildSystem(mode) {
  if (mode === 'oauth') {
    // First block MUST be the Claude Code identity for subscription inference.
    return [
      { type: 'text', text: CLAUDE_CODE_IDENTITY },
      { type: 'text', text: BUILDER_INSTRUCTIONS },
    ];
  }
  return [{ type: 'text', text: BUILDER_INSTRUCTIONS }];
}

function buildHeaders(auth) {
  const headers = {
    'Content-Type': 'application/json',
    'anthropic-version': ANTHROPIC_VERSION,
  };
  if (auth.mode === 'oauth') {
    headers['Authorization'] = `Bearer ${auth.tokens.accessToken}`;
    headers['anthropic-beta'] = 'oauth-2025-04-20';
  } else {
    headers['x-api-key'] = auth.apiKey;
  }
  return headers;
}

// Compose the user-facing turn: include the current files so edits are grounded.
function buildUserTurn(project, message) {
  const fileList = Object.entries(project.files)
    .map(([path, content]) => `<file path="${path}">\n${content}\n</file>`)
    .join('\n');
  return `Current project files:\n${fileList || '(empty project)'}\n\n---\n\nRequest: ${message}`;
}

// Stream a completion. Calls onText(chunk) for each text delta and resolves
// with the full concatenated text. Throws { status, body } on HTTP errors.
async function streamMessage({ auth, model, project, message, history, onText }) {
  const messages = [];
  for (const m of history || []) messages.push({ role: m.role, content: m.content });
  messages.push({ role: 'user', content: buildUserTurn(project, message) });

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: buildHeaders(auth),
    body: JSON.stringify({
      model,
      max_tokens: 16000,
      system: buildSystem(auth.mode),
      messages,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Anthropic API error ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') continue;
      let evt;
      try { evt = JSON.parse(payload); } catch { continue; }
      if (evt.type === 'content_block_delta' && evt.delta && evt.delta.type === 'text_delta') {
        full += evt.delta.text;
        if (onText) onText(evt.delta.text);
      } else if (evt.type === 'error') {
        const err = new Error(evt.error && evt.error.message ? evt.error.message : 'stream error');
        err.status = 500;
        err.body = JSON.stringify(evt.error || {});
        throw err;
      }
    }
  }
  return full;
}

// Parse <file path="..."> ... </file> blocks out of the model's response.
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

// The human-readable explanation is everything before the first <file> block.
function parseExplanation(text) {
  const idx = text.indexOf('<file ');
  return (idx === -1 ? text : text.slice(0, idx)).trim();
}

module.exports = {
  SUPPORTED_MODELS,
  streamMessage,
  parseFiles,
  parseExplanation,
};
