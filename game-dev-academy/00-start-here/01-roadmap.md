# Start Here: The Roadmap

> **What you'll learn:** what a game developer actually does, the 12-month path from zero to a live Roblox game kids play, how to use this repo, and how to set up your tools today.

---

## 1. What "game dev" really means

Making a game is six jobs. As a solo dev you do all of them, so it helps to know which hat you're wearing.

| Job | What it covers | Module |
|---|---|---|
| **Designer** | What the player does, why it's fun, how it gets harder, why they come back | 02, 07 |
| **Programmer** | Making it work: rules, UI, saving, multiplayer, security | 01, 08 |
| **Artist** | How it looks: models, textures, UI, icons, thumbnails, VFX | 04 |
| **Audio / feel** | How it sounds and *feels*: hits, clicks, music, screen shake | 05 |
| **Researcher / marketer** | What players want, what's trending, getting players in the door | 06, 08 |
| **Live-ops / business** | Updates, events, pricing, analytics, money, legal | 07, 08, 09 |

The big lesson from studios like Supercell: **most game ideas fail, and that's normal.** Good studios try many small prototypes fast and only keep the ones players love. Your goal isn't one perfect game. It's **a fast loop for finding the fun**.

---

## 2. The 12-month path

This path assumes about **10–15 hours a week**. Go faster if you have more time. Each phase ends with something real you can show.

| Months | Phase | You will ship | Modules |
|---|---|---|---|
| 1 | **Foundations** | 3 tiny Roblox games: a clicker, an obby, a "collect the coins" game | 00, 01, 03 |
| 2 | **Design basics** | A one-page design for a game, plus a paper prototype tested on 3 people | 02 |
| 3 | **Art basics** | One finished Blender model in Roblox, a game icon, and a thumbnail | 04 |
| 4 | **Roblox deep dive** | A small game with saving, a shop, and analytics funnels | 08 |
| 5 | **Research** | An idea scorecard comparing 3 ideas with real chart data | 06 |
| 6–7 | **Vertical slice** | The first 10 minutes of your real game, polished | 02, 04, 05, 08 |
| 8 | **Playtest and fix** | 10+ kid playtests, then fixes for the top 5 problems | 02, 07 |
| 9 | **Launch** | Public release with icon/thumbnail A/B tests and a small ad test | 08, 09 |
| 10–12 | **Live-ops** | Weekly updates, events, a balanced economy, D1/D7 tracking | 07, 08 |

**Capstone** (`10-capstone/`): the whole path turns into one real game. Start your idea in the vault (`vault/`) on day one, even if it changes later.

---

## 3. How to use this repo

Every lesson has the same shape:

1. **What you'll learn** box at the top
2. **The lesson**: short sections, tables and examples
3. **Exercise**: something you build or decide in one sitting
4. **🤖 Train the Model**: what to teach your AI assistant from this lesson, plus its training and test files in the module's `train/` folder

The AI thread runs through everything. By the end you have an assistant trained on your own rules and lessons, plus test scores that prove it learned. Start with `ai-training/README.md`.

Facts use confidence tags (see `CONTRIBUTING.md`):
- **[P]**: primary source (Roblox said it)
- **[S]**: secondary source (reputable press or analyst)
- **[U]**: unverified (community data, estimates)

---

## 4. Set up your tools today

| Tool | What for | Cost |
|---|---|---|
| **Roblox Studio** | Build and test Roblox games | Free |
| **Blender** | 3D models, rigs, animation, renders for thumbnails | Free |
| **VS Code** + **Rojo** + **luau-lsp** | Write Luau in a real editor and sync it to Studio, with git history | Free |
| **Git + GitHub** | Save every version and never lose work | Free |
| **Krita** or **Photopea** | Thumbnails, icons, UI art | Free |
| **Audacity** | Clean and trim sounds | Free |
| **Obsidian** | Your vault: ideas, research, insight log | Free |
| **A real phone** | Most players are on mobile, so test on one every week | You have one |

Setup checklist:

- [ ] Install Studio and sign in. Make a test place and publish it as private.
- [ ] Install Blender. Do the "donut" tutorial or any beginner series until you can model, UV-unwrap and export.
- [ ] Install VS Code, the Rojo extension, and luau-lsp. Follow `03-engines/02-tooling.md`.
- [ ] Create a GitHub repo for your first game.
- [ ] Make your vault folders: `Ideas/`, `Research/`, `Games/<Game>/`, `Design/`.
- [ ] Turn on 2-Step Verification on your Roblox account. Your games are your income, so protect the account.

---

## 5. Habits that make you good fast

1. **Ship tiny things weekly.** A finished small game teaches more than an unfinished big one.
2. **Watch real kids play.** Don't explain anything. Just watch where they hesitate, then fix that.
3. **Keep an Insight Log.** Each entry: date, question, evidence, conclusion, what you changed, and the result. This is also your best AI training data.
4. **Copy structure, not content.** Study why top games work, then build your own version with your own art and twist.
5. **Measure, don't guess.** Every change gets a metric to watch and a date to check it.
6. **Phone first.** If it doesn't feel good on a phone, it isn't done.

---

## Exercise: your first week

1. Install everything in the setup checklist.
2. Build a 15-minute "touch the part, get a point" game in Studio. Use a leaderstat and one sound.
3. Publish it as private and play it on your phone.
4. Write your first Insight Log entry: "What felt bad on the phone?"

---

## 🤖 Train the Model

**What the model should learn:** how to plan a beginner's path, pick the next step for someone's skill level, and push toward small shipped projects and measurement instead of big unfinished ones.

**Dataset:** `00-start-here/train/roadmap.jsonl`. Planning questions from beginners ("I have 5 hours a week, where do I start?", "Should I learn Unity or Roblox first?", "I want to make an MMO as my first game").

**Evals:** `00-start-here/train/roadmap.eval.jsonl`. A good answer:
- gives a concrete next step
- scopes down over-ambitious first projects
- mentions testing on a phone and with real players
- doesn't promise income
