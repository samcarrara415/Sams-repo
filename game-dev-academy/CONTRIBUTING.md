# How this repo is written

Everything here follows the same rules, so the guide reads like one book and the AI training data stays clean.

## Writing style

- **Plain words.** Sam reads on a phone. Short paragraphs, tables, and bullet lists. No walls of text.
- **Lead with the answer**, then the detail. Every file opens with a 2–4 line "What you'll learn" box.
- **Do, don't just read.** Every lesson ends with an exercise you can finish in one sitting.
- **Mobile-first, kid-first.** Most of our players are kids on phones who arrived 10 seconds ago.

## Facts and numbers

- **Never invent a number.** If it isn't known, say so and name how to measure it.
- Every number gets a **source link**, the **date** it applies to, and a **confidence tag**:

| Tag | Meaning | Examples |
|-----|---------|----------|
| **[P]** | Primary: the company or platform said it | Roblox investor reports, Roblox Creator Docs, DevForum staff posts, SEC filings |
| **[S]** | Secondary: reputable reporting or analysts | Newzoo, Circana, Sensor Tower, Reuters, Bloomberg, Game Developer |
| **[U]** | Unverified: community data, estimates, rumours | RoTrends, Reddit, YouTube, dev tweets, third-party CCU trackers |

- Write dates as "as of Oct 2026". Market data goes stale fast, so re-check anything older than 6 months.

## Kids and ethics

We study how the biggest studios make games people can't put down, and we use what works. But our players are mostly children, so:

- Hidden odds, fake timers, fake discounts, pay-to-win and guilt-trip popups are **out**. They're unethical, often illegal, and against Roblox rules. Kids also notice them and leave.
- "Compelling" means players **want** to come back (friends, progress, surprises, mastery), not that they feel they **can't** stop.
- See `07-engagement-and-retention/03-ethics-and-law-for-kids-games.md`.

## The "🤖 Train the Model" section

Every lesson file ends with a `## 🤖 Train the Model` section. It says:

1. **What the model should learn** from this lesson (the skill, not the trivia).
2. **The dataset file(s)** in that module's `train/` folder.
3. **How to check it**: the eval file(s) and what a good answer must include.

### Training example format (`<module>/train/<topic>.jsonl`)

One JSON object per line:

```json
{"id": "roblox-monetization-001", "module": "08-roblox", "skill": "monetization", "messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}], "source": "https://... (or 'lesson')"}
```

- Leave out the system message. `ai-training/scripts/build_dataset.py` adds the shared one from `ai-training/prompts/system.md`.
- Mix the kinds of tasks: explain, decide, critique a design, write Luau code, fix a bug, plan a test, read a metric.
- Assistant answers should be **how we want the model to talk**: direct, specific, honest about uncertainty, with sources for numbers.

### Eval format (`<module>/train/<topic>.eval.jsonl`)

```json
{"id": "roblox-monetization-eval-001", "module": "08-roblox", "prompt": "...", "rubric": ["mentions X", "does not recommend Y", "gives a metric to watch"], "reference": "optional short ideal answer"}
```

Rubric items are short pass/fail checks that a grader model can apply.
