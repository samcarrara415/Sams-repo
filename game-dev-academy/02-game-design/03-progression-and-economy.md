# Progression, Difficulty and Economy

> **What you'll learn:** how to design progression that feels great (power curves, difficulty curves, pacing), how to build a game economy that doesn't break (sources, sinks, currencies), and how to balance it all with a spreadsheet before players find the problems for you.

---

## 1. Progression: the feeling of getting stronger

Players need to feel **competence**: "I'm better than yesterday." Progression is how you show it.

| Type | Example | Watch out for |
|---|---|---|
| **Power** | Tower damage +20%, new unit rarity | Power creep makes old content trivial |
| **Content** | New maps, modes, enemies | Expensive to make, so pace it |
| **Collection** | Index of units/pets with % complete | Duplicates must still be worth something |
| **Status** | Titles, rare skins, leaderboard rank | Mustn't be pay-only, or it feels unfair |
| **Skill** | Beating Hard mode, faster clears | Needs readable feedback ("You leaked 3 on the left lane") |

**Show progress constantly:** XP bars, "3/10 units collected", "Next unlock: Snow Map (wave 10)". Kids need to *see* how close they are. Progress you can almost reach is one of the strongest reasons to play one more round (the **goal-gradient effect**).

---

## 2. Difficulty: the flow channel

Players are happiest when the challenge is a little above their skill. That's **flow** (Csikszentmihalyi). Too easy is boring. Too hard is frustrating.

```
challenge
   ▲            anxiety
   │          ╱
   │    ╱╲  ╱  ← good curve: waves of tension and relief
   │  ╱    ╲╱
   │╱  flow channel
   │      boredom
   └──────────────────► time / skill
```

**Saw-tooth pacing:** build tension (harder waves), release it (a boss win, then an easy "victory lap" wave or a reward), then build again. Good tower-defense waves do this every 5 waves or so.

### Rules for kid-friendly difficulty
1. **The first session can't be lost.** Confidence first.
2. **Spikes must be signposted.** "⚠ BOSS WAVE: bring splash!" Never a surprise wall.
3. **Every loss teaches something.** Show what went wrong ("3 flying enemies got through. Try an anti-air tower!").
4. **Offer an easier path.** Difficulty select, co-op help, or one more upgrade. Never "pay to pass".
5. **Separate modes for veterans.** Hard/Nightmare/Infinite keep experts busy without punishing new players.

### Diagnosing an accidental wall
Compare **challenge growth** with **player power growth** (math in `01-foundations/02-math-for-games.md`):
- Time-to-kill = enemy HP ÷ player DPS
- Time-in-range = path in range ÷ enemy speed
- If time-to-kill > time-in-range for a *typical* build, enemies leak and players lose.

Log `MatchLost` with the wave number and the build. If losses pile up on one non-boss wave, the wall is an accident.

---

## 3. Economy: sources, sinks and currencies

An economy is just **where stuff comes from (sources)** and **where it goes (sinks)**.

| Sources (faucets) | Sinks (drains) |
|---|---|
| Cash per kill, wave rewards | Placing and upgrading towers (in-match cash) |
| Daily rewards, quests | Summons, upgrades, unlocks |
| Event rewards | Rerolls, cosmetics, crafting |
| Robux purchases | Trading fees, rebirth resets |

**If sources > sinks, inflation:** everything becomes cheap, rewards feel worthless, and trading values crash. **If sinks > sources, grind:** players stall and quit.

### Currency design for kids
- **One soft currency** (earned by playing, e.g. Coins) and at most **one premium currency** (e.g. Gems, earnable a little *and* buyable).
- Show prices in a way kids understand. Avoid confusing conversion chains (Robux → Gems → Tokens → Tickets). Kids feel cheated when they can't tell what something really costs. Odd bundle sizes that always leave leftovers are a known dark pattern (see module 07).
- In-match cash (resets each match) is separate from account currency. That's normal for TD games.

### Pricing intuition (premium currency)
- Sell **convenience and expression** (speed-up, extra slots, skins, cosmetic effects) and **fair access** (a season pass with clear rewards).
- Don't sell **power that wins PvP** or **the only way past a wall**. That's pay-to-win, and kids hate it.
- Starter packs work best **right after a win**, never right after a loss. More in `08-roblox/04-monetization-and-devex.md`.

---

## 4. Balance with a spreadsheet

Before a playtest, model the economy. A minimal sheet:

| Col | Meaning |
|---|---|
| A | Wave number |
| B | Enemy count |
| C | Enemy HP (formula) |
| D | Cash earned this wave |
| E | Total cash so far |
| F | Best affordable build's DPS (look-up from tower config) |
| G | Time-to-kill = C ÷ F |
| H | Time-in-range |
| I | **Leak?** = G > H |

Account progression sheet:
- Minutes of play to earn each unlock, for a typical player
- Target: first unlock in under 5 min, the next few in 10–20 min, then a steady rhythm of something new every session

Paste your config tables straight from `ReplicatedStorage/Config` (data-driven design pays off here).

**Then verify with bots.** Sam's games use a wave bot that plays with a weak build and a normal build to see which wave breaks. Run it after every balance change.

---

## 5. Retention-friendly progression patterns

| Pattern | How it works | Kid-safe version |
|---|---|---|
| **Daily reward** | Reward for logging in each day | Rewards for days played, no harsh reset that punishes missing a day |
| **Quests** | "Clear 5 waves with archers" | Clear, short, varied, with progress always visible |
| **Unlock tree** | New towers/maps behind milestones | Next unlock always visible and reachable this session or next |
| **Battle/season pass** | Track of rewards for playing | Free track is generous. Paid track is cosmetic or convenience. Clear end date, no hidden tasks. |
| **Index/collection** | Grid of all units, missing ones as silhouettes | Show how to get each one |
| **Prestige/rebirth** | Reset progress for a permanent multiplier | Explain clearly what's kept |

Each pattern is covered in depth, with studio examples and legal limits, in `07-engagement-and-retention/`.

---

## Exercise

1. List every source and sink in your game. Are they balanced over a typical 20-minute session?
2. Build the wave spreadsheet above for your first 20 waves. Find the first leak. Is it planned?
3. Write your currency list. If there are more than 2 account currencies, merge some.
4. Pick the next unlock a new player will see. How many minutes away is it? Aim for under 5.

---

## 🤖 Train the Model

**What the model should learn:**
- design and debug difficulty curves and economies with numbers
- spot inflation and grind
- recommend kid-fair currency and pricing structures
- always tie a change to a measurable outcome

**Dataset:** `02-game-design/train/progression-economy.jsonl`. "My economy is inflating", "players quit at wave X", "design a currency system", "is this pass fair?" tasks.

**Evals:** `02-game-design/train/progression-economy.eval.jsonl`. Good answers:
- compare sources with sinks
- compare challenge growth with power growth
- avoid pay-to-win
- name a metric
