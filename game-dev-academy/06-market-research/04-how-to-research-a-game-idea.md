# How to Research a Game Idea

> **What you'll learn**
> - Where to get data (free and paid), and how to read CCU charts without fooling yourself.
> - How to size a Roblox niche in 20 minutes, tear down a competitor, and mine comments for what kids want.
> - A weighted **idea scorecard**, a worked example scoring 3 ideas with live Roblox data, and a **fast-validation playbook** (thumbnail test → weekend prototype → 5-kid playtest).

**Tags:** **[P]** platform said it · **[S]** analyst/press · **[U]** unverified/community. Live numbers in this file were pulled **Mon Oct 26, 2026, 19:55 UTC** from Roblox's public search API. They will be different by the time you read this. That's the point: **pull your own**.

---

## 1. The method in one line

**Size it → check the competition → ask "would a 9-year-old care?" → check you can build it alone → test cheaply before you build big.**

Research should take **days, not months**. You're trying to kill bad ideas fast, not prove good ones.

---

## 2. Data sources

### Free

| Source | What it tells you | Tag | Notes |
|---|---|---|---|
| **Roblox Discover / Charts** | What's trending, top earning, top playing | [P] | Shows *your* region/device feed. Log out or use another account to compare. |
| **Roblox search player counts** | Live players per game | [P] | The number on each tile. One snapshot = one moment. |
| **Your Roblox Creator Dashboard** | Your retention, session length, conversion, and (where shown) benchmarks vs similar games | [P] | The most honest data you'll ever get. |
| **Roblox shareholder letters** | Platform DAU, age split, regional growth, policy changes | [P] | Quarterly, at [ir.roblox.com](https://ir.roblox.com). |
| **Roblox DevForum** | Staff announcements, algorithm and payout changes | [P] for staff posts, [U] for others | Read the "Announcements" category weekly. |
| **RoMonitor Stats, RoTrends, Rolimons** | CCU history and charts per game | [U] | Third-party; good for trends, not exact figures. |
| **fortnite.gg** | Fortnite island players, top islands | [U] | Fortnite equivalent of RoMonitor. |
| **SteamDB, Gamalytic, VG Insights (free tiers)** | Steam CCU, review counts, revenue estimates | [U] | Estimates, not facts. |
| **YouTube & TikTok search** | What kids watch, which games YouTubers cover, comment complaints | [U] | Sort by "upload date" to see what's hot now. |
| **Google Trends** | Search interest over time, by country | [S] | Relative, not absolute numbers. |
| **Reddit (r/roblox, r/robloxgamedev, game subs)** | Player complaints, dev postmortems | [U] | Skews older than your players. |
| **Ofcom, Pew, Common Sense, ESA reports** | Kid behaviour and device data | [P]/[S] | See `02-what-kids-play-and-why.md`. |
| **Newzoo / Sensor Tower public summaries** | Market size, top mobile games | [S] | Free blog summaries; full reports are paid. |

### Paid (only when money is on the line)

| Source | Use it for |
|---|---|
| **Sensor Tower / Appmagic / data.ai** | Mobile downloads & revenue estimates by game and country |
| **Newzoo, Circana** | Market sizing, US retail/spend trends |
| **Naavik** | Deep analysis of live games and business models |

For a solo Roblox dev, **free sources + your own dashboard cover almost everything.** Don't buy reports until you have a game earning money.

---

## 3. How to read CCU and charts without fooling yourself

**CCU** = concurrent users, players in the game *right now*.

1. **One snapshot lies.** CCU swings with time of day, weekday vs weekend, school holidays and updates. Take at least **3 snapshots: weekday after school (US), Saturday afternoon, and a weekday night**, for **2 weeks**. Write the time in UTC.
2. **Know the time zone.** Roblox is global. A peak at 19:00 UTC is a different crowd (Europe evening, US afternoon) from one at 02:00 UTC.
3. **Use averages, not records.** A game's record peak (e.g. Steal a Brainrot's 25.9M on Oct 11, 2025 [S]) tells you about a viral moment, not the steady market.
4. **Watch the trend, not the level.** A 5,000-CCU game that grew 3x in a month is more interesting than a 50,000-CCU game falling 30%.
5. **Check the likes ratio.** Below ~85% often means unhappy players. That's an opening for you. (Our rule of thumb, not a Roblox number.)
6. **Updates and events spike CCU.** Names with "[🎃]", "[UPD]" or "[EVENT]" are mid-event. Wait a week and re-check.
7. **Search results are not genre lists.** Searching "tower defense" also returns unrelated hits (Murder Mystery 2 showed up). **Filter by name and by actually opening the game.**
8. **CCU ≠ money.** Some genres monetize far better per hour. Roblox said per-hour spending varies by game and age group [P] (Q2 2026 letter). You can't see other games' revenue, so treat earnings as unknown.
9. **Platform-wide changes move everything.** Roblox DAUs went 151.5M (Q3 2025) → 123M (Q2 2026) [S]/[P]. Compare a game to its genre, not to last year.

