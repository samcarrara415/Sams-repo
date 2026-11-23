# mcode

A C++ editor that runs in the browser. Write a program, press Run, and the
compiler output and program output appear in the terminal pane below the
editor. It is a static site with no build step and no backend of its own, and
it can be installed to a phone's home screen as a web app.

Live: https://samcarrara415.github.io/Sams-repo/claude-studio-web/

## Using it

- **Run**: the Run button, or Ctrl+Enter (Cmd+Enter on a Mac). While a program
  is running the button changes to Stop.
- **Standard**: pick C++17, C++20 or C++23 from the menu next to Run.
- **Input**: text in the stdin box is passed to the program's standard input.
  It can span several lines.
- **Files**: the menu button at the top left has New file, Open and Save.
  On iPhone, Open reads a file from the Files app and Save opens the share
  sheet, where "Save to Files" stores it. On desktop, Save downloads the file.
  Tap the file name to rename it.

The current code, file name and standard are saved in the browser's local
storage as you type, so they come back after a reload. Nothing is stored on
a server.

## How code runs

The browser sends the source and stdin to the [Wandbox](https://wandbox.org)
API, which compiles it with gcc 13.2 (`-Wall -Wextra` plus the selected
`-std`) and runs it. The response holds the compiler diagnostics, the
program's stdout and stderr, and its exit status, which the terminal shows.

On desktop the editor is [Monaco](https://microsoft.github.io/monaco-editor/),
loaded from jsDelivr. On touch devices it is a plain textarea, because Monaco
does not support native text selection on iOS. The textarea still
auto-closes brackets and keeps indentation.

## Limits

- Running code needs an internet connection. The app itself loads offline
  once it has been opened (the service worker caches it), but on desktop it
  falls back to the plain editor when Monaco can't be fetched.
- Wandbox limits each run: programs are killed after roughly 30 seconds, and
  output stops at 128 KB. Input is fixed before the run starts; there is no
  interactive stdin.
- Code is sent to a third-party service, so don't paste anything private.
- Only one file per program, and only gcc.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page layout |
| `app.js` | Editor setup, Wandbox requests, file menu, autosave |
| `styles.css` | Styles, including safe-area and on-screen keyboard handling |
| `sw.js` | Service worker that caches the app for offline use |
| `manifest.webmanifest`, `icon*` | Install metadata and icons |

To run it locally, serve the folder over HTTP (the service worker does not
work from `file://`), for example `python3 -m http.server`.
