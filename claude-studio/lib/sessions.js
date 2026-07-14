// ---------------------------------------------------------------------------
// In-memory session, PKCE, and project stores.
//
// Kept intentionally simple for a single-node deployment: everything lives in
// memory and is keyed by a signed session-id cookie. Swap these Maps for a
// real store (Redis, Postgres) to run multiple instances or persist projects.
// ---------------------------------------------------------------------------

const crypto = require('crypto');

const sessions = new Map(); // sid -> session
const pkceFlows = new Map(); // state -> { verifier, createdAt }
const allProjects = new Map(); // projectId -> project (for cookie-less preview lookups)

const PKCE_TTL_MS = 15 * 60 * 1000;

function newId() {
  return crypto.randomBytes(16).toString('hex');
}

function createSession() {
  const sid = newId();
  const session = {
    sid,
    createdAt: Date.now(),
    auth: null, // { mode: 'oauth'|'apikey', tokens?, apiKey?, profile? }
    projects: new Map(), // projectId -> project
    model: process.env.DEFAULT_MODEL || 'claude-sonnet-5',
  };
  sessions.set(sid, session);
  return session;
}

function getSession(sid) {
  return sid ? sessions.get(sid) : undefined;
}

function isAuthed(session) {
  if (!session || !session.auth) return false;
  if (session.auth.mode === 'apikey') return !!session.auth.apiKey;
  if (session.auth.mode === 'oauth') return !!(session.auth.tokens && session.auth.tokens.accessToken);
  return false;
}

// --- PKCE flow storage -----------------------------------------------------

function stashPkce(state, verifier) {
  prunePkce();
  pkceFlows.set(state, { verifier, createdAt: Date.now() });
}

function takePkce(state) {
  const entry = pkceFlows.get(state);
  if (!entry) return null;
  pkceFlows.delete(state);
  if (Date.now() - entry.createdAt > PKCE_TTL_MS) return null;
  return entry.verifier;
}

function prunePkce() {
  const now = Date.now();
  for (const [state, entry] of pkceFlows) {
    if (now - entry.createdAt > PKCE_TTL_MS) pkceFlows.delete(state);
  }
}

// --- Projects --------------------------------------------------------------

function createProject(session, { name, files, kind } = {}) {
  const id = newId();
  const projectKind = kind === 'cpp' ? 'cpp' : 'web';
  const project = {
    id,
    name: name || (projectKind === 'cpp' ? 'Untitled C++' : 'Untitled App'),
    kind: projectKind,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    files: files || (projectKind === 'cpp' ? defaultCppFiles() : defaultFiles()),
    messages: [], // { role, content } chat history for the AI
  };
  session.projects.set(id, project);
  allProjects.set(id, project);
  return project;
}

// Look up a project by id regardless of session. Preview subresources load
// from a sandboxed (opaque-origin) iframe that sends no session cookie, so
// preview relies on the unguessable random project id instead.
function getProjectById(id) {
  return allProjects.get(id);
}

function defaultCppFiles() {
  return {
    'main.cpp': `#include <iostream>
#include <string>

int main() {
    std::cout << "Hello from C++!\\n";

    // Try me: this reads a name from stdin.
    // std::string name;
    // std::getline(std::cin, name);
    // std::cout << "Hi, " << name << "!\\n";

    return 0;
}
`,
  };
}

function defaultFiles() {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main>
    <h1>Your app starts here</h1>
    <p>Describe what you want to build in the chat, and Claude will write it.</p>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
    'style.css': `:root { color-scheme: light dark; }
body {
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  text-align: center;
}
`,
    'script.js': `console.log('App loaded');
`,
  };
}

function summarizeProject(project) {
  return {
    id: project.id,
    name: project.name,
    kind: project.kind || 'web',
    updatedAt: project.updatedAt,
    files: Object.keys(project.files),
  };
}

module.exports = {
  createSession,
  getSession,
  isAuthed,
  stashPkce,
  takePkce,
  createProject,
  getProjectById,
  summarizeProject,
  defaultFiles,
};
