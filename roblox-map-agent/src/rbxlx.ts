// Minimal rbxlx (Roblox XML place file) builder. Covers Workspace, Lighting,
// Sky, Part, SpecialMesh, Decal — enough to produce a complete map you can
// drag into Roblox Studio.

export type Vec3 = { x: number; y: number; z: number };
export type Rgb = { r: number; g: number; b: number }; // 0..1
export type ShapeName = "Block" | "Ball" | "Cylinder" | "Wedge";
export type MaterialName =
  | "Plastic"
  | "SmoothPlastic"
  | "Neon"
  | "Wood"
  | "WoodPlanks"
  | "Brick"
  | "Cobblestone"
  | "Concrete"
  | "Granite"
  | "Slate"
  | "Marble"
  | "Sand"
  | "Glass"
  | "Grass"
  | "Metal"
  | "DiamondPlate"
  | "CorrodedMetal"
  | "Pebble"
  | "Ice"
  | "Foil"
  | "Fabric";
export type Face = "Top" | "Bottom" | "Front" | "Back" | "Left" | "Right";

// Roblox Material enum integer values used by <token name="Material">.
const MATERIAL_TOKENS: Record<MaterialName, number> = {
  Plastic: 256,
  SmoothPlastic: 272,
  Neon: 288,
  Wood: 512,
  WoodPlanks: 528,
  Marble: 784,
  Granite: 832,
  Slate: 800,
  Concrete: 816,
  Brick: 848,
  Cobblestone: 880,
  Pebble: 1056,
  Sand: 1280,
  Glass: 1568,
  Grass: 1280 + 16, // 1296
  Metal: 1088,
  DiamondPlate: 1040,
  CorrodedMetal: 1056 + 16, // 1072
  Ice: 1536,
  Foil: 1040 + 64, // approximate; users can override later
  Fabric: 1056 + 64,
};

const SHAPE_TOKENS: Record<ShapeName, number> = {
  Ball: 0,
  Block: 1,
  Cylinder: 2,
  Wedge: 3,
};

const FACE_TOKENS: Record<Face, number> = {
  Top: 1,
  Bottom: 4,
  Front: 5,
  Back: 2,
  Left: 3,
  Right: 0,
};

export interface PartSpec {
  name: string;
  position: Vec3;
  size: Vec3;
  rotationY?: number; // degrees, around Y axis (most common in maps)
  color?: Rgb;
  material?: MaterialName;
  shape?: ShapeName;
  anchored?: boolean;
  transparency?: number; // 0..1
  decals?: { face: Face; assetId: string }[]; // assetId = "rbxassetid://..." or placeholder
}

export interface ModelSpec {
  name: string;
  parts: PartSpec[];
}

export interface SkyboxSpec {
  // Each value is a "rbxassetid://..." or placeholder. Roblox supports one
  // texture per face — order matches the Sky instance properties.
  up: string;
  down: string;
  front: string;
  back: string;
  left: string;
  right: string;
}

export interface MapSpec {
  parts: PartSpec[];
  models: ModelSpec[];
  skybox?: SkyboxSpec;
  ambient?: Rgb;
}

