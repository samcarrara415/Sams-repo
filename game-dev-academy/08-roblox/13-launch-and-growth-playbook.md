# Launch and Growth Playbook

> **What you'll learn:** the pre-launch checklist (including the 2026 rules for reaching under-16 players), how to soft-launch, which levers actually grow a Roblox game (play-through, retention, thumbnails, updates, ads, creators), and a 30-day post-launch plan.

---

## 0. Before anything: can kids even see your game?

Since June 16, 2026, younger players use **Roblox Kids (ages 5–8)** and **Roblox Select (ages 9–15)** accounts. They only see games that pass a selection process and fit their content maturity band (Minimal/Mild for Kids, up to Moderate for Select). Social hangouts and free-form drawing games are excluded. Per the Creator Docs (as of Oct 2026), a game becomes eligible only after **all** of these [P] ([Kids & Select docs](https://create.roblox.com/docs/production/publishing/kids-and-select); [announcement, Apr 2026](https://about.roblox.com/newsroom/2026/04/introducing-roblox-kids-and-select-accounts)):

1. The full maturity & compliance questionnaire, with a Minimal, Mild or Moderate label
2. The developer is ID- or face-verified and has 2-step verification on
3. 2 months of Roblox Plus/Premium, **or** a refundable 1,000 Robux fee
4. **250 plays from highly engaged, age-checked users within 60 days**
5. A safety review

Details: `05-safety-policy-and-compliance.md` and `07-engagement-and-retention/03-ethics-and-law-for-kids-games.md`. Requirements change, so re-read the docs page before launch.

**Sam: check this first.** For a kids' game, it decides whether most of the audience can find you.

- [ ] Kids & Select eligibility steps above are underway (verification + 2SV, Plus/Premium or the 1,000 Robux fee, 250 engaged plays in 60 days, safety review)
- [ ] Maturity & Compliance questionnaire filled in honestly; aim for Minimal/Mild if kids are the audience
- [ ] Title, icon, thumbnails and description suitable for all ages / 9+ (enforced for detail pages [P]; see `04-art/03-thumbnails-icons-and-store-page.md`)
- [ ] No "watch a video feed for rewards" mechanics for under-16s (a 2026 game was pulled for this [S]; see `12-trends-and-viral-mechanics.md`)
- [ ] Paid random items (if any): odds for every outcome shown before purchase (summing to 100%), `PolicyService` gating (`ArePaidRandomItemsRestricted`, `IsPaidItemTradingAllowed`), non-random alternative (DevForum, May 2026 [P])
- [ ] No third-party rewarded ads; none at all for under-13s (since May 4, 2026 [P], lesson 05)

---

## 1. Pre-launch checklist

**Game**
- [ ] First 5 minutes tested with 10+ new players on phones; the biggest funnel drop is fixed
- [ ] No data loss: server hops, rejoin, shutdown tested (`08-data-and-persistence.md`)
- [ ] All remotes validated and rate-limited (`07-architecture-and-security.md`)
- [ ] Runs on a cheap phone for 20 minutes (`15-performance-and-mobile.md`)
- [ ] Purchases tested (Studio test purchases), receipts idempotent
- [ ] Analytics: onboarding funnel, match funnel, `MatchLost`, economy events

**Store page**
- [ ] Icon passes the 150-px squint test
- [ ] 2–5 thumbnails ready for personalization
- [ ] Title: short, searchable, describes the game ("Garden Tower Defense", not "Project X")
- [ ] Description: 2–3 short lines for kids + update notes; no external links that break rules
- [ ] Genre/subgenre set correctly

**Ops**
- [ ] A group owns the game (not your personal account), with 2SV on all admin accounts
- [ ] An admin panel or commands (server-checked user ids) for kicking, giving test items and starting events
- [ ] A bug-report path (an in-game button that logs to a DataStore or webhook via a server proxy, with no personal info)
- [ ] Your launch week is free for fast fixes

---

## 2. Soft launch

Launch quietly first (public, no promotion) for 1–2 weeks:
1. Get a trickle of players (friends, a tiny ad test, your group).
2. Watch: play-through/bounce, the onboarding funnel, session length, D1.
3. Fix the top 3 problems. Repeat.
4. Only scale up (bigger ads, creator outreach) once D1 and session length look healthy compared with similar games in Creator Hub benchmarks.

Spending on traffic before the first session works is the most common way to waste a launch.

---

## 3. What actually grows a Roblox game (2026)

Roblox's recommendations reward games people **play through and come back to**. In 2026 Roblox said recommendations judge games over a longer window (28 days instead of 7) and that games tuned for short-term spend get fewer impressions [P]/[S]. Full analysis: `03-discovery-and-the-algorithm.md`.

| Lever | Why it works | How |
|---|---|---|
| **First-session quality** | Play-through and low bounce feed recommendations | `02-game-design/02-first-five-minutes.md` |
| **Retention** | Long-window signals | Daily reasons to return, friends, updates (`07-…/02`) |
| **Thumbnails/icon** | More clicks from the same impressions | Personalization with 2–5 thumbnails |
| **Regular updates** | Update days drive spikes; returning players | Fixed weekly/biweekly update day |
| **Friends** | Kids follow friends | Invites after wins, co-op modes, friend-join without friction |
| **Ads (Ads Manager)** | Buys testing traffic and a kick-start | Small budgets to test thumbnails/hooks. Ad traffic is excluded from the Recommended-For-You signals, and running ads doesn't change ranking [P] (lesson 03). |
| **Content creators** | YouTube is how many kids find games | Codes, early access, creator-friendly moments (big reveals, funny bosses) |
| **Seasonal moments** | Halloween/winter search and event traffic | Themed maps, lobby, thumbnails, limited cosmetics |

---

## 4. Working with content creators (safely)

- Make your game **recordable**: big reveals, funny moments, boss fights, "first to X" goals.
- Offer creator codes (in-game rewards for players using the code), early-access servers and a press kit (logo, key art, 1-paragraph pitch).
- Follow Roblox's rules on sponsored content and disclosures, and never pay for fake reviews or misleading ads.
- Prefer creators whose audience fits your game's age band.

---

## 5. The first 30 days after launch

| Day | Do |
|---|---|
| 1–3 | Watch errors (Developer Console → Server/Client logs), funnel, crashes. Hotfix only real breakages. |
| 4–7 | First small update (bug fixes + one fun addition). Announce it in the title tag/description and group. |
| 7 | First D1/D7 read on complete cohorts. Insight Log entry. |
| 8–14 | Fix the biggest drop. Start thumbnail personalization. Small ad test with 2 creatives. |
| 14 | Second update (new unit/map). |
| 15–21 | Creator outreach if retention is healthy. First live event planned. |
| 21–30 | First mini-event. Review economy sources/sinks. Decide: double down, pivot or move on. |

**Decision rule at day 30:**
- **Double down** if retention is improving update over update and play-through is healthy.
- **Pivot** (keep code and art, change the hook) if people play the first session but don't return.
- **Move on** (reuse what you can) if people don't even finish the first session after 3 rounds of fixes.

---

## Exercise

1. Go through section 0 and section 1 for your game and mark every unchecked box.
2. Write your update calendar for the first 30 days with a fixed update weekday.
3. Write a 3-line creator pitch and a code reward.

---

## 🤖 Train the Model

**What the model should learn:**
- plan a safe, compliant launch
- prioritise first-session quality and retention over paid traffic
- give a realistic 30-day plan with decision rules

**Dataset:** `08-roblox/train/launch.jsonl`.

**Evals:** `08-roblox/train/launch.eval.jsonl`. Good answers:
- check the under-16 visibility requirements
- recommend a soft launch before scaling ads
- tie each step to a metric
