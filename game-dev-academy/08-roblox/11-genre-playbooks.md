# Genre Playbooks: What Works on Roblox Now

> **What you'll learn**
> - For each genre winning on Roblox in late 2026: how crowded it is, what it takes to compete, how it makes money, and how doable it is solo.
> - A deep tower-defense playbook (Sam's genre): summons, traits, evolutions, modes, wave pacing, bosses, speed-up, co-op, and how the top TDs differ.
> - Which designs survive Roblox's 2026 kid-safety and gacha rules.

**Data is as of Oct 26, 2026.** Tags: **[P]** platform, **[S]** press/analyst, **[U]** tracker/community. **Feasibility scores (1–5) are our judgment**, not data. Design numbers marked "starting point" are guesses to test, not market facts.

---

## The rules every genre now plays under (2026)

| Rule | What it means for design | Source |
|---|---|---|
| Discovery favours **long-term retention** | Hooks that bring kids back on Day 7 and Day 30 beat hooks that squeeze one session | [Kotaku, Aug 5 2026](https://kotaku.com/roblox-tanked-9-billion-in-a-single-day-after-the-company-admitted-it-was-directing-fewer-kids-toward-viral-games-that-emphasize-short-term-monetization-2000722002) [S] |
| **Roblox Kids (5–8)** sees Minimal/Mild games only. **Select (9–15)** adds Moderate | Keep violence and horror light if you want under-16 reach | [Roblox newsroom, Apr 2026](https://about.roblox.com/newsroom/2026/04/introducing-roblox-kids-and-select-accounts) [P] |
| Social hangouts and free-form drawing are **excluded by default** from Kids/Select | Roleplay and drawing games lose the youngest players unless approved | same [P] |
| To reach Kids/Select: ID/face verification + 2-step + questionnaire + **2 months of Plus/Premium or a refundable 1,000 R$ fee** + 250 engaged plays in 60 days + safety review (see lesson 05) | A small fixed cost plus an engagement threshold. Budget it | same [P] |
| **Paid random items**: per-item odds in % (sum 100), pity/luck effects disclosed, no "nothing" outcomes, gate with `PolicyService.ArePaidRandomItemsRestricted`, and offer a compliant alternative to ineligible users | Any gacha that touches Robux, even through a currency, is regulated | [DevForum Announcements, May 26 2026](https://devforum.roblox.com/t/clarifying-requirements-for-paid-random-items/4654622) [P] |
| Paid random items **blocked for Brazilian users under 18** from Mar 17 2026 | Real example of region gating. Expect more regions | [Bloxy News](https://x.com/Bloxy_News/status/2034153291899408514) [U] |
| No reward-for-watching media feeds for Kids/Select | Don't build "watch to earn" | [Kotaku, Aug 26 2026](https://kotaku.com/roblox-cracks-down-on-doomscrolling-games-like-steal-an-egg-that-forces-players-to-watch-reels-while-running-on-a-treadmill-2000727952) [S] |
| Device tastes: **mobile** → horror, escape, obby. **Tablet** → creative. **PC** → RPG, fighting | Sam is mobile-first, so lean toward short, readable, touch-friendly sessions | [Roblox Replay 2025](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P] |

---

## Genre summary matrix

Chart presence = games of that genre in the LiveCounts top ~100 on Oct 26 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]), counted by us from game names. Genres are our labels.

| Genre | Chart presence (examples) | Saturation | Spike or evergreen? | Kids-catalog fit | Solo feasibility |
|---|---|---|---|---|---|
| **Tower defense** | Anime Adventures (#31), Cameraman TD (#46), Vanguards (#67), TDS (#84) | Medium | Evergreen mid-tier | Good if gacha is earned-only and combat is cartoony | **3/5** (niche theme) · 2/5 (anime gacha) |
| Grow / steal / collect | Steal An Egg (#1), Steal a Brainrot (#4), Break and Steal an Egg (#16), Fake an Egg, Ride a Dino… | **Very high** | Spike | Mixed (stealing from kids, gacha eggs) | 3/5 to build, 1/5 to win |
| Simulator / incremental | PS99, Tap Simulator REBORN, Bee Swarm, Sol's RNG, +1 Speed… | High | Spike (+1) / evergreen (PS99) | Good | 4/5 |
| Survival / horror co-op | 99 Nights (#6), Dandy's World, Violence District, DOORS, Evade, Forsaken, Animal Hospital… | High | Both | Only "spooky not gory" | 3/5 |
| Obby | Tower of Hell, DONT SPLASH, escape obbies | Very high | Short spikes | Good | 5/5 to build · 2/5 to stand out |
| Roleplay / life | Brookhaven (#2), Berry Avenue, LifeTogether, Emergency Hamburg, Dreamville | High, dominated by incumbents | Evergreen | **Hangouts excluded by default** | 1/5 |
| Tycoon / shop sim | Sell Fries!, My Small Business; Karinderya (157K record [U]) | Medium | Short spikes | Good | 4/5 |
| Fighting / anime | Jujutsu Shenanigans (#7), Blox Fruits (#9), Strongest Battlegrounds, Slayers 2 | High | Evergreen | Moderate at best | 2/5 |
| Sports | Illegal Soccer, Volleyball Legends, Realistic Street Soccer, Turbo Soccer | Medium | Evergreen with spikes | Good | 2/5 |
| Fashion / creative | Dress To Impress (#10), Catalog Avatar Creator, Catalog Avatar Runway | Medium | Evergreen | Good (no free drawing) | 3/5 |

---

## 1. Tower defense: the deep playbook

### 1.1 Where TD stands (Oct 2026)

- **No TD is in the top 40, but four are in the top ~100**, and TDS hit a tracker peak of 104K on Sept 25 2026 ([LiveCounts](https://livecounts.nl/roblox-charts/), [RoWatcher](https://rowatcher.com/games/1176784616/tower-defense-simulator) [U]). TD is a **steady, loyal mid-tier**, not this year's viral genre.
- **The top-earning game on Roblox for a while in Sept 2024 was a TD** (Anime Vanguards) ([Beebom](https://beebom.com/anime-vanguards-surpasses-blox-fruits-top-earning-roblox-game/amp/) [S]). TD players spend.
- **New TDs keep launching and getting traction in 2026:** Alliance TD (Jun 2026), Slop TD (Jul 19 2026), Cameraman TD (Aug 2026, 75K peak on Oct 19) ([Adellion](https://adellion.com/roblox-tower-defense), [RoWatcher](https://rowatcher.com/games/10762636904/upd-cameraman-tower-defense/dying) [U]). Universal Tower Defense Z posted a 242K tracker peak in Jun 2026 ([RoWatcher](https://rowatcher.com/games/7488190691/universal-tower-defense-z) [U]).
- A **licensed TD won an award**: SpongeBob Tower Defense took Best Use of IP in 2025 ([PocketGamer.biz](https://pocketgamer.biz/roblox-reveals-2025-innovation-awards-winners) [S]).

### 1.2 The three TD families

| Family | Examples | How you get units | Who it's for | Risk |
|---|---|---|---|---|
| **Classic / deterministic** | Tower Defense Simulator, Tower Defense X, Retro TD | Buy or unlock towers with earned coins. Bosses unlock new ones | Strategy fans, co-op squads | Slower monetisation. Needs good content |
| **Anime gacha** | Anime Vanguards, Anime Last Stand, All Star TD, Anime Adventures, Anime Defenders, Universal TD Z, Alliance TD | Summon on banners, then traits, evolutions, levelling | Collectors, anime fans, older kids/teens | Odds rules, IP look-alikes, content treadmill |
| **Trend-skin TD** | Toilet Tower Defense, Cameraman TD (Skibidi), Garden TD (plants), Slop TD (brainrot "slop") | Usually summon or crate-based | Whoever is in the current meme | Dies with the meme. IP disputes |

### 1.3 How the top TDs differ

All player numbers are Rolimons figures via [Adellion, Oct 3 2026](https://adellion.com/roblox-tower-defense) [U] unless noted.

| Game | Developer | 30-day peak | What makes it different |
|---|---|---|---|
| Tower Defense Simulator | Paradoxum Games | 104,491 | Zombie co-op. **No summoning**: beat bosses to unlock towers. Event towers on a 1–2 week rhythm (Kingpin Jul 17–31, Enforcer Aug 14–21 2026 per [AllThingsHow](https://allthings.how/tower-defense-simulator-events-schedule/) [U]). 94.1% approval |
| Anime Vanguards | Kitawari | 44,979 | Summon → level → **evolve**. Rerollable **traits** (Monarch 0.1%, 1,500 pity [U]). Many modes. 96.7% approval |
| Tower Defense X | Tower Defense X | 26,207 | Air/land/sea towers. **Bosses attack your towers**. Battle-pass tokens. Still "beta" |
| Garden Tower Defense | Garden Defenders | 18,606 | 350+ plants as towers. A mode where **you morph into your units**. 98.2% approval (highest of the eight) |
| Alliance Tower Defense | MrUpTime's Games | 20,822 | Launched Jun 2026. Coins from matches → summons |
| All Star Tower Defense | Top Down Games | 12,281 | Summon gate refreshes **hourly**. Story + Infinity Tower |
| Retro Tower Defense | Plaything Games | 16,564 | Hybrid: summon heroes **and** buy towers mid-match. Tradeable towers |
| Slop Tower Defense | Slop TD! | 25,122 | Summon + craft, brainrot theme. 79.3% approval (lowest), meaning trend players tolerate less polish but rate it lower |
| Cameraman Tower Defense | (not verified) | 75K tracker peak, Oct 19 2026 ([RoWatcher](https://rowatcher.com/games/10762636904/upd-cameraman-tower-defense/dying) [U]) | Skibidi Toilet universe. Title shows "TRADES + X2 EXP". Codes need 3 rounds won first |
| Anime Last Stand | (not verified) | 7,399 post-patch peak, Aug 2026 ([Earnaldo](https://earnaldo.com/blog/anime-last-stand-update-log) [U]) | Anime gacha. Big swings around each patch (1,205 → 7,399) |
| Toilet Tower Defense / Anime Defenders | (not verified) | No current verified number found | Toilet TD defined the trend-skin TD in 2023–24. **Measure before you cite** |

**Take-away:** the **highest-rated** TDs (Garden TD 98.2%, Anime Vanguards 96.7%) pair a **clear theme** with **a twist on placement** (morphing into units, evolutions). The **biggest** TD (TDS) has **no gacha at all**.

### 1.4 Systems, one by one

#### Unit acquisition: shop unlocks vs summon banners

| Option | Pros | Cons | Kid-safe version |
|---|---|---|---|
| **Shop unlocks** (TDS) | Fair, simple, no odds rules | Less "surprise" | Show the next unlock and its cost on the results screen |
| **Summon banners** (AV, ASTD) | Surprise, content calendar (rotate banners), big revenue | Paid random rules apply if Robux touches it. Gambling-shaped | **Earned-only summon currency**, odds shown anyway, **small pity** (a session or two of play, not 1,500 rolls), duplicates convert to upgrade materials (no "nothing" outcomes) |
| **Hybrid** (Retro TD) | Collect heroes + strategic towers | More UI | Heroes via quests/bosses, towers via shop |

**If any summon can be bought with Robux, directly or through a bought currency:** show per-unit odds in % before purchase, disclose pity/luck effects and update odds live when boosts are active, gate with `ArePaidRandomItemsRestricted`, and give ineligible players a non-random way to buy ([DevForum, May 26 2026](https://devforum.roblox.com/t/clarifying-requirements-for-paid-random-items/4654622) [P]).

#### Traits (random modifiers on units)

- What they are: a roll that adds a perk (damage, range, speed, or a "one placement but huge damage" type like Monarch's +300% damage, 1 placement limit [U]).
- Why they work: endless chase on units you already own, and they create builds YouTubers argue about.
- **Our rule:** no ultra-rare (<1%) traits behind rerolls a kid can buy. Kid-safe options:
  - **Pick 1 of 3** traits after each boss clear (choice, not slot machine).
  - **Crafted traits**: farm a specific raid for a specific trait.
  - If you keep rolls, keep the rarest at a level a normal player can reach and show the pity counter on screen.

#### Evolutions

- Unit + materials from a **specific mode** → evolved form with a new look and ability.
- This gives every mode a job ("raid drops evolution cores") and gives old units new life, which is cheap content: one model edit + one ability.
- Show the evolved form greyed out on the unit card from day one so the goal is visible.

#### Modes ladder (what each one does for retention)

| Mode | Job | Notes |
|---|---|---|
| **Story** | Teach, then a feeling of journey (map progress) | 3 difficulties per stage. First stage beatable in about 2 minutes (starting point) |
| **Infinite / endless** | Mastery + leaderboard + YouTube "how far can I get" | Weekly leaderboard reset gives a reason to return |
| **Raids** | Co-op boss + specific drops (evolution materials) | Best mode for "play with friends" |
| **Challenges** | Rotating modifiers (no slows, double HP, fast enemies) | Rotate daily or hourly (ASTD refreshes things hourly). Cheap freshness |
| **Events** | Seasonal map + limited unit or skin | Halloween and Winter are the big two. MM2 jumped to a 2.24M 24h peak in its Halloween event [U] |
| **Legend / nightmare stages** | Endgame for whales of *time* (not money) | Unlock by clearing story on hard |

#### Wave pacing (design rules; numbers are starting points to playtest)

1. **First win fast.** The first map should be clearable by a brand-new player in about 2 minutes (starting point). Kids decide in seconds.
2. **Saw-tooth intensity:** build tension for a few waves, then give a **breather wave** where money piles up and players can upgrade. Constant pressure tires players; constant ease bores them.
3. **Money flow you can see:** show "+$" popups on kills and a clear wave bonus. Players should afford a new placement or upgrade almost every wave early on.
4. **Introduce one new enemy trait at a time** (fast, armoured, flying, stealth, splitting) with a one-line warning banner the first time.
5. **Boss every N waves** (starting point: every 5 in story, every 10 in infinite) with a health bar and a name.
6. **Fail state teaches.** On loss, show what killed you ("Flying enemies got through. Try a unit with Air hit").

#### Boss design

- **Telegraph** every special move (glow, sound, 1–2 s wind-up) so mobile players can react.
- **Make bosses interact with towers:** stun a tower, shield nearby enemies, spawn minions, or, like Tower Defense X, **attack towers** ([Adellion](https://adellion.com/roblox-tower-defense) [U]). This makes placement matter.
- **One weakness per boss** (e.g., takes double damage from splash). That teaches roster building.
- **Name and lore** each boss. Steal An Egg added a boss fight as a headline weekly update ([MaxPowerGaming](https://www.maxpowergaming.co/post/roblox-s-top-games-in-september-2026-steal-an-egg-pulls-away-as-ride-a-pet-arrives) [U]). A boss *is* an update.

#### Speed-up and skip

- **1x / 2x speed for everyone, free.** If you sell **3x**, it's a convenience pass. Never sell anything that changes who wins in co-op or PvP.
- **Wave skip / auto-start:** in co-op, use **majority vote** so one fast player can't ruin a slow friend's game.
- Speed-up matters more on mobile, where sessions are short.

#### Co-op

- **Lobby → elevator/queue → match** (TDS style) keeps friends together. Allow a **solo** queue too.
- **Up to 4 players** (starting point; Animal Hospital's parties are up to 4) with **separate cash** but a **shared base HP**, so everyone's choices matter.
- **Carry rewards:** a bonus for helping a lower-level friend clear a stage. This turns veterans into recruiters.
- **Spectate and emote** between waves gives cheap social glue.

#### Mobile UX (Sam's audience)

- Tap a unit card → **ghost preview with range circle** → tap to place → "confirm" only if misplacement is costly.
- Big upgrade/sell buttons. **Auto-upgrade toggle** for kids who don't want to micromanage.
- Readable from far: unit silhouettes and colours must differ at phone size. Enemy health bars only on hover/boss.
- Test on the cheapest phone you can find. Performance with 100+ enemies is the TD killer.

### 1.5 TD monetisation (typical, and our line)

| What TDs sell | Common? | Our call |
|---|---|---|
| Premium units/towers (direct buy) | Yes | OK if earnable too, or if it's a side-grade, not the best unit |
| Summon currency | Yes (anime TDs) | Only with full paid-random-items compliance. Better: **earned-only summons** |
| Trait rerolls for Robux | Yes | **Out** at very low odds. See 1.4 |
| Skins / cosmetics / emotes | Yes | **Best option** for kids: no power, high shareability |
| Speed 3x / extra unit slot / auto-skip pass | Yes | OK as convenience if 1x–2x and a fair number of slots are free |
| Battle/season pass (free + paid track) | Yes (TDX tokens, MM2 30-tier event pass) | OK with clear dates and no fake urgency |
| 2x XP / luck boosts | Yes | OK if timed and not stacked into "must-buy" |
| VIP server | Yes | OK. Lets friends play together |

**Price points:** we could not verify Robux prices for the TDs above in this research pass. **Measure them yourself** (see exercise) and log them with a date.

### 1.6 What it takes to compete in TD (late 2026)

- **A theme that is not "anime #47".** Garden TD (plants) and Cameraman TD (Skibidi) show that a clear theme beats another anime roster.
- **Content cadence:** the leaders ship a new unit, tower or event every 1–2 weeks (TDS's event towers [U]). Plan a **12-week content calendar** before launch.
- **Performance** on low-end phones with many enemies.
- **Fair progression** that passes the 2026 rules and the Kids/Select catalog review.
- **Feasibility for Sam: 3/5** for a themed, non-gacha or earned-gacha TD. **2/5** for a head-on anime gacha TD against Anime Vanguards/UTD.

---

## 2. Grow / steal / collect ("social economy") games

- **Saturation: very high.** After Steal An Egg (created Jul 25 2026), tracker data shows a run of egg games created within weeks: Swing For Eggs (Aug 27), Break and Steal an Egg (Sep 5, 1.3M record), Climb For Animals Eggs (Sep 6), Steal Animal Egg (Sep 11), Shoot For Eggs (Sep 13), Bike For Egg (Sep 15), Steal an Clown Egg (Sep 23), Fake an Egg (Oct 4) ([rblxstat](https://rblxstat.com/lists/record-breaking-roblox-games) [U]; "created" is the place creation date, not necessarily launch).
- **What it takes:** a theme that's already viral, passive income, a visible "steal" moment, weekly Saturday drops, and **a studio's promotion muscle**. Steal a Brainrot and Steal An Egg are both linked to DoBig Studios ([Wikipedia](https://en.wikipedia.org/wiki/List_of_Roblox_games) [U]). DoBig's counsel says copyright doesn't protect "game concepts or genres" ([Kotaku, Jul 15 2026](https://kotaku.com/more-people-are-playing-meccha-chameleon-knock-offs-than-the-original-hit-steam-game-as-the-roblox-clone-machine-goes-into-overdrive-2000715371) [S]), so anyone can clone you.
- **Monetisation:** speed, traps, shields, eggs/pets (paid random), skip-timers, pay-to-steal. Several of these are on our "won't copy" list.
- **Lifecycle:** biggest spikes on the platform, steepest falls. Steal a Brainrot fell ~99% from peak by ~Mar 2026 ([RoWatcher](https://rowatcher.com/news/is-the-brainrot-trend-dying-what-ccu-data-from-three-top-games-reveals) [U]).
- **Solo feasibility: 3/5 to build, 1/5 to win.** Borrow the *parts* (passive income, visible restock, weekly drops) instead of entering this fight.

## 3. Simulators / incrementals / RNG

- **Saturation: high.** The "+1" wave in 2026 includes +1 Speed Keyboard Escape (Jan 2026), +1 Tongue Escape (Aug 11), +1 Loot To Forge (Aug 12), +1 Stone Skipping (Sep 5), +1 Pickaxe Swing for Eggs (Sep 27) and +1 Venom Evolution (Oct 5) ([rblxstat](https://rblxstat.com/lists/record-breaking-roblox-games) [U]).
- **Evergreen anchors:** Pet Simulator 99 (83,596 playing), Bee Swarm Simulator, Sol's RNG ([LiveCounts, Oct 26 2026](https://livecounts.nl/roblox-charts/) [U]).
- **What it takes:** satisfying number growth, a sensory hook (sound, particles), multipliers and rebirths, and codes.
- **Monetisation:** multipliers (2x), auto-farm, extra pet slots, luck boosts (RNG), eggs.
- **Lifecycle:** +1 Speed Keyboard Escape won Best Party & Casual 2026 ([Roblox](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P]) yet fell 61.5% from Aug to Sept ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]).
- **Solo feasibility: 4/5.** Quick to build and good practice for Sam's progression systems, but expect a short life.

## 4. Survival / horror co-op

- **Saturation: high but rewarding.** 99 Nights in the Forest (#6), Dandy's World, Violence District, DOORS, Evade, Forsaken, Flee the Facility, Animal Hospital, Piggy all sit in the top ~100 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]). Horror is a top mobile search ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]). Horror searches spike Sept–Oct.
- **2026 sub-trend: "anomaly" games.** Animal Hospital (Anomaly), Sell Fries! [Anomaly], Home Alone: Anomalies. Spot-what's-wrong co-op, rated **Minimal**, won 4 awards ([Roblox](https://about.roblox.com/newsroom/2026/09/2026-roblox-innovation-awards) [P]).
- **What it takes:** atmosphere with simple art, a shared goal, classes or characters, and frequent new monsters/anomalies.
- **Monetisation:** classes (99 Nights Diamonds; Animal Hospital Robux-only classes), skins, revives.
- **Solo feasibility: 3/5.** Atmosphere is achievable with lighting and sound. Keep it "spooky not gory" for the Kids/Select catalogs.

## 5. Obby

- **Saturation: very high.** Obbies are a top mobile search ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]) and the easiest genre to clone. Hybrids win: "Swing Obby for Brainrots" peaked ~87K ([RoWatcher](https://rowatcher.com/news/is-the-brainrot-trend-dying-what-ccu-data-from-three-top-games-reveals) [U]). Escape-obbies merge with the +1 genre.
- **Monetisation:** skip stage, gravity/speed coils, checkpoints, trails.
- **Solo feasibility: 5/5 to build, 2/5 to stand out.** Good for a 1-week practice project.

## 6. Roleplay / life

- **Dominated by incumbents:** Brookhaven (#1 search of 2025 [P]), Berry Avenue, LifeTogether, Bloxburg, Dreamville, Emergency Hamburg.
- **2026 headwind:** social hangouts are **excluded by default** from Kids/Select catalogs ([Roblox](https://about.roblox.com/newsroom/2026/04/introducing-roblox-kids-and-select-accounts) [P]).
- **Monetisation:** premium houses, vehicles, passes, pets.
- **Solo feasibility: 1/5.** Huge content surface plus moderation burden.

## 7. Tycoon / shop sim

- **Medium saturation, regional surprises:** Karinderya (a Filipino eatery sim, created Aug 7 2026, 157K record) and Sell Fries! [Anomaly] (Sept 2026) ([rblxstat](https://rblxstat.com/lists/record-breaking-roblox-games) [U]). Local themes can break out: an Arabic-titled game (صيد الضبّان) was also in the Oct 26 top 50 ([LiveCounts](https://livecounts.nl/roblox-charts/) [U]), and Roblox reports distinct top searches by country ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]).
- **Monetisation:** 2x cash, auto-collect, premium machines, extra floors.
- **Solo feasibility: 4/5.**

## 8. Fighting / anime action

- **Leaders:** Jujutsu Shenanigans (Best Action 2026 [P]), Blox Fruits (top 10 every month of 2025 [S]), The Strongest Battlegrounds. Slayers 2 launched publicly Sept 18 2026 with a 237.2K peak ([StudioKrew](https://studiokrew.com/blog/top-roblox-games-september-2026/) [U]).
- **What it takes:** combat feel (hitstop, VFX, animation), netcode, anti-cheat, constant new characters. PC-leaning audience ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]).
- **Monetisation:** characters/fruits, spins, passes.
- **Solo feasibility: 2/5.**

## 9. Sports

- **Active:** Blue Lock: Rivals (276K tracker peak [U]), Volleyball Legends, Illegal Soccer, Realistic Street Soccer, Turbo Soccer. Best Sports: Basketball: Zero (2025, [S]) and FIFA Super Soccer (2026, [P]). "Futebol" is Brazil's top search ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]).
- **What it takes:** responsive ball physics online (hard), matchmaking, anime-style abilities as the twist.
- **Monetisation:** style/ability spins, cosmetics.
- **Solo feasibility: 2/5.**

## 10. Fashion / creative

- **Leaders:** Dress To Impress (#10), Catalog Avatar Creator, Catalog Avatar Runway. Newcomer: Facecard: Makeup Showdown (created Oct 5 2026, 56.8K record [U]). Creative games are tablet favourites ([Roblox Replay](https://about.roblox.com/newsroom/2025/12/roblox-replay-decoded-search-style) [P]).
- **What it takes:** big item library, round-based social judging, brand collabs (DTI with Charli XCX, Lady Gaga, Wicked).
- **Note:** free-form drawing is excluded by default from Kids/Select ([Roblox](https://about.roblox.com/newsroom/2026/04/introducing-roblox-kids-and-select-accounts) [P]).
- **Solo feasibility: 3/5** (mostly art volume).

---

## Exercise (one sitting)

1. Open the three TDs with the highest approval in the table (Garden TD, Anime Vanguards, TDS). For each, log in a sheet with today's date: every Robux price in the shop, whether summons can be bought with Robux, where odds are shown, and the pity number.
2. Write your own TD's **modes ladder** (1.4) and **first-two-minutes script**.
3. Pick **one** borrowed mechanic from another genre (e.g., 99 Nights' shared fire, Fisch's bestiary, Adopt Me's trade quiz) and write how it would work in your TD in 5 bullet points.

---

## 🤖 Train the Model

**What the model should learn:** to pick and critique a genre for a solo Roblox dev using saturation, lifecycle and kid-safety rules, and to design tower-defense systems (summons, traits, evolutions, modes, pacing, bosses, co-op) that are fun and compliant with Roblox's 2026 paid-random-item and Kids/Select rules.

**Dataset:** `08-roblox/train/genre-playbooks.jsonl` (genre choice, TD system design, compliance checks, idea critiques, a Luau odds-display snippet).

**Eval:** `08-roblox/train/genre-playbooks.eval.jsonl`. A good answer:
- gives a feasibility judgment *and* the reason (saturation, content load, netcode, moderation);
- for gacha questions, names odds disclosure in %, pity disclosure and `PolicyService.ArePaidRandomItemsRestricted`;
- proposes a kid-safe alternative instead of just saying "no";
- labels design numbers as starting points to playtest, and market numbers with a source tag.
