# Blender → Roblox Pipeline

> **What you'll learn**
> - A repeatable pipeline from blockout to an optimized, animated MeshPart in Studio, with the **current Roblox limits** (verified Oct 2026).
> - Exact Blender export and 3D Importer settings, plus the fixes for the usual "it's huge / it's sideways / it's lagging" problems.
> - How to use AI art tools in 2026 without breaking your art bible, your frame rate or someone's copyright.

---

## 0. Cheat sheet: current Roblox limits

All **[P]**, from Roblox Creator Docs, checked **Oct 2026**. Limits change, so re-check before a big art push.

| Thing | Limit / default | Source |
|---|---|---|
| Triangles per mesh | **20,000** max | [Mesh specifications](https://create.roblox.com/docs/art/modeling/specifications) |
| Bone influences per vertex | **4** max | same |
| Bones/joints at export | scale 1,1,1; rotation 0,0,0; root at 0,0,0 | same |
| Animation tracks per exported mesh/model | **1** | same |
| Texture resolution | up to **4096×4096**. ⚠️ The same page's UV section still says 1024×1024, so the docs are inconsistent | [Texture specifications](https://create.roblox.com/docs/art/modeling/texture-specifications) (updated 20 Oct 2026) |
| Suggested texture size | 5×5-stud object → 256²; 10×10 → 512²; 20×20 → 1024² | same |
| UVs | **one UV set**, all UVs inside 0–1, overlapping UVs allowed | same |
| Materials | **one material per mesh** | same |
| Normal maps | **OpenGL** tangent-space only (flat = 127,127,255) | same + [SurfaceAppearance](https://create.roblox.com/docs/art/modeling/surface-appearance) |
| Texture memory | 1024² uses **4×** the memory of 512²; most images need ≤512², minor ones <256² | [Improve performance](https://create.roblox.com/docs/performance-optimization/improve) |
| Mesh formats (3D Importer) | .fbx, .obj, .gltf (.glb mentioned for hierarchies). Rigs/animation/vertex colours: .fbx and .gltf only | [3D Importer](https://create.roblox.com/docs/art/modeling/3d-importer) |
| Open Cloud upload | **20 MB** per call; images must be < 8000×8000 | [Open Cloud assets guide](https://create.roblox.com/docs/cloud/guides/usage-assets) |
| RenderFidelity = Automatic | Highest < 250 studs · Medium 250–500 · Lowest ≥ 500 studs from camera | [MeshPart reference](https://create.roblox.com/docs/reference/engine/classes/MeshPart) |
| MeshId at runtime | **can't** be changed while the game runs (TextureID can) | same |
| Streaming | on by default for new places; StreamingMinRadius 64, StreamingTargetRadius 1024 | [Instance streaming](https://create.roblox.com/docs/workspace/streaming) |
| Shadows | engine turns shadows off at graphics quality below 4 | [Improve performance](https://create.roblox.com/docs/performance-optimization/improve) |
| Avatar body (UGC) | head 4,000 · torso 1,750 · each arm/leg 1,248 · total **10,742** tris; textures ≤ 2048² | [Character specifications](https://create.roblox.com/docs/art/characters/specifications) |
| Rigid accessory (UGC) | **4,000** tris; textures ≤ 2048² | [Accessory specifications](https://create.roblox.com/docs/art/accessories/specifications) |
| Studio FBX import file-size cap | **not listed** in the docs I checked (Oct 2026). Measure: if import fails, check the Output window | n/a |

> **Max is not a target.** 20,000 tris is the ceiling for *one* mesh. A wave of 40 enemies at 20k each is 800k triangles. Set your own **budgets** in the art bible (§9).

---

## 1. The pipeline at a glance

```text
Concept/ref ─► Blockout ─► Model ─► UV ─► Texture ─► (Bake) ─► Rig/Animate ─► Export ─► Import ─► Set up in Studio ─► Test on phone
   15 min       30 min    1–3 h   30m    1–2 h       30m        1–2 h          5 min    5 min        15 min             10 min
```

Times are a rough solo-dev starting budget for one tower or enemy, not a measured number. Track your own and adjust.

---

## 2. Step by step

### Step 1: Blockout (in Blender *and* in Studio)
- Block the shape from **cubes/spheres/cylinders** only. Check the **silhouette from the game camera** (see 04-01 silhouette test).
- **Scale check:** export a Roblox R15 dummy from Studio (right-click → *Export Selection*, .obj) and import it into Blender as a size reference. Everything is judged against it.
- Quick in-engine check: make a rough Studio Part version first and play a wave. If the shape doesn't read in-game, don't model it yet.

### Step 2: Modelling
- Low-poly stylized: use **bevels** (1–2 segments) on silhouette edges so they catch light; skip detail that won't show at phone distance.
- Keep meshes **watertight** and use quads where possible (Roblox's own guidance). [P] [Mesh specs](https://create.roblox.com/docs/art/modeling/specifications)
- **Separate parts that move** (turret head, wheels, wings) into their own objects *or* rig them with bones.
- **Pivots:** put the origin where it should rotate (tower base centre, turret pivot). The Importer's *Use Imported Pivot* keeps it. [P] [3D Importer](https://create.roblox.com/docs/art/modeling/3d-importer)
- Apply transforms in Blender (**Ctrl+A → All Transforms**) before export.

### Step 3: UVs
- One UV set, everything inside 0–1. [P]
- **Texel density:** keep pixels-per-stud roughly the same across a unit so nothing looks blurry next to something sharp. (Definition: [Polycount wiki: Texel density](http://wiki.polycount.com/wiki/Texel_density); site was down when I checked, Oct 2026.)
- Stylized shortcut: for flat-colour styles, **collapse UV islands onto colour swatches** of a small palette texture (see Step 4, option B).

### Step 4: Texturing: pick ONE approach per game (put it in the art bible)

| Option | What it is | Good for | Cost |
|---|---|---|---|
| **A. Hand-painted colour map** | One painted ColorMap (MeshPart.TextureID or SurfaceAppearance ColorMap), light/shadow painted in | Units, heroes, "Fortnite/WoW" look | Painting time; one texture per asset |
| **B. Palette/gradient atlas** | One tiny shared texture of colour swatches/gradients; UVs placed on swatches | Low-poly props, huge prop libraries, fastest to iterate | Very cheap. Shared texture = low memory |
| **C. Trim sheet** | One texture of reusable strips (wood edge, metal rim, stone band) mapped onto many meshes | Buildings, paths, walls, map kits | Up-front time, then very fast ([Polycount: Trim sheet](http://wiki.polycount.com/wiki/Trim_sheet)) |
| **D. Full PBR (SurfaceAppearance)** | ColorMap + NormalMap + RoughnessMap + MetalnessMap (+ emissive mask) | Hero units, shop showcase items, metals/gems | Up to 4–5 maps per asset → most memory |
| **E. Vertex colours** | Colour stored on vertices, no texture | Ultra-simple low-poly style | Near-zero texture memory; the Importer keeps vertex colours unless *Ignore Vertex Colors* is on [P] [3D Importer](https://create.roblox.com/docs/art/modeling/3d-importer) |

**Recommendation for Sam (kids TD, mobile):** **B or E for maps/props**, **A for towers/enemies/units**, **D only for a few showcase items** (legendary units, the lobby centrepiece). Every PBR map you add costs texture memory on phones.

**SurfaceAppearance facts** [P] [SurfaceAppearance docs](https://create.roblox.com/docs/art/modeling/surface-appearance), Oct 2026:
- Maps: ColorMap, NormalMap, RoughnessMap, MetalnessMap (**metalness workflow only**), EmissiveMaskContent (+ EmissiveTint / EmissiveStrength).
- **AlphaMode**: Overlay (default), Transparency, TintMask, Opaque (beta).
- **Tint is free:** reuse one ColorMap with different `SurfaceAppearance.Color` tints for team colours, rarity variants and skins.
- Most SurfaceAppearance properties **can't be changed by scripts at runtime**, so make variants ahead of time.
- Marketplace items must keep EmissiveStrength between 0 and 40.

### Step 5: Baking (when you need it)
- Bake **high-poly → low-poly normal maps** (export **OpenGL**, which is Blender's default normal map convention) for hero assets only.
- Bake **ambient occlusion** into the colour map for stylized assets; it adds depth for free at runtime.
- **Don't bake strong directional light/shadows** into the colour map unless that *is* your style. It clashes with Roblox lighting and with day/night.

### Step 6: Rig and animate (units and enemies)

| Choice | When |
|---|---|
| **R15 Humanoid rig** | Player-like characters, NPCs that need Humanoid features (clothing, emotes), lobby NPCs |
| **Custom rig + AnimationController** | Tower-defense **enemies and towers**: any non-human shape (slimes, bugs, turrets), and anything you'll spawn in large numbers |

- Rigging rules: ≤ 4 influences per vertex; bones at scale 1 / rotation 0; root bone at 0,0,0; one animation track per export. [P] [Mesh specs](https://create.roblox.com/docs/art/modeling/specifications)
- **Humanoids are expensive at scale.** DevForum developers report that swapping Humanoid for AnimationController fixed lag around ~50 mobs, and one TD dev reports ~500 client-rendered enemies before a performance hit. [U] [DevForum: optimizing many NPCs](https://devforum.roblox.com/t/how-to-optimize-a-lot-of-npcs/3524387), [DevForum: TD enemy system](https://devforum.roblox.com/t/tower-defense-enemy-system/2667346/9). Profile your own game.
- On `AnimationController`, the old `LoadAnimation` is **deprecated**; load through an `Animator` child. [P] [AnimationController reference](https://create.roblox.com/docs/reference/engine/classes/AnimationController)

```lua
-- Client-side: play an enemy's walk loop on a custom rig (no Humanoid)
local function playWalk(enemyModel: Model, walkAnim: Animation)
	local controller = enemyModel:FindFirstChildOfClass("AnimationController")
		or Instance.new("AnimationController", enemyModel)
	local animator = controller:FindFirstChildOfClass("Animator")
		or Instance.new("Animator", controller)
	local track = animator:LoadAnimation(walkAnim)
	track.Looped = true
	track:Play()
	return track
end
```

- **Animate in Blender or Studio.** Studio's Animation Editor is fine for simple loops (idle/walk/attack/hit/death). For Blender animations: export FBX with *Bake Animation* on, *Add Leaf Bones* off, and make sure the timeline covers every keyframe. [P] [Roblox export docs](https://create.roblox.com/docs/art/modeling/export-requirements)
- **Minimum animation set per enemy:** walk (loop), hit-react (very short), death. Per tower: idle, attack, upgrade "pop". Kids read **motion** before detail.

### Step 7: Export from Blender

**Scene setup** (Roblox's Blender guide): Scene Properties → Units → **Unit System: None**, **Rotation: Degrees**. [P] [Roblox: Blender configuration](https://create.roblox.com/docs/art/blender), Oct 2026

**FBX** [P] Roblox [Blender guide](https://create.roblox.com/docs/art/blender) + [export requirements](https://create.roblox.com/docs/art/modeling/export-requirements):

| Setting | Value |
|---|---|
| Limit to | **Selected Objects** |
| Transform → Apply Scalings | **FBX Unit Scale** (all other scale values left at 1.0) |
| Forward / Up | Roblox's guide (Oct 2026) says **Z Forward**, **Y Up**. If the model faces the wrong way in Studio, fix it with the Importer's *World Forward* instead of re-exporting |
| Path Mode | **Copy**, with **Embed Textures** on |
| Armature → Add Leaf Bones | **Off** |
| Bake Animation | **Off** unless you're exporting an animation |

⚠️ **Blender 5.x:** the Blender 5.2 LTS manual says the new built-in FBX handles **import only**; **export uses the "FBX (Legacy)" add-on**. [P] [Blender manual: FBX](https://docs.blender.org/manual/en/latest/files/import_export/fbx.html), Oct 2026. If File → Export → FBX is missing, enable that add-on.

**glTF (.gltf/.glb):** Roblox says glTF **doesn't need the extra scaling setup**. [P] [Roblox: Blender](https://create.roblox.com/docs/art/blender). Good default for static props. Use selected objects only, apply modifiers, and use Principled BSDF materials so textures carry over.

**One-click alternative:** the official **Roblox Blender plugin** uploads selected meshes or collections straight to Roblox via Open Cloud (as packages, so they can auto-update in Studio). Blender 3.2+, MIT licence; Roblox only accepts bug-fix PRs. [P] [Docs](https://create.roblox.com/docs/art/modeling/roblox-blender-plugin) · [GitHub](https://github.com/Roblox/roblox-blender-plugin), Oct 2026

### Step 8: Import (3D Importer: File → Import 3D)
Settings worth knowing [P] [3D Importer](https://create.roblox.com/docs/art/modeling/3d-importer), Oct 2026:

| Setting | Default | Use it when |
|---|---|---|
| Import Only As Model | on | keep on for multi-part towers |
| Upload to Roblox | on | normal |
| Import as Package | off | turn **on** for reusable towers/enemies so edits update every copy |
| Set Pivot to Scene Origin | on | turn off if you set pivots in Blender and want *Use Imported Pivot* |
| Anchored | off | turn **on** for static props/towers (not rigged meshes) |
| Rig Type | auto | R15 / Custom / No Rig |
| World Forward / World Up | Front / Top | fix sideways or backwards imports here |
| Scale Unit | Studs | change if it imports 100× too big/small |
| Merge Meshes | off | on for a static prop with many parts = fewer instances |
| Make Double Sided | off | only for leaves/cards; costs performance |
| Ignore Vertex Colors | off | on if you don't use vertex colours and see odd tints |

### Step 9: Set up in Studio

| Property | TD-friendly setting | Why |
|---|---|---|
| `RenderFidelity` | **Automatic** (default) or Performance | Precise on too many meshes is a common perf problem [P] [Improve performance](https://create.roblox.com/docs/performance-optimization/improve) |
| `CollisionFidelity` | **Box** for small anchored props; Hull for towers you click; never PreciseConvexDecomposition on decor | "generally safe" to use Box on small anchored parts [P] same |
| `CanCollide` / `CanQuery` / `CanTouch` | off on enemies that walk a path and on pure decoration | enemies pushing each other off path is a reported issue [U] (DevForum TD threads) |
| `CastShadow` | off on small/moving things (enemies, particles' parents, tiny props) | shadows are costly [P] same |
| `DoubleSided` | only leaves/cards | doubles rendered faces |
| Instancing | **upload each mesh once and duplicate it in Studio** | same MeshContent + matching SurfaceAppearance/TextureContent can share one draw call. Importing a whole map can give identical meshes different IDs and break instancing [P] same |

**Upgrades:** because `MeshId` can't change at runtime [P], make each tower level a **separate pre-built Model** and swap models on upgrade.

### Step 10: Test on a real low-end phone
- Press **Shift+F2** in the client for Render Stats (draw calls, timing). [P] [Improve performance](https://create.roblox.com/docs/performance-optimization/improve)
- Use the **MicroProfiler** for spikes; watch Render and Prepare-and-Perform. [P] same
- Test the **worst wave** on your **cheapest phone** with graphics on auto.

---

## 3. Optimization for low-end phones (checklist)

- [ ] Each enemy/tower mesh **uploaded once** and cloned (instancing).
- [ ] Textures sized by on-screen size (most ≤ 512², small props ≤ 256²). [P]
- [ ] Variants via **tint**, not new textures. [P]
- [ ] Decals/Textures/particles kept low; Roblox says they "don't batch well". [P]
- [ ] Few overlapping semi-transparent effects. [P]
- [ ] `StreamingEnabled` on (default for new places); consider `StreamOutBehavior = Opportunistic` to free distant content. [P] [Streaming](https://create.roblox.com/docs/workspace/streaming)
- [ ] Enemies: no Humanoid, CanCollide off, CastShadow off, client-side visuals with server-side logic [U] (DevForum TD patterns; validate on the server).
- [ ] Budget written down: e.g. "enemy ≤ X tris, tower ≤ Y tris". Set X and Y by **measuring** your worst wave on your cheapest phone, not by guessing.

**Find duplicate meshes** (run in the Studio command bar, adapted from Roblox's approach):

```lua
local counts = {}
for _, d in workspace:GetDescendants() do
	if d:IsA("MeshPart") then
		local key = d.Name .. " | " .. tostring(d.MeshId)
		counts[key] = (counts[key] or 0) + 1
	end
end
for key, n in counts do
	print(string.format("%s (x%d)", key, n))
end
-- Same Name but different MeshIds = instancing broken: re-use one uploaded mesh.
```

---

## 4. Naming and folders

**Prefixes** (pick once, write in the art bible):

| Prefix | Asset | Example |
|---|---|---|
| `TWR_` | tower | `TWR_Frost_L1`, `TWR_Frost_L2` |
| `ENM_` | enemy | `ENM_Slime_Basic`, `ENM_Slime_Boss` |
| `UNT_` | unit/character | `UNT_Ninja_Common` |
| `PRP_` | prop | `PRP_Fence_A` |
| `VFX_` | effect | `VFX_HitFlash_Ice` |
| `T_..._C/_N/_R/_M/_E` | texture maps | `T_TWR_Frost_C` (colour), `_N` normal, `_R` roughness, `_M` metalness, `_E` emissive |
| `A_` | animation | `A_ENM_Slime_Walk` |

Roblox's texture spec also asks for map-type affixes in names. [P] [Texture specs](https://create.roblox.com/docs/art/modeling/texture-specifications)

**Folders**

```text
art/
  source/towers/frost/frost.blend        ← Blender working files (+ refs/)
  textures/towers/frost/T_TWR_Frost_C.png
  export/towers/frost/TWR_Frost_L1.fbx   ← what you import
Studio:
  ReplicatedStorage/Assets/Towers/Frost/{L1,L2,L3}
  ReplicatedStorage/Assets/Enemies/...
  ReplicatedStorage/Assets/VFX/...
  StarterGui/...                          ← UI art (see 04-04)
```

---

## 5. Free tools

| Tool | Use |
|---|---|
| **Blender** | modelling, UVs, baking, rigging, renders for icons |
| **Roblox Blender plugin** | upload from Blender [P] (above) |
| **Krita** | hand-painting textures, icon paint-overs |
| **Photopea** (browser) | quick PSD edits, thumbnails |
| **Material Maker** | procedural tiling textures and trims |
| **PureRef** | reference boards for the art bible |

Pricing/licences change; check each site before relying on "free". [U]

---

## 6. AI-assisted art in 2026

### 6.1 What Roblox gives you (official) [P]

| Tool | What it does | Notes (as of Oct 2026) |
|---|---|---|
| **Texture Generator** (Model tab → Texture; also Assistant `/generate_texture` or Studio MCP) | Textures a selected mesh from a text/image prompt | **Fast**: 1K diffuse in under 30 s via TextureID. **Quality**: 4K PBR via SurfaceAppearance, a couple of minutes. Quotas not listed. [Docs](https://create.roblox.com/docs/studio/texture-generator) (updated 19 Oct 2026) |
| **Material Generator** | Seamless tiling MaterialVariants | Better than Texture Generator for floors, walls, paths [P] same |
| **Mesh generation** (Assistant / MCP) | Textured MeshPart from a description | [AI workflows](https://create.roblox.com/docs/ai/accelerated-workflows) |
| **GenerateModelAsync** (in-experience, Cube) | Players/server generate models from prompts using schemas ("Body1" single mesh, "Car5" five-part car); optional max-triangle setting | [Model generation](https://create.roblox.com/docs/parts/model-generation). 4D generation launched in **beta** on 4 Feb 2026; in the game *Wish Master* players generated 160,000+ objects in early access and users of it averaged **64% more play time** (Roblox-reported, single game) [P] [Roblox newsroom](https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model) |
| **Avatar Auto-Setup** | Rigs, cages and segments a model into an avatar | [AI workflows](https://create.roblox.com/docs/ai/accelerated-workflows) |

Roblox: **"you are responsible for the content generated within your games,"** and all generations go through moderation. [P] [AI workflows](https://create.roblox.com/docs/ai/accelerated-workflows)

### 6.2 Third-party generators (Meshy, Tripo, etc.)
- **Meshy** terms (last updated 19 Sep 2026): on **free plans Meshy owns the output** and licenses it to you under **CC BY 4.0, so you must credit Meshy**; on **paid plans you own the output**. Free-tier content may be used to train Meshy's models. [P] [Meshy Terms](https://www.meshy.ai/terms-of-use)
- **Tripo** and others: I couldn't load Tripo's terms (403, Oct 2026). **Read the current terms yourself** before shipping anything. [U]
- Roblox's Terms of Use dated 30 Apr 2026 reportedly folded its AI terms into the main User/Creator terms. [U] ([third-party tracker](https://conductatlas.com/platform/roblox/roblox-terms-of-use/ai-features-data-use-and-creator-terms-integration/)); read [Roblox's own terms](https://en.help.roblox.com/hc/en-us/articles/115004647846) to confirm.

### 6.3 Typical AI-output problems

| Problem | Why it hurts | Fix |
|---|---|---|
| Messy, dense triangles | Blows your tri budget, ugly shading, can't rig | Decimate or retopologise in Blender; set max triangles where the tool allows |
| Baked lighting/shadows in the texture | Clashes with your lighting | Paint out; re-texture with your palette |
| Style drift | Looks like "a different game" | Re-texture to art-bible palette + outline rules |
| Muddy, noisy textures | Fails squint/phone tests | Flatten to big colour blocks; sharpen value contrast |
| Wrong scale/pivot/orientation | Breaks placement and rotation | Fix in Blender before export (Step 2) |
| Fragmented UVs | Hard to paint over or tint | Re-UV (Smart UV Project, then tidy) |
| Lookalikes of famous characters | IP takedowns, moderation | Never prompt with brand/character names; change silhouette and colours |
| Extra fingers, melted details, odd faces | Kids notice | Fix or regenerate; faces are worth hand-painting |

### 6.4 Clean-up recipe: AI → art-bible asset
1. **Generate** several options; pick by **silhouette from the game camera**, not by texture.
2. **Retopo/decimate** to your budget. Check watertight, apply transforms, set pivot.
3. **Re-UV**, then **bake** the AI texture onto your clean mesh only as a base.
4. **Repaint**: replace colours with art-bible swatches, remove baked lighting, push value contrast, add your outline/rim rules.
5. **Rig/animate** like any other asset.
6. Run the **04-01 checklist** (squint, phone, silhouette, grayscale, line-up).
7. **Log provenance**: tool, plan (free/paid), date, prompt → `vault/ai-asset-log.md`. If it's a free Meshy asset, add the credit.

---

## 7. Exercise (one sitting, ~90 min)

1. Pick one enemy. Block it out, check the silhouette from your game camera.
2. Model + UV it under a triangle budget you write down first.
3. Texture it with **option A or B** using your art-bible palette.
4. Export with the exact settings in Step 7; import with Step 8. Note anything that went wrong.
5. Make 3 tint variants (normal / fast / armoured) **with one texture**.
6. Spawn 50 on a test path, open Shift+F2 on your phone, screenshot the stats.

---

## 🤖 Train the Model

**What the model should learn:** to plan and debug a Blender → Roblox art pipeline: pick a texturing approach for the asset type, give exact export/import settings, respect *current* limits (and say when docs conflict), optimise for low-end phones (instancing, texture size, Humanoid vs AnimationController, fidelity settings), and use AI tools with clean-up and licence checks.

**Dataset:** `04-art/train/blender-pipeline.jsonl` (explain, decide, debug, Luau code, plan).

**How to check it:** `04-art/train/blender-pipeline.eval.jsonl`. A good answer:
- uses verified numbers (20k tris/mesh, 4 influences, OpenGL normals, one UV set) with dates/sources,
- flags the 1024 vs 4096 doc inconsistency instead of stating one as certain,
- fixes scale/orientation with the right setting (FBX Unit Scale / Importer World Forward / glTF),
- recommends instancing, tint variants and sane texture sizes for phones,
- treats AI output as a starting point and mentions licence terms (e.g. Meshy free = CC BY credit).