---

## 4. Sizing a niche on Roblox: "top-20 CCU"

**The idea:** add up the live players of the top 20 games in a genre. That's a rough "how many kids are in this genre right now". Then look at **how concentrated** it is.

### Steps (20 minutes)

1. Search the genre's keywords (e.g. "tower defense", "td", "defense"). Scroll several pages.
2. Keep only games that really are that genre. Open any you're unsure about.
3. Record: name, CCU, likes %, date/time (UTC).
4. Sort by CCU. Sum the top 20 → **Top-20 CCU**.
5. Work out **#1's share** (#1 CCU ÷ Top-20 CCU) and the **#10 game's CCU**.
6. Repeat at 2 more times of day. Use the average.

### How to read it

| Signal | Means |
|---|---|
| Big top-20 CCU, #1 share under ~30%, many games at 1k–5k | **Healthy, open genre.** Room for a well-made newcomer. |
| Big top-20 CCU, #1 share over ~50% | **Winner-take-most.** You need a clear twist, not a clone. |
| Small top-20 CCU, low #1 share | **Small but open.** Good for a first game; lower ceiling. |
| Tiny top-20 CCU | Niche is small *or* untested. Check YouTube/Google Trends for demand. |

These thresholds are **our working rules**, not industry standards. Adjust them as you collect your own data.

### Live example: Roblox, Mon Oct 26, 2026, 19:55 UTC [P raw counts, our filtering]

Pulled from Roblox's search API, filtered by name for each genre. **Single snapshot, during Halloween events.** Search misses games without the keyword in their name, so totals are **under-counts**.

| Genre (search) | Top-20 CCU | #1 game (CCU) | #1 share | #10 game CCU |
|---|---|---|---|---|
| **Tower defense** | ~147,000 | Anime Adventures (39.5k) | 27% | ~2,750 |
| **Fishing** | ~117,000 | Fish It! (73.3k) | 63% | ~1,330 |
| **Pet / pet sim** | ~164,000 | Pet Simulator 99 (83.4k) | 51% | ~1,500 |
| **Obby** | ~99,600 | Tower of Hell (32.5k) | 33% | ~3,000 |
| **Tycoon** | ~85,100 | Pet Store Tycoon (13.2k) | 16% | ~2,900 |
| **Cooking / restaurant** | ~45,000 | Restaurant Tycoon 3 (9.7k) | 22% | ~990 |

**Tower defense, top 10 in that snapshot:** Anime Adventures 39.5k · Cameraman Tower Defense 26.2k · Vanguards 19.5k · Tower Defense Simulator 15.4k · Candy Kingdom Defense 5.3k · All Star Tower Defense 5.2k · Garden Tower Defense 4.8k · Alliance Tower Defense 3.5k · Toilet Tower Defense 3.5k · Realistic Home Defense 3.3k.

What this says about TD (for Sam):
- **Not one-game-dominated.** The top 4 hold about 68%, but #1 alone is only ~27%.
- **Themed newcomers get traction.** Candy Kingdom Defense and Garden Tower Defense (riding the Grow a Garden theme) were at ~5k CCU. A fresh theme on a known genre can find room.
- **Anime and meme themes dominate the top.** Kid-friendly, non-anime themes are rarer near the top: possibly a gap, possibly no demand. Test it.

---

## 5. Mining comments: YouTube, TikTok, Reddit, DevForum

Kids rarely fill in surveys, but they **comment constantly**.

**Where:**
- YouTube videos of the top 5 games in your genre (sort by "newest" and "top" comments).
- TikTok clips of those games.
- The game's own group wall / Discord (if public), Reddit subs, DevForum postmortems.

**What to collect (spreadsheet, 50–100 comments):**

