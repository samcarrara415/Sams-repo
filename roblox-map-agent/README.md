# roblox-map-agent

An AI agent that builds complete Roblox maps from a single prompt. Uses your existing **Claude Code** subscription for planning + tool use; images are **human-in-the-loop** — the agent prints a Gemini-ready prompt to your terminal, you generate it however you like (Gemini app, Claude.ai, anywhere), drag the saved PNG into the terminal, and the agent continues.

Output: a `.rbxlx` place file + the PNGs you provided. Drag the .rbxlx into Roblox Studio.

## Architecture

```
your prompt
   │
   ▼
src/index.ts ──spawns──▶ claude -p "..."  --mcp-config mcp-config.json
                                  │
                                  │  (uses your Claude Code login)
                                  ▼
                             Claude calls our 7 MCP tools (stdio)
                                  │
                                  ▼
                         src/mcp-server.ts
                          ├─ ask_user            → file handshake → terminal
                          ├─ generate_image      → file handshake → terminal
                          │                        ("here's the prompt, paste a path
                          │                         to the saved PNG")
                          ├─ place_part / place_model
                          ├─ set_skybox / set_ambient_light
                          └─ finalize_map        → writes output/<run>/map.rbxlx
```

The MCP server holds map state in memory and emits the .rbxlx when Claude calls `finalize_map`. Both `ask_user` and `generate_image` use the same file-based handshake to talk to your terminal (the MCP server is a child of the `claude` process and can't read stdin directly).

## Setup (one time, on a Mac)

```bash
cd roblox-map-agent
npm install
```

Make sure `claude` is on your PATH and logged in:
```bash
claude
/login
/exit
```

That's it.

## Usage

```bash
npm run start -- "a small medieval village by a river, with a tavern, market square, and watchtower"
```

What happens:

1. Claude plans the map.
2. When it wants an image, your terminal prints:
   ```
   ────────────────────────────────────────────────────────────
    IMAGE NEEDED — id: skybox_up
   ────────────────────────────────────────────────────────────
    Generate this image (e.g. in Gemini), save the PNG, then
    drag the file into this terminal and press Enter.

    Prompt:
      Seamless skybox face, looking straight up at a clear blue
      sky with wispy cumulus clouds. Painted matte. No horizon,
      no sun, no aircraft.
   ────────────────────────────────────────────────────────────
   path>
   ```
3. Open Gemini (or whatever), paste the prompt, generate the image, save the PNG anywhere (Downloads is fine).
4. Drag the saved PNG into the terminal — Mac auto-pastes the path. Press Enter.
5. Repeat for ~5–15 hero images, then Claude builds the geometry on its own.
6. You get:
   ```
   output/<timestamp>/
   ├── map.rbxlx              # drag into Roblox Studio
   ├── README.md              # what was built + how to wire up images
   ├── mcp-debug.log          # MCP server activity log (useful when debugging)
   ├── mcp-config.json        # the config used for this run
   └── generated-assets/      # copies of the PNGs you provided
   ```

The agent batches all `generate_image` calls upfront before doing geometry, so you can knock them out in one Gemini session rather than being interrupted every minute.

### Wiring up the images in Studio

The .rbxlx references PNGs as `rbxasset://localfile/<name>.png` placeholders. Studio doesn't auto-resolve those, so once per map:

1. Open `map.rbxlx` in Roblox Studio.
2. **View → Asset Manager**, drag the PNGs from `generated-assets/`. Studio gives each an `rbxassetid://NUMBER` URL.
3. In Explorer, find each Decal / Sky and replace the texture URL.

Geometry, materials, and lighting work without this step — only the generated art needs the manual upload.

### CLI flags

```bash
# Pick a model — defaults to "sonnet" (cheaper, plenty for layout work).
npm run start -- "..." --model opus
```

## File map

```
src/
├── index.ts          # CLI orchestrator: spawns claude -p, watches for ask_user / generate_image requests
├── mcp-server.ts     # MCP stdio server: 7 tools, map state, .rbxlx writer
└── rbxlx.ts          # Roblox XML place-file builder
```

## Known limitations

- Decals / skybox use local-file placeholders. Studio asset upload is manual (one-time per map).
- Material enum tokens in `rbxlx.ts` are hand-mapped — common ones (Wood, Brick, Slate, Grass) are right; obscure ones (Foil, Fabric) are approximate.
- Only primitive shapes (Block, Ball, Cylinder, Wedge). No MeshParts.
- Each `generate_image` call blocks until you provide the file. If you walk away, the agent waits up to 30 minutes per image, then the run fails.
