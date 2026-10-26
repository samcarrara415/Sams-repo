# Analytics and Experiments: Measure, Don't Guess

> **What you'll learn:** what Roblox's Creator Hub analytics shows you, how to add funnels and custom and economy events, which numbers matter most for a kids' game, how to read them without fooling yourself, and how to run A/B tests (Experiments, thumbnail personalization).

---

## 1. The numbers that matter (in order)

| Metric | Question it answers | Where |
|---|---|---|
| **Qualified play-through / bounce** | Do people who see the game and click it actually start playing and stay past the first moments? | Creator Hub → Analytics (Acquisition / discovery) |
| **Onboarding funnel** | Where do new players drop in the first minutes? | Analytics → Funnels (Onboarding) |
| **Session length** | Are sessions long enough to be fun? (Very short ones count as bounces.) | Engagement |
| **D1 / D7 / D30 retention** | Do players come back? | Retention |
| **Payer conversion, ARPDAU, ARPPU** | Is the game earning fairly? | Monetization |
| **Economy sources/sinks** | Is the currency inflating? | Economy |
| **Custom events** | Why do players lose/quit? (`MatchLost`, `MatchQuit`, …) | Custom events |

Roblox's recommendation system leans heavily on whether people who are shown the game actually play it and come back. Per Roblox's Q2 2026 shareholder letter, recommendations now judge games over a longer window (28 days instead of 7) and use play-through and first-play bounce rates [P]. Details and sources: `03-discovery-and-the-algorithm.md`.

**Benchmarks:** Roblox doesn't publish one public retention table for all games. Creator Hub shows how your game compares with similar experiences, so use that as your target. Mobile-industry benchmarks for comparison are in `07-engagement-and-retention/02-retention-benchmarks-and-liveops.md`.

---

## 2. Instrumenting your game

The starter kit's `Telemetry.luau` wraps `AnalyticsService`:

```lua
-- Onboarding funnel: one step per milestone, in order, for new players
Telemetry.onboarding(player, Telemetry.Onboarding.PlacedFirstTower)

-- Recurring funnel: each match is its own funnel session
local session = Telemetry.newFunnelSession()
Telemetry.matchStep(player, session, 1, "Started")

-- Custom event with context
Telemetry.event(player, "MatchLost", wave, { wave = wave, difficulty = "Normal" })

-- Economy: every source and sink, with the balance after
Telemetry.economy(player, true, "Coins", 50, data.coins, Enum.AnalyticsEconomyTransactionType.Gameplay)
```

**What to instrument first (tower defense):**

| Funnel / event | Steps or fields |
|---|---|
| Onboarding | Joined → PlacedFirstTower → ClearedWave1 → FirstUpgrade → ClearedWave5 → FirstWin |
| Match | Started → ReachedWave5 → Won (plus `MatchLost {wave}` and `MatchQuit {wave}`) |
| Shop | OpenedShop → ViewedItem → PromptShown → Purchased |
| Summon | OpenedBanner → Summoned (+ result rarity, pity count) |
| Training/tutorial (if any) | Started → each step → Finished / Skipped / Quit |

Rules:
- Keep step names **stable**. Renaming splits your charts.
- Custom field values must be **low-cardinality** (wave number, difficulty, device type). Never usernames or free text.
- Log economy events at the **server**, at the moment the balance changes.
- Check the current limits on event and field counts in the AnalyticsService docs.

---

## 3. Reading the numbers without fooling yourself

1. **Note the date range and sample size** for every number. "40% D1" from 25 players is noise.
2. **Compare like with like:** new vs returning, phone vs PC, ad traffic vs organic. Ad clickers behave differently from friend-joiners.
3. **One change at a time.** If you change the tutorial, the shop and the thumbnail together, you'll never know which worked.
4. **Wait long enough.** Tiny games need days, not hours. Check retention only after full D1/D7 windows have passed.
5. **Look for the biggest drop first.** The step that loses the most players is worth more than polishing anything else.
6. **Pair numbers with watching.** Funnels say *where*. Playtests say *why*.

### Example diagnosis (Sam-style)
> "45 of 110 new players leave before finishing training."
> - Evidence: Training funnel, Oct 1–7, 110 new players: Started 110 → Step 2 92 → Step 3 71 → Finished 65. `TrainingSkipped` 8, `TrainingQuit` 37.
> - Biggest drop: Step 2 → 3 (−21). Step 3 asks them to read a text box about upgrade paths.
> - Fix: replace the text with an arrow on the Upgrade button; make step 3 optional.
> - Watch: Step 2 → 3 conversion and D1 for players who started training, over the next 7 days.

(An illustrative example in the style of Sam's insight log, not real data.)

---

## 4. Experiments (A/B tests)

Roblox supports experiments in a few forms (check Creator Docs for the current feature set):
- **Thumbnail personalization / thumbnail experiments:** Roblox tests your thumbnails and shows each player the one most likely to work. Roblox reported about +8.5% average qualified play-through from personalization [P]. Details in `04-art/03-thumbnails-icons-and-store-page.md`.
- **Experience experiments:** split players into groups server-side and compare metrics. You can also roll your own: assign a group by `UserId % 2` and log it as a custom field.

Good experiment hygiene:
- Write the **hypothesis and the metric** before starting: "Replacing text with an arrow raises Joined → PlacedFirstTower from 52% to 65%."
- Run until each group has enough players (hundreds at least for funnel steps) and a full retention window has passed.
- Only one experiment per metric at a time.
- If the result is flat, that's a result. Write it in the Insight Log.

---

## 5. Your weekly analytics routine (30 minutes)

1. **Acquisition:** impressions → plays → play-through/bounce. Any change after a thumbnail swap?
2. **Onboarding funnel:** biggest drop this week vs last.
3. **Retention:** D1/D7 trend for cohorts that have finished their windows.
4. **Losses:** `MatchLost` by wave. Is any non-boss wave a wall?
5. **Economy:** sources vs sinks. Is currency piling up?
6. **Money:** payer conversion and what sold. Did anything sell suspiciously well right after losses? (That would be a red flag.)
7. **Write 1–3 insights** at the top of the Insight Log, each with evidence, the change and the date to check.

---

## Exercise

1. Add the onboarding funnel and `MatchLost` to your game (or use the starter kit).
2. Play 3 fresh sessions on alt accounts, then confirm the events appear in Creator Hub (it can take time).
3. Write your first Insight Log entry from real data.

---

## 🤖 Train the Model

**What the model should learn:**
- choose what to instrument
- read funnels, retention and economy data carefully (sample sizes, cohorts)
- design clean experiments
- never invent numbers

**Dataset:** `08-roblox/train/analytics.jsonl`. Funnel and retention diagnosis, "what should I track?", "is this result real?" tasks.

**Evals:** `08-roblox/train/analytics.eval.jsonl`. Good answers:
- ask for or note the sample size
- find the biggest drop
- propose one change with a metric and a wait time
