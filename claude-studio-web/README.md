# ◆ Claude Studio — static edition (GitHub Pages)

A **fully client-side** build of Claude Studio that runs on static hosting like
GitHub Pages. Build web apps by chatting with AI and run C++ right in the
browser — no server, no build step. Installable to your home screen (PWA).

**Live (once Pages is enabled):**
`https://samcarrara415.github.io/Sams-repo/claude-studio-web/`

## What it does

- **AI app builder** — describe an app; Claude writes complete multi-file HTML/CSS/JS
  that renders live in a sandboxed preview. Streaming responses.
- **C++ IDE with a Run button** — write C++ and run it in-browser via
  [JSCPP](https://github.com/felixhao28/JSCPP), with a stdin box and console.
- **Editor** — Monaco (with a textarea fallback if the CDN is blocked), file tree,
  tabs. Projects are saved in your browser's `localStorage`.
- **Installable** — Add to Home Screen and it launches standalone like an app.

## How the AI is authenticated (important)

This static edition uses **your own Anthropic API key**, entered once and stored
only in your browser (`localStorage`). Requests go directly from your browser to
`api.anthropic.com` using the `anthropic-dangerous-direct-browser-access` header,
which Anthropic allows via CORS. Get a key at **console.anthropic.com → API Keys**.

> **Why not "Log in with Claude" (subscription)?** That OAuth flow's token
> exchange has no CORS access, so it cannot run in a browser — it needs a server.
> If you want subscription-based login and/or a **real g++** compiler, use the
> **server edition** in [`../claude-studio`](../claude-studio) instead.

## Static vs server edition

| | Static (this) | Server (`../claude-studio`) |
|---|---|---|
| Hosting | ✅ GitHub Pages | Node host |
| AI auth | Your API key | Claude **subscription** login or API key |
| C++ | In-browser (JSCPP, a C++ subset) | Real **g++** |
| Projects | Browser `localStorage` | Server memory |
| Install (PWA) | ✅ from the Pages URL | ✅ once behind HTTPS |

## Enabling GitHub Pages

Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
branch `main`, folder `/ (root)`. Your existing project folders (this one included)
are then served at `https://<user>.github.io/<repo>/<folder>/`.

## Notes / limits

- **C++ dialect (JSCPP):** the in-browser interpreter runs a *subset* of C++, not a
  full compiler. In practice that means:
  - Write `using namespace std;` and **avoid the `std::` prefix** (use `cout`, not `std::cout`).
  - Available headers: `<iostream>`, `<cmath>`, `<cstdio>`, `<cstdlib>`, `<cstring>`,
    `<ctime>`, `<cctype>`, `<iomanip>`.
  - **No STL containers or `std::string`** — use C arrays and `char[]` strings.
  - Great for learning, algorithms, math, and console programs. The AI is instructed
    to generate code within these limits. For full-language C++ (`std::vector`,
    `std::string`, modern STL), use the **server edition's real g++**.
- Your API key lives in this browser only. Use "Remove key" to clear it. Anyone
  with access to this device/profile can use the stored key — treat it like a password.