let referentCounter = 0;
const nextRef = () => `RBX${++referentCounter}`;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rotYMatrix(degrees: number): string {
  const rad = (degrees * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  // Row-major 3x3, rotation around Y:
  // [ cos  0  sin]
  // [  0   1   0 ]
  // [-sin  0  cos]
  return [
    `<R00>${c}</R00><R01>0</R01><R02>${s}</R02>`,
    `<R10>0</R10><R11>1</R11><R12>0</R12>`,
    `<R20>${-s}</R20><R21>0</R21><R22>${c}</R22>`,
  ].join("");
}

function cframe(pos: Vec3, rotationY: number): string {
  return [
    `<CoordinateFrame name="CFrame">`,
    `<X>${pos.x}</X><Y>${pos.y}</Y><Z>${pos.z}</Z>`,
    rotYMatrix(rotationY),
    `</CoordinateFrame>`,
  ].join("");
}

function color3(name: string, c: Rgb): string {
  return [
    `<Color3 name="${name}">`,
    `<R>${c.r}</R><G>${c.g}</G><B>${c.b}</B>`,
    `</Color3>`,
  ].join("");
}

function decalItem(face: Face, assetId: string): string {
  return [
    `<Item class="Decal" referent="${nextRef()}">`,
    `<Properties>`,
    `<string name="Name">Decal</string>`,
    `<token name="Face">${FACE_TOKENS[face]}</token>`,
    `<Content name="Texture"><url>${escapeXml(assetId)}</url></Content>`,
    `</Properties>`,
    `</Item>`,
  ].join("");
}

function partItem(p: PartSpec): string {
  const color = p.color ?? { r: 0.7, g: 0.7, b: 0.7 };
  const material = p.material ?? "Plastic";
  const shape = p.shape ?? "Block";
  const anchored = p.anchored ?? true;
  const transparency = p.transparency ?? 0;
  const rotY = p.rotationY ?? 0;

  const decals = (p.decals ?? []).map((d) => decalItem(d.face, d.assetId)).join("");

  return [
    `<Item class="Part" referent="${nextRef()}">`,
    `<Properties>`,
    `<string name="Name">${escapeXml(p.name)}</string>`,
    cframe(p.position, rotY),
    `<Vector3 name="size"><X>${p.size.x}</X><Y>${p.size.y}</Y><Z>${p.size.z}</Z></Vector3>`,
    color3("Color", color),
    `<token name="Material">${MATERIAL_TOKENS[material]}</token>`,
    `<token name="shape">${SHAPE_TOKENS[shape]}</token>`,
    `<bool name="Anchored">${anchored}</bool>`,
    `<float name="Transparency">${transparency}</float>`,
    `</Properties>`,
    decals,
    `</Item>`,
  ].join("");
}

function modelItem(m: ModelSpec): string {
  return [
    `<Item class="Model" referent="${nextRef()}">`,
    `<Properties>`,
    `<string name="Name">${escapeXml(m.name)}</string>`,
    `</Properties>`,
    m.parts.map(partItem).join(""),
    `</Item>`,
  ].join("");
}

function skyItem(sb: SkyboxSpec): string {
  const u = (s: string) => `<url>${escapeXml(s)}</url>`;
  return [
    `<Item class="Sky" referent="${nextRef()}">`,
    `<Properties>`,
    `<string name="Name">Sky</string>`,
    `<Content name="SkyboxUp">${u(sb.up)}</Content>`,
    `<Content name="SkyboxDn">${u(sb.down)}</Content>`,
    `<Content name="SkyboxFt">${u(sb.front)}</Content>`,
    `<Content name="SkyboxBk">${u(sb.back)}</Content>`,
    `<Content name="SkyboxLf">${u(sb.left)}</Content>`,
    `<Content name="SkyboxRt">${u(sb.right)}</Content>`,
    `</Properties>`,
    `</Item>`,
  ].join("");
}

export function buildRbxlx(spec: MapSpec): string {
  referentCounter = 0;

  const workspaceRef = nextRef();
  const lightingRef = nextRef();

  const baseplate: PartSpec = {
    name: "Baseplate",
    position: { x: 0, y: -0.5, z: 0 },
    size: { x: 2048, y: 1, z: 2048 },
    color: { r: 0.388, g: 0.372, b: 0.384 },
    material: "Slate",
    anchored: true,
  };

  const workspaceContents = [
    partItem(baseplate),
    ...spec.parts.map(partItem),
    ...spec.models.map(modelItem),
  ].join("");

  const lightingContents = spec.skybox ? skyItem(spec.skybox) : "";
  const ambient = spec.ambient ?? { r: 0.5, g: 0.5, b: 0.5 };

  return [
    `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">`,
    `<Item class="Workspace" referent="${workspaceRef}">`,
    `<Properties><string name="Name">Workspace</string></Properties>`,
    workspaceContents,
    `</Item>`,
    `<Item class="Lighting" referent="${lightingRef}">`,
    `<Properties>`,
    `<string name="Name">Lighting</string>`,
    color3("Ambient", ambient),
    `</Properties>`,
    lightingContents,
    `</Item>`,
    `</roblox>`,
  ].join("\n");
}
