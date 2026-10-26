# Pro Tooling for Roblox: Rojo, Git, VS Code

> **What you'll learn:** how to write Roblox code in VS Code with autocomplete, keep every version in git, lint and format automatically, and sync it all into Studio with Rojo. This is the setup professional Roblox studios use.

---

## 1. Why bother?

Studio's script editor is fine for small games. As your game grows you'll want:
- **Version history:** undo a bad week of changes, see exactly what changed before a bug appeared
- **A real editor:** fast search across files, multi-cursor editing, better type checking
- **Linting and formatting:** catch mistakes automatically, consistent style
- **Collaboration:** code reviews and branches when you work with others
- **Backups outside Roblox:** your code is yours

---

## 2. The toolchain

| Tool | Job |
|---|---|
| **Git + GitHub** | Version control and backup |
| **Rokit** (or Aftman) | Installs and pins versions of the tools below, per project |
| **Rojo** | Syncs files on disk ↔ Studio |
| **luau-lsp** (VS Code extension) | Autocomplete, type checking, go-to-definition for Luau |
| **Selene** | Linter: finds bugs and bad patterns |
| **StyLua** | Formatter: consistent code style |
| **Wally** | Package manager for Roblox libraries |

Roblox has also been adding its own file-sync features to Studio. Check the current state on the Creator Docs and DevForum before choosing [U]. Rojo stays the most widely used option.

---

## 3. Setup, step by step

```bash
# 1. Install Rokit (see its GitHub README for your OS), then in a new project folder:
rokit init
rokit add rojo-rbx/rojo
rokit add Kampfkarren/selene
rokit add JohnnyMorganz/StyLua
rokit add UpliftGames/wally

# 2. Create the Rojo project
rojo init
git init && git add . && git commit -m "Initial Rojo project"
```

3. In VS Code install: **Rojo**, **Luau Language Server (luau-lsp)**, **Selene**, **StyLua**.
4. In Studio install the **Rojo plugin**.
5. Run `rojo serve`, then click **Connect** in the Studio Rojo plugin. Edits in VS Code now show up in Studio live.

The academy's starter kit (`08-roblox/starter-kit/`) already includes a `default.project.json`, `selene.toml` and `stylua.toml`. Copy it as a starting point.

### How files map to Roblox

| File | Becomes |
|---|---|
| `Something.server.luau` | `Script` |
| `Something.client.luau` | `LocalScript` |
| `Something.luau` | `ModuleScript` |
| A folder with `init.luau` | A ModuleScript with children |

`default.project.json` says which folder goes where (e.g. `src/server` → `ServerScriptService`).

### What stays in Studio
Rojo is best for **code**. Keep maps, models and UI layouts in the place file (or export models as `.rbxm`). Save the place file regularly and back it up.

---

## 4. Git habits

- Commit small and often, with clear messages: `Fix wave 6 flyer leak; add anti-air unlock at wave 5`.
- One branch per feature: `git checkout -b feature/daily-rewards`.
- Never commit secrets (API keys for Open Cloud, webhooks). Use a `.env` file listed in `.gitignore`.
- Tag every release: `git tag v1.3-winter-event`. When something breaks after an update, you can compare.

---

## 5. Other tools worth knowing

| Tool | Use |
|---|---|
| **Blender** | All 3D art (see `04-art/02-blender-to-roblox-pipeline.md`) |
| **Krita / Photopea** | Icons, thumbnails, UI |
| **Audacity** | Sound editing |
| **Obsidian** | Vault: ideas, research, insight log |
| **Roblox Open Cloud** | Scripts and CI that publish places, update DataStores, and upload assets from outside Studio |
| **Spreadsheet** | Balance and economy modelling |

---

## Exercise

1. Set up Rokit + Rojo + VS Code for a new project and connect it to Studio.
2. Move one game's scripts into the Rojo project and commit them.
3. Run `selene src` and fix every warning. Run `stylua src`.
4. Push to a private GitHub repo.

---

## 🤖 Train the Model

**What the model should learn:**
- set up and troubleshoot a professional Roblox toolchain
- explain the file → instance mapping
- give good git hygiene advice

**Dataset:** `03-engines/train/tooling.jsonl`.

**Evals:** `03-engines/train/tooling.eval.jsonl`. Good answers:
- give exact commands and file names
- keep secrets out of git
- say what belongs in Rojo vs the place file
