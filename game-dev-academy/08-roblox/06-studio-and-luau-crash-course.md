# Roblox Studio and Luau Crash Course

> **What you'll learn:** the parts of Roblox Studio you use every day, how a Roblox game is organised (the DataModel), the Luau features that matter, and the Roblox services you'll use most. It's the fast on-ramp before the deeper lessons (07–09, 15–16).

---

## 1. Studio in 10 minutes

| Window | What it's for |
|---|---|
| **Explorer** | The tree of everything in your game (the DataModel) |
| **Properties** | Settings of the selected object |
| **Output** | Prints, warnings and errors. Keep it open always. |
| **Toolbox / Creator Store** | Models, audio, plugins. Use carefully (see the safety box below). |
| **Test tab** | Play solo, or **Clients and Servers** with 2–8 fake players |
| **Device emulator** | Preview phone and tablet screens |
| **Developer Console** (F9 in game) | Live errors, memory, network, server stats |
| **Script Profiler / MicroProfiler** | Find what's slow |

> **Toolbox safety:** free models can contain hidden scripts (backdoors) that give strangers admin powers in your game, or break rules on your behalf. Before using any model, search it for `Script`/`LocalScript`/`ModuleScript` and `require(` with a number. Delete scripts you didn't write and don't understand. Prefer your own Blender models (Sam's rule: real models, not placeholder parts).

---

## 2. The DataModel: where things live

```
game
├── Workspace               ← the 3D world (parts, models, terrain, cameras)
├── Players                 ← one Player object per person in the server
├── Lighting                ← sky, time of day, atmosphere, post-processing
├── ReplicatedStorage       ← shared by server and clients (modules, remotes, assets)
├── ServerScriptService     ← server scripts (never sent to clients)
├── ServerStorage           ← server-only assets and modules
├── StarterGui              ← UI copied to each player's PlayerGui
├── StarterPlayer
│   ├── StarterPlayerScripts    ← client scripts that run once per player
│   └── StarterCharacterScripts ← client scripts that run on each respawn
├── SoundService            ← global sounds and audio settings
└── … (TweenService, DataStoreService, etc. are services you get via game:GetService)
```

**Replication:** the server's view of `Workspace` and `ReplicatedStorage` is copied to every client. Changes a **client** makes don't go back to the server (except a few things, like their own character's physics). That's why the server must own all game rules.

---

## 3. Luau essentials

Luau is Lua 5.1 plus Roblox's additions. Use these:

```lua
--!strict                                   -- type checking for this file

local count: number = 0                     -- type annotations
count += 1                                  -- compound assignment
local name = `Wave {count}`                 -- string interpolation

local ok = if count > 3 then "hard" else "easy"   -- if-expression

for i, v in { "a", "b" } do print(i, v) end      -- generalized iteration (no ipairs needed)

type Unit = { id: string, level: number }   -- type aliases
export type Rarity = "Common" | "Rare" | "Epic"   -- exported from a module

local t = table.clone(original)             -- shallow copy
table.freeze(CONFIG)                         -- make config read-only
task.spawn(fn); task.delay(2, fn); task.wait(0.5)  -- modern scheduling (not wait/spawn/delay)
```

Avoid the old globals `wait()`, `spawn()` and `delay()`. Use `task.*`. Use `os.clock()` for timing and `os.time()` for calendar time (daily rewards).

---

## 4. Services you'll use constantly

| Service | Use |
|---|---|
| `Players` | Joins, leaves, `Player` objects |
| `ReplicatedStorage` / `ServerStorage` | Where modules and assets live |
| `RunService` | `Heartbeat`, `RenderStepped`, `IsServer()`, `IsStudio()` |
| `TweenService` | Smooth animation of any property |
| `UserInputService` / `ContextActionService` | Input on touch, mouse, keyboard, gamepad |
| `DataStoreService` | Saving player data (lesson 08) |
| `MemoryStoreService` | Fast, short-lived shared data across servers: matchmaking queues, global events |
| `MessagingService` | Messages between servers (e.g. "admin event starting!") |
| `MarketplaceService` | Robux purchases, game passes |
| `AnalyticsService` | Funnels, custom events, economy events (lesson 09) |
| `PolicyService` | What a player is allowed to see/do in their region (e.g. paid random items) |
| `TextChatService` / `TextService` | Chat, and **filtering any player-written text** before others see it |
| `TeleportService` | Moving players between places (lobby → match) |
| `BadgeService` | Badges |
| `CollectionService` | Tags: mark many objects (e.g. "Lava") and handle them all in one script |
| `SocialService` | Friend invites from inside the game |

> **Text filtering is mandatory.** Any text a player types that others can see (pet names, sign text, guild names) must pass `TextService:FilterStringAsync` first. Skipping it breaks Roblox rules.

---

## 5. The patterns, by example

### Tags instead of copy-pasted scripts
```lua
local CollectionService = game:GetService("CollectionService")
local function makeKillBrick(part: BasePart)
	part.Touched:Connect(function(hit)
		local humanoid = hit.Parent and hit.Parent:FindFirstChildOfClass("Humanoid")
		if humanoid then humanoid.Health = 0 end
	end)
end
for _, part in CollectionService:GetTagged("KillBrick") do makeKillBrick(part) end
CollectionService:GetInstanceAddedSignal("KillBrick"):Connect(makeKillBrick)
```

### Attributes for simple state
`player:SetAttribute("Cash", 100)` on the server replicates to clients, and the client listens with `GetAttributeChangedSignal("Cash")`. It's great for HUD values (the starter kit uses it for cash).

### Cleanup
Every `:Connect` returns a connection. Disconnect it when the object it's about goes away, or use `Destroy()` (which disconnects events on that instance). Leaked connections cause memory growth over long sessions.

---

## 6. Your first session checklist

- [ ] Output window open, and you can read an error's script + line
- [ ] Test → Clients and Servers with 2 players works
- [ ] Device emulator set to a small phone
- [ ] API access for DataStores enabled in Game Settings (for testing saves)
- [ ] Rojo connected (see `03-engines/02-tooling.md`)

---

## Exercise

1. Build a lava obby using one `KillBrick` tag script for every lava part.
2. Add a coin counter with an attribute and a HUD label that updates via `GetAttributeChangedSignal`.
3. Run Clients and Servers with 2 players. Confirm each player's coins are separate.

---

## 🤖 Train the Model

**What the model should learn:**
- navigate Studio and the DataModel
- write modern Luau (task library, types, interpolation)
- pick the right service
- remember the mandatory rules: text filtering, never trust the client, Toolbox safety

**Dataset:** `08-roblox/train/studio-luau.jsonl`.

**Evals:** `08-roblox/train/studio-luau.eval.jsonl`. Good answers:
- use `task.*` rather than deprecated globals
- filter player text
- put code in the correct container
