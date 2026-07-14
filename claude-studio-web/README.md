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

Code executes locally via [JSCPP](https://github.com/felixhao28/JSCPP), a C++
interpreter compiled to run in the browser (vendored in `vendor/`, so it works
offline). It supports a **subset** of C++:

- Common headers: `<iostream>`, `<cmath>`, `<cstdio>`, `<cstdlib>`, `<cstring>`,
  `<ctime>`, `<cctype>`, `<iomanip>`.
- Core language: variables, control flow, functions, recursion, arrays,
  pointers, structs, math, and console I/O.
- **No STL containers or `std::string`** (no `<vector>`/`<string>`/`<algorithm>`);
  use C arrays and `char[]` strings.
- You can write either `std::cout` or `using namespace std;` — the playground
  normalizes `std::` automatically so both styles just run.

For full-language C++ (`std::vector`, modern STL, real `g++`), use a real
toolchain; this is a lightweight learn-and-experiment environment.

## Files

```
index.html   editor + Run button + terminal
app.js       editor (Monaco, textarea fallback) + JSCPP runner
styles.css   dark, mobile/safe-area-aware layout
vendor/      bundled JSCPP interpreter (MIT) + its license
sw.js        service worker (offline shell, network-first code)
manifest.webmanifest, icon*  PWA install metadata
```
