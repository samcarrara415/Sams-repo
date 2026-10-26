# Programming for Games

> **What you'll learn:** the handful of programming ideas every game is built from (the game loop, events, state machines, data-driven design, modules), shown in Luau, the language Roblox uses. These ideas work the same way in C# (Unity), GDScript (Godot) and C++ (Unreal).

---

## 1. Games are loops

Every game runs a loop many times per second:

```
read input → update the world → draw the frame → repeat
```

On Roblox, the engine runs the loop for you. You hook into it:

| Hook | Runs | Use for |
|---|---|---|
| `RunService.Heartbeat` | Every frame, after physics | Server game logic, enemy movement |
| `RunService.RenderStepped` | Every frame, before rendering (client only) | Camera, smooth visual effects |
| `task.wait(n)` / `task.delay(n, fn)` | After *n* seconds | Timers, spawns, cooldowns |
| Events (`.Touched`, `.Changed`, RemoteEvents) | When something happens | Reacting to players and the world |

```lua
local RunService = game:GetService("RunService")

RunService.Heartbeat:Connect(function(dt)
	-- dt = seconds since last frame (about 1/60). Always scale movement by dt.
	for _, enemy in enemies do
		enemy.distance += enemy.speed * dt
	end
end)
```

**Rule:** scale anything that moves or counts down by `dt`. Otherwise your game runs faster on fast devices and slower on cheap phones.

---

## 2. Variables, tables and types

Luau has one data structure for everything: the **table**.

```lua
--!strict
type Tower = {
	id: string,
	damage: number,
	range: number,
	cooldown: number,
	lastShot: number,
}

local tower: Tower = { id = "archer", damage = 5, range = 18, cooldown = 0.8, lastShot = 0 }

local inventory: { string } = { "archer", "cannon" }          -- array
local prices: { [string]: number } = { archer = 100, cannon = 250 }  -- dictionary
```

Put `--!strict` at the top of your scripts. Type checking catches bugs before players do, and luau-lsp in VS Code shows the errors as you type.

---

## 3. Functions and modules

Split code into **ModuleScripts**. Each module does one job and returns a table.

```lua
-- ReplicatedStorage/Shared/Format.lua
local Format = {}

-- 1234 -> "1.2K", 3400000 -> "3.4M". Kids read short numbers faster.
function Format.short(n: number): string
	local units = { "", "K", "M", "B", "T" }
	local i = 1
	while math.abs(n) >= 1000 and i < #units do
		n /= 1000
		i += 1
	end
	if i == 1 then
		return tostring(math.floor(n))
	end
	local text = string.format("%.1f%s", n, units[i])
	return (text:gsub("%.0(%a)$", "%1")) -- "1.0K" -> "1K"
end

return Format
```

```lua
local Format = require(game.ReplicatedStorage.Shared.Format)
print(Format.short(1234)) --> 1.2K
```

Where code lives on Roblox:

| Place | Runs on | Put here |
|---|---|---|
| `ServerScriptService` | Server only | Game rules, money, saving, anything players must not control |
| `ServerStorage` | Server only (not sent to clients) | Server modules, enemy templates, secret config |
| `ReplicatedStorage` | Both | Shared modules, RemoteEvents, config players can see |
| `StarterPlayerScripts` / `StarterGui` | Client | Input, UI, camera, visual effects |

---

## 4. Events: don't poll, react

Bad (checks every frame forever):

```lua
while true do
	if player.leaderstats.Coins.Value >= 100 then showBadge() end
	task.wait()
end
```

Good (runs only when the value changes):

```lua
player.leaderstats.Coins.Changed:Connect(function(coins)
	if coins >= 100 then showBadge() end
end)
```

Make your own events with `BindableEvent`, or a small signal module, so systems don't need to know about each other. The wave system fires `WaveCleared`. The reward system and the analytics system both listen. Neither one calls the other.

---

## 5. State machines

Most game objects are "in one state at a time": a match is *Lobby → Voting → Playing → Results*, an enemy is *Walking → Attacking → Dead*. Write that down explicitly instead of juggling booleans.

```lua
--!strict
type MatchState = "Lobby" | "Countdown" | "Playing" | "Results"

local Match = { state = "Lobby" :: MatchState }

local transitions: { [MatchState]: { MatchState } } = {
	Lobby = { "Countdown" },
	Countdown = { "Playing", "Lobby" },
	Playing = { "Results" },
	Results = { "Lobby" },
}

function Match.setState(new: MatchState)
	if not table.find(transitions[Match.state], new) then
		warn(`illegal transition {Match.state} -> {new}`)
		return
	end
	Match.state = new
	-- fire a StateChanged event here so UI, music and analytics can react
end
```

Bugs like "the game started twice" or "rewards were given in the lobby" mostly disappear once illegal transitions are impossible.

---

## 6. Data-driven design

Keep **numbers and content in data**, not scattered through code. Designers (you, later) change data. Code reads it.

```lua
-- ReplicatedStorage/Config/Towers.lua
return {
	archer = { name = "Archer", cost = 100, damage = 5, range = 18, cooldown = 0.8, rarity = "Common" },
	cannon = { name = "Cannon", cost = 250, damage = 22, range = 14, cooldown = 2.0, rarity = "Rare", splash = 6 },
}
```

Benefits:
- Balance changes are one-line edits, so you can tune between playtests.
- You can export the table to a spreadsheet and graph the power curve (see `02-game-design/03-progression-and-economy.md`).
- New content is mostly *adding data*, which is how live games ship weekly updates.

---

## 7. Client vs server (the most important rule on Roblox)

Roblox games are multiplayer. Each player's device is a **client**, and Roblox runs a **server** for each game instance.

> **Never trust the client.** Exploiters can run any code on their own device and fire any RemoteEvent with any arguments.

- The **client** asks: "I'd like to place an archer at this spot."
- The **server** checks: does the player own an archer, have the cash, is the spot valid, are they on cooldown? Only then does it act.

`08-roblox/07-architecture-and-security.md` covers this in depth, and `08-roblox/starter-kit/` has working code.

---

## 8. Debugging like a pro

1. **Reproduce it.** Find the exact steps. "Sometimes the shop breaks" isn't a bug report yet.
2. **Read the Output window.** The red error line tells you the script and line number.
3. **Print the facts.** `print("placing", towerId, position, player.Name)` before the line that fails.
4. **Test on the server and the client.** Studio's "Start" with 2+ players shows multiplayer bugs that solo testing hides.
5. **Fix the cause, not the symptom.** If a value is sometimes `nil`, find out why, not just how to skip it.
6. **Write it down.** Bug, cause, fix, in your Insight Log. Patterns show up fast.

---

## Exercise

Build a tiny **wave spawner**:
1. A config module with 3 waves (enemy count, speed, health).
2. A state machine: `Intermission → Wave → Intermission`, with a 5-second break.
3. Enemies move along 4 waypoints using `Heartbeat` and `dt`.
4. Fire a `WaveCleared` BindableEvent. Then a second script, which knows nothing about the spawner, prints "Wave X cleared!".

Then compare with the full version in `08-roblox/starter-kit/`.

---

## 🤖 Train the Model

**What the model should learn:**
- explain core game-programming patterns in plain words
- write clean, typed, frame-rate-independent Luau
- spot polling, client trust and missing `dt`
- recommend data-driven config

**Dataset:** `01-foundations/train/programming.jsonl`. Explain-a-concept, write-a-module, fix-this-bug and refactor tasks in Luau.

**Evals:** `01-foundations/train/programming.eval.jsonl`. Good answers:
- scale movement by `dt`
- use events instead of polling loops
- keep game rules on the server
- give runnable code
