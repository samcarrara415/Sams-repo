# Retention Benchmarks and Live-Ops

> **What you'll learn**
> - What "good" D1, D7 and D30 retention looks like, per the 2025–2026 reports, and why Roblox has no public table.
> - How to read a cohort chart, and how to plan weekly, monthly and seasonal live-ops.
> - Bottom line: the typical mobile game keeps about 1 in 4 players on Day 1 and fewer than 1 in 25 on Day 7. Top games do far better. On Roblox, **compare yourself to the benchmark range in your own Creator Analytics.**

Tags: **[P]** primary, **[S]** secondary, **[U]** unverified. Researched Oct 2026. Benchmarks go stale fast, so re-check anything older than 6 months.

---

## 1. Retention benchmarks

### Mobile, all genres (GameAnalytics, 2025 data)

Source: GameAnalytics 2026 Mobile & PC Benchmarks, summarised by GameDev Reports (Jun 4 2026). It covers 16,262 mobile games with 1,000+ MAU [S] ([report](https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks), [summary](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)).

| Metric | Median | Top 25% | Top 10% | Top 1% |
|---|---|---|---|---|
| D1 | ~22% (start of 2025) | just above 30% | ~40% | 64–68% |
| D7 | just under 4% | 6–7% | 11–12% | 25%+ |
| D30 | 0.69–0.79% | ~1.6–1.8% | – | 13–15% |
| Playtime per user per day | – | 22–24 min | 40–42 min | 94+ min |
| Session length | – | ~5.2 min | ~8 min | ~22 min |
| Sessions per day | – | 5.3–5.7 | ~9.6 | ~14 |

- The median D1 figure (~22%) comes from a search summary of the 2026 report, not from a page I could read. Treat it as **[U]** until you check the report itself.
- D1 fell in 2025 compared with 2024 [S].
- Weekends are biggest: Saturday and Sunday are each ~16% of weekly playtime, weekdays 13–14% [S].
- ⚠️ These medians include thousands of tiny or unfinished games. Treat the **top 25%** column as the "real game" bar.

### Mobile, the year before (GameAnalytics, 2024 data)

From 11,600 apps [S] ([summary, Feb 17 2025](https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks)):
- D1 top 25%: ~26.5–27.7%. On iOS the top 25% reach 31–33%, on Android 25–27%.
- D7 median: 3.4–3.9%. Top 25%: 7–8%.
- D28: 75% of games are below 3%.
- Median session 5–6 min. Median playtime 22 min/day.
- Genres: **board, card, puzzle and casino** keep players longest. **Arcade** has strong D1 but drops off. **Multiplayer** has the longest sessions but the weakest retention. Midcore has the most sessions per day (6–7).

### Mobile (Adjust)

