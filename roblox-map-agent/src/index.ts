#!/usr/bin/env node
// CLI orchestrator. Spawns `claude -p` with our local MCP server attached,
// then watches the run's `.questions/` dir for ask_user prompts and relays
// them to the user via stdin/stdout.

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const SYSTEM_PROMPT = `You are a Roblox map builder using a set of MCP tools (prefixed mcp__roblox__).

You design and emit a complete, playable Roblox map by calling tools. The runtime writes a .rbxlx place file (the user drags into Roblox Studio) once you call mcp__roblox__finalize_map.

Coordinate system:
- Roblox uses studs (~1 ft). Y is up. X and Z are horizontal.
- A 2048x2048 stud Baseplate is auto-added at y=0; build on top of it (parts at y > 0).
- A typical human character is ~5 studs tall.

Materials available: Plastic, SmoothPlastic, Neon, Wood, WoodPlanks, Brick, Cobblestone, Concrete, Granite, Slate, Marble, Sand, Glass, Grass, Metal, DiamondPlate, CorrodedMetal, Pebble, Ice, Foil, Fabric. Prefer real materials over plain Plastic.

Image generation rules:
- mcp__roblox__generate_image is HUMAN-IN-THE-LOOP: it prints your prompt to the user's terminal, the user generates the image themselves (e.g. in Gemini), and provides a path to the saved PNG. Each call BLOCKS until the user supplies the image.
- Be efficient with image requests — prefer ~5-10 hero images per map, never more than 15. Each one costs the user real time.
- Use it for HERO art only: skybox faces, decals on signs/posters/billboards/murals. DO NOT use it for ground or wall textures.
- Skybox: 6 separate images (up, down, front, back, left, right). Each prompt: "seamless skybox face, no horizon line, no sun, no clouds at edges, painted matte" plus the theme. For a stylized vibe you can reuse the same imageId on all 6 faces (call generate_image once, then pass the same id to set_skybox.up/down/front/back/left/right).
- Decals: square aspect; phrase as "square poster, centered subject".
- BATCH all your generate_image calls upfront in a sequence, before doing geometry. This way the user can generate them all at once instead of being interrupted between every part placement.

Workflow:
1. Briefly internalize the user's theme. If something fundamental is unclear (scale, vibe, must-have features), use mcp__roblox__ask_user — but only ONE round of questions, then commit and build.
2. Plan a layout: 5-15 distinct landmarks/zones, spatially separated.
3. Request ALL hero images in a tight sequence (skybox + key decals) — let the user generate them, then proceed.
4. Build geometry. Use mcp__roblox__place_model for groups (a building is a model; a tree is a model). Compound parts beat single giant primitives — a house is walls + roof + door + windows.
5. Set the skybox (mcp__roblox__set_skybox) and ambient color (mcp__roblox__set_ambient_light).
6. Call mcp__roblox__finalize_map with a short summary.

Style:
- Walls 10-20 studs tall, buildings 15-30 studs wide. Whole map can extend hundreds of studs.
- Vary materials/colors across landmarks. Pick 3-5 colors per zone and stick to them.
- Anchor everything (default).
- Name models descriptively ("MainTavern", "OakTree_01", "DockPier").

Constraints:
- A complete map is roughly 50-200 parts and 5-15 generated images. Do not over-build.
- Don't ask the user for permission to proceed — just build. The user wants a finished map, not a planning session.

When done, call mcp__roblox__finalize_map.`;

function checkClaudeAvailable(): void {
  const which = spawnSync("which", ["claude"], { encoding: "utf8" });
  if (which.status !== 0 || !which.stdout.trim()) {
    console.error(
      "\nCould not find the `claude` CLI on your PATH.\n" +
        "Install Claude Code from https://claude.com/code, then run `claude` once and `/login` with your Pro/Max account.\n"
    );
    process.exit(1);
  }
}

function getPrompt(): string {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const prompt = args.join(" ").trim();
  if (!prompt) {
    console.error(
      'Usage: roblox-map-agent "<map theme prompt>"\n\n' +
        "Example:\n" +
        '  roblox-map-agent "a small medieval village by a river, with a tavern, market square, and watchtower"'
    );
    process.exit(1);
  }
  return prompt;
}

function getFlag(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && idx < process.argv.length - 1) {
    const next = process.argv[idx + 1]!;
    if (!next.startsWith("--")) return next;
  }
  return undefined;
}


