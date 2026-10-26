# Career and Business

> **What you'll learn:** the ways to earn a living from game dev (your own games, freelancing, studio jobs), how to build a portfolio that gets you hired, how to work with collaborators fairly, and the business basics (money, taxes, IP, contracts) to sort out before money arrives.

> Not legal or tax advice. Rules depend on your country and age. Talk to a qualified professional (and a parent or guardian if you're under 18) before signing contracts or dealing with taxes.

---

## 1. Four ways to earn

| Path | Pays | Pros | Cons |
|---|---|---|---|
| **Your own games** | Robux → DevEx, Creator Rewards, ads | Biggest upside; you own the IP | Very top-heavy: most games earn little. Slow to start. |
| **Freelancing for Roblox studios** (scripting, modelling, UI, VFX, thumbnails) | Per task, hourly, or % of revenue | Paid sooner; builds a portfolio and network | Unreliable clients; scope creep |
| **Studio job** (Roblox studios like Gamefam, Super League, or independent teams; or traditional game studios) | Salary/contract | Stable; learn from seniors | Less ownership; competitive |
| **Adjacent** (UGC items, asset packs, tutorials, YouTube) | Varies | Uses the same skills | Crowded; needs an audience |

A common path: **freelance + small own games** while learning, then go all-in on the game that shows real retention.

Earnings on Roblox are heavily concentrated at the top. Platform-wide payout totals and averages for top creators are in `08-roblox/01-platform-by-the-numbers.md` and `08-roblox/04-monetization-and-devex.md`. Those are top-end numbers, not what a typical game earns.

---

## 2. A portfolio that gets you hired

**For Roblox studios:**
- 3–5 short **video clips** (15–45 s each) of your best work, shot on a phone-sized screen where relevant
- For each: what *you* did, the tools, and one result ("cut first-session drop-off by 30%"; "500 enemies at 60 FPS on mobile")
- **Live games** with real players beat any demo. Link them.
- For scripters: a GitHub repo with clean, typed, server-authoritative code (your version of the starter kit is perfect)
- For artists: turntables, wireframes and in-engine screenshots (proves your work survives import)

**Where to find work:** Roblox Talent Hub, the DevForum's collaboration categories, Roblox-dev communities and social media, and direct outreach to studios whose games you like. Watch for scams: never pay to get a job, and get agreements in writing.

---

## 3. Working with collaborators

Most Roblox games are made by small teams. Agree **in writing, before work starts**:
- Who does what, and what "done" means
- **Payment:** fixed, hourly, or a % of revenue (and how it's calculated: gross Robux? after marketplace fees? before or after ads?)
- **Ownership:** who owns the code, models and the game itself; what happens if someone leaves
- Credit (name in the credits, portfolio rights)

Roblox **groups** can split revenue with members through group payouts. Revenue-sharing is common, but percentage deals for unfinished games often end badly. For small tasks, prefer fixed payments.

---

## 4. Money basics

- **DevEx:** converts earned Robux to real money if you meet the eligibility rules (age, account standing, minimum balance, verified email). Check Roblox's DevEx page for current rates and requirements. The current rate and history are in `08-roblox/04-monetization-and-devex.md`.
- **Taxes:** DevEx income is taxable income in most countries. In the US, Roblox's DevEx payment provider collects tax information, and you may receive tax forms. Keep records of earnings and expenses (software, ads, freelancer payments).
- **Business entity:** when income grows, many devs form a company (e.g. an LLC in the US) to separate business and personal finances. Get local advice.
- **Reinvest wisely:** your first earnings are best spent on art quality, sound, and small ad tests of thumbnails. Hype doesn't count.

---

## 5. Protecting your work

- **Copyright:** your code, art and music are protected by copyright automatically. Game *ideas and genres* generally aren't. Clones of hit mechanics appear within days (see `08-roblox/12-trends-and-viral-mechanics.md`). Your protection is speed, quality, original art and community.
- **Don't use others' IP:** brand names, anime characters, copyrighted music or memes you don't have rights to can get your game taken down (DMCA). Original characters are safer and more valuable long-term.
- **Back up everything** outside Roblox (git, Blender files, PSDs).

---

## 6. Staying healthy

Game dev rewards consistency over crunch. Burnout kills more projects than bugs do.
- Keep a sustainable weekly schedule. A rest day is part of the plan.
- Celebrate shipped things, not just hits.
- Ignore toxic comments. Read feedback for patterns, not for individual insults.
- If you're a student: school first, game dev second. Shipping small games around your schedule is still progress.

---

## Exercise

1. Choose your path for the next 6 months (own games / freelance / both).
2. Make a one-page portfolio with 3 clips and one live game link.
3. Write a one-paragraph collaborator agreement template for small tasks.

---

## 🤖 Train the Model

**What the model should learn:**
- give practical, honest career and business guidance
- recommend written agreements
- say when professional (legal/tax) advice is needed
- never promise income

**Dataset:** `09-shipping-and-career/train/career.jsonl`.

**Evals:** `09-shipping-and-career/train/career.eval.jsonl`. Good answers:
- recommend written agreements
- mention IP and taxes appropriately
- avoid income promises
- point to current official DevEx terms
