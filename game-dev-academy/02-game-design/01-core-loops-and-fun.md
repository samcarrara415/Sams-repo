# Core Loops and Fun

> **What you'll learn:** how to describe any game as loops, what "fun" is made of (and which kinds kids want), how to find the fun fast with prototypes, and how to write a one-page design that keeps you focused.

---

## 1. The three loops

Every successful game has loops inside loops.

| Loop | Length | Question it answers | Tower-defense example |
|---|---|---|---|
| **Core loop** | Seconds | "What am I doing right now?" | Place tower → enemies walk in → towers shoot → earn cash → upgrade/place more |
| **Session loop** | Minutes | "What am I trying to finish this sitting?" | Survive 20 waves → win → rewards → pick next map/difficulty |
| **Meta loop** | Days/weeks | "Why come back tomorrow?" | Summon new units, level them, unlock maps, daily quests, events, climb leaderboards |

**Test:** describe your game's core loop in one sentence with arrows. If you can't, the game isn't clear yet, and kids won't get it either.

Top Roblox examples (details in `08-roblox/10-top-games-teardowns.md`):
- **Grow a Garden:** buy seeds → plant → wait / come back → harvest → sell → buy better seeds
- **Adopt Me!:** care for pets → earn money → hatch eggs → trade and collect
- **Obby games:** jump → fail → retry → checkpoint → brag

---

## 2. What fun is made of

A useful frame is **MDA** (Hunicke, LeBlanc & Zubek, 2004):
- **Mechanics:** the rules you code (towers shoot, cash per kill)
- **Dynamics:** what happens when players use them (players rush splash towers on swarm waves)
- **Aesthetics:** the feelings that result (tension, mastery, pride)

You build mechanics, but players only feel aesthetics. Always design backwards from the feeling.

### Kinds of fun, and how much kids care about each

| Fun | Feeling | Kids (8–14) on Roblox | How to deliver it |
|---|---|---|---|
| **Social** | Being with friends | ★★★★★ | Co-op, trading, showing off, playing *with* someone |
| **Collection** | "Gotta get them all" | ★★★★★ | Units, pets, skins, an index with silhouettes of missing ones |
| **Progress** | Numbers go up, getting stronger | ★★★★★ | Levels, upgrades, visible power jumps |
| **Surprise** | "WHAT?!" moments | ★★★★☆ | Rare drops, secret areas, admin events, funny physics |
| **Mastery** | "I got good" | ★★★☆☆ | Hard modes, skill-based bosses, speedruns |
| **Expression** | "This is mine" | ★★★★☆ | Customising a base/avatar/garden, naming pets |
| **Humor / memes** | Laughing | ★★★★☆ | Silly sounds, ragdolls, meme characters, absurd items |
| **Fantasy** | Being something cool | ★★★★☆ | Being a hero, a commander, a monster |

The star ratings are this academy's judgment, based on the research in `06-market-research/02-what-kids-play-and-why.md` and `08-roblox/02-audience-and-player-psychology.md`. The winning Roblox games stack **social + collection + progress**, plus at least one surprise.

---

## 3. The motivation behind "I want to play again"

**Self-Determination Theory** (Ryan, Rigby & Przybylski, 2006) found that players enjoy games and come back when three needs are met:

1. **Competence:** "I'm getting better / stronger." → Clear feedback, fair difficulty, visible upgrades.
2. **Autonomy:** "I chose this." → Meaningful choices: which towers, which path, which unit to level.
3. **Relatedness:** "I'm connected to others." → Friends, co-op, trading, guilds, shared events.

These are the healthy roots of "addictive". Games that meet them keep players because the game is *good*. Tricks like fake timers and guilt popups work briefly, then erode trust (`07-engagement-and-retention/`).

---

## 4. Find the fun first: prototype like Supercell

Supercell is famous for **killing most of its games** before launch, including some that were already in public tests. The lesson for a solo dev: **cheap tests, fast verdicts**.

**The grey-box rule:** prototype with plain parts and no art until the core loop is fun. Art makes a fun game great. It can't make a boring game fun.

Prototype process:
1. **Write the question.** "Is placing towers on a tiny map with 3 lanes fun on a phone?"
2. **Build the smallest thing that answers it.** 1–3 days, grey boxes, one map.
3. **Watch 3–5 people play.** Don't explain anything.
4. **Decide:** *kill*, *change one thing and retest*, or *keep and grow*.

Signs you've found the fun:
- Playtesters ask "can I play again?" or keep playing after you say they can stop.
- They talk to each other about strategy ("put the cannon there!").
- They laugh or shout at surprises.

Signs you haven't:
- Polite "it's cool". Phones go down the moment you stop watching. They ask what to do next.

---

## 5. Hooks, twists and the "one-line pitch"

Kids choose games from a tiny icon, a title and maybe a friend's recommendation. You need a **one-line pitch** with a clear twist:

| Formula | Example |
|---|---|
| Known genre + one twist | "Tower defense where **your towers are your pets** and they level up as they fight." |
| Fantasy + verb | "**Grow** a garden, **steal** your friends' rarest plants." |
| Absurd + familiar | "Survive 99 nights in a forest… with a **giant deer** hunting you." |

The twist should show up **in the thumbnail**. If the twist can't be drawn, it won't sell (see `04-art/03-thumbnails-icons-and-store-page.md`).

---

## 6. The one-page design

Before building, fill in `templates/game-design-doc.md`. The short version:

```
Name:
One-line pitch:
Player fantasy:          (what it feels like)
Core loop (arrows):
Session goal:
Meta loop (why return):
The twist (drawable):
Target player:           (age, device, which persona from 08-roblox/02)
First 60 seconds:        (what they do, step by step)
What I will NOT build:   (cut list)
How I'll know it works:  (metric + target, e.g. "60% of new players finish wave 3")
```

The **cut list** is the most important line for a solo dev.

---

## Exercise

1. Pick 3 games you love. Write each one's core, session and meta loops with arrows.
2. For each, which kinds of fun from the table does it deliver?
3. Write a one-page design for your own idea and build a grey-box prototype of just the core loop in 1–3 days.
4. Watch 3 people play it. Write the verdict (kill / change / keep) in your vault.

---

## 🤖 Train the Model

**What the model should learn:**
- break any game into core, session and meta loops
- name the kinds of fun it delivers
- critique a pitch for a clear, drawable twist
- push for cheap prototypes before art

**Dataset:** `02-game-design/train/core-loops.jsonl`. "Break down this game", "critique my pitch", "is my prototype fun? here's what testers did" tasks.

**Evals:** `02-game-design/train/core-loops.eval.jsonl`. Good answers:
- write loops with arrows
- connect mechanics to feelings
- recommend testing with real players
- don't recommend manipulative hooks
