# Claude Studio

A browser IDE where you describe an app in chat and Claude writes the files. There are two project types:

- **Web app**: HTML, CSS and JavaScript, shown in a sandboxed preview that reloads as files change.
- **C++ program**: the server compiles the project with g++ and runs it with the input you provide.

Each project has a file list, tabbed editor (Monaco, or a plain text editor on touch devices or when the Monaco CDN can't be reached), autosave and a chat history. Follow-up messages edit the current project; Claude sees every file on each turn. The layout switches to a bottom tab bar on phones, and the app can be installed as a PWA.

This is an independent project and is not affiliated with Anthropic.

## Requirements

- Node.js 20.12 or newer
- g++ with C++20 support, for C++ projects (`sudo apt install g++`, or Xcode Command Line Tools on macOS)
- An Anthropic API key, for chat. Editing and running code work without one.

## Setup

```bash
cd claude-studio
npm install
npm start
```

Open http://localhost:3000. Click **Add API key** and paste a key from the [Claude Console](https://platform.claude.com/). The server checks the key with a single request to the Models API, then keeps it in your in-memory session. It is never sent back to the browser or written to disk or logs, and it is forgotten when the server restarts.

For a single-user, self-hosted setup you can set the key on the server instead, and nobody will be asked for one:

```bash
cp .env.example .env    # then set ANTHROPIC_API_KEY
npm start
```

Anyone who can reach the server uses that key, so only do this on a machine you control. `.env.example` lists the other settings (port, host, default model).

## How generation works

Each chat message is sent to the Messages API with the full contents of the project and the recent chat history. The system prompt asks Claude to reply with a short explanation followed by complete files in `<file path="...">` blocks. The server streams the reply to the browser, then writes the returned files into the project. Files that aren't mentioned are left alone.

Models: Claude Opus 5.5 (default), Claude Sonnet 5.5 and Claude Haiku 5.5, selectable in the chat panel. Requests stream with a 64,000 token output limit. For Opus and Sonnet, the request opts into server-side fallback, so a request declined by a safety classifier is retried on the model Anthropic recommends instead of failing. API errors (rejected key, rate limit, network failure) are shown in the chat as plain messages.

## How C++ runs

Pressing **Run** (or Ctrl+Enter in the editor) saves pending edits, then `lib/runner.js`:

1. creates a fresh temp directory and writes the project's `.cpp` and header files into it, keeping subfolders,
2. compiles every `.cpp` file with `g++ -std=c++20 -O2` (15 second limit),
3. runs the binary with the stdin box as input (5 second limit, 64 KB combined output limit),
4. kills the program's whole process group if it hits a limit, and deletes the temp directory.

The console shows compiler errors, program output, the exit code, or the signal that ended the program (for example a segmentation fault). At most four programs run at once.

## Security

**The C++ runner is not a sandbox.** Programs run as the same user as the server, with that user's access to files and the network. The time and output limits stop runaway programs; they don't stop malicious ones. Run Claude Studio on your own machine or a disposable VM or container, not on a shared or public server.

The server listens on 127.0.0.1 by default for this reason. Set `HOST=0.0.0.0` only on a network you trust. If you put it on the internet, put real isolation around the runner (a container per run, seccomp, cgroup limits) and authentication in front of the app.

Web app previews are served with a `Content-Security-Policy: sandbox` header and loaded in a sandboxed iframe, so generated code runs in an opaque origin and can't call the Claude Studio API with your session, even when the preview is opened in its own tab.

## Limits

- Sessions and projects are kept in memory and are lost when the server restarts. Idle sessions are removed after 7 days.
- Web apps are static files only: no server code, no npm packages or build step. Libraries can be loaded from a CDN.
- C++ projects can use the standard library only, with no build system.
- One server process; there is no rate limiting or user accounts.

## Project layout

```
server.js          Express app: settings, projects, files, chat (SSE), C++ run, preview
lib/anthropic.js   Anthropic SDK calls, prompts, error messages, file-block parsing
lib/runner.js      g++ compile and run with limits and cleanup
lib/sessions.js    In-memory sessions and projects, file path validation
public/            Front end (no build step): index.html, app.js, styles.css, service worker
```

## Testing without an API key

`ANTHROPIC_BASE_URL` points the Anthropic client at a different server. Running a small local server that speaks the Messages API streaming format and starting Claude Studio with `ANTHROPIC_BASE_URL=http://127.0.0.1:<port>` lets you exercise the chat flow, including error cases, without calling the real API.
