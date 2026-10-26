# Capstone: Ship a Game Kids Want to Play

> **What you'll learn:** how to put every module together into one real game, from your vault idea to a live Roblox game with data, in 12–16 weeks. It ends with a capstone dataset that makes your AI assistant a specialist in *your* game.

---

## 1. The brief

Build and launch a Roblox game that:
1. **Kids choose:** a clear twist you can draw, an icon and thumbnails that pass the phone-size test
2. **Kids understand in seconds:** first action in under 30 s, first reward in under 60 s, fun in under 5 minutes
3. **Kids come back to:** friends, collection, progress and surprises, built ethically
4. **Looks good:** one art bible, real Blender models, consistent colours and shapes
5. **Is safe and fair:** passes the Kid-Safe Checklist, shown odds, no pay-to-win, eligible for Kids & Select if that's your audience
6. **Is measured:** onboarding funnel, match funnel, losses by wave, economy events, D1/D7

---

## 2. Start from your vault

Your ideas live in your Obsidian vault (DoSa Vault). Copy your best idea into `templates/idea-brief.md`. If you have several, score them all with the weighted scorecard in `06-market-research/04-how-to-research-a-game-idea.md`.

If you're making a tower-defense game (Sam's genre), the research in this academy points to three openings in late 2026 (from `08-roblox/11-genre-playbooks.md` and `08-roblox/12-trends-and-viral-mechanics.md`; the tracker data behind them is [U], so re-check it):

| Opening | Why now | The twist |
|---|---|---|
| **Kid-safe TD for Kids & Select** | Most competing TDs are anime gacha with Robux summons and very rare rerolls. That model now faces odds rules, region gating and a retention-first algorithm. | Cartoony TD with a Minimal/Mild rating, towers unlocked by play, earned summons with shown odds, cosmetics + season pass |
| **Hatch/steal flavour inside a TD, with no real loss** | Late-2026 breakouts are egg/pet hatching games | Earned egg reveals for hero units; "egg-thief" enemies you must stop; garden-style offline income that powers towers |
| **Co-op "night waves" light-horror TD** | Light, kid-safe horror and survival are big on mobile (99 Nights won Best Survival 2026 [P]) | Survive the nights around a campfire with friends; a new named boss every week on a fixed update day |

These are starting points, not guarantees. Validate with the fast-validation playbook (thumbnail tests, a weekend prototype, 5 kid playtests) before committing.

---

## 3. Milestones

| Week | Milestone | Proof you're done | Modules |
|---|---|---|---|
| 0 | Idea brief + scorecard + one-page design + cut list | Written in the vault | 02, 06 |
| 1–2 | Grey-box core loop | 3/5 testers replay without asking | 02, 08 (starter kit) |
| 3 | Onboarding hints + funnels | Funnel visible in Creator Hub | 02, 08/09 |
| 4–5 | Art bible + first real models + map | Passes the art checklist on a phone | 04 |
| 6 | Saving + account progression | Survives server-hop tests | 08/08 |
| 7 | Collection (index, earned summons with odds + pity) | Odds UI checked against policy | 01, 07, 08/05 |
| 8 | Content: 3 maps/levels + 1 mode for veterans | Bot: normal build wins, weak build loses at bosses | 02, 08/14 |
| 9 | Fair shop | Test purchases idempotent; red-line check passes | 07, 08/04 |
| 10 | Juice pass (sound, VFX, reveals) | Before/after video | 05 |
| 11 | Icon + 2–5 thumbnails + description; Kids & Select steps started | Squint/phone tests pass | 04/03, 08/13 |
| 12 | Soft launch | D1, funnel and session length read on real cohorts | 08/09, 08/13 |
| 13–16 | Fix top 3, weekly updates, first event | Retention trend, Insight Log entries | 07, 08 |

---

## 4. Final review checklist

**Fun**
- [ ] One-line pitch with a drawable twist
- [ ] Core loop fun in grey box (playtest evidence)
- [ ] First 5 minutes: action < 30 s, reward < 60 s, "wow" < 5 min

**Quality**
- [ ] Art bible followed; every asset passes the silhouette, grayscale and phone-size tests
- [ ] Every action has visual + audio feedback
- [ ] Runs on a cheap phone for 20 minutes

**Retention (ethical)**
- [ ] Reasons to return: daily reward (no harsh reset), quests, unlocks in reach, events, friends
- [ ] Kid-Safe Engagement Checklist passes (`07-…/03`)

**Business**
- [ ] Shop sells convenience and expression; starter pack after a win
- [ ] `ProcessReceipt` idempotent; no paid random items without odds + `PolicyService`

**Data**
- [ ] Onboarding and match funnels, `MatchLost`, economy events
- [ ] Insight Log has at least 5 entries with evidence and results

---

## 5. Capstone: train your game's specialist model

By now you have real playtests, real funnels and real fixes. Turn them into the best training data in the repo:

1. For every Insight Log entry, write one training example in `10-capstone/train/my-game.jsonl`:
   - user: the question as you'd have asked it then (with the evidence)
   - assistant: the answer you now know was right, including the metric and the result
2. Write 5–10 evals from mistakes you made ("players quit at wave 6" → rubric: "checks for an unsignposted new enemy type").
3. Rebuild and run evals (`ai-training/README.md`). Compare scores before and after adding your game's data.
4. Optional: turn your best workflows into a Claude Code skill, like `roblox-player-mind`.

---

## 🤖 Train the Model

**What the model should learn:** connect every module into an end-to-end plan, review a whole game against the final checklist, and give prioritised next steps.

**Dataset:** `10-capstone/train/capstone.jsonl`, plus your own `my-game.jsonl`.

**Evals:** `10-capstone/train/capstone.eval.jsonl`. Good answers:
- plan in order (fun → first session → art → retention → monetization → launch)
- use the checklists
- name metrics
- respect the red lines
