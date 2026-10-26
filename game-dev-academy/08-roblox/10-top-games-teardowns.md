# Top Roblox Games: Teardowns (2024–2026)

> **What you'll learn**
> - What the biggest Roblox games of 2024–2026 actually do in the first 5 minutes, why kids come back, and how they make money.
> - Which of their hooks are fair and which are dark patterns we will not copy.
> - A cross-game pattern table you can check your own game against.

**Data is as of Oct 26, 2026.** Every number has a source, a date and a tag: **[P]** platform said it, **[S]** press/analyst, **[U]** community tracker or rumour. See `CONTRIBUTING.md`.

---

## Read this first: how to read Roblox player numbers

- **CCU** = concurrent users, meaning people in the game at the same moment. **Peak CCU** is the highest CCU ever recorded.
- Only Roblox's own posts are **[P]**. Every tracker (RoWatcher, Rolimons, LiveCounts, rblxstat, RoVitals, GGAID) is **[U]**. They **disagree a lot**. For example, Steal An Egg's record is listed as 14.3M (RoWatcher), 13.8M (LiveCounts) and "approaching 9.9M" (Rolimons via Player.one), all in Sept 2026.
- A tracker's "all-time peak" often means "**since we started tracking**". LiveCounts shows Murder Mystery 2's "all-time peak" as 2.24M on 25 Oct 2026, but that only covers the window it has watched. Don't treat it as a lifetime record.
- **Bots inflate some counts.** An analyst (TD Cowen) alleged bot activity around Grow a Garden and later withdrew the manipulation claim ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden) [U]). A tracker write-up flagged bot farming in Murder Mystery 2's August 2026 numbers ([MaxPowerGaming, Oct 2026](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]).
- **Rule for Sam:** quote ranges, name the tracker, and compare like with like (same tracker, same time of day).

## The platform in late 2026 (why "what wins" changed)

