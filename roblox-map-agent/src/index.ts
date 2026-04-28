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
- Use mcp__roblox__generate_image for HERO art only: skybox faces, decals on signs/posters/billboards/murals.
- DO NOT use it for ground or wall textures — they don't tile and show seams. Use Roblox built-in materials for those.
- Skybox: 6 separate images (up, down, front, back, left, right). Each prompt should say "seamless skybox face, no horizon line, no sun, no clouds at edges, painted matte" plus the theme. For a stylized vibe you can reuse the same image on all 6 faces.
- Decals: square aspect (the browser only emits one image per prompt; framing the prompt as "square poster, centered subject" works best).

Workflow:
1. Briefly internalize the user's theme. If something fundamental is unclear (scale, vibe, must-have features), use mcp__roblox__ask_user — but only ONE round of questions, then commit and build.
2. Plan a layout: 5-15 distinct landmarks/zones, spatially separated.
3. Generate hero art FIRST (skybox + key decals).
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

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function watchQuestions(questionsDir: string, signal: AbortSignal): Promise<void> {
  await fs.mkdir(questionsDir, { recursive: true });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const handled = new Set<string>();

  while (!signal.aborted) {
    let entries: string[] = [];
    try {
      entries = await fs.readdir(questionsDir);
    } catch {
      // dir might not exist yet
    }
    for (const file of entries) {
      if (!file.endsWith(".q.txt") || handled.has(file)) continue;
      const stem = file.replace(/\.q\.txt$/, "");
      handled.add(file);
      const qPath = path.join(questionsDir, file);
      const aPath = path.join(questionsDir, `${stem}.a.txt`);
      try {
        const question = (await fs.readFile(qPath, "utf8")).trim();
        process.stdout.write(`\n[agent asks] ${question}\n`);
        const answer = await rl.question("> ");
        await fs.writeFile(aPath, answer, "utf8");
      } catch (err) {
        // If the question file disappears or the answer write fails, ignore;
        // the MCP server will time out on its own.
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
  const headless = hasFlag("headless");

  // Project root = parent of dist/ or src/, depending on how it ran.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(here, "..");
  const profileDir = path.join(projectRoot, ".gemini-profile");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = path.resolve("output", stamp);
  const imageDir = path.join(outputDir, "generated-assets");
  const questionsDir = path.join(outputDir, ".questions");
  await fs.mkdir(imageDir, { recursive: true });
  await fs.mkdir(questionsDir, { recursive: true });

  // Locate the MCP server entry. Use tsx if running from src/, node if from dist/.
  const isTs = here.endsWith("src");
  const mcpEntry = isTs
    ? path.join(here, "mcp-server.ts")
    : path.join(here, "mcp-server.js");
  const mcpCommand = isTs ? "npx" : "node";
  const mcpArgs = isTs
    ? ["tsx", mcpEntry, "--output-dir", outputDir, "--profile-dir", profileDir, "--headless", String(headless)]
    : [mcpEntry, "--output-dir", outputDir, "--profile-dir", profileDir, "--headless", String(headless)];

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
  if (!existsSync(profileDir)) {
    console.log(
      "\nFirst run: a Chromium window will open. Sign in to Google so Gemini works.\n" +
        "The session is saved in .gemini-profile/ and reused on subsequent runs."
    );
  }
  console.log("");

  const abort = new AbortController();
  const watcher = watchQuestions(questionsDir, abort.signal);

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
