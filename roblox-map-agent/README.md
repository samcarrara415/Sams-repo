# roblox-map-agent

An AI agent that builds complete Roblox maps from a single prompt. **Claude Opus 4.7** handles planning and geometry; **Google Gemini (Imagen)** handles hero art (skybox, decals, signs, posters). Output is a `.rbxlx` place file plus the generated PNGs — drag into Roblox Studio and play.

## How it works

```
your prompt ──▶ Claude (planner / tool user)
                    │
                    ├── ask_user        ── readline prompts when scope is genuinely ambiguous
                    ├── generate_image  ── Gemini → PNG saved to output/<run>/generated-assets/
                    ├── place_part      ── adds a Part to Workspace
                    ├── place_model     ── adds a Model (group of Parts)
                    ├── set_skybox      ── 6 face Sky in Lighting
                    ├── set_ambient_light
                    └── finalize_map    ── ends the loop, runtime emits map.rbxlx
```

Built-in materials (Grass, Brick, Wood, Slate, etc.) are used for ground and walls — Gemini-generated images don't tile, so they're reserved for hero art. Skybox can be 6 separate faces or one image reused on all 6.

## Setup

```bash
cd roblox-map-agent
npm install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY and GOOGLE_API_KEY
```

API keys:
- `ANTHROPIC_API_KEY` — https://console.anthropic.com/settings/keys
- `GOOGLE_API_KEY` — https://aistudio.google.com/app/apikey (must have Imagen access enabled)

## Usage

```bash
npm run start -- "a small medieval village by a river, with a tavern, market square, and watchtower"
```

The agent may ask one round of clarifying questions, generate ~5–15 images, place ~50–200 parts, then finalize. Each run produces:

```
output/<timestamp>/
├── map.rbxlx              # drag into Roblox Studio
├── README.md              # what was built + how to wire up the images
└── generated-assets/      # Gemini PNGs (skybox faces, decals)
    ├── skybox_up.png
    ├── sign_welcome.png
    └── ...
```

### Hooking up the images in Studio

The .rbxlx references PNGs as `rbxasset://localfile/<name>.png` placeholders. Studio doesn't auto-resolve those, so:

1. Open `map.rbxlx` in Roblox Studio.
2. **View > Asset Manager**, drag the PNGs from `generated-assets/` to upload. Studio gives each an `rbxassetid://NUMBER` URL.
3. In the Explorer, find each Decal / Sky and replace the texture URL.

Geometry, materials, and ambient lighting work without this step — only the Gemini art needs the manual upload.

## Tweaking behavior

- **Different model**: pass `model` into `runAgent()` in `src/agent.ts`. Defaults to `claude-opus-4-7`.
- **More/fewer iterations**: `max_iterations` in `src/agent.ts` (default 60).
- **Higher map quality / cost**: bump `max_tokens` in `src/agent.ts` (currently 32k).
- **Different aspect ratios for images**: see the `aspectRatio` enum in `src/tools.ts`.

## File map

```
src/
├── index.ts     # CLI entry point — reads prompt, sets up output dir, runs agent, writes .rbxlx
├── agent.ts    # System prompt + Claude tool runner setup
├── tools.ts    # Zod-typed tools (ask_user, generate_image, place_part, ...)
├── gemini.ts   # Imagen-4 client wrapper, saves PNGs to disk
├── rbxlx.ts    # rbxlx XML builder (Workspace / Lighting / Sky / Part / Decal / Model)
└── state.ts    # Shared mutable map state across tool calls
```

## Known limitations

- Decals / skybox use local-file placeholders; Roblox Studio asset upload is manual.
- No physics objects (everything is anchored). Easy to extend in `tools.ts`.
- Material enum tokens are hand-mapped in `rbxlx.ts` — a few of the more obscure ones are approximate.
- No MeshParts (only primitive shapes: Block, Ball, Cylinder, Wedge).