function normalizePath(input: string): string {
  // Mac drag-and-drop into Terminal can produce: "/path/with spaces/file.png",
  // /path/with\ spaces/file.png, or 'file.png'. Strip wrapping quotes and
  // unescape spaces.
  let s = input.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  s = s.replace(/\\ /g, " ");
  if (s.startsWith("~/")) s = path.join(process.env.HOME ?? "", s.slice(2));
  return path.resolve(s);
}

async function watchRequests(requestsDir: string, signal: AbortSignal): Promise<void> {
  await fs.mkdir(requestsDir, { recursive: true });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const handled = new Set<string>();

  while (!signal.aborted) {
    let entries: string[] = [];
    try {
      entries = await fs.readdir(requestsDir);
    } catch {
      // dir might not exist yet
    }
    for (const file of entries.sort()) {
      if (!file.endsWith(".req.json") || handled.has(file)) continue;
      const stem = file.replace(/\.req\.json$/, "");
      handled.add(file);
      const reqPath = path.join(requestsDir, file);
      const resPath = path.join(requestsDir, `${stem}.res.txt`);

      let req: any;
      try {
        req = JSON.parse(await fs.readFile(reqPath, "utf8"));
      } catch {
        continue;
      }

      let response = "";
      try {
        if (req.type === "ask_user") {
          process.stdout.write(`\n[agent asks] ${req.question}\n`);
          response = await rl.question("> ");
        } else if (req.type === "generate_image") {
          process.stdout.write(`\n────────────────────────────────────────────────────────────\n`);
          process.stdout.write(` IMAGE NEEDED — id: ${req.id}\n`);
          process.stdout.write(`────────────────────────────────────────────────────────────\n`);
          process.stdout.write(` Generate this image (e.g. in Gemini), save the PNG, then\n`);
          process.stdout.write(` drag the file into this terminal and press Enter.\n\n`);
          process.stdout.write(` Prompt:\n`);
          for (const ln of String(req.prompt).split("\n")) process.stdout.write(`   ${ln}\n`);
          process.stdout.write(`────────────────────────────────────────────────────────────\n`);
          while (true) {
            const raw = await rl.question("path> ");
            if (!raw.trim()) {
              process.stdout.write("(empty — drag the saved file here, or paste its path)\n");
              continue;
            }
            const resolved = normalizePath(raw);
            try {
              const stat = await fs.stat(resolved);
              if (!stat.isFile()) {
                process.stdout.write(`Not a file: ${resolved}\n`);
                continue;
              }
              response = resolved;
              break;
            } catch {
              process.stdout.write(`Couldn't find: ${resolved}\nTry again:\n`);
            }
          }
        } else {
          continue; // unknown type
        }
        await fs.writeFile(resPath, response, "utf8");
      } catch {
        // ignore — MCP server will time out gracefully
      }
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  rl.close();
}

function handleStreamLine(line: string): void {
  let evt: any;
  try {
    evt = JSON.parse(line);
  } catch {
    // Not JSON — claude sometimes prints free text on init. Pass it through.
    process.stdout.write(line + "\n");
    return;
  }

  // Shape A: Claude Code's outer envelope.
  switch (evt.type) {
    case "system": {
      if (evt.subtype === "init") {
        process.stdout.write(`[claude] session ${evt.session_id ?? "?"} ready (${evt.model ?? ""})\n`);
      }
      return;
    }
    case "assistant": {
      const blocks = evt.message?.content ?? [];
      for (const b of blocks) {
        if (b.type === "text" && typeof b.text === "string" && b.text.trim()) {
          process.stdout.write(`\n[claude] ${b.text.trim()}\n`);
        } else if (b.type === "tool_use") {
          const args =
            typeof b.input === "object" ? JSON.stringify(b.input).slice(0, 80) : String(b.input ?? "");
          process.stdout.write(`[tool→] ${b.name}  ${args}${args.length >= 80 ? "…" : ""}\n`);
        }
      }
      return;
    }
    case "user": {
      const blocks = evt.message?.content ?? [];
      for (const b of blocks) {
        if (b.type === "tool_result") {
          const text =
            Array.isArray(b.content)
              ? b.content
                  .filter((c: any) => c.type === "text")
                  .map((c: any) => c.text)
                  .join(" ")
              : String(b.content ?? "");
          const trimmed = text.trim().slice(0, 120);
          if (trimmed) process.stdout.write(`[tool←] ${trimmed}${text.length > 120 ? "…" : ""}\n`);
        }
      }
      return;
    }
    case "result": {
      if (typeof evt.total_cost_usd === "number") {
        process.stdout.write(
          `\n[claude] Done. Cost: $${evt.total_cost_usd.toFixed(4)}  Turns: ${evt.num_turns ?? "?"}\n`
        );
      }
      return;
    }
    case "stream_event": {
      // Anthropic API streaming deltas. Print incremental text only.
      const inner = evt.event;
      if (inner?.type === "content_block_delta" && inner.delta?.type === "text_delta") {
        process.stdout.write(inner.delta.text);
      }
      return;
    }
    default:
      // Unknown — quietly drop. Useful events are covered above.
      return;
  }
}

async function main() {
  checkClaudeAvailable();
  const prompt = getPrompt();
  const model = getFlag("model") ?? "sonnet";

  const here = path.dirname(fileURLToPath(import.meta.url));

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = path.resolve("output", stamp);
  const imageDir = path.join(outputDir, "generated-assets");
  const requestsDir = path.join(outputDir, ".requests");
  await fs.mkdir(imageDir, { recursive: true });
  await fs.mkdir(requestsDir, { recursive: true });

  // Locate the MCP server entry. Use tsx if running from src/, node if from dist/.
  const isTs = here.endsWith("src");
  const mcpEntry = isTs
    ? path.join(here, "mcp-server.ts")
    : path.join(here, "mcp-server.js");
  const mcpCommand = isTs ? "npx" : "node";
  const mcpArgs = isTs
    ? ["tsx", mcpEntry, "--output-dir", outputDir]
    : [mcpEntry, "--output-dir", outputDir];

  const mcpConfig = {
    mcpServers: {
      roblox: {
        command: mcpCommand,
        args: mcpArgs,
      },
    },
  };
  const mcpConfigPath = path.join(outputDir, "mcp-config.json");
  await fs.writeFile(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), "utf8");

  console.log(`\nBuilding map for: "${prompt}"`);
  console.log(`Model: ${model}`);
  console.log(`Output folder: ${outputDir}`);
  console.log(
    `\nWhen the agent needs an image, you'll see an "IMAGE NEEDED" block here.\n` +
      `Generate it however you like (Gemini app, Claude.ai, anywhere), save the PNG,\n` +
      `then drag the file into this terminal and press Enter.\n`
  );

  const abort = new AbortController();
  const watcher = watchRequests(requestsDir, abort.signal);

  const claudeArgs = [
    "-p",
    prompt,
    "--append-system-prompt",
    SYSTEM_PROMPT,
    "--mcp-config",
    mcpConfigPath,
    "--allowedTools",
    "mcp__roblox__ask_user mcp__roblox__generate_image mcp__roblox__place_part mcp__roblox__place_model mcp__roblox__set_skybox mcp__roblox__set_ambient_light mcp__roblox__finalize_map",
    "--dangerously-skip-permissions",
    "--max-turns",
    "80",
    "--model",
    model,
    "--output-format",
    "stream-json",
    "--verbose",
  ];

  const child = spawn("claude", claudeArgs, { stdio: ["ignore", "pipe", "inherit"] });
  child.stdout.setEncoding("utf8");

  // Parse stream-json line-by-line and surface useful events to the user.
  // Claude's stream-json shapes vary; we handle the common ones loosely so a
  // shape change just means we print less, never crashes.
  let buf = "";
  child.stdout.on("data", (chunk: string) => {
    buf += chunk;
    let idx: number;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      handleStreamLine(line);
    }
  });

  const exitCode: number = await new Promise((resolve) => {
    child.on("exit", (code) => resolve(code ?? 0));
  });
  if (buf.trim()) handleStreamLine(buf.trim());
  abort.abort();
  await watcher.catch(() => {});

  if (exitCode !== 0) {
    console.error(`\nclaude exited with code ${exitCode}.`);
    process.exit(exitCode);
  }

  const rbxlxPath = path.join(outputDir, "map.rbxlx");
  if (existsSync(rbxlxPath)) {
    console.log(`\nDone.`);
    console.log(`  ${rbxlxPath}`);
    console.log(`  ${path.join(outputDir, "README.md")}`);
  } else {
    console.error(
      `\nclaude finished but no map.rbxlx was written — the agent likely never called finalize_map. Check the output folder for partial state.`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nAgent failed:", err);
  process.exit(1);
});
