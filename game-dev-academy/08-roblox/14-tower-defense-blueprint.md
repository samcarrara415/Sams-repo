# Tower Defense Blueprint: Building Sam's Genre Right

> **What you'll learn:** how to design every system of a Roblox tower-defense game (units, enemies, waves, maps, modes, economy, collection, co-op, live-ops), with concrete starting numbers and a build order. It pairs with the market view in `11-genre-playbooks.md` and the code in `starter-kit/`.

All numbers here are **starting points for tuning**, not industry data. Change them with your spreadsheet, wave bot and funnels.

---

## 1. The TD loops

| Loop | Tower defense version |
|---|---|
| **Core (seconds)** | Place/upgrade units → enemies walk the path → units attack → cash per kill → place/upgrade more |
| **Session (10–25 min)** | Clear a map on a difficulty (20–30 waves, or Infinite until you fall) → rewards |
| **Meta (days/weeks)** | Summon/unlock units → level, evolve, traits → harder maps and modes → events, limited units, leaderboards, co-op with friends |

What top Roblox TD games add on top (teardowns in `10-top-games-teardowns.md`): **collection** (units as characters with rarities), **co-op** (2–4 players sharing a map), **modes** (story, infinite, raids, challenges), and **frequent updates** with new units and maps.

---

## 2. Units (towers)

### The unit sheet
| Field | Purpose |
|---|---|
| Role | DPS, splash, anti-air, slow/support, farm (makes cash), buffer |
| Placement cost + upgrade costs | In-match cash sinks |
| Damage, cooldown, range | DPS = damage ÷ cooldown |
| Targeting | First / Last / Strongest / Closest (player-selectable) |
| Hits air / hidden / armored? | Counters (see enemies) |
| Placement limit | Prevents spamming one unit |
| Rarity | Collection value. **Not raw power alone.** |

### Balance principles
- **Every rarity has a job.** A Common anti-air unit should stay useful on air waves forever. Rares do more things, not just bigger numbers.
- **DPS per cash** is the real currency. Graph it per unit and per upgrade level. Upgrades should usually be slightly better value than placing a new copy, or players spam the cheapest unit.
- **Farm units** (cash generators) are powerful and need limits: cap their count, and make their payback take several waves.
- **Avoid "must-own" paid units.** If a paid or limited unit is the only way to beat content, that's pay-to-win (see module 07). Limited units should be *different*, not mandatory.

### Starting numbers (tune these)
| Unit | Cost | Dmg | Cooldown | Range | DPS | DPS/100 cash |
|---|---|---|---|---|---|---|
| Archer (DPS, hits air) | 100 | 5 | 0.8 s | 18 | 6.25 | 6.25 |
| Cannon (splash 6) | 250 | 22 | 2.0 s | 14 | 11 (+splash) | 4.4 (+splash) |
| Frost (slow 30%) | 200 | 2 | 1.0 s | 14 | 2 | support |
| Farm | 300 | — | — | — | +40 cash/wave | pays back in about 8 waves |

---

## 3. Enemies

| Type | What it tests | Counter |
|---|---|---|
| Basic | Total DPS | Anything |
| Fast | Burst / slows | Frost, high DPS near the start |
| Tank | Single-target DPS | Focused DPS, "Strongest" targeting |
| Swarm | Splash | Cannons |
| Flying | Air coverage | Anti-air units |
| Hidden/stealth | Detection | Detector units/upgrades |
| Armored/shielded | Damage types | Armor-piercing upgrades |
| Boss | Everything + a mechanic (stun towers, spawn minions, speed burst) | A build that covers the mechanic |

**Rule:** introduce each new type **alone first, with a warning and an available counter**, before mixing it with others. Most "unfair" TD losses come from a type the player had no tool for.

### Enemy HP scaling
Start with `HP = base × (1 + 0.12 × wave)^1.5` or the polynomial from `01-foundations/02-math-for-games.md`. Check time-to-kill vs time-in-range for a "normal" build every wave.

Co-op scaling: about +25% HP per extra player (the starter kit uses `1 + 0.25 × (players − 1)`). Tune it so 4 players feel powerful but still need to coordinate.

---

## 4. Waves and pacing

- **Saw-tooth:** 4 build-up waves → a boss or spike → 1 release wave (see `02-game-design/03-progression-and-economy.md`).
- **Wave length:** about 20–45 s each; long waves with nothing to do bore kids.
- **Skip/next-wave button:** lets veterans call the next wave early for a small cash bonus. It respects their time.
- **Speed-up (2×/3×):** a huge quality-of-life feature. It's fine as a game pass, but consider making 2× free after the first win and selling 3×. Kids hate waiting.
- **Between waves:** 3–8 s. Long intermissions are dead time.
- **Warnings** before special waves: an icon + max 4 words ("⚠ Flying!").

---

## 5. Maps

- **Path readability:** a high-contrast path, with arrows at the spawn and the base.
- **Placement zones:** clearly different ground (grass pads) vs blocked (path, water). Show valid/invalid colour while placing.
- **Choke points and corners** create interesting placement decisions. Long straights are boring.
- **Phone camera:** the whole map should be readable at default zoom on a phone, or offer a top-down view.
- **Themes per map** (forest → snow → lava → space) double as content updates and thumbnail material.
- **Performance:** maps should be modest in part count and texture memory (`15-performance-and-mobile.md`).

---

## 6. Modes