| Column | Example |
|---|---|
| Game | Tower Defense Simulator |
| Comment (short) | "grinding for this tower takes forever" |
| Type | Complaint / Wish / Praise / Meme |
| Theme | Grind, Fairness, Friends, Humour, Bugs, Price, Content |
| Count | how many similar comments |

**Then:** sort by Theme × Count. The top 3 complaints are your **design openings**. The top 3 praises are your **must-haves**.

**Cautions:**
- Comment writers are louder and often older than average players [U].
- Don't copy a kid's username or quote personal details. Summarize themes only.
- A comment saying "add X" is a symptom. Ask *why* they want X.

---

## 6. Competitor teardown template

Play each top competitor for **30 minutes as a new player on a phone**. Fill this in:

```
GAME: __________   Date/time (UTC): ______   CCU: ______   Likes %: ____
Age band it feels made for: 6–8 / 9–12 / 13–17   Maturity label: ______

FIRST 60 SECONDS
- What do I see first? ______
- Seconds until first fun action: ____
- Words I had to read before playing: ____
- Did it make sense with sound off? Y/N

CORE LOOP (one sentence): ________________________________

PROGRESSION
- What I collect/unlock: ______
- How long until first upgrade: ____ min
- Visible long-term goal? ______

SOCIAL
- Co-op? Trading? Invite button? Leaderboards? ______

MONETIZATION (list each offer + Robux price)
- ______
- Ethics check: shown odds? fake timers? pay-to-win? popups after losses? ______

UPDATES
- Last update date: ____  How often: ____

TOP 3 PLAYER COMPLAINTS (from comments): 1.___ 2.___ 3.___

WHAT I'D STEAL (good ideas): ______
WHAT I'D DO DIFFERENTLY: ______
```

Do 3 teardowns per idea. Patterns across 3 games matter more than details of 1.

---

## 7. The idea scorecard

Score each line **1–5**, multiply by the weight, add up. Max = 500.

| Criterion | Weight | 1 = | 5 = | How to measure |
|---|---|---|---|---|
| **Market size** | 20 | Top-20 CCU under ~10k | Top-20 CCU over ~100k | §4 snapshot, averaged |
| **Competition** | 15 | #1 share over 60%, many polished clones | #1 share under 30%, weak/aging leaders, low likes % | §4 + teardowns |
| **Fit for kids** | 20 | Needs reading, mature themes, solo grind | Instantly readable, friends-first, Minimal/Mild content | Age table in `02-what-kids-play-and-why.md` |
| **Art scope** | 15 | Lots of custom models/animations | Reuses simple assets / stylized low-poly | Count unique assets in your plan |
| **Solo feasibility** | 15 | Needs complex netcode, live ops team, big content drops | Core loop prototypable in a weekend; updates in days | Your honest estimate in hours |
| **Monetization** | 15 | Only fair option is ads/donations | Clear, fair things to buy (cosmetics, passes, convenience) | Competitor teardown offers list |

Weights reflect Sam's goals (kids, solo). Change them if your goals differ, but **decide the weights before scoring**, not after.

### Worked example: three ideas, scored with the Oct 26, 2026 snapshot

| | **A. Candy-themed co-op TD** (cute, kid-first) | **B. Fishing collector** | **C. Cooking/restaurant tycoon** |
|---|---|---|---|
| **Market size** (×20) | 5: TD top-20 ~147k → **100** | 5: ~117k → **100** | 4: ~45k → **80** |
| **Competition** (×15) | 3: #1 only 27%, but strong anime leaders → **45** | 1: Fish It! holds 63% → **15** | 4: #1 only 22%, leaders modest → **60** |
| **Fit for kids** (×20) | 4: collecting + co-op + humour; some strategy reading → **80** | 4: calm, collecting, simple → **80** | 4: role-play, simple, friends → **80** |
| **Art scope** (×15) | 3: towers + enemies + maps → **45** | 3: many fish models → **45** | 3: food, stations, customers → **45** |
| **Solo feasibility** (×15) | 4: Sam's existing TD skills/code → **60** | 4: simple loop → **60** | 3: tycoon economy tuning, many systems → **45** |
| **Monetization** (×15) | 4: tower skins, unit packs with shown odds, VIP lane → **60** | 4: rods, bait, cosmetics → **60** | 3: decor and boosts; less proven at low CCU → **45** |
| **Total (/500)** | **390** | **360** | **355** |

