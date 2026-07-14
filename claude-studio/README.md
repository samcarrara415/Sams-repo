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
  static web app. Follow-up prompts edit the existing project with full file
  context. Streaming responses.
- **IDE** — projects list, file tree, Monaco code editor with tabs, autosave.
- **Live preview** — each project is served under `/preview/:id/*` and rendered in
  a sandboxed iframe that refreshes as files change.

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

## How the Claude login works

`lib/oauth.js` implements authorization-code + PKCE against Claude's OAuth
endpoints using the public Claude Code OAuth client. The returned access token is
used to call the Anthropic Messages API with the `anthropic-beta: oauth-2025-04-20`
header, which routes inference to the logged-in user's subscription. All OAuth
parameters are overridable via environment variables — see `.env.example`.

## Architecture

```
server.js            Express app: auth, projects, AI chat (SSE), live preview
lib/oauth.js         Claude "Login with Claude" PKCE flow + token refresh
lib/anthropic.js     Messages API client (oauth + api-key), file-block parsing
lib/sessions.js      In-memory session / PKCE / project stores
public/              IDE front-end (Monaco via CDN, no build step)
```

Sessions and projects are held in memory, keyed by a signed cookie — swap the Maps
in `lib/sessions.js` for a database to persist projects or run multiple instances.

## Notes & limits

- Generated apps are **static** (HTML/CSS/JS, CDN libraries allowed) and run in a
  sandboxed iframe — no server-side code or npm build step.
- This is a demo-grade build: single node, in-memory storage, no rate limiting.
- Respect Anthropic's usage policies and your plan's terms when using
  subscription-backed inference.
