# 08 · The Roblox Deep Dive

The biggest section of the academy: everything about building, growing and running a Roblox game, from the platform's own numbers to working Luau code. Research is current as of **late October 2026**, and every fact is tagged **[P]** (Roblox said it), **[S]** (reputable press/analysts) or **[U]** (unverified). Roblox reports Q3 2026 results on **Oct 29, 2026**, so re-check lesson 01 after that.

## Part A: The platform (research)
| # | Lesson | You'll know |
|---|---|---|
| 01 | [Roblox by the Numbers](01-platform-by-the-numbers.md) | DAU, hours, bookings, payouts, age split, regions, 2023→2026 trends, and the 2026 slowdown |
| 02 | [Audience and Player Psychology](02-audience-and-player-psychology.md) | Who plays, how kids decide in the first minute, personas, how kids read UI |
| 03 | [Discovery and the Algorithm](03-discovery-and-the-algorithm.md) | Recommended For You signals (28-day window, play-through, bounce), charts, search, ads, Kids & Select gate |
| 04 | [Monetization and DevEx](04-monetization-and-devex.md) | Passes, products, subscriptions, Creator Rewards, regional pricing, DevEx rates with worked examples |
| 05 | [Safety, Policy and Compliance](05-safety-policy-and-compliance.md) | Age checks, Kids & Select, maturity labels, paid random items, ads rules, lawsuits, the compliance checklist |

## Part B: Building it right (engineering)
| # | Lesson | You'll know |
|---|---|---|
| 06 | [Studio and Luau Crash Course](06-studio-and-luau-crash-course.md) | Studio, the DataModel, modern Luau, the services you'll use |
| 07 | [Architecture and Security](07-architecture-and-security.md) | Never trust the client: validation, rate limits, exploits |
| 08 | [Data and Persistence](08-data-and-persistence.md) | Session locking, safe receipts, trades, migrations, leaderboards |
| 09 | [Analytics and Experiments](09-analytics-and-experiments.md) | Funnels, custom and economy events, reading data honestly, A/B tests |
| 15 | [Performance and Mobile](15-performance-and-mobile.md) | Budgets, enemies-as-data, the cheap-phone checklist |

## Part C: Winning (market and design)
| # | Lesson | You'll know |
|---|---|---|
| 10 | [Top Games Teardowns](10-top-games-teardowns.md) | 17 hits from 2024–2026: first 5 minutes, hooks, monetization, what to steal (and what not to) |
| 11 | [Genre Playbooks](11-genre-playbooks.md) | Every genre's saturation and solo feasibility, plus the deep tower-defense playbook |
| 12 | [Trends and Viral Mechanics](12-trends-and-viral-mechanics.md) | How hits spread, clone timing, lifecycles, the weekly trend routine |
| 13 | [Launch and Growth Playbook](13-launch-and-growth-playbook.md) | Kids & Select eligibility, pre-launch checklist, soft launch, the first 30 days |
| 14 | [Tower Defense Blueprint](14-tower-defense-blueprint.md) | Units, enemies, waves, maps, modes, collection, fair monetization, 12-week build order |

## Part D: Code
- [`starter-kit/`](starter-kit/README.md): a complete TD skeleton (Rojo project). It includes session-locked saves, validated remotes, enemies-as-data for phones, a match state machine, a safe `ProcessReceipt`, a kid-friendly daily reward, analytics funnels and a phone-first HUD.

## 🤖 Training data
`train/` holds the largest dataset in the academy: 129 training examples and 78 eval items across platform numbers, audience, discovery, monetization, safety, Studio/Luau, security, data, analytics, top games, genres, trends, launch, the TD blueprint and performance. See `../ai-training/README.md`.

## The 10 facts to remember (Oct 2026)
1. **Q2 2026:** 123M DAU (+10%), $1.56B bookings (+8%), $363M paid to creators. Q3 bookings guided −14% to −18% YoY [P].
2. **Age-checked players:** 35% under 13, 38% 13–17, 27% 18+ [P].
3. **Recommendations judge 28 days** of play-through, first-play bounce, return days and capped playtime. Ads, search and friend traffic don't count, and ads don't change ranking [P].
4. **Kids (5–8) and Select (9–15) accounts** only see games that pass eligibility: verification + 2SV, the questionnaire, Plus/Premium or a 1,000 R$ fee, 250 engaged plays in 60 days, and a safety review [P].
5. **DevEx:** $0.0038 per Robux standard; $0.0054 for eligible US 18+ spend (since Jun 2026) [P].
6. **Premium Payouts ended Jul 2025.** Creator Rewards replaced them [P].
7. **Paid random items:** odds for every outcome before purchase, `PolicyService` gating, a non-random alternative [P].
8. **Viral spikes collapse fast** (often 60–90% within 1–2 months) and clones arrive in days to weeks [U]. Evergreen games run on friends, collection and events.
9. **Tower defense is a steady mid-tier genre**, strong on "Top Revisited", not a spike genre [P]/[U].
10. **Thumbnail personalization** averaged +8.5% qualified play-through [P].