- 2025 data: average D1 **27%** across genres. **Family** games rose from 18% to 23% D1. Day-0 sessions averaged 1.65 [S] ([Adjust 2026 via GameDev Reports, Apr 15 2026](https://gamedevreports.substack.com/p/adjust-gaming-app-insights-report)).
- 2024 data: D1 27%, D30 ~5%. Average session 30.75 min (Adjust measures sessions differently from GameAnalytics, so don't mix them) [S] ([Adjust 2025 via GameDev Reports](https://gamedevreports.substack.com/p/adjust-mobile-games-insights-report)).

> Why do Adjust and GameAnalytics disagree on D30 (~5% vs <1%)? They use different samples (Adjust skews to games that pay for attribution, i.e. bigger ones) and different definitions. **Never compare your number to a benchmark without checking the definition.**

### PC (GameAnalytics, 2025 data)

From 3,582 PC games: top 25% D1 15–16%, median session 18 min, median playtime 32–33 min/day, sessions/day 1.65–1.7 [S] ([summary](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)).

### Roblox

- **There is no public Roblox-wide retention table.** I found none from Roblox or a reputable analyst as of Oct 2026.
- Creator Analytics shows a **benchmark range for similar experiences** (50th–90th percentile), for games with 100+ DAU [P] ([Roblox docs](https://create.roblox.com/docs/production/analytics)). Since Oct 16 2025 you can switch the comparison between "similar experiences" and "genre". You can also split D1, D7 and D30 by acquisition source [P] ([DevForum](https://devforum.roblox.com/t/analytics-view-retention-by-acquisition-source-and-select-your-benchmark-set/4010157)).
- Roblox's definitions: D7 = came back on day 8, D30 = came back on day 31 [P] ([Roblox retention docs](https://create.roblox.com/docs/production/analytics/retention)).
- Roblox's own advice: get players to the fun in **5 minutes or less**. Get D1 and session time to benchmark **before** paying for ads. Ship small updates every **2–4 weeks** and big ones every **2–3 months** [P] (same docs).
- Platform context, Q2 2026: 123M DAU (+10% YoY), 29B hours, bookings $1,557M (+8%), 27M average monthly unique payers. Roblox said per-hour monetisation fell, most notably among younger players in the US and Canada [P] ([Roblox 8-K, Q2 2026](https://www.sec.gov/Archives/edgar/data/0001315098/000162828026051059/ex991-robloxq22026earnin.htm)). Of age-checked DAU, 35% were under 13 [P] (same).

**What to do:** open Creator Analytics → Retention, write down the benchmark range shown for your game, and use that as your target. It is better than any mobile table.

---

## 2. Money benchmarks (read with care)

| Metric | What we know | Tag |
|---|---|---|
| Payer conversion | Vendor blogs say "most mobile games convert 2–5% of players to payers". **I found no primary 2025–26 report backing this.** | [U] ([Playio](https://blog.playio.co/arpdau-benchmarks-mobile-games), [Juego Studio](https://www.juegostudio.com/blog/arpdau-benchmarks-by-game-genre)) |
| ARPDAU | Vendor ranges disagree, e.g. hyper-casual $0.01–0.10, casual $0.05–0.50. Playio itself says there's no trustworthy primary source for midcore. | [U] |
| Roblox platform | Q2 2026: bookings ÷ average DAU = $1,557M ÷ 123M ≈ **$12.66 per DAU for the quarter**. Bookings ÷ monthly payers ≈ $19 per payer per month (my calculation). | [P] inputs, own math |

**Measure your own:** payer conversion = unique payers ÷ active players in the same window. ARPDAU = revenue that day ÷ DAU that day. Track both as 7-day averages.

---

## 3. How to read a cohort chart

A cohort chart has one row per **install day** and one column per **day since install**. The numbers below are made up for practice. They are not benchmarks.

| Install day | Players | D1 | D3 | D7 | D14 | D30 |
|---|---|---|---|---|---|---|
| Mon | 1,000 | 24% | 14% | 7% | 4% | 2% |
| Tue (update) | 1,200 | 31% | 19% | 10% | – | – |
| Wed (ad push) | 3,000 | 15% | 8% | – | – | – |

How to read it:
1. **Read across** a row to see one group's decay. The steepest drop is usually Day 0 → 1, which is your first-time experience.
2. **Read down** a column to see whether newer players stay better. Tue's D1 beats Mon's, so the update helped.
3. **Watch the mix.** Wed's big ad push brought players who fit the game less well, so D1 dropped. That's a **source** problem, not a game problem. Roblox shows this split by acquisition source.
4. **Don't read unfinished cells.** D7 for yesterday's cohort doesn't exist yet. Roblox warns recent D7 and D30 are incomplete [P].
5. **Small cohorts are noisy.** With 50 players, one kid is 2%. Wait for a few hundred before deciding.

What to fix, by column:
- **D1 low** → first-time experience: time to first fun, clarity, crashes, phone performance.
- **D7 low** → meta: short- and long-term goals, variety, difficulty curve.
- **D30 low** → social and live content: trading, co-op, leaderboards, events.

(That mapping follows Roblox's guidance [P] ([retention docs](https://create.roblox.com/docs/production/analytics/retention)).)

---

## 4. Live-ops: what the top games do

| Finding | Source |
|---|---|
| Live-ops events per top mobile game rose from **73 to 89 per month** during 2025 | [S] [Naavik, Sep 27 2026](https://naavik.co/weekly-digest/tis-the-season-holiday-live-ops-in-2026/) (citing Sensor Tower) |
| **90%+** of the top 100 grossing US iOS games run seasonal events | [S] same |
| Christmas lift is shrinking: median Christmas-week revenue fell from 1.88× a normal week (2017) to **1.01×** (2025) for five long-running titles | [S] same |
| Halloween median 0.97–1.05×. Black Friday ~1.19× for ten years | [S] same |
| **Your own events win:** Pokémon GO's GO Fest 2025 hit 6.7× a normal week. Brawl Stars' Apr 2024 update hit 1.7× (best Christmas 1.5×). Monopoly GO content drop 2.6× | [S] same |
| Top live-ops layers: recurring events, feature events and big events, plus collections, rolling offers and passes | [S] [Sensor Tower, Mar 2026](https://sensortower.com/blog/top-grossing-mobile-games-live-ops-strategies-2025-report) |

**Update cadence in practice:**
- **Brawl Stars:** Trophy Season and Brawl Pass reset together, monthly [P] ([Supercell, Oct 2024](https://supercell.com/en/games/brawlstars/blog/news/trophy-season-rework-is-coming)).
- **Grow a Garden:** weekly events. The team split into two event teams in Jul 2025 to keep up [U] ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden)).
- **Roblox guidance:** small updates every 2–4 weeks, big ones every 2–3 months [P].
- **Pokémon GO:** Community Day monthly since 2018 [P] ([Pokémon GO](https://pokemongo.com/post/communityday?hl=en)).

**Event types (lift varies; measure your own):**

| Type | Example | What it usually moves |
|---|---|---|
| Weekly challenge | New modifier on a map, leaderboard resets Monday | D7, sessions/week |
| Weekend boost | 2× coins Sat–Sun (weekends are already the biggest days [S]) | Weekend DAU |
| Monthly season | Free + paid pass, new tower, ranked reset | D30, conversion |
| Content drop | New map or tower family | Returning players, CCU spike |
| Seasonal/holiday | Halloween, winter | New installs (gift devices), mood |
| Community moment | Live boss everyone fights at a set time | Social, CCU, sharing |

A note for kids' games: Black Friday works because people already expect discounts [S]. If you run one, the "before" price must be **real**. Fake discounts are a dark pattern and are illegal in many places.

---

## 5. Example: 12-week live-ops plan for a Roblox tower-defense game

The plan runs from Mon Nov 2 2026 to Sun Jan 24 2027. Every week has the same base rhythm: a **weekly challenge map on Monday**, a **2× coin weekend**, and a **patch-notes post**. Events are free to join. Paid items are cosmetic or convenience, with no paid random items.

| Wk | Dates | Beat | What ships | Metric to watch |
|---|---|---|---|---|
| 1 | Nov 2–8 | **Season 1 starts** | Free + paid pass (30 tiers, free track finishable by a ~20-min/day player), new "Frost" tower | D1/D7 of new cohort; % reaching tier 5 |
| 2 | Nov 9–15 | Weekly | Challenge: "No-upgrade run" | Challenge participation |
| 3 | Nov 16–22 | Content | New map (co-op 2–4 players) | Co-op share of sessions |
| 4 | Nov 23–29 | Holiday | Harvest event map, Black Friday bundle at an honest price, gifting to friends | Returning players; payer conversion |
| 5 | Nov 30–Dec 6 | QoL | Fix the top 3 bugs and pain points from the feedback form, faster wave skip | Session length; crash rate |
| 6 | Dec 7–13 | Community | Saturday "World Boss" at two set times (one EU-friendly, one US-friendly), shared health bar | Peak CCU; D7 |
| 7 | Dec 14–20 | **Winter event** | Snow maps and an event currency **earned by play only**. Shop items stay in the game afterwards | Event completion % |
| 8 | Dec 21–27 | Holiday | Daily advent gift (claimable later; nothing lost if missed), new players get a starter tower | New installs; new-player D1 |
| 9 | Dec 28–Jan 3 | **Season 1 ends** | Last-week catch-up (2× pass XP), recap screen "Your season" | Pass completion; D30 |
| 10 | Jan 4–10 | **Season 2 starts** | New tower family, ranked endless mode with a soft reset | Returning lapsed players |
| 11 | Jan 11–17 | Weekly | Challenge plus a community vote on the next map theme | Vote participation |
| 12 | Jan 18–24 | Review | No big content. Analyse the 12 weeks, plan the next 12 | – |

Rules for the plan:
- Announce dates **in advance** in-game. No surprise "24 hours only!" for kids.
- Every event item comes back later, or has a non-FOMO route (e.g. a shop rotation that repeats).
- If a metric doesn't move after two tries, cut the feature (the Supercell lesson).

---

## Exercise (one sitting)

1. Open Creator Analytics → Retention. Write down your D1/D7/D30 and the benchmark range shown.
2. Find your weakest column (D1, D7 or D30) and write one change from section 3 to fix it.
3. Fill weeks 1–4 of the plan template above for your game.

---

## 🤖 Train the Model

**What the model should learn:** quote benchmarks correctly, with source, date and definition caveats. Read cohort charts. Diagnose which part of the game a weak column points to. Plan live-ops calendars that drive return visits **without** fake urgency. When it doesn't know a number (like a Roblox-wide benchmark), say so and point to Creator Analytics.

**Dataset:** `07-engagement-and-retention/train/retention-liveops.jsonl`

**Check it with:** `07-engagement-and-retention/train/retention-liveops.eval.jsonl`. A good answer:
- uses the right benchmark for the platform and doesn't mix Adjust and GameAnalytics definitions,
- reads cohorts across *and* down and spots acquisition-mix effects,
- proposes events with a metric for each,
- refuses fake timers and discounts and offers an honest version.
