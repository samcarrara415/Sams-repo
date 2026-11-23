const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const express = require('express');
const cookieParser = require('cookie-parser');

const store = require('./lib/sessions');
const anthropic = require('./lib/anthropic');
const runner = require('./lib/runner');

const PORT = Number(process.env.PORT) || 3000;
// The C++ runner executes arbitrary code, so listen on loopback unless told otherwise.
const HOST = process.env.HOST || '127.0.0.1';
// Sessions are in memory, so a per-process secret loses nothing on restart.
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SERVER_API_KEY = process.env.ANTHROPIC_API_KEY || null;
const MAX_CONCURRENT_RUNS = 4;

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser(SESSION_SECRET));

const api = express.Router();

api.use((req, res, next) => {
  let session = store.getSession(req.signedCookies.sid);
  if (!session) {
    session = store.createSession(anthropic.DEFAULT_MODEL);
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

function apiKeyFor(session) {
  return session.apiKey || SERVER_API_KEY;
}

function loadProject(req, res, next) {
  const project = req.session.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  req.project = project;
  next();
}

function projectSummary(p) {
  return { id: p.id, name: p.name, kind: p.kind, updatedAt: p.updatedAt };
}

function projectDetail(p) {
  return { ...projectSummary(p), files: p.files, messages: p.messages };
}

// --- Settings and API key ---------------------------------------------------
// The key stays in the server-side session. Responses only say whether one is set.

api.get('/settings', (req, res) => {
  res.json({
    hasKey: !!req.session.apiKey,
    serverKey: !!SERVER_API_KEY,
    model: req.session.model,
    models: anthropic.MODELS,
  });
});

api.post('/settings/key', async (req, res) => {
  const apiKey = typeof req.body.apiKey === 'string' ? req.body.apiKey.trim() : '';
  if (!/^sk-ant-\S+$/.test(apiKey)) {
    return res.status(400).json({ error: 'Anthropic API keys start with "sk-ant-".' });
  }
  try {
    await anthropic.verifyKey(apiKey);
  } catch (err) {
    return res.status(err.status === 401 ? 401 : 502).json({ error: anthropic.describeError(err) });
  }
  req.session.apiKey = apiKey;
  res.json({ ok: true });
});

api.delete('/settings/key', (req, res) => {
  req.session.apiKey = null;
  res.json({ ok: true });
});

api.post('/settings/model', (req, res) => {
  const { model } = req.body;
  if (!anthropic.MODELS.some((m) => m.id === model)) {
    return res.status(400).json({ error: 'Unknown model.' });
  }
  req.session.model = model;
  res.json({ ok: true });
});

// --- Projects ---------------------------------------------------------------
// Editing and running work without a key; only chat needs one.

api.get('/projects', (req, res) => {
  const projects = [...req.session.projects.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(projectSummary);
  res.json({ projects });
});

api.post('/projects', (req, res) => {
  const project = store.createProject(req.session, { kind: req.body.kind });
  res.json({ project: projectDetail(project) });
});

api.get('/projects/:id', loadProject, (req, res) => {
  res.json({ project: projectDetail(req.project) });
});

api.patch('/projects/:id', loadProject, (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 80) : '';
  if (!name) return res.status(400).json({ error: 'Name cannot be empty.' });
  req.project.name = name;
  req.project.updatedAt = Date.now();
  res.json({ project: projectSummary(req.project) });
});

api.delete('/projects/:id', loadProject, (req, res) => {
  store.deleteProject(req.session, req.project.id);
  res.json({ ok: true });
});

api.put('/projects/:id/files', loadProject, (req, res) => {
  const filePath = store.normalizePath(req.body.path);
  const { content } = req.body;
  if (!filePath) return res.status(400).json({ error: 'Invalid file name.' });
  if (typeof content !== 'string') return res.status(400).json({ error: 'File content must be text.' });
  req.project.files[filePath] = content;
  req.project.updatedAt = Date.now();
  res.json({ ok: true, path: filePath });
});

api.post('/projects/:id/files/rename', loadProject, (req, res) => {
  const { files } = req.project;
  const from = req.body.from;
  const to = store.normalizePath(req.body.to);
  if (typeof from !== 'string' || !Object.hasOwn(files, from)) {
    return res.status(404).json({ error: 'File not found.' });
  }
  if (!to) return res.status(400).json({ error: 'Invalid file name.' });
  if (to !== from && Object.hasOwn(files, to)) {
    return res.status(409).json({ error: `${to} already exists.` });
  }
  const content = files[from];
  delete files[from];
  files[to] = content;
  req.project.updatedAt = Date.now();
  res.json({ ok: true, path: to });
});

api.delete('/projects/:id/files', loadProject, (req, res) => {
  const filePath = req.body.path;
  if (typeof filePath === 'string' && Object.hasOwn(req.project.files, filePath)) {
    delete req.project.files[filePath];
    req.project.updatedAt = Date.now();
  }
  res.json({ ok: true });
});

// --- Run C++ ----------------------------------------------------------------

let activeRuns = 0;

api.post('/projects/:id/run', loadProject, async (req, res) => {
  if (req.project.kind !== 'cpp') return res.status(400).json({ error: 'Only C++ projects can be run.' });
  if (activeRuns >= MAX_CONCURRENT_RUNS) {
    return res.status(429).json({ error: 'Too many programs running. Try again in a few seconds.' });
  }
  const stdin = typeof req.body.stdin === 'string' ? req.body.stdin : '';
  activeRuns++;
  try {
    res.json(await runner.compileAndRunCpp(req.project.files, stdin));
  } catch (err) {
    console.error('C++ run failed:', err);
    res.status(500).json({ error: 'The run failed on the server.' });
  } finally {
    activeRuns--;
  }
});

// --- Chat (Server-Sent Events) ----------------------------------------------

api.post('/projects/:id/chat', loadProject, async (req, res) => {
  const { project, session } = req;
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'Message is empty.' });
  const apiKey = apiKeyFor(session);
  const usingServerKey = !session.apiKey;
  if (!apiKey) return res.status(401).json({ error: 'Add an Anthropic API key to use chat.', needsKey: true });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  // Stop paying for tokens if the browser goes away mid-generation.
  const abort = new AbortController();
  res.on('close', () => abort.abort());

  try {
    const { text, stopReason } = await anthropic.generate({
      apiKey,
      model: session.model,
      project,
      message,
      history: project.messages,
      onText: (chunk) => send('delta', { text: chunk }),
      signal: abort.signal,
    });

    if (stopReason === 'refusal') {
      send('error', { error: 'Claude declined this request. Try rephrasing it.' });
      return;
    }

    const changed = {};
    for (const [rawPath, content] of Object.entries(anthropic.parseFiles(text))) {
      const p = store.normalizePath(rawPath);
      if (p) changed[p] = content;
    }
    const changedPaths = Object.keys(changed);
    Object.assign(project.files, changed);

    let explanation = anthropic.parseExplanation(text)
      || (changedPaths.length ? 'Updated the project.' : 'No changes.');
    if (stopReason === 'max_tokens') {
      explanation += '\n\nThe response hit the length limit, so the last file may be missing. Ask for the rest to continue.';
    }

    // Store the conversation without the file dumps; the current files are
    // sent in full with every request anyway.
    project.messages.push({ role: 'user', content: message });
    project.messages.push({ role: 'assistant', content: explanation, files: changedPaths });
    project.updatedAt = Date.now();

    send('done', { explanation, changedFiles: changedPaths, files: project.files });
  } catch (err) {
    if (anthropic.isAbort(err)) return;
    if (!anthropic.isApiError(err)) console.error('Chat failed:', err);
    const keyRejected = anthropic.isAuthError(err);
    let error = anthropic.describeError(err);
    if (keyRejected && usingServerKey) error = 'The server\'s ANTHROPIC_API_KEY was rejected (401).';
    else if (keyRejected) session.apiKey = null;
    send('error', { error, needsKey: keyRejected && !usingServerKey });
  } finally {
    res.end();
  }
});

api.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.use('/api', api);

// --- Preview ----------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

app.get('/preview/:id/*', (req, res) => {
  const project = store.getProjectById(req.params.id);
  if (!project) return res.status(404).type('text/plain').send('Project not found.');
  let filePath = req.params[0] || 'index.html';
  if (filePath.endsWith('/')) filePath += 'index.html';
  if (!Object.hasOwn(project.files, filePath)) {
    return res.status(404).type('text/plain').send(`File not found: ${filePath}`);
  }
  // Keep generated code sandboxed even when the preview is opened in its own tab.
  res.set('Content-Security-Policy', 'sandbox allow-scripts allow-forms allow-modals allow-popups');
  res.set('Cache-Control', 'no-store');
  res.type(MIME[path.extname(filePath).toLowerCase()] || 'text/plain; charset=utf-8');
  res.send(project.files[filePath]);
});
app.get('/preview/:id', (req, res) => res.redirect(`/preview/${req.params.id}/`));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, HOST, () => {
  console.log(`Claude Studio listening on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  if (!SERVER_API_KEY) console.log('No ANTHROPIC_API_KEY set; users will be asked for their own key.');
});
