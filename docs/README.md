# FreaksMC Creator Tracker — static (GitHub Pages) version

This folder is a **self-contained, browser-only** version of the creator
tracker, built to be hosted on GitHub Pages. It's a single `index.html` (no
server, no build step). Your data is stored in **your browser's localStorage** —
it never leaves your machine and is never committed to the repo.

It mirrors the local Flask tool in `../freaksmc-creator-tracker/`: dashboard,
add/edit/delete, status + subscriber filtering and sorting, per-creator
commission, HANDLE+suffix affiliate codes, and `.xlsx` export/import (via
SheetJS loaded from a CDN).

---

## ⚠️ Read this about the password

The sign-in box (`samc` / `samc4153`) is a **cosmetic speed-bump, not real
security.** GitHub Pages has no server, so there's no way to do genuine login
protection. Specifically:

- The username and password are visible in plain text in `index.html`, which is
  in a **public** repo. Anyone who opens the file can read them.
- Anyone can bypass the prompt entirely via browser DevTools.
- The page is publicly reachable by anyone who has the URL.

What actually protects you here is that **your data lives only in your own
browser** — it isn't published with the site. The `noindex` tag keeps the page
out of search results, but does not make it private. Don't treat this page as a
secure or private store of sensitive data.

---

## Deploy it to GitHub Pages

GitHub Pages can't be toggled from code, so do this once in the repo settings:

1. Push this branch (already done by the tool).
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment → Source**, pick **Deploy from a branch**.
4. Set **Branch** to `claude/freaksmc-creator-tracker-2xjp2m` (or merge to `main`
   first and pick `main`), and **Folder** to **`/docs`**. Save.
5. Wait ~1 minute for the first build.

Your site will be published at:

```
https://samcarrara415.github.io/Sams-repo/
```

This is a **project page** under your account — it is *not* your default
`samcarrara415.github.io` user site, so it won't interfere with whatever you're
keeping that for.

> A true subdomain like `tracker.samcarrara415.github.io` isn't possible on
> GitHub Pages without a custom domain you own (set via a `CNAME` file +
> DNS). If you have a domain, say so and I'll wire that up.

### Files in this folder
- `index.html` — the entire app (HTML + CSS + JS)
- `.nojekyll` — tells Pages to serve files as-is (skip Jekyll)
- `robots.txt` — asks crawlers to stay away (best-effort)

---

## Local use

Just open `index.html` in any browser — no server needed. Same data model, also
stored in that browser's localStorage.

## Local vs. Pages data

The static app (this folder) and the Flask app (`../freaksmc-creator-tracker/`)
store data **separately** — browser localStorage vs. a SQLite file. They don't
sync. Use **Export .xlsx** in one and **Import** in the other to move records
between them.
