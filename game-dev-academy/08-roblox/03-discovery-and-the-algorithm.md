# Discovery and the Algorithm (as of Oct 2026)

> **What you'll learn**
> - How Roblox decides who sees your game: Home "Recommended For You", Charts, Search, Sponsored, Moments.
> - Which signals count (and which don't), straight from Roblox's 2026 docs and investor letters.
> - How to use thumbnails, ads, notifications and Kids & Select eligibility. Plus a "do this week" checklist.

Tags: **[P]** Roblox said it · **[S]** reputable press/analyst · **[U]** unverified/community · **Lesson** = our guidance.

---

## 1. The big change in 2026: retention over 28 days

In **April 2026** Roblox began rolling out a new "Recommended For You" (RFY) algorithm [P] [Q2'26 letter][q2-26]:

- It evaluates player behaviour over a **28-day window (was 7 days)**.
- New signals: **play-through rate**, **first-play bounce rate**, **spend days**, **Robux spent per user**.
- It "intentionally provides more impressions for highly retentive games at the expense of near term monetization."
- Roblox accepted a bookings hit for this. Q3 2026 bookings are guided **−14% to −18% YoY**, partly because of it [P] [q2-26].

At **RDC 2026** (Sep 11, 2026), Roblox added that discovery is now **age-aware**, optimises "across the first 28 days and beyond", and is testing rewards for games that **bring new players to the platform** [P] [RDC 2026][rdc26].

**Meaning for Sam:** a TD game that kids come back to on day 2, day 7 and day 20 gets pushed. A game that spikes and dies doesn't.

---

## 2. How Home "Recommended For You" works

From Roblox's Discovery docs [P] [Discovery docs][disc]:

**Two stages:**
1. **Retrieval** picks candidate games a user might like (engagement, retention, monetization signals).
2. **Ranking** personalises and orders them for that user.

**Signals are averages per user, not totals.** Small games with engaged players aren't penalised for being small.

**Explore and expand:** RFY tests your game on a new cohort. If they engage and retain, it keeps showing it to similar cohorts.

### Signals, by priority (Roblox's own ordering)

| Priority | Signal | Direction | Notes |
|---|---|---|---|
| **Most important** | Play-through rate (from the RFY tile) | ↑ good | Players who see your tile and press Play |
| Most important | First-play bounce rate | ↓ good | Measured at **<60 s** and **61–180 s** |
| Most important | Play days per user (D1, D2–7, D8–28) | ↑ good | This is the retention signal |
| Most important | Playtime per user | ↑ good | **Capped at 60 min per user, per game, per day** |
| Important | Intentional co-play days per user | ↑ good | Joins, invites, private servers |
| Important | Qualified play sessions per user | ↑ good | Filters out accidental clicks |
| Important | Spend days per user | ↑ good | Days with any spend, not size of spend |
| Important | Robux spent per user | ↑ good | Averaged per user |

**Only organic RFY users count.** Signals use only players who "*organically* joined from the Recommended for You sort on Home" [P] [disc].

Roblox says it will "continue to add and remove signals while also adjusting their influence" toward "strong long term retention" [P] [disc]. Expect this table to change.

### What does NOT feed RFY ranking

| Source | Counts in RFY ranking? | Can it still help? | Tag |
|---|---|---|---|
| Players acquired by **ads** | No | Yes: "can accelerate your consideration" | [P] [disc] |
| **Search** | No | Same | [P] [disc] |
| **Friends** (joins, friend lists) | No (as acquisition) | Same. Co-play **days** of RFY users do count. | [P] [disc] |
| **Curation** (Standout Games, events) | No | Same | [P] [disc] |
| **Social media / off-platform** | No | Same | [P] [disc] |
| **Running ads at all** | "Does not change a game's Recommended For You ranking" | — | [P] [Ads Manager docs][ads-docs] |
| **Benchmarks** shown in your dashboard | No effect | Comparison only | [P] [disc] |

**Community reports** (Oct 2026) say Home recommendations fell during ad campaigns. Roblox gave no official explanation in that thread, and others report no effect [U] [Ads RDC 2026 recap thread][ads-rdc26]. Watch your own dashboard.

### What gets your exposure cut

[P] [disc]:
- **Giveaway-style metadata** ("Robux! Play now!") → less exposure.
- **Thumbnail/title that doesn't match gameplay** (e.g., dinosaur thumbnail on a generic obby) → less exposure in RFY and Search.
- **Non-unique games** that closely copy existing titles/visuals → deprioritised. Ads may also get **no spend** [P] [ads-docs].
- **Default thumbnail** → **not eligible** for Home recommendation impressions at all. A custom thumbnail is **required**.
- Reduced exposure shows as a **banner in the Creator Dashboard**. It updates daily, and quality is reassessed with every update.

---

## 3. All the discovery surfaces (2026)

| Surface | How you get on it | Tag |
|---|---|---|
| **Recommended For You** (Home) | The signals above | [P] [disc] |
| **Continue Playing / Friends** (Home) | Your players come back / their friends play | [P] [disc] |
| **Sponsored** (Home, Search) | Ads Manager campaigns | [P] [disc], [ads-docs] |
| **Standout Games** (Home, 2nd row) | Hand-curated: novel or under-represented genres | [P] [disc], [Q1'26][q1-26], [DevEx 42% post][devex-42] |
| **Live Events** (Home) | Limited-time events with quests/rewards (Roblox-run, e.g., "The Hollow", Oct 2026) | [P] [disc], [newsroom][newsroom] |
| **Search** | Semantic search in supported languages ("food games" works) | [P] [disc] |
| **Charts** (Discover tab) | Formula-based sorts, below | [P] [charts-api] |
| **Moments** (Home tab, video) | Short videos. Experience Details videos feed in from Sep 2026. Live for age-checked 16+ in the US first. | [P] [Q2'26][q2-26], [rdc26] |
| **Experience Notifications** | Opt-in, 13+, 1/day/user | [P] [notif-docs] |
| **Game Details page** | Events, groups, passes, subscriptions, similar games | [P] [disc] |

### Charts: the exact definitions (from Roblox's API, read Oct 26, 2026)

[P] [Roblox explore API][charts-api]:

| Chart | Roblox's definition | Small-dev angle |
|---|---|---|
| **Top Trending** | "Largest relative increase in daily active users over the past week" | *Relative* growth: a jump from 500 to 2,000 DAU can beat a giant that's flat |
| **Up-and-Coming** | "Published within the last **28 days**, sorted by user growth" | Your launch window is **28 days**. Plan the launch push inside it. |
| **Top Playing Now** | Sorted by concurrent users | Hard for small games |
| **Fun with Friends** | Share of time spent **as groups of friends**. Needs ≥5,000 daily users, top-10% DAU, or top-30 most played. | Co-op TD fits this |
| **Top Revisited** | Share of users who **come back after a week**. Same thresholds. | TD's natural home: 8 TD games were in it on Oct 26, 2026 (our count) |

The roblox.com Top Trending page described the chart in search snippets as "spending more time over the past two weeks". That conflicts with the API text [U]. Trust the API definition, and re-check.

---

## 4. Thumbnails, icons and personalization

[P] [Thumbnails docs][thumbs]:

- Up to **10** images/videos. **16:9**, ideally **1920×1080**.
- **Thumbnail personalization** starts when you activate **2–5** thumbnails. Each is tested on random users, then the winner per user group gets more impressions.
- Roblox testing: average **+8.5% qualified play-through rate**, some games **+50%** [P].
- A later update (remembering winners) measured only **+0.19%** qualified PTR and 21% fewer impressions to losing thumbnails. That's a separate, smaller change [P] [DevForum][thumb-update].
- Advice: keep several active. Test new ones with **major updates**, then hold until the next update.
- **Video thumbnails:** 3 uploads/month. No voice-over, lyrics, fake gameplay, "free" claims or real-life footage.
- Keep key art **away from the bottom**, where player-count overlays sit.

**Experiments (A/B tests):** Roblox recommends Experiments for onboarding and starter-currency tests [P] [Onboarding docs][onboard]. An **Experiment Agent** that suggests A/B tests is "shipping over the next several months" [P] [Q2'26][q2-26].

---

## 5. Sponsored ads (Ads Manager)

### Formats, objectives and costs

| Item | Detail | Tag |
|---|---|---|
| Format | **Sponsored tiles** on Home and Search, up to 10 thumbnails (16:9) per campaign | [P] [ads-docs] |
| Objectives | **Plays** (likely to start a session), **Earnings** (likely to spend, limited), **Engagement** (age-checked, highly engaged players toward Kids & Select, usually higher cost per play) | [P] [ads-docs] |
| Bidding | **Auto-bid**: you set budget + duration. Reports cost per play (CPP), plus ROAS for Earnings. | [P] [ads-docs] |
| Budget | Daily or lifetime. Minimum stated: 1 ad credit. | [P] [ads-docs] |
| Pay with | Card (18+ only), or **ad credits** bought or converted from Robux (13+). Conversion is **permanent**. | [P] [ads-docs] |
| Robux → ad credit | **1 ad credit = 263 Robux** (since Sep 2025, was 285). Same value as DevEx at $0.0038. | [P] [Ads RDC 2025 recap][ads-rdc25]. Calc: 263 × 0.0038 ≈ $1.00 |
| US 18+ earnings | Applied first at enhanced value when converting to ad credits | [P] [ads-rdc26] |
| Targeting | All / New / Recent (needs 10k+) / Lapsed (needs 20k+) players. Location, age, gender, genre, device. | [P] [ads-docs] |
| Sponsored tiles for 13 and under | Now allowed, with age guardrails (Oct 2026) | [P] [ads-rdc26] |
| Third-party cost benchmarks | ~$0.45 avg cost per play, ~$0.25 CPC, $3.50 immersive CPM (Mar 2026) | [U] [BLOXG][bloxg] |
| Community-cited cost | ~$7–11 per 1,000 plays | [U] (quoted in the [RDC 2025 thread][ads-rdc25]) |

### Does it work? Roblox's numbers

| Claim | Number | Tag |
|---|---|---|
| Incrementality, 21 campaigns | All 21 brought incremental plays. Median **+14%** play sessions, **+10%** D7-retained users vs unexposed. | [P] [ads-rdc26] (Oct 2, 2026) |
| Earnings campaigns | ~**2 in 3** games reinvesting up to 4% of earnings hit ROAS > 100%. These were games with **ARPU ≥ 6 Robux** in H1 2026. | [P] [ads-rdc26] |
| Example | Ink Game: $250/day → 277% return | [P] [ads-rdc26] |
| 2025 lift studies | Typical advertised game: +150% impressions, +24% plays, +16% playtime | [P] [ads-rdc25] (Sep 2025) |
| Cost per play | "Over 71% cheaper" after 2025 changes. Plays possible "for less than $0.01". | [P] [ads-rdc25] |
| Usage | 45,000+ creators used Ads Manager in 2025 | [P] [ads-rdc25] |
| ROAS attribution window | 30 days after click-and-play. Includes Creator Rewards, immersive, rewarded video and dev-product earnings. | [P] [ads-rdc26] |

**Lesson:** ads buy **a test audience**, not a ranking. Run a small Plays campaign when your D1/D7 is already decent. That gives RFY's explore step enough players to judge you. Don't buy traffic for a game with a leaky first minute. You'll just pay to raise your bounce rate.

---

## 6. Notifications and social features

### Experience Notifications [P] [Notifications docs][notif-docs]

- **13+ only.** Under-13s never see the opt-in prompt and get only update notifications.
- Eligibility: **100+ visits**, not under moderation.
- **One notification per user per day** per experience, plus an aggregate daily cap across experiences. Delivery isn't guaranteed (spam system).
- Opt-in prompt: `ExperienceNotificationService:CanPromptOptInAsync()` → `:PromptOptIn()`. Text can't be customised. It won't re-show for 30 days.
- Strings ≤ **99 characters**. Launch data ≤ **200 bytes**.
- **Banned:** disguised ads, false urgency, bait-and-switch, and **requiring notifications to play**.
- Metrics: opted-in users, impressions, clicks, CTR, turn-off rate (needs 100+ impressions).

```lua
-- LocalScript: ask for notification opt-in AFTER a win (13+ only; Roblox hides it otherwise)
local ExperienceNotificationService = game:GetService("ExperienceNotificationService")

local function askAfterVictory()
	local ok, canPrompt = pcall(function()
		return ExperienceNotificationService:CanPromptOptInAsync()
	end)
	if ok and canPrompt then
		ExperienceNotificationService:PromptOptIn()
	end
end

return askAfterVictory
```

Good TD notification ideas (Lesson): "Your friend {name} beat Wave 40", "Event map unlocks in your server tonight" (only if true), "Your daily tower crate is ready" (only if it's free and real).

### Friends and co-play

- **Intentional co-play days** count in RFY (joins, invites, private servers) [P] [disc].
- **Fun with Friends** chart rewards friend-group playtime [P] [charts-api].
- Roblox Plus subscribers get **free private servers**. Creators earn up to **100 Robux** per Plus subscriber with 60+ min in a paid private server over 30 days (top 5 servers/month) [S] [Tubefilter][tubefilter].
- Social links (Discord, YouTube) are visible **only to age-checked 16+** users. Creators can't post social links inside experiences [P] [kids-launch], [Community Standards][cs].

---

## 7. Kids & Select: a hidden discovery gate

Since **Jun 16, 2026**, players aged **5–15** see only games that passed evaluation [P] [Kids & Select docs][kids-docs]:

1. Publish requirements: ID or face check, **2FA**, the full **Maturity & Compliance Questionnaire** with a Minimal / Mild / Moderate rating, and **either** 2 months of Roblox Plus/Premium **or** a refundable **1,000 Robux** publishing fee [P] [Publishing docs][publish].
2. A trial phase with age-checked **16+** players.
3. A threshold of **250 unique plays by highly engaged age-checked users within 60 days**. "Highly engaged" means tenure + playtime + some platform spend in the last 60 days, not necessarily in your game [P] [kids-docs].
4. A safety review. Social hangouts, free-form drawing and "sensitive issues" games are excluded.
5. Optional **expedited review**: 50,000 Robux, refundable [P] [kids-docs].
6. Ads Manager's **Engagement** objective exists to help you reach that threshold [P] [ads-docs]. Track progress in **Audience Reach** in Creator Hub.

Kids & Select had ~**30,000** eligible games by Q2 2026, up ~50% since launch [P] [Q2'26][q2-26].

**For a kid-friendly TD game, this is priority #1.** If you're not eligible, a third of the audience (under-13) and much of 13–15 may simply never see you.

---

## 8. Roblox's published discovery advice (summary)

[P] [disc]:
- Be accurate in metadata. No irrelevant keywords.
- Don't rely on promotional monetary rewards to drive engagement.
- Use original imagery and naming. Add your own spin to trends.
- Strong core gameplay and retention matter more than tuning every signal.
- When impressions drop, check **play-through, play days, playtime and first-play bounce** first.
- Expect play-through to dip temporarily when impressions rise. It normalises.

---

## ✅ What to do this week

| # | Task | Metric to watch |
|---|---|---|
| 1 | Confirm a **custom thumbnail** is live (a default one = no Home impressions) | RFY impressions > 0 |
| 2 | Upload **3–5 thumbnails** that each show real gameplay (towers firing, a boss wave, co-op) | Qualified play-through rate |
| 3 | Remove anything giveaway-like from the title/description ("FREE", "Robux") | Reduced-exposure banner gone |
| 4 | Complete the **full Maturity & Compliance Questionnaire**. Enable 2FA. Pay the 1,000-Robux refundable fee or keep Plus/Premium 2 months. | Audience Reach progress |
| 5 | Add **onboarding funnel events** and fix the biggest early drop with an icon | First-play bounce <60 s |
| 6 | Add **party/friend join** into the same match + a co-op reward | Co-play days per user |
| 7 | Add a **post-victory notification opt-in** (13+) and one honest, personal notification | Opt-in rate, CTR, turn-off rate |
| 8 | If D1 looks healthy, run a **small Plays campaign** (e.g., a fixed daily budget you can afford to lose) | CPP, D7 of ad cohort |
| 9 | Plan the next update to land on a **Friday/Saturday** | Saturday Home traffic |
| 10 | Open **Analytics → Acquisition → Home Recommendations** and screenshot today's baseline | Week-over-week change |

---

## Exercise (one sitting)

Write a one-page "discovery audit" for your TD game:
1. Paste your RFY dashboard numbers: impressions, play-through, first-play bounce (<60 s, 61–180 s), D1/D2–7/D8–28 play days, playtime.
2. Mark the **worst** "most important" signal.
3. Write 3 changes that target **only** that signal. Note which one you'll ship first and how you'll know it worked (metric + date).

---

## Sources

[q2-26]: https://www.sec.gov/Archives/edgar/data/0001315098/000162828026051059/ex991-robloxq22026earnin.htm
[q1-26]: https://www.sec.gov/Archives/edgar/data/0001315098/000162828026028882/ex991-q12026earningsshar.htm
[rdc26]: https://about.roblox.com/newsroom/2026/09/rdc-2026-the-world-needs-more-play
[disc]: https://create.roblox.com/docs/discovery
[ads-docs]: https://create.roblox.com/docs/production/promotion/ads-manager
[ads-rdc26]: https://devforum.roblox.com/t/ads-manager-rdc-recap-earnings-roas-reporting-incrementality/4909790
[ads-rdc25]: https://devforum.roblox.com/t/ads-for-creators-rdc-recap-and-what%E2%80%99s-next/3929106
[bloxg]: https://bloxg.com/statistics/roblox-advertising-benchmarks
[charts-api]: https://apis.roblox.com/explore-api/v1/get-sorts
[thumbs]: https://create.roblox.com/docs/production/publishing/thumbnails
[thumb-update]: https://devforum.roblox.com/t/thumbnail-personalization-now-remembers-your-existing-winning-thumbnails/3793665
[onboard]: https://create.roblox.com/docs/production/game-design/onboarding
[notif-docs]: https://create.roblox.com/docs/production/promotion/experience-notifications
[tubefilter]: https://www.tubefilter.com/2026/04/13/roblox-plus-creator-payouts/
[kids-launch]: https://about.roblox.com/newsroom/2026/06/age-based-roblox-kids-and-select-accounts-now-globally-available
[kids-docs]: https://create.roblox.com/docs/production/publishing/kids-and-select
[publish]: https://create.roblox.com/docs/production/publishing/publish-experiences-and-places
[cs]: https://about.roblox.com/community-standards
[devex-42]: https://about.roblox.com/newsroom/2026/04/roblox-fuels-high-fidelity-games-over-18-players-increases-qualifying-devex-rate-42
[newsroom]: https://about.roblox.com/newsroom

- Q2 2026 letter [link][q2-26]; Q1 2026 letter [link][q1-26]
- RDC 2026 recap (Sep 11, 2026) [link][rdc26]
- Creator Docs: Discovery [link][disc], Ads Manager [link][ads-docs], Thumbnails [link][thumbs], Onboarding [link][onboard], Experience Notifications [link][notif-docs], Kids & Select [link][kids-docs], Publishing [link][publish]
- DevForum: Ads Manager RDC recap (Oct 2, 2026) [link][ads-rdc26]; Ads for Creators RDC recap (Sep 10, 2025) [link][ads-rdc25]; thumbnail personalization update [link][thumb-update]
- Roblox explore/charts API (Oct 26, 2026) [link][charts-api]
- Community Standards [link][cs]; Kids & Select launch post [link][kids-launch]; DevEx 42% post [link][devex-42]
- Tubefilter on Roblox Plus (Apr 13, 2026) [link][tubefilter]; BLOXG ad benchmarks [link][bloxg]

---

## 🤖 Train the Model

**What the model should learn:** diagnose discovery problems with Roblox's real 2026 signal list, then prescribe the smallest fix with a metric. That means:
- 28-day window,
- play-through,
- first-play bounce,
- play days D1/D2–7/D8–28,
- playtime capped at 60 min,
- co-play days,
- spend days.

It must know what does **not** count (ad/search/friend/curation acquisition, benchmarks). It must explain ads as a test-audience tool, and flag the Kids & Select gate.

**Dataset:** `08-roblox/train/discovery.jsonl` (diagnose a dashboard, critique a thumbnail/title, plan a launch, write Luau for notifications, explain charts).

**How to check it:** `08-roblox/train/discovery.eval.jsonl`. A good answer:
- names the right signal,
- doesn't claim ads improve RFY ranking,
- mentions that a custom thumbnail is required,
- knows Up-and-Coming = first 28 days,
- respects 13+ rules for notifications,
- gives a metric and timeframe.
