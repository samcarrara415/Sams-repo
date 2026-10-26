# The First Five Minutes

> **What you'll learn:** why the first minutes decide everything, how kids actually behave when they join, and a step-by-step recipe for onboarding that gets them to the fun fast, without a boring forced tutorial.

---

## 1. Why this matters most

On Roblox, a new player arrived seconds ago from a thumbnail, an ad or a friend. They're usually a **kid on a phone** who reads almost nothing and leaves the moment they're bored or confused.

Principles from Roblox's creator guidance and Sam's research notes (DoSa Vault, *Roblox Player Mind*):

- **Get to the fun in 5 minutes or less.** Faster is better.
- **Very short sessions are a bad sign for discovery.** Sessions under about 3 minutes are treated as a negative "bounce" signal when ranking games. Verify the current wording in `08-roblox/03-discovery-and-the-algorithm.md`.
- **Pointers and icons beat text.** In a Roblox sample funnel shared by staff (DevForum, Jul 2024 [P]), only 29.5% of players did the first action until an icon cue was added. Roblox didn't publish the after-fix number.
- **Forced tutorials lose players, even with a skip button.** This is Sam's research and common Roblox dev experience [U]. Test it in your own funnel.

If your first 5 minutes are broken, nothing else matters: not your art, not your late-game content, not your monetization.

---

## 2. The recipe: "Do, then explain (barely)"

| Time | Goal | What the player should see/do |
|---|---|---|
| **0–10 s** | Something is happening | Spawn facing the action. Music, motion, other players. No popups. |
| **10–30 s** | First action | One glowing arrow or bouncing hand pointing at ONE thing to tap. |
| **30–60 s** | First reward | That action pays off right away: coins burst, a sound, a number goes up. |
| **1–3 min** | First choice | Pick between 2 options (two towers, two seeds). Both are good. |
| **3–5 min** | First "wow" | A rare drop, a boss, a level-up, a big visual upgrade. |
| **5+ min** | First goal | Show the next target: "Beat wave 10 to unlock the Snow Map". |

Rules:
- **One instruction at a time.** Never show two arrows.
- **Max about 4 words** on any instruction ("Tap to place!"). Use icons and arrows more than words.
- **No shop, no daily reward wall, no update log popup** in the first session's first minutes. Save them for later.
- **Teach by doing.** Make wave 1 so easy it can't be lost. It *is* the tutorial.
- **Contextual hints, not a tutorial level.** Show "Upgrade!" with an arrow only when they can afford an upgrade and haven't done one yet.
- **Friend-joiners skip everything.** If someone joins a friend, put them right next to the friend and let them catch up, with no tutorial gate.

---

## 3. Personas: walk it as each player

Copied from Sam's *Roblox Player Mind* skill. Walk your first 5 minutes as each one.

| Persona | Who | What they need in minute 1 |
|---|---|---|
| **Ad-clicker, 8–12, phone** | Clicked a funny ad 10 s ago | Exactly what the ad showed, right away. Leaves after about 20 s without fun. |
| **Friend-joiner** | Came to play *with* someone | To be next to the friend immediately. Skips everything. |
| **Genre veteran** | Has played the top games in the genre | Speed: skip/fast-forward, hard modes, depth. Hates hand-holding. |
| **Collector / spender** | Loves new units, skins, limited items | To see the collection and what's rare. Hates unclear odds. |
| **Returning player** | Played yesterday | A reason today: daily reward, quest progress, event, new content. |

For each step, write down: time since join, what's on screen, what they want, what they tap, and **what could make them leave**.

---

## 4. Measure it: the onboarding funnel

Every step above becomes a funnel step you log with Roblox's `AnalyticsService` (full code in `08-roblox/09-analytics-and-experiments.md` and `08-roblox/starter-kit/`):

```
1 Joined → 2 Placed first tower → 3 Wave 1 cleared → 4 First upgrade → 5 Wave 5 cleared → 6 First win
```

Read it like this:
- **The biggest drop between two steps is your #1 problem.** Fix that one first.
- Compare **phone vs PC** and **new vs returning** players.
- A step with a big drop and a text instruction? Replace the text with an arrow or icon and measure again.

Example diagnosis:

| Step | Players | Drop | Likely cause | Fix |
|---|---|---|---|---|
| Joined | 1,000 | – | – | – |
| Placed first tower | 520 | **48%** | Didn't know what to tap; a popup covered the button | Remove popup; bouncing hand on the tower slot |
| Wave 1 cleared | 470 | 10% | OK | – |
| First upgrade | 260 | **45%** | Upgrade button hidden in a menu | Show "Upgrade!" arrow when affordable |

(These numbers are a made-up example for practice, not real data.)

---

## 5. Common first-5-minute killers

| Killer | Why it hurts | Fix |
|---|---|---|
| Slow loading / blank screen | Kids think it's broken | Loading screen with art and a progress bar. Stream content in. |
| Popups on join | Covers the fun, and kids tap "X" on everything anyway | No popups in the first session's first minutes |
| Forced tutorial | Feels like school | Tutorial = an easy wave 1, plus contextual hints |
| Too many buttons | Overwhelming on a phone | Show buttons only once they're useful |
| The ad/thumbnail lied | Feels cheated, leaves and dislikes | Show the thumbnail's promise in the first 30 s |
| Empty server | Social game with no one around | Fill servers (smaller max size, matchmaking), bots or solo-friendly start |
| Losing in the first session | "I'm bad at this" | First match can't be lost. Gentle difficulty ramp. |
| Early Robux prompt | Feels greedy | Never prompt a purchase before the first win |

---

## Exercise

1. Record yourself playing your game's first 5 minutes on a phone, as the ad-clicker. Count seconds to the first action and the first reward.
2. Write the funnel steps for your game and add them as `AnalyticsService` funnel events.
3. Watch 3 kids (or new players) play without helping. Mark where each one hesitates for more than 3 seconds.
4. Fix the biggest hesitation. Measure again next week.

---

## 🤖 Train the Model

**What the model should learn:**
- diagnose onboarding problems from funnel numbers and playtest notes
- recommend the smallest fix first (icon/arrow over text, remove popups, easier wave 1)
- always say how to measure the result

**Dataset:** `02-game-design/train/onboarding.jsonl`. Funnel-reading, persona walk-throughs and "should I add a forced tutorial?" decisions.

**Evals:** `02-game-design/train/onboarding.eval.jsonl`. Good answers:
- find the biggest drop
- prefer icons and arrows over text
- reject forced tutorials and early purchase prompts
- name the funnel step that will show improvement
