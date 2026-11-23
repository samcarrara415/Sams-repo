// Sessions and projects live in memory, keyed by a signed cookie. Restarting
// the server clears everything. Replace these Maps with a database to persist
// projects or run more than one instance.

const crypto = require('crypto');

const SESSION_IDLE_MS = 7 * 24 * 60 * 60 * 1000;

const sessions = new Map(); // sid -> session
// Preview requests come from a sandboxed iframe with an opaque origin, so they
// carry no cookie. They are looked up by the unguessable project id instead.
const allProjects = new Map(); // projectId -> project

function newId() {
  return crypto.randomBytes(16).toString('hex');
}

function createSession(defaultModel) {
  const session = {
    sid: newId(),
    lastSeen: Date.now(),
    apiKey: null,
    projects: new Map(),
    model: defaultModel,
  };
  sessions.set(session.sid, session);
  return session;
}

function getSession(sid) {
  const session = sid ? sessions.get(sid) : undefined;
  if (session) session.lastSeen = Date.now();
  return session;
}

function pruneSessions() {
  const cutoff = Date.now() - SESSION_IDLE_MS;
  for (const [sid, session] of sessions) {
    if (session.lastSeen >= cutoff) continue;
    for (const id of session.projects.keys()) allProjects.delete(id);
    sessions.delete(sid);
  }
}
setInterval(pruneSessions, 60 * 60 * 1000).unref();

// Returns a clean relative path ("src/app.js"), or null if the path is empty,
// absolute, or tries to leave the project.
function normalizePath(raw) {
  if (typeof raw !== 'string') return null;
  const parts = raw.trim().replace(/\\/g, '/').split('/').filter((p) => p && p !== '.');
  if (!parts.length || parts.some((p) => p === '..')) return null;
  const clean = parts.join('/');
  if (clean.length > 200 || /[\0<>"]/.test(clean) || parts.includes('__proto__')) return null;
  return clean;
}

const DEFAULT_WEB_FILES = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New app</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main>
    <h1>New app</h1>
    <p>Describe what to build in the chat panel.</p>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
  'style.css': `body {
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  text-align: center;
}
`,
  'script.js': '',
};

const DEFAULT_CPP_FILES = {
  'main.cpp': `#include <iostream>
#include <string>

int main() {
    std::string name;
    if (std::getline(std::cin, name) && !name.empty()) {
        std::cout << "Hello, " << name << "\\n";
    } else {
        std::cout << "Hello, world\\n";
    }
    return 0;
}
`,
};

function createProject(session, { name, kind } = {}) {
  const projectKind = kind === 'cpp' ? 'cpp' : 'web';
  const project = {
    id: newId(),
    name: (typeof name === 'string' && name.trim().slice(0, 80)) ||
      (projectKind === 'cpp' ? 'Untitled C++ program' : 'Untitled web app'),
    kind: projectKind,
    updatedAt: Date.now(),
    // No prototype, so a file named "constructor" or "toString" is just a file.
    files: Object.assign(Object.create(null), projectKind === 'cpp' ? DEFAULT_CPP_FILES : DEFAULT_WEB_FILES),
    messages: [],
  };
  session.projects.set(project.id, project);
  allProjects.set(project.id, project);
  return project;
}

function deleteProject(session, id) {
  session.projects.delete(id);
  allProjects.delete(id);
}

function getProjectById(id) {
  return allProjects.get(id);
}

module.exports = {
  createSession,
  getSession,
  normalizePath,
  createProject,
  deleteProject,
  getProjectById,
};
