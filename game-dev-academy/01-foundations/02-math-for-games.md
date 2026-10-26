# Math for Games

> **What you'll learn:** the math you'll actually use: vectors and CFrames for movement, lerp and easing for smooth motion, randomness and probability for drops and summons, and growth curves for costs and difficulty. Each idea comes with Luau you can paste.

---

## 1. Vectors: position, direction, distance

A `Vector3` is a point or a direction in 3D.

```lua
local a = Vector3.new(0, 0, 0)
local b = Vector3.new(10, 0, 10)

local offset = b - a                -- direction AND distance from a to b
local distance = offset.Magnitude   -- 14.14 studs
local direction = offset.Unit       -- length 1, just the direction

-- Is the enemy in tower range? (Compare squared lengths to skip the square root.)
local function inRange(tower: Vector3, enemy: Vector3, range: number): boolean
	local d = enemy - tower
	return d:Dot(d) <= range * range
end
```

**Dot product** tells you if something is in front of you: `look:Dot(toTarget.Unit) > 0.7` means "roughly ahead, within about 45°". Use it for vision cones and "facing the NPC" checks.

## 2. CFrame: position + rotation

A `CFrame` is where something is **and** which way it faces.

```lua
-- Face the tower toward its target, staying upright
tower:PivotTo(CFrame.lookAt(tower:GetPivot().Position, Vector3.new(target.X, tower:GetPivot().Position.Y, target.Z)))

-- Something 5 studs in front of the player
local front = root.CFrame * CFrame.new(0, 0, -5)   -- -Z is "forward" on Roblox
```

## 3. Lerp and easing: smooth motion

**Lerp** (linear interpolation) moves part of the way from A to B: `a + (b - a) * t`, where `t` runs from 0 to 1.

```lua
local function lerp(a: number, b: number, t: number): number
	return a + (b - a) * t
end

-- Frame-rate-independent smoothing (camera follow, health bar catching up):
local function smooth(current: number, target: number, speed: number, dt: number): number
	return lerp(current, target, 1 - math.exp(-speed * dt))
end
```

**Easing** makes motion feel alive. Linear looks robotic. Ease-out ("fast then settle") feels responsive. Back/elastic feels bouncy and toy-like, which kids love on buttons.

```lua
local TweenService = game:GetService("TweenService")
-- Button pop: put a UIScale inside the button, then grow 10% with a little overshoot
local scale = button:FindFirstChildOfClass("UIScale") or Instance.new("UIScale", button)
scale.Scale = 1
TweenService:Create(scale, TweenInfo.new(0.15, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1.1 }):Play()
```

## 4. Moving along a path (tower-defense style)

Don't move enemies with physics. Track **distance travelled along the path** and work out the position from it. It's cheap, exact, and makes "first/last/strongest" targeting easy: the "first" enemy is just the one with the largest distance.

```lua
--!strict
-- waypoints: { Vector3 }, precompute cumulative lengths once
local function buildPath(waypoints: { Vector3 })
	local cum = { 0 }
	for i = 2, #waypoints do
		cum[i] = cum[i - 1] + (waypoints[i] - waypoints[i - 1]).Magnitude
	end
	return { points = waypoints, cum = cum, length = cum[#cum] }
end

local function positionAt(path, distance: number): Vector3
	local pts, cum = path.points, path.cum
	for i = 2, #pts do
		if distance <= cum[i] then
			local t = (distance - cum[i - 1]) / (cum[i] - cum[i - 1])
			return pts[i - 1]:Lerp(pts[i], t)
		end
	end
	return pts[#pts]
end
```

The server only needs `distance` per enemy. Clients draw the models. `08-roblox/15-performance-and-mobile.md` explains why this lets you run hundreds of enemies on phones.

---

## 5. Randomness

Use a `Random` object, not `math.random`, so you can seed it for repeatable tests.

```lua
local rng = Random.new()            -- random seed
local testRng = Random.new(12345)   -- same results every run, for testing balance

rng:NextInteger(1, 6)   -- dice roll
rng:NextNumber()        -- 0..1
```

### Weighted random (drops, summons, loot tables)

