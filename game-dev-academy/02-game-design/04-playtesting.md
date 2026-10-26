# Playtesting

> **What you'll learn:** how to run playtests that find real problems (especially with kids), what to watch for, what questions to ask (and not ask), and how to turn notes into fixes you can measure.

---

## 1. Why you can't skip this

You know where every button is and what every enemy does, so you're the worst tester of your own game. Players show you the truth in minutes:
- where they hesitate
- what they ignore
- where they die
- what they laugh at

**Watching beats asking.** Kids are polite and will say "it's cool". Their hands tell the truth.

---

## 2. Kinds of playtests

| Test | Who | When | Finds |
|---|---|---|---|
| **Hallway / friend test** | 3–5 people nearby | Every prototype | Is the core fun? Is the first action obvious? |
| **Kid playtest** | Kids in your target age, *with a parent's permission* | Every milestone | Reading problems, UI confusion, what's actually fun to kids |
| **Remote unmoderated** | Players you don't know | Before launch | Real behaviour without you in the room |
| **Analytics "playtest"** | All live players | Always | Funnels, retention, where people quit (module 08) |
| **Bot/sim test** | Your wave bot | Every balance change | Difficulty walls, economy breaks |

> **Safety first:** when testing with kids, always have a parent's or guardian's permission, test in a public or family setting, never collect personal info, and never ask them to friend you or chat privately. Watching a family member or a friend's kid on their own device, with the adult present, is ideal.

---

## 3. Running a playtest (moderated)

**Before:**
- One clear question for this test: "Can new players place a tower in under 20 seconds?"
- A fresh account/save so they start as a real new player.
- Their own phone if possible. Record the screen (with permission).

**During:**
- Say only: "Play like you would at home. I can't help, but I'll watch. Say what you're thinking if you want."
- **Don't explain. Don't point. Don't defend.** Bite your tongue when they're stuck. That moment is the data.
- Note timestamps: hesitations (>3 s), mis-taps, frowns, laughs, "what do I do?", and when they stop.

**After (2–3 minutes max):**
- "What was the game about?" (Did they get the fantasy?)
- "What was the best part?" and "What was annoying?"
- "Would you play again tomorrow? Why?"
- "If you could add one thing, what would it be?" (Treat answers as hints, not orders.)

**Never ask:** "Did you like it?" (always yes), "Was the upgrade button easy to find?" (leading).

---

## 4. Turning notes into fixes

Make a table straight after the session:

| Moment (time) | What happened | How many testers | Cause (guess) | Smallest fix | Metric to watch |
|---|---|---|---|---|---|
| 0:25 | Tapped the shop instead of the tower slot | 3/5 | Shop button bounces, slot doesn't | Stop shop bounce; add hand pointer on slot | Funnel: Joined → Placed first tower |
| 4:10 | Lost to flying enemies on wave 6 | 2/5 | No warning, no anti-air in starter set | "⚠ Flying!" banner + free anti-air unlock at wave 5 | `MatchLost` at wave 6 |

Rank fixes by **players affected × how sure you are × how cheap the fix is** (the scoring rule from Sam's *Roblox Player Mind* skill). Do the top 3, then retest.

---

## 5. Playtest checklist for kid-focused games

- [ ] Can they start playing without reading anything?
- [ ] First action within 20–30 seconds?
- [ ] First reward within a minute?
- [ ] Do they understand what's rare and why it's special?
- [ ] Can they find the way back to what they were doing after any popup?
- [ ] Are all tap targets easy for small fingers? (See `04-art/04-ui-for-kids-on-phones.md`.)
- [ ] Do they ever feel tricked (prices, odds, "free" things that aren't)?
- [ ] Do they want to show someone something? (Social pull.)
- [ ] Did they lose? Did they understand why?
- [ ] Did they ask to keep playing?

---

## 6. Write it down

Every playtest goes in your vault under `Games/<Game>/Playtests/<date>.md`, and every confirmed insight goes at the top of the **Insight Log**. Insights that later turn out wrong get a ✗, not deleted.

These notes are gold for your AI assistant. Real observations with real outcomes make the best training examples (see `ai-training/README.md`).

---

## Exercise

1. Write one test question for your current build.
2. Run 3 sessions (friends or family, with permission if they're kids).
3. Fill in the fix table. Do the top 3 fixes.
4. Retest with 3 *different* people. Did the moment you fixed disappear?

---

## 🤖 Train the Model

**What the model should learn:**
- plan playtests safely (especially with kids)
- write non-leading questions
- turn raw observations into ranked, measurable fixes

**Dataset:** `02-game-design/train/playtesting.jsonl`. "Here are my playtest notes, what do I fix?", "write me a playtest script", "what should I ask kids?" tasks.

**Evals:** `02-game-design/train/playtesting.eval.jsonl`. Good answers:
- tell you to watch rather than explain
- avoid leading questions
- include child-safety steps
- rank fixes and give a metric for each
