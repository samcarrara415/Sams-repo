// MCP stdio server exposing the Roblox map-building tools to Claude Code.
//
// Claude Code is invoked via `claude -p ... --mcp-config <json>` with this
// file's path in the config; Claude spawns this process and talks to it over
// stdio. All tool calls land here.
//
// The server holds the in-progress map state in memory and writes
// `map.rbxlx` + `README.md` when finalize_map is called.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";

import {
  buildRbxlx,
  type Face,
  type MaterialName,
  type ModelSpec,
  type PartSpec,
  type ShapeName,
  type SkyboxSpec,
  type Rgb,
} from "./rbxlx.js";

// ─── config from argv / env ──────────────────────────────────────────────────

function readArg(name: string, fallback?: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && idx < process.argv.length - 1) {
    return process.argv[idx + 1]!;
  }
  const env = process.env[`ROBLOX_AGENT_${name.toUpperCase().replace(/-/g, "_")}`];
  if (env) return env;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required arg --${name}`);
}

const OUTPUT_DIR = readArg("output-dir");
const REQUESTS_DIR = path.join(OUTPUT_DIR, ".requests");
const IMAGE_DIR = path.join(OUTPUT_DIR, "generated-assets");

// Debug log — claude doesn't reliably surface MCP server stderr to the user's
// terminal, so we tee everything to <output-dir>/mcp-debug.log too.
let debugStream: ReturnType<typeof createWriteStream> | null = null;
function dbg(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stderr.write(line);
  try {
    debugStream ??= createWriteStream(path.join(OUTPUT_DIR, "mcp-debug.log"), { flags: "a" });
    debugStream.write(line);
  } catch {
    // OUTPUT_DIR may not exist yet on the very first call; ignore.
  }
}

// Make sure the output dir is on disk before anything else (so debug log
// doesn't fail silently). Top-level await is fine in ESM.
await fs.mkdir(OUTPUT_DIR, { recursive: true });
dbg(`mcp-server starting. output=${OUTPUT_DIR}`);

process.on("uncaughtException", (err) => {
  dbg(`uncaughtException: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
});
process.on("unhandledRejection", (err) => {
  dbg(`unhandledRejection: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
});

// ─── shared state (single in-memory map) ─────────────────────────────────────

interface ImageRec {
  id: string;
  prompt: string;
  filepath: string;
}

const state = {
  parts: [] as PartSpec[],
  models: [] as ModelSpec[],
  skybox: undefined as SkyboxSpec | undefined,
  ambient: undefined as Rgb | undefined,
  images: [] as ImageRec[],
  finalized: false,
  requestCounter: 0,
};

// ─── tool input schemas ──────────────────────────────────────────────────────

const Vec3 = z.object({ x: z.number(), y: z.number(), z: z.number() });
const Rgb01 = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
});

const MATERIALS = [
  "Plastic", "SmoothPlastic", "Neon", "Wood", "WoodPlanks", "Brick", "Cobblestone",
  "Concrete", "Granite", "Slate", "Marble", "Sand", "Glass", "Grass", "Metal",
  "DiamondPlate", "CorrodedMetal", "Pebble", "Ice", "Foil", "Fabric",
] as const;
const SHAPES = ["Block", "Ball", "Cylinder", "Wedge"] as const;
const FACES = ["Top", "Bottom", "Front", "Back", "Left", "Right"] as const;

const PartShape = z.object({
  name: z.string().min(1),
  position: Vec3,
  size: Vec3,
  rotationY: z.number().optional(),
  color: Rgb01.optional(),
  material: z.enum(MATERIALS).optional(),
  shape: z.enum(SHAPES).optional(),
  anchored: z.boolean().optional(),
  transparency: z.number().min(0).max(1).optional(),
  decals: z
    .array(z.object({ face: z.enum(FACES), imageId: z.string() }))
    .optional(),
});

const ToolInputs = {
  ask_user: z.object({ question: z.string().min(1) }),
  generate_image: z.object({
    id: z.string().min(1),
    prompt: z.string().min(1),
  }),
  place_part: PartShape,
  place_model: z.object({ name: z.string().min(1), parts: z.array(PartShape).min(1) }),
  set_skybox: z.object({
    up: z.string(),
    down: z.string(),
    front: z.string(),
    back: z.string(),
    left: z.string(),
    right: z.string(),
  }),
  set_ambient_light: z.object({ color: Rgb01 }),
  finalize_map: z.object({ summary: z.string().min(1) }),
} as const;

// ─── tool definitions for ListTools ──────────────────────────────────────────

function jsonSchema(s: z.ZodTypeAny): unknown {
  // Minimal Zod → JSON Schema (good enough for MCP — Claude Code does not
  // enforce strict JSON Schema, just uses it as guidance).
  // We hand-build for clarity rather than pull a dependency.
  return zodToJsonSchema(s);
}

function zodToJsonSchema(s: z.ZodTypeAny): any {
  if (s instanceof z.ZodObject) {
    const shape = (s as any).shape as Record<string, z.ZodTypeAny>;
    const props: Record<string, any> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(shape)) {
      props[k] = zodToJsonSchema(v);
      if (!v.isOptional()) required.push(k);
    }
    return { type: "object", properties: props, required, additionalProperties: false };
  }
  if (s instanceof z.ZodArray) return { type: "array", items: zodToJsonSchema((s as any).element) };
  if (s instanceof z.ZodString) return { type: "string" };
  if (s instanceof z.ZodNumber) return { type: "number" };
  if (s instanceof z.ZodBoolean) return { type: "boolean" };
  if (s instanceof z.ZodEnum) return { type: "string", enum: (s as any).options };
  if (s instanceof z.ZodOptional) return zodToJsonSchema((s as any).unwrap());
  if (s instanceof z.ZodNullable) return zodToJsonSchema((s as any).unwrap());
  return {};
}

const TOOL_DEFS = [
  {
    name: "ask_user",
    description:
      "Ask the user a clarifying question and wait for their text answer. Use sparingly — only when a decision genuinely affects the map (theme details, scale, must-have features). Do NOT ask about things you can decide yourself. At most one round of questions before committing.",
    inputSchema: jsonSchema(ToolInputs.ask_user),
  },
  {
    name: "generate_image",
    description:
      "Request an image from the user. The user generates it manually (typically in Gemini) and provides a path to the saved PNG. Returns an imageId you can reference in place_part decals or set_skybox. Use for: skybox faces, decals, signs, posters, murals, billboards, concept art. DO NOT use for ground or wall textures — they don't tile; use Roblox built-in materials for those. Each generate_image call blocks until the user supplies the image, so prefer to batch these early in the run rather than asking for one image at a time after lots of geometry.",
    inputSchema: jsonSchema(ToolInputs.generate_image),
  },
  {
    name: "place_part",
    description:
      "Place a single Part in the map (Workspace). Use for terrain features, walls, props. For collections of related parts, prefer place_model.",
    inputSchema: jsonSchema(ToolInputs.place_part),
  },
  {
    name: "place_model",
    description:
      "Place a Model — a named group of related parts (e.g. 'Tavern', 'OakTree_01'). Models keep your map organized in the Studio explorer.",
    inputSchema: jsonSchema(ToolInputs.place_model),
  },
  {
    name: "set_skybox",
    description:
      "Set the Lighting skybox using 6 generated images (one per face). All 6 imageIds must already exist (call generate_image first). For a stylized look you can pass the same imageId for all 6 faces.",
    inputSchema: jsonSchema(ToolInputs.set_skybox),
  },
  {
    name: "set_ambient_light",
    description:
      "Set Lighting.Ambient (the global ambient color). Use to dial mood — warm orange for sunset, cool blue for dusk, dim grey for stormy.",
    inputSchema: jsonSchema(ToolInputs.set_ambient_light),
  },
  {
    name: "finalize_map",
    description:
      "Call when the map is complete. The runtime writes map.rbxlx and exits after this. Provide a short summary of what you built.",
    inputSchema: jsonSchema(ToolInputs.finalize_map),
  },
];

// ─── tool handlers ───────────────────────────────────────────────────────────

function asText(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function resolveAssetId(imageId: string): string {
  if (imageId.startsWith("rbxassetid://")) return imageId;
  const img = state.images.find((i) => i.id === imageId);
  if (!img) {
    throw new Error(`Unknown imageId '${imageId}'. Generate it first with generate_image.`);
  }
  return `rbxasset://localfile/${path.basename(img.filepath)}`;
}

function partFromInput(p: z.infer<typeof PartShape>): PartSpec {
  return {
    name: p.name,
    position: p.position,
    size: p.size,
    rotationY: p.rotationY,
    color: p.color,
    material: p.material as MaterialName | undefined,
    shape: p.shape as ShapeName | undefined,
    anchored: p.anchored,
    transparency: p.transparency,
    decals: p.decals?.map((d) => ({
      face: d.face as Face,
      assetId: resolveAssetId(d.imageId),
    })),
  };
}

/**
 * Generic file-handshake to ask the parent CLI to prompt the user for input.
 * Writes <seq>.req.json describing the request; polls for <seq>.res.txt with
 * the user's response (text answer for ask_user, file path for generate_image).
 */
async function requestFromUser(
  type: "ask_user" | "generate_image",
  payload: Record<string, unknown>,
  timeoutMs: number
): Promise<string> {
  await fs.mkdir(REQUESTS_DIR, { recursive: true });
  state.requestCounter += 1;
  const stem = String(state.requestCounter).padStart(4, "0");
  const reqPath = path.join(REQUESTS_DIR, `${stem}.req.json`);
  const resPath = path.join(REQUESTS_DIR, `${stem}.res.txt`);
  await fs.writeFile(reqPath, JSON.stringify({ type, ...payload }), "utf8");
  dbg(`request ${stem} (${type}) written, waiting for response`);

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fs.readFile(resPath, "utf8");
      await fs.unlink(reqPath).catch(() => {});
      await fs.unlink(resPath).catch(() => {});
      const trimmed = response.trim();
      dbg(`request ${stem} (${type}) got response (${trimmed.length} chars)`);
      return trimmed;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw new Error(`${type} timed out after ${Math.round(timeoutMs / 1000)}s.`);
}

async function writeFinalOutputs(summary: string): Promise<void> {
  const rbxlx = buildRbxlx({
    parts: state.parts,
    models: state.models,
    skybox: state.skybox,
    ambient: state.ambient,
  });
  await fs.writeFile(path.join(OUTPUT_DIR, "map.rbxlx"), rbxlx, "utf8");

  const readme = [
    `# Roblox Map`,
    ``,
    `Generated by roblox-map-agent on ${new Date().toISOString()}.`,
    ``,
    `## Summary`,
    summary,
    ``,
    `## Files`,
    `- \`map.rbxlx\` — drag this into Roblox Studio.`,
    `- \`generated-assets/\` — ${state.images.length} PNG(s) Gemini produced.`,
    ``,
    `## Stats`,
    `- Loose parts: ${state.parts.length}`,
    `- Models: ${state.models.length}`,
    `- Generated images: ${state.images.length}`,
    `- Skybox set: ${state.skybox ? "yes" : "no"}`,
    ``,
    `## Wiring up the images in Studio`,
    `Decals/Sky reference \`rbxasset://localfile/<name>.png\` placeholders. To make them appear:`,
    `1. Open \`map.rbxlx\` in Roblox Studio.`,
    `2. View → Asset Manager. Drag PNGs from \`generated-assets/\` to upload — Studio gives you \`rbxassetid://NUMBER\` URLs.`,
    `3. In Explorer, find each Decal/Sky and replace the \`Texture\` (or \`SkyboxUp\`/etc.) URL.`,
    ``,
    `Geometry, materials, and lighting work without this step.`,
    ``,
    `## Generated images`,
    ...state.images.map((i) => `- **${i.id}** (\`${path.basename(i.filepath)}\`): ${i.prompt}`),
  ].join("\n");
  await fs.writeFile(path.join(OUTPUT_DIR, "README.md"), readme, "utf8");
}

async function dispatch(name: string, raw: unknown): Promise<{ content: { type: "text"; text: string }[] }> {
  switch (name) {
    case "ask_user": {
      const { question } = ToolInputs.ask_user.parse(raw);
      const answer = await requestFromUser("ask_user", { question }, 10 * 60_000);
      return asText(`User answered: ${answer || "(no answer)"}`);
    }
    case "generate_image": {
      const { id, prompt } = ToolInputs.generate_image.parse(raw);
      if (state.images.some((i) => i.id === id)) {
        const existing = state.images.find((i) => i.id === id)!;
        return asText(`Image '${id}' already exists at ${existing.filepath}.`);
      }
      const userPath = await requestFromUser("generate_image", { id, prompt }, 30 * 60_000);
      // Copy the user's image into our output dir so the run is self-contained.
      await fs.mkdir(IMAGE_DIR, { recursive: true });
      const safe = id.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
      const ext = path.extname(userPath).toLowerCase() || ".png";
      const dest = path.join(IMAGE_DIR, `${safe}${ext}`);
      await fs.copyFile(userPath, dest);
      state.images.push({ id, prompt, filepath: dest });
      return asText(
        `Image '${id}' saved to ${dest}. Reference as imageId='${id}' in place_part decals or set_skybox.`
      );
    }
    case "place_part": {
      const input = ToolInputs.place_part.parse(raw);
      state.parts.push(partFromInput(input));
      return asText(
        `Placed part '${input.name}' at (${input.position.x}, ${input.position.y}, ${input.position.z}).`
      );
    }
    case "place_model": {
      const { name: modelName, parts } = ToolInputs.place_model.parse(raw);
      state.models.push({ name: modelName, parts: parts.map(partFromInput) });
      return asText(`Placed model '${modelName}' with ${parts.length} part(s).`);
    }
    case "set_skybox": {
      const faces = ToolInputs.set_skybox.parse(raw);
      state.skybox = {
        up: resolveAssetId(faces.up),
        down: resolveAssetId(faces.down),
        front: resolveAssetId(faces.front),
        back: resolveAssetId(faces.back),
        left: resolveAssetId(faces.left),
        right: resolveAssetId(faces.right),
      };
      return asText("Skybox set.");
    }
    case "set_ambient_light": {
      const { color } = ToolInputs.set_ambient_light.parse(raw);
      state.ambient = color;
      return asText(`Ambient set to (${color.r}, ${color.g}, ${color.b}).`);
    }
    case "finalize_map": {
      const { summary } = ToolInputs.finalize_map.parse(raw);
      await writeFinalOutputs(summary);
      state.finalized = true;
      return asText(
        `Finalized. Wrote ${path.join(OUTPUT_DIR, "map.rbxlx")} and README.md. ${state.parts.length} parts, ${state.models.length} models, ${state.images.length} images.`
      );
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── server boot ─────────────────────────────────────────────────────────────

async function main() {
  const server = new Server(
    { name: "roblox-map-agent", version: "0.2.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    dbg(`tools/list requested → returning ${TOOL_DEFS.length} tools`);
    return { tools: TOOL_DEFS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = req.params.name;
    const args = req.params.arguments ?? {};
    dbg(`tools/call ${name} args=${JSON.stringify(args).slice(0, 200)}`);
    try {
      const result = await dispatch(name, args);
      dbg(`tools/call ${name} ok`);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      dbg(`tools/call ${name} ERROR: ${message}`);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  dbg("connected to stdio transport, ready for requests");
}

main().catch((err) => {
  // Anything that escapes here goes to stderr — claude pipes our stdout for
  // MCP, but stderr surfaces in the user's terminal.
  console.error("[mcp-server] fatal:", err);
  process.exit(1);
});