| Mode | For | Notes |
|---|---|---|
| Story/Campaign (maps 1–N, Easy/Normal/Hard) | Everyone | Main progression; unlock maps by clearing the previous one |
| Infinite/Endless | Veterans | Leaderboards (best wave); great for status |
| Challenges (daily modifiers: "no splash", "fast enemies") | Returning players | Cheap content; rotates daily |
| Raids/Bosses (co-op) | Groups of friends | Big rewards; social pull |
| Events (limited time) | Everyone | New map/boss + event currency + limited cosmetic or unit |
| PvP/versus | Optional | High effort, toxic risk; usually later, if at all |

Build order for a solo dev: **Story (3 maps) → Infinite → Challenges → Events → Raids.**

---

## 7. Account progression and collection

- **Unlocking units:** start with 2–3 free units. Unlock more via story milestones (guaranteed) **and** summons (random, with **shown odds and pity**).
- **Duplicates matter:** dupes level the unit up, or feed evolution/trait systems, so no pull is wasted.
- **Unit levels:** small, visible gains (+5% per level). Max level reachable by playing.
- **Evolutions:** a big visual upgrade (new model/VFX) at a milestone. Great for "wow" moments and thumbnails.
- **Traits/rerolls:** popular in anime TDs, but rerolls with Robux are effectively paid random items and come under odds-disclosure and `PolicyService` rules. If you add them, make them earnable and show odds (see `05-safety-policy-and-compliance.md`).
- **Index:** a grid of every unit, with missing ones as silhouettes and how to get each one.

### Currencies
- **Cash:** in-match only, resets every match.
- **Coins:** account soft currency, earned from waves, wins and dailies. Spent on unit levels and the summon pity track.
- **Gems:** premium currency, earnable slowly (quests, events) and buyable.
- Event currency only during events.

---

## 8. Monetization that kids think is fair

| Sell | Why it's fair |
|---|---|
| 3× speed, extra loadout slot, auto-skip | Convenience, no power over others |
| Unit skins, evolution VFX, tower trails, emotes | Expression and status |
| Season pass (generous free track, cosmetic/convenience paid track) | Clear value and end date |
| Starter pack shown **after the first win** | Clear and instant value |
| Gems (with a clear price ladder, no awkward leftovers) | Transparent |

Avoid: power-only paid units, paid revives during boss waves, popups after losses, fake timers, hidden odds. Full red lines in `07-engagement-and-retention/03-ethics-and-law-for-kids-games.md`.

---

## 9. Co-op and social

- **Shared map, split cash:** each player has their own cash and placement limit. Kills pay the unit's owner, and a small share goes to everyone so supports aren't punished.
- **Friend-joiners land in the friend's match** (late join is on in the starter kit).
- **Quick chat/emotes** (safe, pre-set) for coordinating.
- **Invite button** (`SocialService:PromptGameInvite`) after a win: "Bring a friend for Raid mode!"
- **Show off:** a lobby display of your best unit, Infinite best-wave titles.

---

## 10. Live-ops for TD

A sustainable solo rhythm (expand with `07-engagement-and-retention/02-retention-benchmarks-and-liveops.md`):
- **Every 1–2 weeks:** new unit or balance patch + a code reward
- **Every 3–4 weeks:** new map or challenge set
- **Every 6–10 weeks:** an event (map + boss + event track + limited cosmetic)
- **Seasonal:** Halloween, winter, summer themes. Swap thumbnails and the lobby.

Update logs should be **short and visual** (icons + 1 line each). Kids don't read patch notes.

---

## 11. Build order (solo, ~12 weeks)

| Week | Build | Done when |
|---|---|---|
| 1–2 | Grey-box core with the starter kit: 1 map, 3 units, 10 waves | 3/5 testers replay without asking |
| 3 | Onboarding hints + funnel + `MatchLost` | Funnel visible in Creator Hub |
| 4–5 | Real art for 3 units + map (Blender) | Passes the art checklist on a phone |
| 6 | Account data: coins, unit levels, unlocks | Saves survive server hops |
| 7 | Summon with shown odds + pity, index | Odds UI reviewed against the policy lesson |
| 8 | Maps 2–3, Infinite mode | Bot: normal build wins Normal, weak build loses at bosses |
| 9 | Shop: speed pass, starter pack after win, gems | `ProcessReceipt` tested with test purchases |
| 10 | Juice pass: sounds, VFX, reveals | Before/after video feels better |
| 11 | Icon, thumbnails (2–5 for personalization), description | Phone-size and squint tests pass |
| 12 | Soft launch + small ad test | Read D1, funnel and session length; fix the top 3 |

---

## Exercise

1. Fill in the unit sheet for 6 units with roles that cover every enemy type in section 3.
2. Build the DPS-per-cash chart. Is any unit strictly better than another at every price? Fix it.
3. Write waves 1–20 for your first map using the saw-tooth pattern. Mark where each enemy type is introduced.
4. Run the starter kit, replace placeholders with one real unit model, and play it on your phone.

---

## 🤖 Train the Model

**What the model should learn:**
- design and balance TD units, enemies, waves, maps and modes with numbers
- spot unfair spikes and pay-to-win
- plan a realistic solo build order

**Dataset:** `08-roblox/train/td-blueprint.jsonl`. "Design a unit", "balance this wave", "why do players lose at wave X", "what should I build next" tasks.

**Evals:** `08-roblox/train/td-blueprint.eval.jsonl`. Good answers:
- give roles and counters
- use DPS/cost reasoning
- introduce enemy types with warnings
- keep monetization fair
