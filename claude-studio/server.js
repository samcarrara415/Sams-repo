// ---------------------------------------------------------------------------
// Claude Studio — a Replit-style AI app builder powered by your own Claude
// subscription (via "Login with Claude" OAuth) or an Anthropic API key.
// ---------------------------------------------------------------------------

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const oauth = require('./lib/oauth');
const store = require('./lib/sessions');
const anthropic = require('./lib/anthropic');
const runner = require('./lib/runner');

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';

const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser(SESSION_SECRET));

// Attach (or lazily create) a session for every request.
app.use((req, res, next) => {
  let sid = req.signedCookies && req.signedCookies.sid;
  let session = store.getSession(sid);
  if (!session) {
    session = store.createSession();
    res.cookie('sid', session.sid, {
      httpOnly: true,
      sameSite: 'lax',
      signed: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  req.session = session;
  next();
});

// If a server-wide API key is configured, treat unauthenticated sessions as
// authenticated with it (handy for local dev).
app.use((req, res, next) => {
  if (!req.session.auth && process.env.ANTHROPIC_API_KEY) {
    req.session.auth = { mode: 'apikey', apiKey: process.env.ANTHROPIC_API_KEY, serverDefault: true };
  }
  next();
});

function requireAuth(req, res, next) {
  if (!store.isAuthed(req.session)) {
    return res.status(401).json({ error: 'Not authenticated. Log in with Claude first.' });
  }
  next();
}

// Ensure a live OAuth token before an inference call; refresh if near expiry.
async function ensureFreshToken(session) {
  const auth = session.auth;
  if (!auth || auth.mode !== 'oauth') return;
  if (auth.tokens.expiresAt && auth.tokens.expiresAt > Date.now()) return;
  if (!auth.tokens.refreshToken) return; // nothing to do; call may 401 and prompt re-login
  const refreshed = await oauth.refreshToken(auth.tokens.refreshToken);
  auth.tokens = refreshed;
}

// --- Auth API --------------------------------------------------------------

app.get('/api/auth/status', (req, res) => {
  const authed = store.isAuthed(req.session);
  res.json({
    authed,
    mode: authed ? req.session.auth.mode : null,
    serverDefault: authed ? !!req.session.auth.serverDefault : false,
    model: req.session.model,
    models: anthropic.SUPPORTED_MODELS,
  });
});

// Step 1: begin the "Login with Claude" flow. Returns a URL the user opens.
app.post('/api/auth/claude/start', (req, res) => {
  const { verifier, challenge, state } = oauth.createPkce();
  store.stashPkce(state, verifier);
  const authUrl = oauth.buildAuthorizeUrl({ challenge, state });
  res.json({ authUrl });
});

// Step 2: the user pastes the code shown after authorizing.
app.post('/api/auth/claude/finish', async (req, res) => {
  try {
    const { code: pasted } = req.body || {};
    if (!pasted) return res.status(400).json({ error: 'Missing authorization code.' });
    const { code, state } = oauth.parsePastedCode(pasted);
    if (!code) return res.status(400).json({ error: 'Could not parse the authorization code.' });
    const verifier = store.takePkce(state);
    if (!verifier) {
      return res.status(400).json({ error: 'Login session expired or state mismatch. Please start again.' });
    }
    const tokens = await oauth.exchangeCode({ code, state, verifier });
    req.session.auth = { mode: 'oauth', tokens };
    res.json({ ok: true, mode: 'oauth' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Login failed.' });
  }
});

// Alternative: authenticate with an Anthropic API key.
app.post('/api/auth/apikey', (req, res) => {
  const { apiKey } = req.body || {};
  if (!apiKey || !/^sk-/.test(apiKey.trim())) {
    return res.status(400).json({ error: 'That does not look like an Anthropic API key.' });
  }
  req.session.auth = { mode: 'apikey', apiKey: apiKey.trim() };
  res.json({ ok: true, mode: 'apikey' });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.auth = null;
  res.json({ ok: true });
});

app.post('/api/settings/model', (req, res) => {
  const { model } = req.body || {};
  const ok = anthropic.SUPPORTED_MODELS.some((m) => m.id === model);
  if (!ok) return res.status(400).json({ error: 'Unknown model.' });
  req.session.model = model;
  res.json({ ok: true, model });
});

// --- Projects API ----------------------------------------------------------

// Note: the IDE (projects, editing, running) works without logging in — only
// the AI chat endpoint requires authentication. This keeps the plain C++ /
// web editor usable as a "normal IDE with a Run button".
app.get('/api/projects', (req, res) => {
  const list = [...req.session.projects.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(store.summarizeProject);
  res.json({ projects: list });
});

app.post('/api/projects', (req, res) => {
  const { name, kind } = req.body || {};
  const project = store.createProject(req.session, { name, kind });
  res.json({ project: fullProject(project) });
});

app.get('/api/projects/:id', (req, res) => {
  const project = req.session.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  res.json({ project: fullProject(project) });
});

// Save a single file's contents (manual editor edits).
app.put('/api/projects/:id/file', (req, res) => {
  const project = req.session.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  const { path: filePath, content } = req.body || {};
  if (!filePath || typeof content !== 'string') {
    return res.status(400).json({ error: 'path and content are required.' });
  }
  project.files[filePath] = content;
  project.updatedAt = Date.now();
  res.json({ ok: true });
});

app.delete('/api/projects/:id/file', (req, res) => {
  const project = req.session.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  const { path: filePath } = req.body || {};
  if (filePath && project.files[filePath]) {
    delete project.files[filePath];
    project.updatedAt = Date.now();
  }
  res.json({ ok: true });
});

function fullProject(project) {
  return {
    id: project.id,
    name: project.name,
    kind: project.kind || 'web',
    files: project.files,
    messages: project.messages,
    updatedAt: project.updatedAt,
  };
}

// --- Run C++ (real g++ compile + execute) ----------------------------------

app.post('/api/projects/:id/run', async (req, res) => {
  const project = req.session.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  const stdin = req.body && typeof req.body.stdin === 'string' ? req.body.stdin : '';
  try {
    const result = await runner.compileAndRunCpp(project.files, stdin);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, stage: 'run', stderr: err.message || 'Run failed.' });
  }
});

// --- AI chat (Server-Sent Events) -----------------------------------------

app.post('/api/projects/:id/chat', requireAuth, async (req, res) => {
  const project = req.session.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  const message = (req.body && req.body.message ? String(req.body.message) : '').trim();
  if (!message) return res.status(400).json({ error: 'Empty message.' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    await ensureFreshToken(req.session);

    const full = await anthropic.streamMessage({
      auth: req.session.auth,
      model: req.session.model,
      project,
      message,
      history: project.messages,
      onText: (chunk) => send('delta', { text: chunk }),
    });

    const explanation = anthropic.parseExplanation(full);
    const changed = anthropic.parseFiles(full);
    const changedPaths = Object.keys(changed);

    // Apply file changes.
    for (const [p, content] of Object.entries(changed)) project.files[p] = content;
    project.updatedAt = Date.now();

    // Keep chat history compact: store the conversation, not the file dumps
    // (current files are always re-sent to the model on each turn).
    project.messages.push({ role: 'user', content: message });
    project.messages.push({
      role: 'assistant',
      content: explanation + (changedPaths.length ? `\n\n(updated files: ${changedPaths.join(', ')})` : ''),
    });

    send('done', {
      explanation,
      changedFiles: changedPaths,
      files: project.files,
    });
  } catch (err) {
    let msg = err.message || 'Generation failed.';
    if (err.status === 401) {
      const wasOauth = req.session.auth && req.session.auth.mode === 'oauth';
      req.session.auth = null;
      msg = wasOauth
        ? 'Your Claude login expired or was rejected. Please log in again.'
        : 'Your Anthropic API key was rejected. Please re-enter it.';
    } else if (err.body) {
      msg += ` — ${String(err.body).slice(0, 300)}`;
    }
    send('error', { error: msg });
  } finally {
    res.end();
  }
});

// --- Live preview ----------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

app.get('/preview/:id/*', (req, res) => {
  const project = store.getProjectById(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  let filePath = req.params[0] || 'index.html';
  if (filePath === '' || filePath.endsWith('/')) filePath += 'index.html';
  const content = project.files[filePath];
  if (content === undefined) return res.status(404).send('Not found: ' + filePath);
  const ext = path.extname(filePath).toLowerCase();
  res.type(MIME[ext] || 'application/octet-stream');
  res.send(content);
});
// Bare /preview/:id → index.html
app.get('/preview/:id', (req, res) => res.redirect(`/preview/${req.params.id}/index.html`));

// --- Static frontend -------------------------------------------------------

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Claude Studio running at http://localhost:${PORT}`);
});
