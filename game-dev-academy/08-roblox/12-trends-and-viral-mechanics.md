# Trends and Viral Mechanics: How Roblox Hits Spread (2025–2026)

> **What you'll learn**
> - The machine behind 2025–2026 Roblox hits: meme → clip → chart → clones → event spikes → decline.
> - Which viral mechanics work (steal, trade, restock timers, live events, limited items, update days, collabs) and which cross the line for kids.
> - How fast clones arrive, what hit lifecycles look like, and a **weekly 40-minute trend routine** for a solo dev.

**Data is as of Oct 26, 2026.** Tags: **[P]** platform, **[S]** press/analyst, **[U]** tracker/community. Percentages marked "our maths" are calculated by us from the cited figures (often across different trackers), so treat them as rough.

---

## The viral machine (one picture)

```
Meme / trend on TikTok, YouTube Shorts, Steam
        ↓  (days)
Simple Roblox game wears the trend + a 10-second loop
        ↓  (clips: steal drama, egg reveal, scare, outfit, number-go-up)
Roblox charts + recommendations lift it
        ↓  (1–9 weeks)
Clone wave: same loop, new skin ("Steal a ___", "+1 ___", "___ Tower Defense")
        ↓
Original holds #1 with weekly updates + live events (spikes on update days)
        ↓  (1–3 months after peak)
Novelty fades: −60% to −99% from peak; survivors plateau
        ↓
The studio launches the next skin (often itself)
```

Roblox content had passed **1 trillion all-time YouTube views** by Dec 2025 ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]). Video is the distribution channel.

