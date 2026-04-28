import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import readline from "node:readline/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";

import type { GeminiImageClient } from "./gemini.js";
import type { MapState } from "./state.js";
import type { MaterialName, ShapeName, Face, PartSpec } from "./rbxlx.js";

const Vec3 = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const Rgb01 = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
});

const MaterialEnum = z.enum([
  "Plastic",
  "SmoothPlastic",
  "Neon",
  "Wood",
  "WoodPlanks",
  "Brick",
  "Cobblestone",
  "Concrete",
  "Granite",
  "Slate",
  "Marble",
  "Sand",
  "Glass",
  "Grass",
  "Metal",
  "DiamondPlate",
  "CorrodedMetal",
  "Pebble",
  "Ice",
  "Foil",
  "Fabric",
]);

const ShapeEnum = z.enum(["Block", "Ball", "Cylinder", "Wedge"]);
const FaceEnum = z.enum(["Top", "Bottom", "Front", "Back", "Left", "Right"]);

const PartInput = z.object({
  name: z.string().min(1),
  position: Vec3.describe("Center position in studs (Y is up). Roblox studs are roughly 1ft."),
  size: Vec3.describe("Dimensions in studs."),
  rotationY: z.number().optional().describe("Yaw in degrees around Y axis."),
  color: Rgb01.optional(),
  material: MaterialEnum.optional(),
  shape: ShapeEnum.optional(),
  anchored: z.boolean().optional(),
  transparency: z.number().min(0).max(1).optional(),
  decals: z
    .array(
      z.object({
        face: FaceEnum,
        imageId: z
          .string()
          .describe(
            "ID returned by generate_image, OR a 'rbxassetid://NUMBER' string if you already have one."
          ),
      })
    )
    .optional(),
});
type PartInputT = z.infer<typeof PartInput>;

function resolveDecalAssetId(
  imageId: string,
  state: MapState
): { assetId: string; placeholder: boolean } {
  if (imageId.startsWith("rbxassetid://")) {
    return { assetId: imageId, placeholder: false };
  }
  // We don't upload to Roblox automatically — user uploads PNGs after the
  // fact. Use a placeholder URL the user replaces in Studio after upload.
  const img = state.images.find((i) => i.id === imageId);
  if (!img) {
    throw new Error(`Unknown imageId: ${imageId}. Generate it first with generate_image.`);
  }
  return { assetId: `rbxasset://localfile/${path.basename(img.filepath)}`, placeholder: true };
}

function partFromInput(input: PartInputT, state: MapState): PartSpec {
  const decals = input.decals?.map((d) => ({
    face: d.face as Face,
    assetId: resolveDecalAssetId(d.imageId, state).assetId,
  }));
  return {
    name: input.name,
    position: input.position,
    size: input.size,
    rotationY: input.rotationY,
    color: input.color,
    material: input.material as MaterialName | undefined,
    shape: input.shape as ShapeName | undefined,
    anchored: input.anchored,
    transparency: input.transparency,
    decals,
  };
}

export function buildTools(state: MapState, gemini: GeminiImageClient) {
  const askUser = betaZodTool({
    name: "ask_user",
    description:
      "Ask the user a clarifying question and wait for their text answer. Use sparingly — only when a decision genuinely affects the map (theme details, scale, must-have features). Do NOT ask about things you can decide yourself.",
    inputSchema: z.object({
      question: z.string().min(1).describe("The question to ask the user."),
    }),
    run: async ({ question }) => {
      const rl = readline.createInterface({ input, output });
      try {
        const answer = await rl.question(`\n[agent] ${question}\n> `);
        return answer.trim() || "(no answer)";
      } finally {
        rl.close();
      }
    },
  });

  const generateImage = betaZodTool({
    name: "generate_image",
    description:
      "Generate an image with Google Gemini (Imagen). Use for: skybox faces, decals, signs, posters, murals, billboards, concept art. Returns an imageId that can be used in place_part decals or set_skybox. Saves the PNG to the output folder.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe(
          "Short logical id, e.g. 'skybox_up', 'sign_welcome'. Used to reference this image later."
        ),
      prompt: z
        .string()
        .min(1)
        .describe(
          "Detailed visual prompt. For skybox faces include 'seamless skybox face, no horizon line, no sun, ...'."
        ),
      aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional(),
    }),
    run: async ({ id, prompt, aspectRatio }) => {
      if (state.images.some((i) => i.id === id)) {
        return `Image with id '${id}' already exists at ${state.images.find((i) => i.id === id)!.filepath}.`;
      }
      const filepath = await gemini.generate(prompt, id, aspectRatio ?? "1:1");
      state.images.push({ id, prompt, filepath });
      return `Generated image '${id}' saved to ${filepath}. You can reference it as imageId='${id}' in place_part decals or set_skybox.`;
    },
  });

  const placePart = betaZodTool({
    name: "place_part",
    description:
      "Place a single Part in the map (Workspace). Use this for terrain features, walls, props, etc. For collections of related parts, prefer place_model.",
    inputSchema: PartInput,
    run: async (input) => {
      state.parts.push(partFromInput(input, state));
      return `Placed part '${input.name}' at (${input.position.x}, ${input.position.y}, ${input.position.z}).`;
    },
  });

  const placeModel = betaZodTool({
    name: "place_model",
    description:
      "Place a Model — a named group of related parts (e.g. 'Tavern', 'Spaceship', 'Tree_01'). Models keep your map organized in the Studio explorer.",
    inputSchema: z.object({
      name: z.string().min(1),
      parts: z.array(PartInput).min(1),
    }),
    run: async ({ name, parts }) => {
      state.models.push({
        name,
        parts: parts.map((p) => partFromInput(p, state)),
      });
      return `Placed model '${name}' with ${parts.length} part(s).`;
    },
  });

  const setSkybox = betaZodTool({
    name: "set_skybox",
    description:
      "Set the Lighting skybox using 6 generated images (one per face). All 6 imageIds must already exist (call generate_image first). For a stylized look you can also pass the same imageId for all 6 faces.",
    inputSchema: z.object({
      up: z.string(),
      down: z.string(),
      front: z.string(),
      back: z.string(),
      left: z.string(),
      right: z.string(),
    }),
    run: async (faces) => {
      const resolve = (id: string) => resolveDecalAssetId(id, state).assetId;
      state.skybox = {
        up: resolve(faces.up),
        down: resolve(faces.down),
        front: resolve(faces.front),
        back: resolve(faces.back),
        left: resolve(faces.left),
        right: resolve(faces.right),
      };
      return "Skybox set.";
    },
  });

  const setAmbient = betaZodTool({
    name: "set_ambient_light",
    description:
      "Set Lighting.Ambient (the global ambient color). Use to dial mood — warm orange for sunset, cool blue for dusk, dim grey for stormy, etc.",
    inputSchema: z.object({ color: Rgb01 }),
    run: async ({ color }) => {
      state.ambient = color;
      return `Ambient set to (${color.r}, ${color.g}, ${color.b}).`;
    },
  });

  const finalizeMap = betaZodTool({
    name: "finalize_map",
    description:
      "Call when the map is complete. The agent loop ends after this. Provide a short summary of the map for the user.",
    inputSchema: z.object({
      summary: z.string().min(1),
    }),
    run: async ({ summary }) => {
      state.finalized = true;
      return `Finalized. Summary recorded: ${summary}`;
    },
  });

  return [askUser, generateImage, placePart, placeModel, setSkybox, setAmbient, finalizeMap];
}
