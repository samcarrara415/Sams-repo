# 🎮 Game Dev Academy

**How to become a game developer, and how to make games kids actually want to play, with a deep focus on Roblox.**

Every lesson teaches two students: **you**, and an **AI model** that learns alongside you. Each lesson ends with a 🤖 **Train the Model** section and real training and test data, so by the end you have a game-dev assistant trained on your own rules, plus the scores to prove it learned.

> Research is current as of **late October 2026**. Every number carries a source and a confidence tag: **[P]** primary, **[S]** secondary, **[U]** unverified. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## The path

| Module | What you'll learn | Lessons |
|---|---|---|
| **[00 · Start Here](00-start-here/01-roadmap.md)** | What a game dev does, the 12-month path, tool setup | 1 |
| **01 · Foundations** | [Programming for games](01-foundations/01-programming-for-games.md) · [Math for games](01-foundations/02-math-for-games.md) (vectors, probability, pity, growth curves) | 2 |
| **02 · Game Design** | [Core loops & fun](02-game-design/01-core-loops-and-fun.md) · [The first 5 minutes](02-game-design/02-first-five-minutes.md) · [Progression & economy](02-game-design/03-progression-and-economy.md) · [Playtesting](02-game-design/04-playtesting.md) | 4 |
| **03 · Engines** | [Choosing an engine](03-engines/01-choosing-an-engine.md) · [Pro tooling: Rojo, git, VS Code](03-engines/02-tooling.md) | 2 |
| **04 · Art** (all art must be good) | [Art direction that sells](04-art/01-art-direction-that-sells.md) · [Blender → Roblox pipeline](04-art/02-blender-to-roblox-pipeline.md) · [Thumbnails, icons & store page](04-art/03-thumbnails-icons-and-store-page.md) · [UI for kids on phones](04-art/04-ui-for-kids-on-phones.md) | 4 |
| **05 · Audio & Game Feel** | [Juice, sound, rarity reveals](05-audio-and-game-feel/01-game-feel-and-juice.md) | 1 |
| **06 · Market Research** | [Global market 2026](06-market-research/01-global-market-2026.md) · [What kids play and why](06-market-research/02-what-kids-play-and-why.md) · [UGC platforms compared](06-market-research/03-ugc-platforms-compared.md) · [How to research a game idea](06-market-research/04-how-to-research-a-game-idea.md) | 4 |
| **07 · Engagement & Retention** | [How big studios hook players](07-engagement-and-retention/01-how-big-studios-hook-players.md) · [Retention benchmarks & live-ops](07-engagement-and-retention/02-retention-benchmarks-and-liveops.md) · [Ethics & law for kids' games](07-engagement-and-retention/03-ethics-and-law-for-kids-games.md) | 3 |
| **[08 · Roblox Deep Dive](08-roblox/README.md)** ⭐ | Platform numbers, audience, algorithm, monetization & DevEx, safety, Studio/Luau, security, data, analytics, 17 top-game teardowns, genre playbooks, trends, launch, tower-defense blueprint, performance, **plus a working starter kit** | 15 + code |
| **09 · Shipping & Career** | [Career & business](09-shipping-and-career/01-career-and-business.md) | 1 |
| **10 · Capstone** | [Ship a game kids want to play](10-capstone/01-capstone-brief.md) | 1 |
| **🤖 [AI Training](ai-training/README.md)** | The 4 levels of training a model (prompt, open-book, fine-tune, skills), with the scripts | toolkit |

**Templates:** [game design doc](templates/game-design-doc.md) · [idea brief](templates/idea-brief.md) · [playtest notes](templates/playtest-notes.md) · [insight log entry](templates/insight-log-entry.md)
**Your ideas:** [vault/](vault/README.md) (how to bring in the DoSa Vault)

---

## The short version of everything

1. **Find the fun in grey boxes before making art.** Kill ideas fast.
2. **The first 5 minutes decide everything.** First action in under 30 s, first reward in under 60 s. Icons beat text. No popups.
3. **Kids want friends, collection, progress and surprise.** Build for *wanting* to come back, not *feeling* unable to stop.
4. **Art must read on a phone:** silhouette, shape language, colour, one art bible, real models.
5. **On Roblox, the algorithm rewards play-through and retention over 28 days.** Ads don't buy ranking.
6. **Kids & Select gates who can see you.** Plan for the eligibility steps if kids are your audience.
7. **Fair money:** convenience and expression. Show odds, no pay-to-win, no fake timers. It's ethical, it's the law in more places every year, and it's what keeps players.
8. **Never trust the client. Never lose a save.**
9. **Measure everything.** Every change gets a metric and a check date, written in the Insight Log.
10. **Teach your AI from your real work.** Your own insights make the best training data.

---

## Train the model (quick start)

```bash
cd game-dev-academy
pip install -r ai-training/requirements.txt
python ai-training/scripts/build_dataset.py              # 331 examples + 196 evals from all modules
export ANTHROPIC_API_KEY=...                             # or: ant auth login
python ai-training/scripts/ask.py "Why do new players leave my TD game at wave 3?"
python ai-training/scripts/run_evals.py --candidate claude --limit 10
```

Fine-tuning an open model, writing skills and the training loop are in [ai-training/README.md](ai-training/README.md).

---

## Status and honesty notes

- Research was gathered on Oct 26, 2026. Roblox's Q3 2026 results come out on Oct 29, so re-check `08-roblox/01`.
- Some facts couldn't be verified (search limits, blocked sites). They're tagged **[U]** and listed in each lesson.
- The starter kit's Luau was written and reviewed carefully but **hasn't been run in Studio yet**. Test it before building on it.
- Lessons on law and policy are **not legal advice**.