| Fact | Number | Source |
|---|---|---|
| Daily active users, Q2 2026 | 123M, up 10% YoY. Q3 2025 peak was ~151–152M | [Shacknews, Jul 30 2026](https://www.shacknews.com/article/150208/roblox-daus-grew-10-percent-yoy) [S] |
| Bookings growth, Q2 2026 | +8% YoY | [Dexerto, Aug 5 2026](https://www.dexerto.com/roblox/roblox-loses-70-billion-in-value-as-company-blames-lack-of-viral-games-3395064/) [S] |
| Why bookings slowed | CFO: "a greater-than-expected shift of engagement from high monetizing 2025 vintage viral games" to newer/evergreen games that earn less per hour | same [S] |
| Discovery now optimises for | "measured long-term retention". Games built for short-term monetisation get fewer impressions, mainly with US under-13s | [Kotaku, Aug 5 2026](https://kotaku.com/roblox-tanked-9-billion-in-a-single-day-after-the-company-admitted-it-was-directing-fewer-kids-toward-viral-games-that-emphasize-short-term-monetization-2000722002) [S] |
| Top-10 games' share of hours | ~20%, vs ~30% three years earlier | [Outlook Respawn, Q2 2026](https://respawn.outlookindia.com/gaming/gaming-news/roblox-q2-2026-revenue-soars-36-to-15b-despite-bookings-miss) [S] |
| Kids & Select accounts | Kids (5–8) see only Minimal/Mild games. Select (9–15) adds Moderate. Creators need ID verification, 2-step verification and an active Roblox Plus subscription. Rolled out early June 2026 | [Roblox newsroom, Apr 13 2026](https://about.roblox.com/newsroom/2026/04/introducing-roblox-kids-and-select-accounts) [P] |
| Paid random items (gacha) | Per-item odds shown as % summing to 100. Pity/luck effects must be disclosed. Must use `PolicyService.ArePaidRandomItemsRestricted`. Live May 26 2026 | [DevForum Announcements, May 26 2026](https://devforum.roblox.com/t/clarifying-requirements-for-paid-random-items/4654622) [P] |
| "Watch-feed for rewards" ban | Games that combine a media feed, autoplay/infinite scroll and a reward for watching are removed from the Kids/Select catalogs | [Kotaku, Aug 26 2026](https://kotaku.com/roblox-cracks-down-on-doomscrolling-games-like-steal-an-egg-that-forces-players-to-watch-reels-while-running-on-a-treadmill-2000727952) [S] |

**What this means for you:** in 2025, raw virality plus heavy monetisation won. In 2026, Roblox's own algorithm rewards **games kids keep coming back to**. It also sorts under-16s into age-gated catalogs. A kid-safe, retention-first game is now the commercial play as well as the ethical one.

---

## The chart right now (snapshot)

LiveCounts top 10 at 19:50 UTC, Oct 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]):

| # | Game | Playing now | 24h peak |
|---|---|---|---|
| 1 | Steal An Egg | 765,349 | 1,329,499 |
| 2 | Brookhaven RP | 375,204 | 558,480 |
| 3 | Murder Mystery 2 | 310,812 | 2,239,955 |
| 4 | Steal a Brainrot | 276,574 | 320,465 |
| 5 | Adopt Me! | 243,447 | 268,241 |
| 6 | 99 Nights in the Forest | 162,891 | 282,863 |
| 7 | Jujutsu Shenanigans | 141,136 | 252,614 |
| 8 | RIVALS | 138,504 | 206,067 |
| 9 | Blox Fruits | 136,447 | 229,800 |
| 10 | Dress To Impress | 97,172 | 155,437 |

For comparison, Grow a Garden was at #85 (15,274 playing) and Tower Defense Simulator at #84 (15,393) in the same snapshot [U]. The 2026 Roblox Innovation Awards (Sept 12 2026) went to Animal Hospital (Best New Game, People's Choice, Creative Direction, Builderman Award), RIVALS, 99 Nights in the Forest, +1 Speed Keyboard Escape, Jujutsu Shenanigans and others ([Roblox newsroom](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P]).

---

## Teardowns

How to read each card: "**First 5 minutes**" is drawn from guides and press descriptions. Play it yourself before relying on it (see the exercise). Where a price isn't verified, the card says **not verified** rather than guessing.

### 1. Grow a Garden (2025's record-breaker)

| | |
|---|---|
| **Peak CCU** | 21.6M, Guinness "most concurrently played video game", July 2025 ([Roblox Replay, Dec 16 2025](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]). Jandel cites 22.3M ([GamesBeat, Sept 7 2025](https://gamesbeat.com/janzen-madsen-interview/) [S]) |
| **Now** | 15,274 playing, Oct 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]). Fell out of the top 10 by Dec 2025 ([Newzoo via GameDevReports](https://gamedevreports.substack.com/p/newzoo-top-roblox-games-in-2025) [S]). Grow a Garden 2 launched Jun 12 2026 ([games.gg](https://games.gg/news/grow-a-garden-2-release-date/) [U]) |
| **Genre** | Idle farming / social economy |
| **Core loop** | Buy seeds → plant → crops grow (even offline) → harvest and sell → buy rarer seeds |
| **First 5 minutes** | You get a plot and a few seeds. Planting is one tap. The first harvest comes fast and the shop is right there. Zero fail state ("low stakes" per [Game File, May 2025](https://www.gamefile.news/p/grow-a-garden-roblox-interview) [S]) |
| **Retention hooks** | Offline growth. A rotating seed **stock** that goes in and out. Weekly exclusives you must claim **while online**. Live "admin abuse" events where the owner spawns weather, restocks shops and gives items. Pets from eggs. Trading ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden) [U]) |
| **Monetisation** | Robux to skip waiting, unlock perks and **steal other players' crops**. Pets from loot boxes ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden) [U]). Prices **not verified**. A former Square Enix executive called it "somewhat evil" because of repeated pay-to-speed-up and pay-to-steal prompts ([Insider Gaming, Jul 18 2025](https://insider-gaming.com/former-square-enix-boss-calls-roblox-grow-a-garden-somewhat-evil/) [S]) |
| **Cadence** | Weekly updates from the start of the Splitting Point partnership ([GamesBeat](https://gamesbeat.com/janzen-madsen-interview/) [S]). Each record lined up with an update: Blood Moon ~5M (May 18), Bizzy Bees 11.7M (May 31), Summer 21.3M (Jun 21 2025) ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden) [U]) |
| **Art** | Bright, blocky, low-detail. Readable on a phone at a glance |
| **Why kids share** | "Everyone likes to farm, to watch something grow" (Jandel). A mutated rare crop is a screenshot. Live admin events are a "be there now" moment |
| **Growth story** | ~500 CCU when Splitting Point partnered → ~100K in ~2 weeks → 1M in ~a month ([GamesBeat](https://gamesbeat.com/janzen-madsen-interview/) [S]). The original was built by a 16-year-old in about 3 days ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden) [U]) |
| **Dark-pattern flags** | Pay-to-steal from other kids. Claim-while-online FOMO. Paid loot-box pets. Real-money trading on eBay/Discord (against Roblox ToS) |
| **What Sam can steal** | Offline progress. A **visible restock timer** that gives a reason to check back (keep it fair and free). Live dev events. A dead-simple first action. Weekly updates |

### 2. Steal a Brainrot (the CCU record holder)

| | |
|---|---|
| **Peak CCU** | "Over 25 million", Sept 2025 ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]). 25.4M in Oct 2025 ([PocketGamer.biz](https://www.pocketgamer.biz/robloxs-steal-a-brainrot-becomes-first-game-to-surpass-25m-concurrent-players/) [S]). A Bruno Mars in-game concert drew 12.8M CCU in Jan 2026 ([PocketGamer.biz](https://www.pocketgamer.biz/roblox-reports-record-128m-concurrent-users-for-bruno-mars-virtual-concert/) [S]) |
| **Now** | ~215K around late Mar 2026, "a 99.2% decline from peak" ([RoWatcher](https://rowatcher.com/news/is-the-brainrot-trend-dying-what-ccu-data-from-three-top-games-reveals) [U]). 276,574 on Oct 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]) |
| **Genre** | Idle collector + PvP stealing ("capture the flag with meme characters") |
| **Core loop** | Buy brainrots off a conveyor → they earn passive income in your base → steal rarer ones from others → rebirth for multipliers |
| **First 5 minutes** | Small cash, a conveyor of silly characters, a base. Within a minute you see someone run off with a character, and you want to do it too |
| **Retention hooks** | Passive income. Theft (both revenge and defending). A base shield button. Traps. Rebirth. "Admin abuse" events with exclusive characters ([Wikipedia](https://en.wikipedia.org/wiki/Steal_a_Brainrot) [U]) |
| **Monetisation** | Traps and items for in-game cash or Robux. Critics said the best items are cash-only and **server admin powers can be bought** (Polygon, cited by [Wikipedia](https://en.wikipedia.org/wiki/Steal_a_Brainrot) [U]). Prices **not verified** |
| **Cadence** | Frequent numbered updates ("Update 44" by ~Mar 2026) and regular events. Each event peak was followed by a steeper drop than the last ([RoWatcher](https://rowatcher.com/news/is-the-brainrot-trend-dying-what-ccu-data-from-three-top-games-reveals) [U]). Halloween "Haunted Fuse" ran Oct 3–7 2026 ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]) |
| **Art** | AI-meme "Italian brainrot" characters the devs did not create ([mobilegamer.biz, Jan 5 2026](https://mobilegamer.biz/everything-you-always-wanted-to-know-about-roblox-brainrot-but-were-afraid-to-ask/) [S]) |
| **Why kids share** | The characters are already TikTok memes, and a theft clip is drama. Viral clips show kids upset after being robbed ([Wikipedia](https://en.wikipedia.org/wiki/Steal_a_Brainrot) [U]) |
| **Business** | Owned by DoBig Studios (also linked to Steal An Egg). Licensed to Fortnite as "Steal the Brainrot" (500K CCU, Sept 13 2025). A character was pulled over a licensing dispute in Sept 2025. Lawsuits against copycats ([Wikipedia](https://en.wikipedia.org/wiki/Steal_a_Brainrot) [U]; [Bloomberg headline, Mar 24 2026](https://www.bloomberg.com/news/articles/2026-03-24/roblox-s-hit-game-steal-a-brainrot-battles-its-many-imitators) [S], paywalled) |
| **Dark-pattern flags** | Loss-aversion theft aimed at young kids. Pay-for-admin-powers over other players. Borrowed meme IP is a legal risk |
| **What Sam can steal** | A **visible "thing that earns while you watch"**. A short, readable PvP moment. Events built around a named character. Don't copy the unlicensed meme IP or the pay-to-grief |

### 3. Steal An Egg (the #1 game of late 2026)

| | |
|---|---|
| **Peak CCU** | 14.3M on Sept 19 2026 ([RoWatcher](https://rowatcher.com/games/10563114921/steal-an-egg), [RoVitals](https://rovitals.com/game/107778070777162) [U]). 13.79M on Sept 26 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]). September average 1,447,549, up 167% on August ([MaxPowerGaming, Rolimons data](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]) |
| **Now** | 765,349 playing, Oct 26 2026, still #1 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]) |
| **Genre** | Steal/collect + pet hatching + speed stat |
| **Core loop** | Grab eggs (from biomes guarded by tougher guardians for better eggs) → hatch pets that earn money every second → upgrade base and speed → steal eggs from others ([eGamers, Aug 25 2026](https://egamers.io/robloxs-no-1-game-steal-an-egg-was-pulled-hours-after-reaching-the-top/) [U]; [Player.one, Sept 9 2026](https://www.player.one/robloxs-steal-egg-beating-some-platforms-biggest-games-164086) [S]) |
| **First 5 minutes** | Start with a chicken. Run for an egg, get chased, hatch it, and watch money tick. Average session is ~15 minutes (Rolimons estimate via [Player.one](https://www.player.one/robloxs-steal-egg-beating-some-platforms-biggest-games-164086) [S]) |
| **Retention hooks** | Weekly Saturday updates ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]). Sept 2026 alone added the Rift update, Angels & Demons, enemy drones and a boss fight plus egg-to-pet lab ([MaxPowerGaming](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]) |
| **Monetisation** | Speed can be bought with Robux or earned on treadmills ([eGamers](https://egamers.io/robloxs-no-1-game-steal-an-egg-was-pulled-hours-after-reaching-the-top/) [U]). Prices **not verified** |
| **The scandal** | The treadmills showed a **"Reels" feed of short videos** (mostly AI content and uncredited TikToks) that rewarded watching. Roblox pulled the game around Aug 24–25 2026 and then banned reward-for-watching feeds from Kids/Select catalogs. The game came back without the feed ([Kotaku, Aug 26 2026](https://kotaku.com/roblox-cracks-down-on-doomscrolling-games-like-steal-an-egg-that-forces-players-to-watch-reels-while-running-on-a-treadmill-2000727952) [S]; [TechSpot, Aug 27 2026](https://www.techspot.com/news/113630-roblox-cracking-down-games-reward-kids-doomscrolling.html) [S]) |
| **Why kids share** | Same "steal" drama as Brainrot, plus pets (Adopt Me's oldest pull). Egg-hatching reveals make good clips |
| **Dark-pattern flags** | **Pay kids to doomscroll** (now banned for under-16 catalogs). Pay-for-speed in a game where speed decides who gets robbed |
| **What Sam can steal** | Weekly Saturday drops with a **boss** each week. "Better reward = tougher guardian" risk/reward. Reskinning a proven loop with a broader theme (pets beat memes for staying power) |

### 4. 99 Nights in the Forest (co-op survival that kept its audience)

| | |
|---|---|
| **Peak CCU** | 14.2M ([PC Gamer via inkl](https://www.inkl.com/news/with-a-peak-player-count-of-14-2-million-99-nights-in-the-forest-has-an-audience-other-multiplayer-games-would-kill-for-to-find-these-behemoth-playerbases-you-need-to-be-on-a-platform-like-roblox) [S]) |
| **Now** | 162,891 playing (24h peak 282,863), Oct 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]). 26B visits by Apr 2026 ([Wikipedia list](https://en.wikipedia.org/wiki/List_of_Roblox_games) [U]) |
| **Awards** | Best Adventure + Best Horror 2025 ([Variety](https://variety.com/2025/digital/news/grow-a-garden-roblox-innovation-awards-2025-winners-1236510387) [S]). Best Survival 2026 ([Roblox](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P]). Film rights to 20th Century Studios ([TheWrap](https://www.thewrap.com/creative-content/movies/20th-century-studios-roblox-game-99-nights-in-the-forest/) [S]) |
| **Genre** | Co-op survival-horror (light) |
| **Core loop** | Gather wood and food by day → keep the campfire alive → survive the night's monster → push to day 99 |
| **First 5 minutes** | Drop into a forest with friends and a fire. Instant shared goal ("keep the fire going") and a scary thing in the dark |
| **Retention hooks** | Classes bought with **Diamonds** (earned from daily quests, badges, chests, surviving to day 50/99, or bought with Robux). Weekend updates. "Update parties" where devs hand out Diamonds ([esports.gg](https://esports.gg/news/roblox/diamonds-99-nights-in-the-forest/) [U]) |
| **Monetisation** | Diamonds for Robux, plus Robux skips on class upgrades. One guide cites 250 Robux to skip a level ([Deltia's Gaming](https://deltiasgaming.com/all-classes-in-99-nights-in-the-forest-roblox) [U]). Class prices vary by guide, so they're **not verified** |
| **Art** | Moody low-poly forest. Simple silhouettes that read as scary without gore |
| **Why kids share** | "We made it to night 40" is a team brag. Jump-scare clips |
| **What Sam can steal** | **A shared, visible goal** for friends (the fire). Day counters as a milestone ladder. Classes as horizontal, earnable progression. Horror tuned to "spooky not gory", which keeps the maturity label low |

### 5. Dead Rails (2025 hit, now small)

| | |
|---|---|
| **Peak CCU** | Conflicting: "over 600K one weekend" ([GameAnalytics blog](https://www.gameanalytics.com/blog/dead-rails-and-the-hit-makers-formula) [U]) vs a tracker peak of 79K on Nov 28 2025 ([RoWatcher](https://rowatcher.com/games/7018190066/dead-rails/dying) [U]). Treat the record as **unknown** |
| **Now** | 21,630 playing, Oct 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]) |
| **Awards** | Best Strategy + Best Use of Tech 2025 ([PocketGamer.biz](https://pocketgamer.biz/roblox-reveals-2025-innovation-awards-winners) [S]) |
| **Genre** | Co-op run-based survival (Wild West train journey) |
| **Core loop** | Fuel the train → stop to scavenge towns → fight the undead at night → reach the end of the line |
| **Retention hooks** | Run variety (different stops), classes, co-op. Seasonal events ("[EVENT]" in the title) |
| **Why it faded** | **Not known** from sources. Run-based games need fresh content to stay new |
| **What Sam can steal** | **A journey with a finish line** (the train). Sam's TD story mode can use the same "map progress bar" feeling |

### 6. Fisch (and the fishing wave)

| | |
|---|---|
| **Peak CCU** | No verified all-time figure found. rblxstat lists a 511K record ([rblxstat](https://rblxstat.com/lists/record-breaking-roblox-games) [U]) |
| **Now** | 63,420 (24h peak 90,885). Rival **Fish It!** is at 73,387. Both Oct 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]). The fishing category was +55% YoY in Q1 2026 ([RoWatcher](https://rowatcher.com/news/top-10-roblox-games-by-players-march-2026-data-breakdown) [U]) |
| **Genre** | Collection RPG (fishing) |
| **Core loop** | Cast → timing minigame → catch → sell or log in your bestiary → better rod → new waters |
| **Retention hooks** | Huge bestiary (collection). Rare/mutated catches. Named seasonal events (FischFright 3, Oct 17–Nov 9 2026) ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]) |
| **Monetisation** | Not verified |
| **What Sam can steal** | **A tiny skill minigame inside a collection loop**. A bestiary page that shows "?" silhouettes for what's missing |

### 7. Dress to Impress (fashion, the top game without combat)

| | |
|---|---|
| **Peak CCU** | 651K+ after the Charli XCX "Brat" collab in Aug 2024 ([Wikipedia](https://en.wikipedia.org/wiki/Dress_to_Impress_(video_game)) [U]). Other claims range from 1.5M to 1.73M (unverified) |
| **Now** | 97,172 playing, Oct 26 2026 (#10) ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]) |
| **Genre** | Social creative competition |
| **Core loop** | Theme prompt → 360 seconds to style an outfit → runway → players star-rate each other → podium ([Wikipedia](https://en.wikipedia.org/wiki/Dress_to_Impress_(video_game)) [U]) |
| **First 5 minutes** | You're in a round within seconds, with a clear theme and timer. Being judged by real players is the hook |
| **Retention hooks** | Ranks unlock items. Limited-time quest events. Codes. Brand collabs: Charli XCX (2024), Lady Gaga (Aug 16–23 2025), Wicked (Nov 2025) |
| **Monetisation** | Items for in-game currency or Robux. Prices **not verified** |
| **Who made it** | A developer known as Gigi, who started it at 14. Released Nov 11 2023 |
| **Why kids share** | Every round makes a shareable outfit. Themes are prompts for TikTok |
| **What Sam can steal** | **Short rounds with a social judge**. Collabs as event content. Tablet players like creative games ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]) |

### 8. Blox Fruits (the evergreen)

| | |
|---|---|
| **Stability** | In the top 10 **every month of 2025** ([Newzoo via GameDevReports](https://gamedevreports.substack.com/p/newzoo-top-roblox-games-in-2025) [S]). 136,447 playing on Oct 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]) |
| **Awards** | Best Action 2025 ([Variety](https://variety.com/2025/digital/news/grow-a-garden-roblox-innovation-awards-2025-winners-1236510387) [S]) |
| **Genre** | Anime action RPG (One Piece-inspired) |
| **Core loop** | Quest → level → find or buy a Devil Fruit power → new sea/zone → raids and bosses |
| **Retention hooks** | Long level ladder. Fruit rarity and trading. Fruit "reworks". A long-promised Fourth Sea, reported for Dec 2026 but **not confirmed** ([RoWatcher](https://rowatcher.com/news/blox-fruits-update-30-and-beyond-fourth-sea-roadmap-and-new-fruits-coming-2026) [U]) |
| **Monetisation** | Fruits and passes for Robux. Prices **not verified**. It was the #1 top-earning game for almost a year until Sept 2024 ([Beebom](https://beebom.com/anime-vanguards-surpasses-blox-fruits-top-earning-roblox-game/amp/) [S]) |
| **What Sam can steal** | **One fantasy power the whole game orbits** (fruits = Sam's hero units). A huge far-off goal teased for months |

### 9. Adopt Me! (pets + trading, since 2017)

| | |
|---|---|
| **Now** | 243,447 playing, Oct 26 2026 (#5) ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]) |
| **Genre** | Pet-raising roleplay + trading economy |
| **Core loop** | Hatch a pet → care for it (tasks) → it grows → trade or fuse toward Neon/Mega Neon |
| **Retention hooks** | Weekly Friday updates. New eggs replace old ones (the Endangered Egg replaced the Aztec Egg on Feb 28 2026). Seasonal festivals. A **trade-licence quiz** before trading Legendary/Ultra-Rare pets ([RoWatcher](https://rowatcher.com/news/adopt-me-2026-roadmap-every-confirmed-feature-event-rumored-update) [U]) |
| **Monetisation** | Eggs, pets and vehicles for Robux. Prices **not verified** |
| **What Sam can steal** | **Retiring an item to make it collectible**. A *safety* gate on trading (the quiz) is a pattern worth copying for kids |

### 10. Brookhaven RP (the most searched game)

| | |
|---|---|
| **Signals** | #1 most-searched game of 2025 ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]). Top 10 every month of 2025 ([Newzoo](https://gamedevreports.substack.com/p/newzoo-top-roblox-games-in-2025) [S]). Record of 1,296,208 on Dec 19 2025 ([RoWatcher](https://rowatcher.com/news/top-10-roblox-games-by-players-march-2026-data-breakdown) [U]). 375,204 playing on Oct 26 2026 (#2) |
| **Owner** | Made by Wolfpaq, acquired by Voldex in 2025 ([Wikipedia list](https://en.wikipedia.org/wiki/List_of_Roblox_games) [U]) |
| **Genre** | Open roleplay town |
| **Core loop** | There isn't one. Pick a house, car and job, then make up stories with others. No win/fail state. Sessions are reportedly 45–60+ minutes ([RoWatcher](https://rowatcher.com/news/top-10-roblox-games-by-players-march-2026-data-breakdown) [U]) |
| **Monetisation** | Premium houses, vehicles and passes. Prices **not verified** |
| **Cadence** | Typically ships Fridays ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]) |
| **Note for 2026** | "Social hangouts" are **excluded by default** from Kids/Select catalogs ([Roblox](https://about.roblox.com/newsroom/2026/04/introducing-roblox-kids-and-select-accounts) [P]). Watch how RP games adapt |
| **What Sam can steal** | Little directly for TD. The lesson is that **friends are the content**: a lobby where friends can hang out between matches is cheap and sticky |

### 11. Murder Mystery 2 (a 12-year-old game back at #1–3)

| | |
|---|---|
| **Signals** | Created 2014. 24h peak of 2,239,955 on Oct 25 2026 during its Halloween event ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]). The summer event (Jul 23–Aug 23 2026) pushed the August average to 633K, and September fell to 249K once it ended ([MaxPowerGaming](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]) |
| **Genre** | Social deduction (Innocent / Sheriff / Murderer) |
| **Core loop** | Short rounds → roles are secret → survive or win → earn coins → unbox weapon skins → trade |
| **Retention hooks** | **Seasonal events with a 30-tier battle pass**, crafting (Cauldron) and an event box. Halloween 2026 runs Oct 18–Nov 16 ([AllThingsHow](https://allthings.how/murder-mystery-2-halloween-schedule/) [U]). Skin trading economy |
| **Monetisation** | Event battle pass, weapon boxes. Prices **not verified**. Boxes are paid random items, so odds must be disclosed |
| **What Sam can steal** | **An old game + a big seasonal event = a top-3 spike**. Sam can run a Halloween/Winter event every year in his TD |

### 12. Tower Defense Simulator (the TD benchmark)

| | |
|---|---|
| **Signals** | 30-day peak of 104,491 and 19,581 playing, Oct 3 2026 (Rolimons via [Adellion](https://adellion.com/roblox-tower-defense) [U]). All-time tracker peak of 104K on Sept 25 2026 ([RoWatcher](https://rowatcher.com/games/1176784616/tower-defense-simulator) [U]) |
| **Genre** | Co-op wave TD (zombies) |
| **Core loop** | Queue with up to a few players → place and upgrade towers → survive waves and bosses → earn coins → unlock towers |
| **Key difference** | **No summoning/gacha.** You unlock towers by beating bosses and buying them ([Adellion](https://adellion.com/roblox-tower-defense) [U]) |
| **Retention hooks** | Limited-time **event towers** in a steady rhythm: Kingpin (Jul 17–31 2026), Enforcer (Aug 14–21), then reworks ([AllThingsHow](https://allthings.how/tower-defense-simulator-events-schedule/) [U]). Difficulty ladder. Named update "nights" ("[NIGHT 3]" in the title in Oct 2026) |
| **Monetisation** | Premium towers, skins and passes. Prices **not verified**. Free $100 starting cash for joining the group |
| **What Sam can steal** | **Deterministic unlocks** (fair, kid-safe, and they pass gacha rules). A big seasonal event lifts the whole game. A tower *rework* counts as content |

### 13. Anime Vanguards (the anime-TD money machine)

| | |
|---|---|
| **Signals** | Launched Sept 8 2024. 215K+ CCU and **#1 top-earning game** within 10 days, displacing Blox Fruits ([Beebom, Sept 18 2024](https://beebom.com/anime-vanguards-surpasses-blox-fruits-top-earning-roblox-game/amp/) [S]). 30-day peak of 44,979 on Oct 3 2026 ([Adellion](https://adellion.com/roblox-tower-defense) [U]). Now titled "Vanguards: 2nd Anniversary" |
| **Genre** | Anime gacha TD |
| **Core loop** | Summon units on banners → place and upgrade in waves → clear story/raid/challenge → farm materials → evolve and trait-roll units → summon again |
| **Retention hooks** | Banners rotate. Evolutions. **Traits** rerolled with an item. Example: "Monarch" at 0.1% per roll with a 1,500-roll pity ([Sportskeeda](https://www.sportskeeda.com/roblox-news/anime-vanguards-traits-guide), [AllThingsHow](https://allthings.how/anime-vanguards-how-to-roll-the-0-1-monarch-trait-on-jotaro/) [U]). Big numbered updates (11.5 in Mar 2026) |
| **Monetisation** | Gems → summons (one guide: 50 gems per pull, 500 for 10 [U]). Rerolls, passes, boosts. Robux prices **not verified** |
| **Dark-pattern flags** | **0.1% odds with 1,500-roll pity is gambling-shaped for kids.** If any of it can be bought with Robux, Roblox's paid-random-items rules apply (disclosed odds, PolicyService gating) ([DevForum](https://devforum.roblox.com/t/clarifying-requirements-for-paid-random-items/4654622) [P]) |
| **What Sam can steal** | Unit **evolutions** and **modes** (story → raid → challenge → infinite). Banner rotation as a content calendar. Keep summons earned-only and odds generous (see `11-genre-playbooks.md`) |

**Other anime/trend TDs worth a look (Oct 2026, all [U]):** Universal Tower Defense Z, 242K tracker peak in Jun 2026 ([RoWatcher](https://rowatcher.com/games/7488190691/universal-tower-defense-z)). Cameraman Tower Defense (Skibidi theme), 75K peak on Oct 19 2026 and +110% over 30 days ([RoWatcher](https://rowatcher.com/games/10762636904/upd-cameraman-tower-defense/dying)). Garden Tower Defense, 18.6K 30-day peak. Alliance TD, launched Jun 2026, 20.8K. Slop TD, launched Jul 19 2026, 25.1K ([Adellion](https://adellion.com/roblox-tower-defense)). Anime Last Stand swung from 1,205 to 7,399 around its Aug 2026 patch ([Earnaldo tracker](https://earnaldo.com/blog/anime-last-stand-update-log)). Anime Adventures: 39,675 playing on Oct 26 ([LiveCounts](https://livecounts.nl/roblox-charts/)).

### 14. Blue Lock: Rivals (anime sports)

| | |
|---|---|
| **Signals** | Frequently searched in 2025 ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]). Tracker peak of 276K on Sep 13 2025 and ~4.55B visits ([RoWatcher](https://rowatcher.com/games/6325068386) [U]) |
| **Genre** | Arcade soccer with anime abilities |
| **Core loop** | Short matches → use your style's special moves → score → unlock or roll new styles/abilities |
| **Retention hooks** | New character-named updates (Sendou, Chigiri, Niko, Aiku in the title history). Tournaments |
| **Monetisation** | Spins/rolls for styles. Details **not verified** |
| **What Sam can steal** | **Name the update after the new character** in the game title. It's free marketing on the charts |

### 15. Forsaken (asymmetric horror)

| | |
|---|---|
| **Signals** | Best Survival 2025 ([Variety](https://variety.com/2025/digital/news/grow-a-garden-roblox-innovation-awards-2025-winners-1236510387) [S]). Peaks conflict: 138K+ ([RoWatcher](https://rowatcher.com/news/forsaken-s-floral-update-drives-the-survival-horror-hit-past-86k-players) [U]) vs a 382K record ([rblxstat](https://rblxstat.com/lists/record-breaking-roblox-games) [U]). 34,156 playing on Oct 26 2026 [U] |
| **Genre** | 1 killer vs ~8 survivors, still labelled alpha |
| **Core loop** | Survive or hunt → earn currency → unlock characters/skins |
| **What Sam can steal** | **Character rosters with distinct kits** create endless "who's best" content for YouTubers |

### 16. Animal Hospital (Anomaly) (2026's award winner and a lifecycle warning)

| | |
|---|---|
| **Signals** | Released May 10 2026. ~57K in month one, 580K+ on Jun 28, 736,948 peak on Jul 5 (Rolimons via [GosuGamers](https://www.gosugamers.net/entertainment/news/78741-animal-hospital-becomes-roblox-s-latest-horror-sensation-here-s-everything-you-need-to-know) [S]). Other trackers say 1.2–1.3M [U]. Fell from 358.5K (Aug) to 35.3K (Sept), **−90%** ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]). Won **4 Innovation Awards** on Sept 12 2026 ([Roblox](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P]) |
| **Genre** | Co-op "spot the anomaly" light horror |
| **Core loop** | Admit animal patients → treat with the right medicine → spot which patients are anomalies (photos, CCTV, sanity) → survive the shift |
| **Hooks** | Up to 4 players. 10 levelling **Classes**. Permanent Animal Coins. Shift streak badge. "Minimal" maturity rating |
| **Monetisation** | Some classes are Robux-only. Prices **not verified** |
| **Lesson** | Even an award-winning, well-made game lost 90% in a month once novelty faded. Plan **content depth** before the spike |
| **What Sam can steal** | **Kid-safe horror (Minimal rating)** opens the Kids/Select catalogs. Pair a cosy theme with tension. Copy the class system |

### 17. +1 Speed Keyboard Escape (the "+1" incremental wave)

| | |
|---|---|
| **Signals** | Best Party & Casual 2026 ([Roblox](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P]). Tracker peak of 3.69M on Sept 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]), now 37,953. Monthly CCU fell from 358K to 138K between Aug and Sept (−61.5%) ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]) |
| **Genre** | Incremental obby ("+1 speed every step") |
| **Core loop** | Run → speed +1 → reach farther stages → multipliers → escape |
| **Hooks** | Number-goes-up. ASMR keyboard sounds. Codes posted in Discord, including a 15,000-speed social code ([PC Gamer](https://www.pcgamer.com/roblox/1-speed-keyboard-escape-codes/) [U]) |
| **Dark-pattern flag** | **Discord-gated codes** push kids under 13 toward a 13+ platform |
| **What Sam can steal** | **Visible, constant number growth** in a tiny loop. A sensory hook (sound) that makes clips satisfying |

### Also on the chart in 2026 (short notes, all [U])

- **Ride A Pet**: hatch pets you can ride, and faster pets are better mounts. New in the Sept 2026 top 10 with a 117,637 Sept average ([MaxPowerGaming](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives)).
- **Escape Tsunami for Brainrots**: created Dec 15 2025, peaked near 5M, briefly #1 in Jan 2026, ~164K by ~Mar 2026 ([RoWatcher](https://rowatcher.com/news/is-the-brainrot-trend-dying-what-ccu-data-from-three-top-games-reveals)).
- **RIVALS** (Best Shooter 2026; Nosniy = Best Studio [P]) and **Jujutsu Shenanigans** (Best Action 2026 [P]): skill-based PvP holding 100K+.
- **The Hollow** (created Oct 13 2026, 452K record [U]) and **DONT SPLASH** (116K [U]): **October 2026 newcomers to watch**. Verify what they are before drawing lessons.

---

## Cross-game pattern table

✓ = clearly present, ~ = partly, blank = not a core part. Based on the cards above.

| Pattern | GAG | SAB | Egg | 99N | DTI | BF | AM | MM2 | TDS | AV | AH |
|---|---|---|---|---|---|---|---|---|---|---|---|
| First action in under 10 seconds, no fail state | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ~ |
| Progress while offline / passive income | ✓ | ✓ | ✓ | | | | ~ | | | ~ | |
| Shop stock / restock timer | ✓ | ✓ (conveyor) | ~ | | | ~ | ~ | | ~ | ✓ (banners) | |
| Steal / PvP loss | ✓ (paid) | ✓ | ✓ | | | ✓ | | ✓ | | | |
| Co-op shared goal | | | | ✓ | | ~ | | | ✓ | ✓ | ✓ |
| Trading economy | ✓ | ~ | ~ | | | ✓ | ✓ | ✓ | | ~ | |
| Collection / bestiary / roster | ✓ | ✓ | ✓ | ✓ (classes) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (classes) |
| Weekly update rhythm | ✓ | ✓ | ✓ (Sat) | ✓ (wknd) | ~ | ~ | ✓ (Fri) | ~ | ✓ | ✓ | ✓ |
| Live dev events / "admin abuse" | ✓ | ✓ | ~ | ✓ | ✓ (collabs) | | ✓ | ✓ (seasonal) | ✓ | ~ | |
| Gacha / paid random | ✓ (eggs) | | ~ | | | ~ (random fruit) | ✓ | ✓ (boxes) | | ✓ | |
| Meme or licensed IP | | ✓ | ~ | | ✓ (brands) | ✓ (anime-ish) | | | | ✓ (anime-ish) | |
| Readable at phone size | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ |
| Still top-10 a year later? | No | Yes | (new) | Yes | Yes | Yes | Yes | Yes | No (mid) | No (mid) | No |

**What the table says:**
1. **Collection is universal.** Every game on the list has something to collect.
2. **Weekly updates are the norm.** The 2026 hits ship on a fixed weekday.
3. **The 2025–2026 mega-spikes all had a "steal" or "loss" mechanic** (GAG, SAB, Steal An Egg). The games still in the top 10 a year later lean on **friends, collection and events** (99 Nights, Adopt Me, Brookhaven, MM2, Blox Fruits).
4. **TD is a durable mid-tier genre, not a spike genre right now.** Four TDs were in the Oct 26 2026 top ~100, none in the top 40 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]).

## Ethics box: hooks we will NOT copy

| Hook | Seen in | Why it's out |
|---|---|---|
| Rewards for watching an autoplay video feed | Steal An Egg (removed) | Banned for Kids/Select catalogs, Aug 2026 [S] |
| Pay to steal from / grief other kids | GAG, SAB | Turns other kids' loss into revenue. Pay-to-win |
| Buyable admin powers over a server | SAB (per critics) | Pay-to-win and pay-to-grief |
| 0.1% gacha with deep pity | Anime Vanguards traits | Gambling-shaped. Must disclose odds and gate by policy [P] |
| Claim-while-online exclusives | GAG | FOMO pressure. Prefer "claim within 7 days" |
| Codes only in Discord | +1 Speed | Discord is 13+. Post codes in-game or in the game description |

See `07-engagement-and-retention/03-ethics-and-law-for-kids-games.md`.

## Exercise (one sitting, ~60 min, on your phone)

1. Play **Steal An Egg**, **99 Nights in the Forest** and **Tower Defense Simulator** for 10 minutes each, fresh account if you can.
2. For each, write: seconds to first meaningful action, the first thing that made you want to come back, the first purchase prompt (what, when, how many Robux), and anything on the "will NOT copy" list.
3. Fill in a row for your own TD game in the pattern table. Circle the two blanks you'll fix first.

---

## 🤖 Train the Model

**What the model should learn:** to break any Roblox game into loop, first-5-minutes, retention hooks, monetisation and sharing. It should compare a game idea against the patterns of 2024–2026 winners, read tracker numbers sceptically (tag them [U] and name the tracker), and flag dark patterns aimed at kids. The skill is analysis and critique, not memorising CCU figures.

**Dataset:** `08-roblox/train/top-games.jsonl` (teardowns, pattern-matching, critiques of game ideas, reading conflicting CCU data).

**Eval:** `08-roblox/train/top-games.eval.jsonl`. A good answer:
- separates [P]/[S]/[U] sources and says when trackers disagree;
- names a specific mechanic and why it retains (not just "it's fun");
- flags pay-to-steal, reward-for-watching feeds and low-odds gacha as not OK for kids;
- connects lessons to Sam's tower-defense game with a concrete next step or metric.