**2026 changed the last mile.** Roblox now steers discovery toward "measured long-term retention" and away from games built for short-term monetisation, mainly for US under-13s ([Kotaku, Aug 5 2026](https://kotaku.com/roblox-tanked-9-billion-in-a-single-day-after-the-company-admitted-it-was-directing-fewer-kids-toward-viral-games-that-emphasize-short-term-monetization-2000722002) [S]). It also splits under-16s into Kids/Select catalogs ([Roblox](https://about.roblox.com/newsroom/2026/04/introducing-roblox-kids-and-select-accounts) [P]). Virality still matters, but retention decides how long the algorithm keeps helping you.

---

## 1. Brainrot and meme culture

- **What it is:** "intentionally random, nonsensical content drawn from memes and AI-generated characters" ([mobilegamer.biz, Jan 5 2026](https://mobilegamer.biz/everything-you-always-wanted-to-know-about-roblox-brainrot-but-were-afraid-to-ask/) [S]).
- **Scale:** Steal a Brainrot passed 47.4B total logins, and Plants Vs Brainrots 4.1B (same source [S]).
- **IP is murky:** a Steal a Brainrot character ("Tung Tung Tung Sahur") was removed in Sept 2025 after a licensing dispute and returned Nov 29 2025 ([Wikipedia](https://en.wikipedia.org/wiki/Steal_a_Brainrot) [U]). Skibidi Toilet was trademarked and licensed, while other memes were never owned ([mobilegamer.biz](https://mobilegamer.biz/everything-you-always-wanted-to-know-about-roblox-brainrot-but-were-afraid-to-ask/) [S]).
- **Is brainrot dying?** Each Steal a Brainrot event peak was followed by a steeper drop. Players moved *within* the genre: Escape Tsunami for Brainrots (created Dec 15 2025) peaked near 5M and briefly passed Steal a Brainrot in Jan 2026 ([RoWatcher, ~Mar 2026](https://rowatcher.com/news/is-the-brainrot-trend-dying-what-ccu-data-from-three-top-games-reveals) [U]).
- **2026 shift: memes → pets and eggs.** The two breakouts of Sept 2026 were Steal An Egg and Ride A Pet, both egg-hatching/pet-collecting ([MaxPowerGaming](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]). Pets are an older, broader, safer theme than borrowed memes.
- **For Sam:** use meme *energy* (silly names, exaggerated reactions) with **your own characters**. Borrowed memes bring legal risk and die with the meme.

## 2. TikTok / YouTube Shorts loops

What gets clipped (from the teardowns in `10-top-games-teardowns.md`):

| Clip type | Example | Build it into your game |
|---|---|---|
| **Loss / steal drama** | Steal a Brainrot thefts, with viral clips of upset kids ([Wikipedia](https://en.wikipedia.org/wiki/Steal_a_Brainrot) [U]) | Use *safe* loss: losing to a boss, not to another kid's wallet |
| **Reveal** | Egg hatch, rare mutated crop, rare fish | A slow-motion reveal with sound and a rarity colour flash |
| **Number goes up** | +1 Speed games | Big floating numbers, a satisfying sound on milestones |
| **Scare** | 99 Nights, anomaly games | One telegraphed jump moment per session |
| **Creation** | Dress To Impress outfits | A "results screen" worth screenshotting |
| **Feature novelty** | Steal An Egg's treadmill feed drew a 1.3M-view video ([eGamers](https://egamers.io/robloxs-no-1-game-steal-an-egg-was-pulled-hours-after-reaching-the-top/) [U]) before being banned | Novel *and* allowed. Check policies first |

- Dev reach matters: Grow a Garden co-owner Jandel says he has ~12M TikTok followers ([GamesBeat](https://gamesbeat.com/janzen-madsen-interview/) [S]).
- Roblox gives a "Best Video Star" award: WaffleTrades won in 2025 ([PocketGamer.biz](https://pocketgamer.biz/roblox-reveals-2025-innovation-awards-winners) [S]) and Laughability in 2026 ([Roblox](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P]). Creators who *trade* and *react* drive these games.

## 3. "Steal" and "trade" social mechanics

**Why "steal" works:** it creates a visible loss, a revenge goal and a reason to guard your base (= stay online). All three 2025–26 mega-spikes used it (Grow a Garden added paid stealing; Steal a Brainrot; Steal An Egg).

**Why trading works:** it gives items social value beyond their game value. Adopt Me and Murder Mystery 2 have run trading economies for years.

**Risks:**
- Real-money trading and scams. Grow a Garden items were traded for cash on eBay/Discord, against Roblox ToS ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden) [U]).
- Peer trading must respect `PolicyService.IsPaidItemTradingAllowed` ([DevForum, May 26 2026](https://devforum.roblox.com/t/clarifying-requirements-for-paid-random-items/4654622) [P]).
- Pay-to-steal turns one kid's purchase into another kid's loss.

**Safer versions for Sam's TD:**
- **Raid an NPC base**, not a player's. You still get the "steal" thrill.
- **"Borrow" a friend's unit for one co-op match** (social, no loss).
- **Trade licence quiz** before trading valuable items, as Adopt Me does ([RoWatcher](https://rowatcher.com/news/adopt-me-2026-roadmap-every-confirmed-feature-event-rumored-update) [U]).
- **Trade only cosmetics**, never power.

## 4. Timed global events and "admin abuse"

- **What it is:** the owner joins live and uses admin powers (spawns weather, restocks shops, gives exclusive items) for everyone at once ([Wikipedia: SAB](https://en.wikipedia.org/wiki/Steal_a_Brainrot), guides [U]).
- **Evidence that live moments drive peaks:**
  - Grow a Garden's records all landed on update days: ~5M (May 18), 11.7M (May 31), 21.3M (Jun 21 2025) ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden) [U]).
  - The staged "admin war" between Grow a Garden and Steal a Brainrot on Aug 23 2025 coincided with a platform record. Roblox says **45M users played together one Saturday morning in August** ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]).
  - A Bruno Mars concert inside Steal a Brainrot drew 12.8M CCU in Jan 2026 ([PocketGamer.biz](https://www.pocketgamer.biz/roblox-reports-record-128m-concurrent-users-for-bruno-mars-virtual-concert/) [S]).
  - 99 Nights runs "update parties" that hand out Diamonds ([esports.gg](https://esports.gg/news/roblox/diamonds-99-nights-in-the-forest/) [U]).
- **Seasonal calendar (Halloween 2026, [U] from [StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) and [AllThingsHow](https://allthings.how/murder-mystery-2-halloween-schedule/)):** Adopt Me Oct 3 · Steal a Brainrot Oct 3–7 · Dress To Impress from Oct 10 · Fisch Oct 17–Nov 9 · Murder Mystery 2 Oct 18–Nov 16. Roblox's own "The Hunt: Roblox 20" started Sept 17 2026 ([Roblox](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P]).
- **For Sam:** a **monthly 30-minute live dev event** in the TD (Sam joins, drops a boss, gives a free event unit to everyone present, and repeats it later for other time zones so nobody is punished for bedtime).

## 5. Stock restock timers

- **What it is:** a shop shows a limited set of items and **refreshes on a timer**. Grow a Garden's seed shop is the famous one ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden) [U]). Grow a Garden 2's shop reportedly restocks every 5 minutes ([games.gg](https://games.gg/news/grow-a-garden-2-release-date/) [U]). All Star TD's summon gate refreshes hourly ([Adellion](https://adellion.com/roblox-tower-defense) [U]).
- **Why it works:** a real reason to check back, a "lucky moment" when a rare item appears, and a community job (fans built Discord stock-alert bots, per [Insider Gaming](https://insider-gaming.com/grow-a-garden-discord-stock-notifiers/) [U]).
- **Fair version:** the timer is **real** (never fake), the rare item **comes back** on a known rotation, and the **free path** can buy it. A "next restock in 4:59" timer is fine. "Only 2 left! Buy now!" when that isn't true is out.

## 6. Limited items

| Version | Example | Kid-safe? |
|---|---|---|
| Retired items become collectible | Adopt Me's Aztec Egg replaced by Endangered Egg, Feb 28 2026 [U] | OK for cosmetics/pets with no power edge |
| Event-only items | MM2 Ember weapons, 30-tier event pass (Oct 18–Nov 16 2026) [U] | OK with clear end dates |
| Must-be-online weekly drops | Grow a Garden weekly exclusives must be claimed while online [U] | Soften to "claim within 7 days" |
| Limited **power** (best unit only this week) | Common in gacha TDs | **Avoid.** Bring it back in a later rerun |

## 7. Update-day spikes

- **Fixed weekday drops are standard:** Steal An Egg and Anime Dice update **Saturdays**, Brookhaven typically **Fridays** ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]), Adopt Me **Fridays** ([RoWatcher](https://rowatcher.com/news/adopt-me-2026-roadmap-every-confirmed-feature-event-rumored-update) [U]), 99 Nights at **weekends** [U].
- **Spikes are big:** Steal An Egg's daily high of ~2.25M came at its "Dr. Scramble" update ([MaxPowerGaming](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]). Anime Last Stand went from 1,205 to 7,399 around one patch ([Earnaldo](https://earnaldo.com/blog/anime-last-stand-update-log) [U]). Animal Hospital peaked during a weekend update ([GosuGamers](https://www.gosugamers.net/entertainment/news/78741-animal-hospital-becomes-roblox-s-latest-horror-sensation-here-s-everything-you-need-to-know) [S]).
- **Title tags:** almost every top game puts its update in the name: "[🎃]", "[UPD]", "[NIGHT 3]", "[NEW STAGES]" ([rblxstat](https://rblxstat.com/lists/record-breaking-roblox-games) [U]). It tells returning players something changed.
- **The flip side:** event spikes fade. MM2 averaged 633K in Aug 2026 during its summer event and 249K in Sept after it ended ([MaxPowerGaming](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]).

## 8. Collabs: brands, musicians, YouTubers

| Collab | Result | Source |
|---|---|---|
| Dress To Impress × Charli XCX "Brat" (Aug 2024) | 651K+ CCU after launch | [Wikipedia](https://en.wikipedia.org/wiki/Dress_to_Impress_(video_game)) [U] |
| Dress To Impress × Lady Gaga (Aug 16–23 2025), × Wicked (Nov 2025) | Event content and press. Some backlash over access | same [U] |
| Steal a Brainrot × Bruno Mars concert (Jan 2026) | 12.8M CCU | [PocketGamer.biz](https://www.pocketgamer.biz/roblox-reports-record-128m-concurrent-users-for-bruno-mars-virtual-concert/) [S] |
| Steal a Brainrot × GOAT | Best Innovation in a Branded Game 2026 | [Roblox](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P] |
| SpongeBob Tower Defense | Best Use of IP 2025 | [PocketGamer.biz](https://pocketgamer.biz/roblox-reveals-2025-innovation-awards-winners) [S] |
| NASCAR + Driving Empire | Best Collaboration 2025 | same [S] |

**Solo-dev version:** brands won't call yet, but **mid-size YouTubers will** if you give them something: a unit/skin designed with them, a creator code, an early-access server. Make a one-page "creator kit" (what's new, clip ideas, codes).

## 9. The clone wave: how fast and how hard

**Speed (place creation dates from [rblxstat](https://rblxstat.com/lists/record-breaking-roblox-games) [U]; creation ≠ public launch):**

| Original | Created | Clones / followers created after it |
|---|---|---|
| Steal An Egg | Jul 25 2026 | Swing For Eggs (Aug 27), Break and Steal an Egg (Sep 5), Climb For Animals Eggs (Sep 6), Steal Animal Egg (Sep 11), Shoot For Eggs (Sep 13), Bike For Egg (Sep 15), Steal an Clown Egg (Sep 23), +1 Pickaxe Swing for Eggs (Sep 27), Fake an Egg (Oct 4) |
| +1 Speed Keyboard Escape | Jan 18 2026 | +1 Tongue Escape (Aug 11), +1 Loot To Forge (Aug 12), +1 Stone Skipping (Sep 5), +1 Venom Evolution (Oct 5) |
| Meccha Chameleon (Steam) | Steam hit, covered Jul 2026 | Roblox clones appeared "almost immediately", and their combined players passed the original's ([Kotaku, Jul 15 2026](https://kotaku.com/more-people-are-playing-meccha-chameleon-knock-offs-than-the-original-hit-steam-game-as-the-roblox-clone-machine-goes-into-overdrive-2000715371) [S]) |

**Rule of thumb from this data:** the first clones appear within **days to ~5 weeks**, and the wave keeps going for **2–3 months**. One clone (Break and Steal an Egg) hit a 1.3M record [U]. Clones can win big.

**Other forces:**
- **Lawsuits:** Steal a Brainrot's developers filed at least four suits against imitators since Nov 2025 ([Bloomberg, Mar 24 2026](https://www.bloomberg.com/news/articles/2026-03-24/roblox-s-hit-game-steal-a-brainrot-battles-its-many-imitators) [S], seen as summary; paywalled). Yet DoBig's own counsel says copyright doesn't protect "game concepts or genres" ([Kotaku](https://kotaku.com/more-people-are-playing-meccha-chameleon-knock-offs-than-the-original-hit-steam-game-as-the-roblox-clone-machine-goes-into-overdrive-2000715371) [S]). **Art and code are protected; the loop is not.**
- **Cross-platform clones:** Fortnite's "Stealing Brainrots" was sued over copied content ([Wikipedia](https://en.wikipedia.org/wiki/Steal_a_Brainrot) [U]).
- **Self-clones:** Grow a Garden 2 (Jun 12 2026) relaunched the formula with stealing and a day/night cycle ([games.gg](https://games.gg/news/grow-a-garden-2-release-date/) [U]).

**For Sam:** expect any original mechanic to be copied within a month. Your moat is **content cadence, community and your own art/characters**, not the idea.

## 10. Lifecycle curves of hits

| Game | Rise | Peak | After | Now (Oct 26 2026, LiveCounts [U]) | Now ÷ peak (our maths) |
|---|---|---|---|---|---|
| Grow a Garden | Mar 26 2025 launch → 1M CCU in ~a month ([GamesBeat](https://gamesbeat.com/janzen-madsen-interview/) [S]) | 21.6M, Jul 2025 [P] | Out of top 10 by Dec 2025 [S] | 15,274 | ~0.07% |
| Steal a Brainrot | May 16 2025 → 5M by Jul ([Wikipedia](https://en.wikipedia.org/wiki/Steal_a_Brainrot) [U]) | 25.87M, Oct 11 2025 (Guinness) [S] | ~215K by ~Mar 2026 [U] | 276,574 | ~1.1% |
| Escape Tsunami for Brainrots | Dec 15 2025 → #1 in Jan 2026 [U] | ~5M [U] | ~164K by ~Mar 2026 [U] | (not in top 97) | ~3% by Mar |
| Animal Hospital | May 10 2026 → 57K in month one → 580K Jun 28 [S] | 736,948, Jul 5 2026 (Rolimons) [S] | −90% Aug → Sept [U] | 21,537 | ~2.9% |
| Steal An Egg | Jul 25 2026 → 500K+ by Aug 24 [U] | 13.8–14.3M, Sept 2026 [U] | ~969K end of Sept [U] | 765,349 | ~5–6% (still early) |
| +1 Speed Keyboard Escape | Jan 2026 | 3.69M, Sept 26 2026 [U] | −61.5% Aug → Sept monthly [U] | 37,953 | ~1% |
| **Contrast: evergreens** | Brookhaven (2020), Adopt Me (2017), MM2 (2014), Blox Fruits (2019) | — | Top 10 for years; spikes on events | 136K–375K | n/a |

**The typical spike shape (2025–26):**
1. **Rise: 3–8 weeks** from small to millions (Grow a Garden ~1M in a month; Animal Hospital ~8 weeks to peak).
2. **Peak on an update or live event**, not on a random day.
3. **Drop: −60% to −90% within 1–2 months** after peak, faster when school restarts in Sept ([MaxPowerGaming](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]).
4. **Plateau at ~0.1–5% of peak** (our maths). That can still be tens of thousands of players, a great outcome for a solo dev.

**Market concentration is rising:** the biggest title's share of top-10 visits went from 22% (Q1 2025) to 43% (Q4 2025), and Q2 2025 was the first quarter with any game above 10M peak CCU ([Newzoo via GameDevReports](https://gamedevreports.substack.com/p/newzoo-top-roblox-games-in-2025) [S]). Winner-takes-most at the top, but the top 10 share of *hours* is falling ([Outlook Respawn, Q2 2026](https://respawn.outlookindia.com/gaming/gaming-news/roblox-q2-2026-revenue-soars-36-to-15b-despite-bookings-miss) [S]). There's room in the middle, which is where a solo TD lives.

## 11. How a solo dev catches a trend early

You won't out-ship DoBig on a full clone. Your edge is **adding a trend layer to your existing game within a week**: a map skin, an event boss, a summon banner theme, a limited cosmetic.

### Signal sources (what each tells you)

| Signal | Where | Lead time | Watch for |
|---|---|---|---|
| New games entering record lists | [rblxstat records](https://rblxstat.com/lists/record-breaking-roblox-games) (sort by creation date) | Weeks | Games created in the last 30 days with 50K+ records |
| "Growing" verdicts and 30-day % | [RoWatcher](https://rowatcher.com) game pages | Days–weeks | +100% over 30 days (e.g., Cameraman TD +109.9% in Oct 2026 [U]) |
| Live top 100 + 24h peak | [LiveCounts](https://livecounts.nl/roblox-charts/), Rolimons | Hours | 24h peak far above "now" means event/update spikes |
| Roblox's own charts | Roblox app → Charts | Hours | New names in trending/up-and-coming sorts (sort names change, so check what's live) |
| Code-guide pages | PC Gamer, Pocket Tactics, ProGameGuides | ~1–3 weeks after breakout | When guide sites start a "codes" page, the game has a mass audience (Cameraman TD codes pages by Oct 2026 [U]) |
| YouTube Shorts / TikTok | Search "roblox" + sort by recent | Days | The same mechanic or character in 3+ creators' clips in one week |
| Steam viral hits | Steam top sellers / trending | Days | Cheap, simple multiplayer hits get Roblox clones fast (Meccha Chameleon [S]) |
| Policy and platform news | [Roblox newsroom](https://about.roblox.com/newsroom), DevForum Announcements | Before it hits you | Rules that kill a mechanic (reward-for-watching feeds, gacha rules) |
| Seasonal search patterns | [Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P] | Months | Horror searches rise before Halloween; Halloween searches spike Sept–Oct |
| Awards | Roblox Innovation Awards (Sept) | Yearly | What Roblox staff want to promote (2026: Animal Hospital, kid-safe horror) |

### Trend filter (all five must pass before you build anything)

1. **Fits TD?** Can it be a map, enemy, boss, unit or event in your game?
2. **Kid-safe?** No borrowed IP you can't license, no gore, no watch-to-earn, no pay-to-steal.
3. **Has it lasted 2+ weeks?** One-week memes are gone before you ship.
4. **Can you ship it in ≤ 7 days?** If not, skip it.
5. **Does it add retention, not just a spike?** E.g., a new evolution path, not just a hat.

## 12. Weekly trend-watching routine (40 minutes, every Sunday)

Sunday works because Saturday is the big update day for top games.

| Min | Step | Output |
|---|---|---|
| 0–10 | LiveCounts top 100 + rblxstat records: note **new names** and anything whose 24h peak is 2x+ its "now" | 3–5 names in your trend log |
| 10–15 | RoWatcher: check the 30-day % for those names + the top 5 TDs | "Rising / flat / falling" next to each |
| 15–25 | YouTube Shorts + TikTok: search "roblox" (recent) and "roblox tower defense" | Clip types that repeat 3+ times |
| 25–30 | Roblox newsroom + DevForum Announcements | Any rule that changes your design or store |
| 30–35 | Play the #1 new game for 5 minutes | Its first-5-minutes in 3 bullets |
| 35–40 | Run the 5-point trend filter. Decide: **ignore / watch / build this week** | One decision, written down |

**Trend log template** (keep it in a note on your phone):

```
Date:
New names (source, CCU, tag [U]):
Rising TDs:
Repeating clip type:
Policy change:
Decision (ignore / watch / build) + why:
Next check:
```

---

## Ethics box: viral hooks we won't use

- **Reward-for-watching feeds** (banned for Kids/Select, Aug 2026 [S]).
- **Pay-to-steal / pay-to-grief** and buyable admin powers.
- **Fake timers and fake scarcity** ("only 2 left!" when false).
- **Must-be-online-now** rewards that punish kids for school or bedtime. Repeat live events across time zones.
- **Codes only in Discord** (13+ platform). Put codes in-game too.
- **Borrowed meme IP** you don't have rights to.

See `07-engagement-and-retention/03-ethics-and-law-for-kids-games.md`.

## Exercise (one sitting)

1. Do the 40-minute routine once, today. Fill in the trend log.
2. Pick the strongest trend that passes all 5 filters and write a **7-day "trend layer" plan** for your TD: what you'll build each day, what goes in the game title tag, and what clip you'd want a YouTuber to make.
3. Write down the **metric** you'll check one week after shipping it (e.g., Day-1 return rate of new players, average session length, CCU on update day vs the previous Saturday).

---

## 🤖 Train the Model

**What the model should learn:** to explain why a Roblox game went viral and why it faded, using the meme → clip → chart → clone → decline cycle. It should estimate clone timing and lifecycle risk from real data, spot trend signals early, and turn a trend into a fast, kid-safe content layer for an existing game, refusing dark-pattern versions.

**Dataset:** `08-roblox/train/trends.jsonl` (viral-mechanic explanations, clone-wave timing, lifecycle reading, trend-filter decisions, critiques of trend-chasing ideas, a weekly routine).

**Eval:** `08-roblox/train/trends.eval.jsonl`. A good answer:
- separates spike drivers (events, update days) from retention drivers (friends, collection, cadence);
- gives a realistic clone/decline expectation with sourced examples and tags;
- applies the trend filter and proposes a ≤7-day trend layer rather than a full clone;
- rejects watch-to-earn, pay-to-steal and fake scarcity, and offers a safe alternative.
