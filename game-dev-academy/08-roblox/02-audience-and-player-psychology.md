# The Roblox Audience and How Kids Play (as of Oct 2026)

> **What you'll learn**
> - Who actually plays Roblox in 2026, by age, region and device, using Roblox's new age-checked data.
> - How kids decide in the first minute whether to stay, and the numbers Roblox uses to measure that.
> - Five player personas for a tower-defense game, and how kids read (or don't read) your UI.

Tags: **[P]** Roblox said it · **[S]** reputable press/analyst · **[U]** unverified/community · **Lesson** = our design guidance built on the facts. It is not a measured number.

---

## 1. Who plays: the facts

### Age (age-checked users, 7 days ended Jun 30, 2026)

| Group | Share | What it means for you | Tag |
|---|---|---|---|
| Under 13 | **35%** | Biggest single kid block. COPPA-age. No personalised notifications. No rewarded ads. Spend limits often set by parents. | [P] [Q2'26][q2-26] |
| 13–17 | **38%** | Largest group. Social, competitive, trend-driven. | [P] [Q2'26][q2-26] |
| 18+ | **27%** | Smallest globally. Fastest-growing in the US. Spends 50%+ more than under-18s (US). | [P] [Q2'26][q2-26] |

- **~73% are under 18.** "About 7 in 10 players are kids or teens" is confirmed (calc: 35 + 38).
- **Correction to a common claim:** "18+ is now Roblox's largest group" came from **self-reported** ages. Since Jan 2026 Roblox uses **age-checked** data (face estimation or ID). It shows a **younger** base, and 18+ is the **smallest** of the three groups [P] [Q4'25 supplemental][q4-25-supp], [Feb 2026 newsroom][age-feb26].
- **Where 18+ really is growing:** US 18+ DAU **+32%** YoY, US 18–34 **+42%**. In the US, 18+ is about **one-third** of age-checked DAU [P] [Q2'26][q2-26].
- **Coverage caveat:** only **57%** of DAU had age-checked by end of Q2 2026 (US and Australia over 70%) [P] [Q2'26][q2-26].

### Roblox's age bands (they drive chat and accounts)

| Band | Account type (since Jun 16, 2026) | Default chat | Tag |
|---|---|---|---|
| 5–8 (under 9) | **Roblox Kids** | Off. A parent can turn it on. | [P] [Kids & Select launch][kids-launch] |
| 9–12 | **Roblox Select** | Grows gradually after an age check. Trusted friends / similar ages only. | [P] [kids-launch] |
| 13–15 | **Roblox Select** | Same ages and nearby bands | [P] [kids-launch], [age-check post][agecheck-nov25] |
| 16–17 | Roblox (standard) | On, similar ages | [P] [kids-launch] |
| 18–20, 21+ | Roblox (standard) | On, 16+ | [P] [agecheck-nov25] |
| Not age-checked | Kids/Select by self-declared age | **Off** | [P] [kids-launch] |

### Region

| Fact | Number | Tag |
|---|---|---|
| DAUs outside US & Canada, FY2025 | ~82% | [P] [10-K][10k-25] |
| Revenue outside US & Canada, FY2025 | ~39% | [P] [10-K][10k-25] |
| Fastest DAU growth, Q2 2026 | Japan +67%, India +64% (US/Canada +6%) | [P] [Q2'26][q2-26] |

**So:** most of your players don't speak English as a first language and don't pay US prices. Icons beat words. Regional pricing beats one price.

### Device

| Fact | Number | Tag |
|---|---|---|
| Users who access Roblox on mobile | ~80% | [S] [Newzoo, Oct 2025][newzoo] |
| Players 10–65 who play **only** on mobile | 24% | [S] [newzoo] |
| Revenue via Apple + Google stores, FY2025 | 44% | [P] [10-K][10k-25] |

Roblox does not publish an official device split. "~80% mobile" is an analyst figure about **access**, not playtime.

### Gender

**Not verified.** Roblox's 2025–2026 filings and letters we checked give no gender split, and we found no recent primary source. Use your own Creator Hub audience data if it's there. If not, treat it as unknown.

### Genres (what the crowd plays)

Daily visits by genre, Q1 2021–Q2 2025 [S] [Newzoo][newzoo]:

| Rank | Genre | Daily visits |
|---|---|---|
| 1 | Roleplay & Avatar Sim | 116M |
| 2 | Simulation | 110M |
| 3 | Platformer | 70M |
| 4 | Survival | 70M |
| 5 | Action | 59M |

Tower defense isn't a top-5 genre by visits. It **is** strong on **coming back**: on Oct 26, 2026, **8 tower-defense games** appeared in Roblox's "Top Revisited" chart (players who return after a week) [P data from the [charts API][charts-api], our count].

---

## 2. How kids play: sessions, friends, co-play

### The first minute decides everything

Roblox's own definitions:

- **First-play bounce rate:** players who open a game for the first time and leave within a short threshold, "typically under **30 to 90 seconds**", without meaningful gameplay [P] [Q2'26 letter, footnote 4][q2-26].
- The Creator Hub tracks first-play bounce in two buckets: **under 60 seconds** and **61–180 seconds**. It is a **negative** signal for Home recommendations [P] [Discovery docs][disc].
- **Qualified play:** a play that filters out "accidental clicks and quick bounces". Qualified play-through rate = qualified plays ÷ Home impressions [P] [disc], [thumbnails docs][thumbs].

**Rule of thumb (Lesson):** a session under ~3 minutes is a warning sign, and under 1 minute is a failure. Roblox measures both buckets, so get the player doing something fun inside **30 seconds**.

Roblox's onboarding guidance [P] [Onboarding docs][onboard]:
- "New players typically decide their interest in a game within minutes."
- Get to the fun fast. Give early progression (low early XP thresholds), starter items/currency, and social motivators.
- End onboarding with a deliberate "moment of joy".
- A/B test tutorial designs, e.g. "a shorter dialogue sequence versus a guided arrow".

### Forced tutorials lose players

- Roblox's example funnel ("Plant" game): **100%** reach the farm, but only **29.52%** plant their first seed, a **70.48%** drop at step 2. **Fewer than 3%** reach step 9 [P] [Roblox staff DevForum post, Jul 12, 2024][funnel-post].
- The fix Roblox describes was **"simply adding an icon over the players' pots"** to show seeds go there [P] [funnel-post]. Roblox **did not publish an after-fix percentage**, so don't quote one.
- Staff advice: "Tackle the **largest and earliest** drop-offs first" [P] [funnel-post, Oct 2024 reply].
- **No Roblox primary source** says "forced tutorials lose X% of players". The claim is **[U]/Lesson**. What *is* sourced: long early funnels leak hard (29.5% → under 3%), and a visual cue fixed the biggest leak. So teach by doing, show with icons, and let returning players skip.

### Friends and co-play

- Roblox says **co-play (playing with friends) "drives a large share of playtime"** [P] [Q2'26][q2-26].
- **Intentional co-play days per user** (joins, invites, private servers) is an "important" Home recommendation signal [P] [disc].
- Roblox has a whole chart, **Fun with Friends**, ranked by the share of time spent in friend groups. It requires at least 5,000 daily users or top-10%/top-30 status [P] [charts-api].
- **Chat dropped** after mandatory age checks (Jan 2026) and was "still below pre-age check levels" in Q2. Roblox is rebuilding it with Global Chat (30M messages/day in June), Quick Words (5M+/day), In-Experience Friends Chat, and voice typing [P] [Q2'26][q2-26], [RDC 2026][rdc26].

**For a TD game (Lesson):** co-op lanes, "carry a friend" boosts, shared wave rewards, and **party join** matter more than ever, because many kids can't type to strangers. Don't make your game **depend** on chat. Use pings, emotes and Quick Words.

### Session rhythm

- Platform average: ~**2.6–2.7 hours per DAU per day**, across all games [P/calc] [10-K][10k-25], [Q2'26][q2-26].
- Home traffic peaks on **Saturdays**, in **summer** and around **holidays** [P] [disc].
- Playtime counted for recommendations is **capped at 60 minutes per user, per game, per day** [P] [disc]. Five hours of grinding doesn't help ranking more than one great hour.

---

## 3. What kids say they want

There's **no recent primary Roblox survey** with kid-stated preferences that we could verify for 2025–2026. What Roblox *does* tell us comes from behaviour:

| Behaviour signal | What it implies | Tag |
|---|---|---|
| Top Revisited / D7 retention charts exist and TD games over-index | Kids return for progression, new towers, events | [P] [charts-api] (our count) |
| Fun with Friends chart and co-play signal | Kids want to play **with** someone | [P] [disc], [charts-api] |
| Kids & Select excludes free-form drawing, social hangouts, "sensitive issues" games | Parents and Roblox want safe, structured play | [P] [kids-launch] |
| Brainrot/egg/"steal a" trends top the CCU charts | Memes, collecting and light chaos spread fast among kids | [P] live charts [charts-api] |

Anything like "kids want X%" without a source is **[U]**. Ask your own players with short in-game polls (Lesson).

---

## 4. Personas for a tower-defense game (Lesson)

These are **design tools**, not measured segments. Each one is built on the facts above.

| Persona | Who | Arrives from | Wants in first 60 s | Kills them | What to build |
|---|---|---|---|---|---|
| **Ad-clicker (8–12, phone)** | Under-13 or young Select, one thumb, maybe no chat | Sponsored tile or Home | Place a tower and see it blast an enemy | Text walls, menus before play, tiny buttons | Auto-start wave 1 at spawn. Big glowing "drag tower here" icon. No reading needed. |
| **Friend-joiner** | Any age, joined a friend's server | Friend join / party | Be useful to the friend right away | Locked out of the friend's map or level | Let low levels join co-op. Give a "helper" role. Shared rewards. |
| **Genre veteran (12–17)** | Has played TDS/ASTD-style games | Search, charts | Something new: a twist on towers, maps or modes | Clone feel, slow start, no skip | Skip-tutorial button. Hard mode visible early. A unique mechanic shown in the thumbnail. |
| **Collector/spender** | Often 13+ or US 18+, has Robux | Returning player | New towers/skins, visible rarity, fair odds | Hidden odds, pay-walls on core progress | Cosmetic and convenience passes. Odds shown before purchase (required). Event exclusives earnable by play. |
| **Returning player** | Lapsed 7–28 days | Notification (13+), update news, friends | "What's new?" and a reason to log in | Losing progress, confusing new UI | A "What's new" board, comeback reward, update tag in the title, experience notifications (13+ only). |

Roblox's ad tools target **New, Recent and Lapsed players** as separate audiences. Lapsed needs 20,000+ lapsed players and Recent needs 10,000+ [P] [Ads Manager docs][ads-docs]. That matches the persona split.

---

## 5. How kids read UI

**Sourced facts:**
- A single icon over the right spot fixed the biggest onboarding leak in Roblox's example funnel [P] [funnel-post].
- Roblox's docs recommend "contextual indicators", e.g. prompts above flowerpots [P] [Funnel events docs][funnel-docs].
- Odds pop-ups can't use a bare **(i)** icon. Roblox requires a **descriptive word** ("Odds", "Details") [P] [Paid random items][pri]. That's Roblox admitting a lone symbol isn't clear enough for this job.
- Thumbnails: key elements **shouldn't sit at the bottom**, where player-count overlays cover them [P] [thumbs].

**Lesson rules (not measured; test them):**

| Rule | Why |
|---|---|
| One instruction at a time, shown **where** the action happens (world-space arrow/icon) | Roblox's own fix was an icon on the object |
| Icons + colour + motion before words; words ≤ 3 per label | Many readers are under 9, and ~82% of players are outside US/Canada |
| Thumb-sized buttons; nothing important in screen corners | Phones are the main way in |
| Never block the first wave with a menu | First-play bounce is measured at <60 s |
| Show rewards visually (towers popping, coins flying) | Kids read pictures faster than numbers |
| "Free" / "Robux!" in titles or thumbnails = bad | Roblox reduces exposure for giveaway-style metadata [P] [disc] |

---

## 6. Measuring all this in your game

Use **funnel events** for onboarding (up to 10 funnels in the dashboard) [P] [funnel-docs]:

```lua
-- ServerScriptService/OnboardingFunnel.server.lua
local AnalyticsService = game:GetService("AnalyticsService")

local Funnel = {}

-- Call each once per player, in order.
function Funnel.step(player: Player, step: number, name: string)
	AnalyticsService:LogOnboardingFunnelStepEvent(player, step, name)
end

return Funnel

-- Usage: Funnel.step(player, 1, "Spawned")
--        Funnel.step(player, 2, "PlacedFirstTower")
--        Funnel.step(player, 3, "ClearedWave1")
--        Funnel.step(player, 4, "UpgradedTower")
--        Funnel.step(player, 5, "StartedWave5")
```

Read the biggest, earliest drop first. That's Roblox staff's own advice.

---

## Exercise (one sitting)

1. Add the 5-step funnel above to your TD game and publish.
2. After 48 hours, screenshot the funnel. Write the % at each step.
3. Find the biggest early drop. Make **one** visual-only fix (an icon, arrow or glow; no new text).
4. Publish, wait another 48–72 hours, compare. Write down the change in step % **and** first-play bounce (<60 s).
5. Pick the persona you're failing worst and write one sentence on what you'll build for them next.

---

## Sources

[q2-26]: https://www.sec.gov/Archives/edgar/data/0001315098/000162828026051059/ex991-robloxq22026earnin.htm
[q4-25-supp]: https://investgame.net/news/pdf/2026-02-06-q4-2025-supplemental-materials/
[age-feb26]: https://about.roblox.com/newsroom/2026/02/moving-beyond-self-reported-age
[kids-launch]: https://about.roblox.com/newsroom/2026/06/age-based-roblox-kids-and-select-accounts-now-globally-available
[agecheck-nov25]: https://about.roblox.com/newsroom/2025/11/roblox-requires-age-checks-limits-minor-and-adult-chat
[10k-25]: https://www.sec.gov/Archives/edgar/data/1315098/000131509826000024/rblx-20251231.htm
[newzoo]: https://gamedevreports.substack.com/p/newzoo-roblox-as-a-platform-in-2025
[charts-api]: https://apis.roblox.com/explore-api/v1/get-sorts
[disc]: https://create.roblox.com/docs/discovery
[thumbs]: https://create.roblox.com/docs/production/publishing/thumbnails
[onboard]: https://create.roblox.com/docs/production/game-design/onboarding
[funnel-post]: https://devforum.roblox.com/t/improving-onboarding-through-funnel-events/3064458
[funnel-docs]: https://create.roblox.com/docs/production/analytics/funnel-events
[rdc26]: https://about.roblox.com/newsroom/2026/09/rdc-2026-the-world-needs-more-play
[ads-docs]: https://create.roblox.com/docs/production/promotion/ads-manager
[pri]: https://create.roblox.com/docs/production/monetization/paid-random-items

- Q2 2026 shareholder letter — [link][q2-26] (age mix, co-play, bounce definition)
- Q4 2025 supplemental materials — [link][q4-25-supp]
- Roblox newsroom: self-reported age (Feb 5, 2026) [link][age-feb26]; age checks (Nov 19, 2025) [link][agecheck-nov25]; Kids & Select (Jun 16, 2026) [link][kids-launch]
- FY2025 10-K — [link][10k-25]
- Newzoo via GameDevReports (Oct 23, 2025) — [link][newzoo]
- Roblox charts API (read Oct 26, 2026) — [link][charts-api]
- Creator Docs: Discovery [link][disc], Thumbnails [link][thumbs], Onboarding [link][onboard], Funnel events [link][funnel-docs], Ads Manager [link][ads-docs], Paid random items [link][pri]
- DevForum staff post: Improving Onboarding through Funnel Events (Jul 12, 2024) — [link][funnel-post]
- RDC 2026 recap (Sep 11, 2026) — [link][rdc26]

---

## 🤖 Train the Model

**What the model should learn:** reason about Roblox players the way Roblox measures them. That means:
- age-checked age bands,
- first-play bounce (<60 s and 61–180 s),
- qualified play-through,
- co-play,
- turning that into concrete, kid-readable design fixes.

It should correct the stale "18+ is the largest group" claim. It should not invent survey numbers. And it should give a metric to watch for every fix.

**Dataset:** `08-roblox/train/audience.jsonl` (persona design, UI critique, funnel reading, Luau funnel code, myth correction).

**How to check it:** `08-roblox/train/audience.eval.jsonl`. A good answer:
- uses 35/38/27 (age-checked, Jun 2026) with the coverage caveat,
- names first-play bounce and qualified play-through,
- recommends icon/world-space cues over text,
- doesn't claim an after-fix % for Roblox's icon example,
- designs for no-chat co-play.
