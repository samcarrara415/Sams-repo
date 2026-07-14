# ◆ Claude Studio

A Replit-style, in-browser **AI app builder** — describe an app in chat and Claude
writes the code, with a live file tree, Monaco editor, and instant preview.

The twist: you **log in with your own Claude subscription** (Pro / Max). The AI
features run on *your* plan through the standard Claude OAuth flow, so there's no
shared API key to provision or pay for. (An Anthropic API key is also supported
as a fallback.)

![layout: sidebar · editor · preview + chat](https://img.shields.io/badge/layout-files%20%C2%B7%20editor%20%C2%B7%20preview%20%2B%20chat-2a313c)

## Features

- **Log in with Claude** — PKCE OAuth (the same flow Claude Code's `setup-token`
  uses). Subscription-backed inference via the `user:inference` scope. Tokens are
  refreshed automatically; nothing is billed to a central API key.
- **AI app creation** — chat a prompt, Claude scaffolds a complete multi-file
  project. Follow-up prompts edit the existing project with full file context.
  Streaming responses.
- **Two project types**
  - **Web app** — HTML/CSS/JS rendered live in a sandboxed preview iframe.
  - **C++ program** — a real IDE with a **Run button**: the server compiles your
    sources with `g++ -std=c++20` and runs the binary, with a stdin box and a
    console for stdout/stderr, compiler errors, exit codes, and a run timeout.
    (This is the "plain C++ IDE with a Run button" that Replit removed.)
- **IDE** — projects list, file tree, code editor (Monaco, with a plain-textarea
  fallback if the editor CDN is unavailable), tabs, autosave.
- **Works on mobile** — responsive layout that collapses to a bottom tab bar
  (Files · Code · Run/Preview · Chat) on phones and tablets.
- **No-login editing** — the editor and the C++ Run button work without signing
  in; a Claude login is only needed for the AI generation features.
- **Installable (PWA)** — "Add to Home Screen" and Claude Studio launches
  standalone with its own icon, like a native app. A service worker caches the
  app shell for instant, offline-capable startup (dynamic requests — auth, AI
  chat, C++ run, previews — always go to the network).

## Quick start

```bash
cd claude-studio
npm install
cp .env.example .env        # set SESSION_SECRET
npm start                   # http://localhost:3000
```

Open the app and choose **Log in with Claude**:

1. Click **Authorize with Claude** — a Claude tab opens.
2. Approve access. Claude shows you an authorization code.
3. Paste it back and **Connect subscription**.

Then type what you want to build (e.g. *"a pomodoro timer with a circular progress
ring"*) and watch it appear in the preview.

> No subscription? Switch to the **Use API key** tab and paste an `sk-ant-…` key.

## Install it as an app (PWA)

Claude Studio is a Progressive Web App, so you can pin it to your phone or
desktop and it runs full-screen like a native app:

- **iOS (Safari):** Share → *Add to Home Screen*.
- **Android (Chrome):** ⋮ menu → *Install app* / *Add to Home screen*.
- **Desktop (Chrome/Edge):** the install icon in the address bar.

> Browsers only offer install over **HTTPS** (or on `localhost` for testing).
> To install from a phone, run the server behind HTTPS — e.g. put it behind a
> TLS-terminating reverse proxy, or expose it with a tunnel like
> `cloudflared` / `ngrok` — then open that `https://…` URL and install.

## How the Claude login works

`lib/oauth.js` implements authorization-code + PKCE against Claude's OAuth
endpoints using the public Claude Code OAuth client. The returned access token is
used to call the Anthropic Messages API with the `anthropic-beta: oauth-2025-04-20`
header, which routes inference to the logged-in user's subscription. All OAuth
parameters are overridable via environment variables — see `.env.example`.

## Architecture

```
server.js            Express app: auth, projects, AI chat (SSE), C++ run, preview
lib/oauth.js         Claude "Login with Claude" PKCE flow + token refresh
lib/anthropic.js     Messages API client (oauth + api-key), file-block parsing
lib/runner.js        Real g++ compile-and-run with timeouts and output caps
lib/sessions.js      In-memory session / PKCE / project stores
public/              IDE front-end (Monaco via CDN + textarea fallback, no build)
```

### The C++ Run button

Requires `g++` on the host (`sudo apt-get install g++` / part of `build-essential`).
When you press **Run**, `lib/runner.js` writes the project's `.cpp`/header files to a
temp directory, compiles them together, then executes the binary — feeding your
stdin box to the program. Compilation is capped at 15s, execution at 8s, and each
output stream at 256 KB, so runaway programs are killed cleanly.

> Server-side execution note: the runner compiles and runs untrusted code on the
> host with time/output limits but **no OS-level sandbox**. Run it locally or in a
> disposable container; don't expose this endpoint on a shared/production host
> without adding real isolation (containers, seccomp, resource cgroups).

Sessions and projects are held in memory, keyed by a signed cookie — swap the Maps
in `lib/sessions.js` for a database to persist projects or run multiple instances.

## Notes & limits

- Generated apps are **static** (HTML/CSS/JS, CDN libraries allowed) and run in a
  sandboxed iframe — no server-side code or npm build step.
- This is a demo-grade build: single node, in-memory storage, no rate limiting.
- Respect Anthropic's usage policies and your plan's terms when using
  subscription-backed inference.
