# Choosing an Engine

> **What you'll learn:** what each major engine and platform is good at, what it costs, and why this academy starts on Roblox. If you want to go beyond Roblox later, this tells you where to go next.

---

## 1. The short answer

| You want to… | Use | Why |
|---|---|---|
| Reach kids and teens fast, multiplayer by default | **Roblox** | Built-in audience, multiplayer, hosting and payments |
| Build islands inside Fortnite for its audience | **UEFN / Fortnite Creative** | Fortnite's audience; engagement-based payouts |
| Make a PC/console/mobile game you own and sell | **Unity** or **Godot** | Full control, mature tools (Unity) or fully free and open (Godot) |
| Make high-end 3D (realistic, big worlds) | **Unreal Engine 5** | Top graphics, C++ and Blueprints |
| Sell on Minecraft's marketplace | **Minecraft Bedrock add-ons** | Partner program, huge kid audience |
| Make a Garry's Mod-style sandbox game | **s&box** (Facepunch) | Source 2 + C#. Still maturing; check its current status [U] |

The UGC platforms are compared with numbers in `06-market-research/03-ugc-platforms-compared.md`.

---

## 2. Engine-by-engine

### Roblox Studio
- **Language:** Luau (a typed Lua dialect)
- **Strengths:** instant multiplayer, free hosting, built-in payments (Robux), discovery, avatars, a huge young audience mostly on mobile
- **Weaknesses:** you don't own the platform or the players; the rules (payouts, discovery, policy) can change; graphics are limited compared with Unreal; the audience skews young, so safety rules are strict
- **Money:** Robux from passes, products, subscriptions, Creator Rewards (which replaced Premium Payouts in July 2025) and ads, cashed out through DevEx. Details and current rates in `08-roblox/04-monetization-and-devex.md`.

### Unity
- **Language:** C#
- **Strengths:** huge mobile and indie ecosystem, an asset store, tons of tutorials, exports everywhere
- **History to know:** Unity announced a per-install "Runtime Fee" in 2023, then cancelled it in September 2024 after a developer backlash [S]. Check the current licence terms before you commit.
- **Best for:** mobile games outside Roblox, 2D/3D indies

### Godot
- **Language:** GDScript (Python-like), C#
- **Strengths:** free and open source (MIT licence), no royalties, light and fast to learn, great for 2D
- **Weaknesses:** smaller ecosystem; console exports go through third parties
- **Best for:** indie PC games, learning engine fundamentals

### Unreal Engine 5
- **Language:** C++, Blueprints (visual scripting)
- **Strengths:** top-end graphics (Nanite, Lumen), used by big studios, and the same skills carry over to UEFN
- **Cost:** free to start. Epic's standard licence charges a 5% royalty on gross revenue over $1 million per product [P]. Check Epic's current EULA.
- **Weaknesses:** heavy, steep learning curve, overkill for most solo projects

### UEFN (Unreal Editor for Fortnite)
- **Language:** Verse
- **Strengths:** Fortnite's audience; "engagement payouts" share a pool of Fortnite revenue based on how much players engage with your island [P]
- **Weaknesses:** limited compared with full Unreal; audience a bit older than Roblox's; less control over monetization

---

## 3. Why this academy is Roblox-first

1. **Fastest path to real players.** You publish in minutes, and the audience is already there.
2. **Multiplayer is free.** Social play is the #1 thing kids want, and on most engines it's the hardest part to build.
3. **Everything you learn transfers.** Design, art, playtesting, analytics, economy, live-ops and market research work on every platform.
4. **It's where Sam's games and data already are.** Your insight log compounds.

The trade-off: **platform risk.** Roblox controls discovery, payouts and rules. Protect yourself:
- Keep your art source files (Blender, PSDs) and code in git, outside Roblox.
- Build skills, not just one game.
- Read the DevForum announcements weekly. Policy and payout changes come with notice.

---

## 4. When to add a second engine

Consider Unity or Godot when:
- you want a premium PC game on Steam, or a mobile app outside Roblox
- you've shipped at least one live Roblox game and understand the full loop

Consider UEFN when:
- your idea fits Fortnite's older audience and shooter/party style
- you already know Unreal

Your Blender skills, design docs and analytics habits come with you everywhere.

---

## Exercise

1. Write your 1-year goal in one line ("A live Roblox TD game with 1,000 daily players", or "A Steam demo").
2. Use the table in section 1 to pick your engine.
3. Write the top 2 platform risks for that choice and how you'll reduce them.

---

## 🤖 Train the Model

**What the model should learn:**
- recommend an engine from the user's actual goals and constraints
- state the costs and licence facts with sources, and hedge when they may have changed
- name platform risks honestly

**Dataset:** `03-engines/train/engines.jsonl`.

**Evals:** `03-engines/train/engines.eval.jsonl`. Good answers:
- ask or infer the goal
- give a clear pick
- mention licensing or payout caveats
- don't bash any engine