```lua
--!strict
type Entry = { id: string, weight: number }

local function pick(rng: Random, entries: { Entry }): string
	local total = 0
	for _, e in entries do total += e.weight end
	local roll = rng:NextNumber() * total
	for _, e in entries do
		roll -= e.weight
		if roll <= 0 then return e.id end
	end
	return entries[#entries].id
end

local banner = {
	{ id = "Common", weight = 70 },
	{ id = "Rare", weight = 25 },
	{ id = "Epic", weight = 4.5 },
	{ id = "Legendary", weight = 0.5 },
}
```

Odds are just `weight / total`. **Show them to players.** Roblox requires odds disclosure for paid random items, and kids feel cheated when odds are hidden (see `07-engagement-and-retention/03-ethics-and-law-for-kids-games.md`).

---

## 6. Probability you need for fair design

| Question | Formula | Example (p = 0.5% Legendary) |
|---|---|---|
| Expected pulls for one | `1 / p` | 200 pulls |
| Chance of at least one in *n* pulls | `1 - (1 - p)^n` | 100 pulls → 39.4%. 200 pulls → 63.3%. 460 pulls → 90% |
| Pulls to reach X% chance | `ln(1 - X) / ln(1 - p)` | 90% → about 460 pulls |

**Read that table carefully:** after the "expected" 200 pulls, more than 1 in 3 players still has nothing. That's why fair games add **pity**: a guarantee after N pulls without the item.

```lua
-- Pity: guaranteed Legendary on the 150th pull without one
local PITY = 150
local function summon(state: { sinceLegendary: number }, rng: Random): string
	state.sinceLegendary += 1
	if state.sinceLegendary >= PITY then
		state.sinceLegendary = 0
		return "Legendary"
	end
	local result = pick(rng, banner)
	if result == "Legendary" then state.sinceLegendary = 0 end
	return result
end
```

With pity, the **worst case is known and you can tell players**. That's both fairer and better for trust.

### Expected value

The average of a reward table is `Σ (chance × value)`. Use it to check that a chest costing 100 coins doesn't pay out 300 on average (inflation) or 10 (feels like a scam).

---

## 7. Growth curves: costs, health, rewards

| Curve | Formula | Feels like | Use for |
|---|---|---|---|
| Linear | `base + k * level` | Steady, gets boring | Early levels, simple rewards |
| Polynomial | `base * level^p` (p ≈ 1.5–2.5) | Gently steeper | Enemy HP per wave, XP per level |
| Exponential | `base * g^level` (g ≈ 1.07–1.25) | Explodes | Incremental/simulator upgrade costs |

```lua
local function upgradeCost(level: number): number
	return math.floor(100 * 1.15 ^ level)   -- 100, 115, 132, 152 ... level 20 ≈ 1,637
end

local function waveHealth(wave: number): number
	return math.floor(20 * wave ^ 1.6 + 10 * wave)
end
```

**The key balance check:** compare *how fast the player's power grows* with *how fast the challenge grows*. If enemy HP grows like `wave^1.6` and the player's damage grows more slowly, there will be a wall. Graph both lines in a spreadsheet. Walls should be **planned** (a boss wave, a reason to upgrade), not accidents. Module 02 covers this.

---

## 8. DPS and time-to-kill

- **DPS** = `damage / cooldown` (times the number of targets for splash)
- **Time to kill** = `enemyHP / totalDPS`
- **Time in range** = `pathLengthInRange / enemySpeed`

If time-to-kill is longer than time-in-range, enemies leak. This one comparison explains most "this wave is impossible" complaints in tower-defense games.

---

## Exercise

1. Build a spreadsheet: wave 1–30, enemy HP using `20 * w^1.6 + 10w`, and the player's expected DPS if they spend all their cash on the best-value tower each wave.
2. Find the wave where time-to-kill first exceeds time-in-range. That's your first wall. Is it a boss wave? If not, retune.
3. Write the weighted `pick` function and run it 100,000 times with a seeded `Random`. Check that the results match the weights within about 1%.

---

## 🤖 Train the Model

**What the model should learn:**
- apply vectors, CFrames and easing correctly
- implement weighted random and pity
- compute real probabilities (and explain them to a kid-friendly audience)
- reason about balance with growth curves and DPS vs time-in-range

**Dataset:** `01-foundations/train/math.jsonl`. Compute-and-explain, write-the-function and diagnose-the-balance tasks.

**Evals:** `01-foundations/train/math.eval.jsonl`. Good answers:
- get the numbers right (e.g. 1 − (1 − p)^n)
- recommend showing odds
- compare growth rates instead of guessing