**Reading the result:**
- **A wins**, mostly because Sam already knows TD (feasibility) and the TD market is big *and* not dominated by one game.
- **B** has a big market but one giant holds 63%. It only works with a strong twist.
- **C** is the safest "small open niche", a good backup or second game.
- The scores are close. **Scores pick what to test first, not what to build forever.** Run §8 on A, and on B or C if A fails.

---

## 8. Fast validation playbook (2–3 weeks, small budget)

### Step 1: Thumbnail + title test (3–7 days)

**Goal:** do kids click?

1. Make **3 thumbnails + titles** for the idea (bright, one clear subject, readable on a phone at thumbnail size).
2. Publish a **placeholder or very early version** (be honest in the description: "early test").
3. Run small ad campaigns in Roblox's ads tools (Ads Manager / sponsored experiences), one per thumbnail, same budget and audience. If your dashboard offers **thumbnail experiments**, use those instead. Ad pricing changes; set a budget you can afford to lose.
4. Compare **click-through rate (CTR)** and **cost per play**. Run each for the same days of the week.

What's a "good" CTR? **We don't have a reliable public benchmark** [gap]. Compare your 3 variants against each other and against your own past games.

### Step 2: Weekend prototype (2 days)

**Goal:** is the core loop fun in 3 minutes?

- Build **only the core loop**: one map, 3 towers, 3 enemy types, a win/lose screen. Grey boxes are fine.
- **No shop, no progression, no UI polish.**
- Mobile controls from day one.
- Add analytics events: `session_start`, `wave_reached`, `quit_wave`, `replay_clicked`.

### Step 3: Playtest with 5 kids (1 afternoon)

Five testers find most usability problems (Nielsen Norman Group's rule of thumb) [S] ([NN/g](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/)).

**Ethics first:**
- Only kids you know through their **parents**, with the parent's **permission and present** (or in the room/call).
- No recording faces or voices without written parent consent. Don't collect names in your notes; use "Kid 1 (age 9)".
- Keep it short (≤30 min) and fun. Thank them; no pressure.

**Run it:**
1. Hand over the phone. Say only: "This is a game I'm making. Show me how you'd play it." Then **stay quiet**.
2. Watch and note: first confused moment, first smile/laugh, first "can I…?", the moment they want to stop.
3. After: ask 3 questions: "What was the best bit?" "What was boring or confusing?" "Would you play this with a friend?"
4. Watch for **unprompted replay**. If a kid asks to play again, that's your strongest signal.

**Pass/fail (decide before testing):**
- ✅ 3+ of 5 kids replay unprompted or ask to play with a friend → build the next layer.
- ⚠️ They like it but get confused → fix onboarding, test again.
- ❌ Bored within 2 minutes, no replay → change the core loop or drop the idea.

### Step 4: Soft launch and read the dashboard

Publish a small playable version and run it for a week. Watch: **D1 retention, session length, first-play bounce, play-through**. Roblox's recommendations use the last two directly [P] (Q2 2026 letter). Compare to your dashboard's benchmarks if shown.

---

## ✏️ Exercise (one sitting, ~2 hours)

1. Pick **2 ideas**. For each, do the §4 top-20 CCU snapshot and write down the time in UTC.
2. Do **one** competitor teardown per idea (§6).
3. Score both on the scorecard (§7). Write the totals and *one sentence* on why the winner won.
4. Book a weekend for the prototype (§8 Step 2) and write down your pass/fail rule **now**.

---

## 🤖 Train the Model

**What the model should learn**
- Run a **repeatable research process**: multiple CCU snapshots with UTC timestamps, genre filtering, concentration (#1 share), comment mining, competitor teardowns.
- Use a **weighted scorecard** honestly (weights set first, scores justified by data) and treat results as "what to test", not truth.
- Design **cheap, ethical validation**: thumbnail CTR tests, weekend prototypes, 5-kid playtests with parent consent and pre-set pass/fail rules.
- Admit missing benchmarks (e.g. no public Roblox CTR norm) and suggest how to measure.

**Dataset:** `06-market-research/train/idea-research.jsonl`

**How to check it:** `06-market-research/train/idea-research.eval.jsonl`. A good answer:
- warns that one CCU snapshot is not enough and asks for timestamps,
- computes or asks for concentration, not just total CCU,
- sets pass/fail criteria *before* testing,
- includes parent consent for any kid playtest,
- does not invent benchmark numbers.
