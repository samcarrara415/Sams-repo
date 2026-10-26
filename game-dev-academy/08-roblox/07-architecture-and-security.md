# Architecture and Security: Never Trust the Client

> **What you'll learn:** how client/server works on Roblox, how exploiters attack games, and the exact patterns that stop them: server authority, remote validation, rate limits, sanity checks. You'll also learn how to structure a game so it stays secure as it grows.

---

## 1. The threat model

Exploiters run modified clients. On their own device they can:
- read anything replicated to them (all of `ReplicatedStorage`, the Workspace, your LocalScripts' code)
- change anything locally (their walk speed, their UI, what they see)
- **fire any RemoteEvent/RemoteFunction with any arguments, as often as they like**
- move their own character anywhere (characters are physics-owned by the client)

They **cannot**:
- run code on your server (unless *you* give them a way: a backdoor or `loadstring` on remote input)
- read `ServerStorage` or `ServerScriptService`
- change other players' data, unless your remotes let them

So security comes down to one rule: **the server decides everything that matters.**

---

## 2. Server authority, in practice

| Thing | Who decides | Client's role |
|---|---|---|
| Currency, items, XP, unlocks | Server | Shows numbers it's sent |
| Damage, kills, wave results | Server | Plays effects |
| Prices, odds, rewards | Server config | Shows them |
| Placement validity | Server (raycast, spacing, cash, ownership) | Preview + request |
| Cooldowns | Server (timestamps) | Shows the countdown |
| Movement/position | Client physics, **checked** by the server where it matters (teleport/speed sanity checks) | Moves |
| Purchases | `MarketplaceService` + server `ProcessReceipt` | Prompts |

**The request pattern** (used throughout `starter-kit/`):

```
Client: Remotes.PlaceTower:InvokeServer("Archer", position)   -- intent only
Server: validate type → validate value ranges → rate limit → ownership → cost → world checks → act
Server: replicate the result (the tower model, the new Cash attribute)
```

---

## 3. Validating remote input

Every argument from a client is hostile until checked:

```lua
local function isFiniteNumber(v: any): boolean
	return type(v) == "number" and v == v and v ~= math.huge and v ~= -math.huge  -- v == v rejects NaN
end

Remotes.UpgradeTower.OnServerInvoke = function(player, towerId)
	if type(towerId) ~= "number" then return false end          -- type
	local tower = towers[towerId]
	if not tower or tower.owner ~= player then return false end -- ownership
	-- ... cost check, max level check ...
end
```

Checklist for every handler:
- [ ] **Type** of every argument (`type()` / `typeof()`)
- [ ] **Range**: finite numbers, non-negative counts, string length caps, vectors within the map
- [ ] **Existence + ownership**: the item/tower/pet exists and belongs to *this* player
- [ ] **Affordability**: re-check cost on the server from config
- [ ] **State**: is this allowed now (match phase, cooldown, distance to the shop NPC)?
- [ ] **Rate limit**: max N calls per second per player (the starter kit uses a token bucket)
- [ ] **No yields between check and write** for money/items (prevents double-spend races)
- [ ] `pcall` around anything that can error, so one bad call can't break the handler for everyone

### Things never to do
- `RemoteEvent:FireServer(amount)` where the server adds `amount` coins
- Trusting a client-sent price, damage, reward, item id without an ownership check, or position for a "teleport to"
- `loadstring` or `require(id)` on anything influenced by a client
- Admin commands checked on the client (always check the user id on the server)
- A RemoteFunction **from the server to a client** (`InvokeClient`): an exploiter can make it never return and hang your server thread. Use RemoteEvents for server→client.

---

## 4. Common exploits and defences

| Exploit | Defence |
|---|---|
| Remote spam (auto-farm clicks) | Rate limits; server-side cooldowns from timestamps |
| Fake rewards / infinite money | Server computes rewards; never accept amounts from clients |
| Speed/teleport hacks | Server sanity checks (distance moved per second); verify proximity before interactions |
| Item duplication in trading | Atomic trades: lock both inventories, verify both sides, swap, save, unlock. Session-locked data (lesson 08). |
| Double purchase grants | Idempotent `ProcessReceipt` keyed by `PurchaseId` |
| Backdoors from free models | Audit every script; avoid untrusted models and plugins |
| Reading your client code | Assume clients see it. Put nothing secret in it (no webhook URLs, keys or "hidden" admin lists). |

Anti-cheat that only runs on the client can be deleted by the exploiter. It can slow casual cheaters, but real protection is server-side.

---

## 5. Structuring a growing game

Use **services** (server) and **controllers** (client), each a ModuleScript with `start()`, wired up by one entry script per side. This is the starter kit's layout:

```
server/Main.server.luau  → DataService, Remotes, Telemetry, WaveService, TowerService, MatchService, ShopService, DailyRewardService
client/Main.client.luau  → Hud, EnemyRenderer, Placement, Onboarding
shared/                  → Config/*, Path, Format
```

Rules that keep it clean:
- **Data flows one way:** client requests → server decides → server replicates → client renders.
- Services expose a few functions/events. They don't reach into each other's tables.
- One `Remotes` module creates every remote. Any remote that doesn't exist there doesn't exist at all.
- Config modules hold numbers. The server is the source of truth, and the client reads the same config to display it.

---

## 6. Multiplayer correctness

Security bugs and multiplayer bugs share a root: **per-player state stored in shared variables**.
- Key everything by `player` (or `UserId`).
- Clean up on `PlayerRemoving`.
- Test with Clients and Servers, and with players joining **mid-match**.

---

## Exercise

1. Pick one remote in your game. Write the validation checklist for it and fix every gap.
2. Add the token-bucket rate limiter from `starter-kit/src/server/Services/Remotes.luau` to all your remotes.
3. Try to break your own game: in a Studio test, run code in the client command bar that fires your remotes with nonsense (`nil`, `-1`, `math.huge`, `0/0`, huge strings, someone else's tower id). Nothing should change on the server.

---

## 🤖 Train the Model

**What the model should learn:**
- review Luau for client-trust bugs
- write validated, rate-limited remote handlers
- explain exploits and their server-side fixes

**Dataset:** `08-roblox/train/security.jsonl`. Code-review and fix tasks with vulnerable snippets.

**Evals:** `08-roblox/train/security.eval.jsonl`. Good answers:
- find every client-trusted value
- add type, range and ownership checks
- never suggest client-only anti-cheat as the real fix
