# roblox-map-agent

An AI agent that builds complete Roblox maps from a single prompt — runs entirely off subscriptions you already pay for, no API keys.

- **Claude** (planning + tool use): your existing Claude Code login (Pro/Max).
- **Gemini** (skybox + decals + signs + posters): your Gemini Advanced login, driven via headed Playwright.

Output: a `.rbxlx` place file + a folder of generated PNGs. Drag the .rbxlx into Roblox Studio.

## Architecture

```
your prompt
   │
   ▼
src/index.ts ──spawns──▶ claude -p "..."  --mcp-config mcp-config.json
                                  │
                                  │  (uses your Claude Code subscription)
                                  ▼
                             Claude calls our 7 MCP tools (stdio)
                                  │
                                  ▼
                         src/mcp-server.ts
                          ├─ ask_user            → file-based hand-off back to index.ts (your terminal)
                          ├─ generate_image      → Playwright on gemini.google.com (uses your Gemini sub)
                          ├─ place_part / place_model
                          ├─ set_skybox / set_ambient_light
                          └─ finalize_map        → writes output/<run>/map.rbxlx + README.md
```

The MCP server holds map state in memory across all tool calls and emits the .rbxlx when Claude calls `finalize_map`.

## Setup (one time, on a Mac)

```bash
cd roblox-map-agent
npm install
npm run playwright:install   # downloads Chromium for Playwright
```

Make sure `claude` is on your PATH and logged in:

```bash
claude            # opens interactive mode
/login            # log in with your Pro/Max subscription
/exit
```

That's it — you don't need to do this again.

## Usage

```bash
npm run start -- "a small medieval village by a river, with a tavern, market square, and watchtower"
```

What happens:

1. The CLI spawns `claude -p` with your map prompt and our MCP server attached.
2. Claude plans the map and starts calling tools.
3. The first time it calls `generate_image`, a **Chromium window opens** at gemini.google.com. If you're not logged in, sign in once — the session is saved in `.gemini-profile/` and reused on every future run.
4. Claude generates 5–15 hero images, places 50–200 parts, and finalizes.
5. You get:
   ```
   output/<timestamp>/
   ├── map.rbxlx              # drag into Roblox Studio
   ├── README.md              # what was built + how to wire up images
   ├── mcp-config.json        # the config used for this run (debug)
   └── generated-assets/      # Gemini PNGs
   ```

### Wiring up the images in Studio

The .rbxlx references PNGs as `rbxasset://localfile/<name>.png` placeholders. Studio doesn't auto-resolve those, so once per run:

1. Open `map.rbxlx` in Roblox Studio.
2. **View → Asset Manager**, drag the PNGs from `generated-assets/`. Studio gives each an `rbxassetid://NUMBER` URL.
3. In Explorer, find each Decal / Sky and replace the texture URL.

Geometry, materials, and lighting work without this step — only the Gemini art needs the manual upload.

### CLI flags

```bash
# Pick a model — defaults to "sonnet" (cheaper, plenty for layout work).
npm run start -- "..." --model opus

# Run Playwright headless (no visible browser). Use ONLY after you've logged in
# once headed and saved the session.
npm run start -- "..." --headless
```

## File map

```
src/
├── index.ts              # CLI orchestrator: spawns claude -p, watches ask_user
├── mcp-server.ts         # MCP stdio server: 7 tools, map state, .rbxlx writer
├── gemini-browser.ts     # Playwright driver for gemini.google.com
└── rbxlx.ts              # Roblox XML place-file builder
```

## Known limitations

- **Selectors are brittle.** Google reshuffles Gemini's UI a few times a year. When something breaks, you'll see a clear timeout error pointing at the failing selector — fix in `src/gemini-browser.ts`.
- **Browser automation is gray-area against Google's TOS.** Personal use is low risk; don't hammer it for hours.
- **Playwright keeps a real browser running.** If a run crashes mid-way, run `pkill -f chromium` to clean up stragglers.
- **Decals / skybox use local-file placeholders.** Studio asset upload is manual (one-time per map).
- **Material enum tokens** in `rbxlx.ts` are hand-mapped — common ones (Wood, Brick, Slate, Grass) are right; obscure ones (Foil, Fabric) are approximate.
- **Only primitive shapes** (Block, Ball, Cylinder, Wedge). No MeshParts.
