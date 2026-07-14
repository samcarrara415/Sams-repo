# ◆ C++ Playground

A dead-simple, **fully in-browser C++ playground**: write C++, hit **▶ Run**, and
the output prints to the terminal. No server, no account, no setup — and it
installs to your home screen as an app.

**Live:** `https://samcarrara415.github.io/Sams-repo/claude-studio-web/`

## Use it

1. Open the page (or install it: **Add to Home Screen**).
2. Type C++ in the editor.
3. Press **▶ Run** (or `Ctrl`/`Cmd` + `Enter`). Output shows in the terminal.
4. Need input? Type it in the **stdin** box before running; read it with `cin`.

Your code is saved in the browser automatically. **Reset** restores the starter.

## How it runs

Run compiles and executes your code on a **real gcc 13.2 compiler** via the
[Wandbox](https://wandbox.org) API (called directly from the browser — it's
CORS-enabled). That means the **full C++ standard library** works: `std::string`,
`std::vector`, `<algorithm>`, ranges, everything. Pick the language standard
(C++17 / C++20 / C++23) from the header.

Because compilation runs online, **Run needs an internet connection** (the app
shell itself still loads offline as an installed PWA).

## Files

```
index.html   editor + Run + C++ standard picker + terminal
app.js       editor (Monaco, textarea fallback) + Wandbox (gcc) runner
styles.css   dark, mobile/safe-area-aware, Replit-style layout
sw.js        service worker (offline shell, network-first code)
manifest.webmanifest, icon*  PWA install metadata
```
