# C++ Academy

A small web app for learning C++ on a phone or a laptop. It has 44 short lessons in 10 modules (from Hello World through pointers, classes, templates, smart pointers, and move semantics), 10 practice problems, a quick-reference sheet, and a free-form code editor.

Live: https://samcarrara415.github.io/Sams-repo/cpp-academy/

## How code runs

Code is compiled and run with GCC 13.2 (`-std=c++20`, warnings on) by the public [Wandbox](https://wandbox.org) API. The browser sends the source and any input to `https://wandbox.org/api/compile.json` and shows the compiler messages, the program's output, and its exit status. Because it is a real compiler, anything in the standard library works.

Each lesson ends with an exercise. An exercise is checked by running your program against one to three inputs and comparing the output with the expected output (trailing spaces and blank lines at the end are ignored). The first input and its expected output are shown; the others make sure a program that just prints the answer doesn't pass.

## Limits

- Running code needs an internet connection and depends on Wandbox being up. Lessons, the reference, and your saved code work offline once the app has been loaded.
- Programs can't be interactive. Everything they read from `std::cin` has to be typed into the Input box before pressing Run.
- Wandbox stops programs after roughly 30 seconds, and the app stops waiting after 25. It also rate-limits clients that send many requests in a short time.
- Progress and code drafts are stored in the browser's `localStorage`, so they stay on one device and are lost if site data is cleared.

## Files

| File | Contents |
| --- | --- |
| `index.html` | Markup and all CSS (light and dark themes) |
| `app.js` | Routing, rendering, the Wandbox client, exercise checking, saved progress |
| `curriculum.js` | Lessons, practice problems, reference entries, and editor templates |
| `sw.js` | Service worker that caches the app for offline use |

There is no build step. CodeMirror 5 is loaded from cdnjs. To run it locally, serve the folder with any static server, for example `python3 -m http.server`, and open `http://localhost:8000/`.

## Checking the course content

Every example, starter, and solution in `curriculum.js` compiles cleanly with `g++ -std=c++20 -Wall -Wextra`, every solution passes all of its tests, and no starter does. When you edit a lesson, re-check its code with a local compiler before publishing. Code samples live inside JavaScript template literals, so write `std::endl` or `'\\n'` rather than a bare `"\n"`.
