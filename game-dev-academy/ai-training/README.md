# 🤖 Training a Model to Be a Game Dev

Every lesson in this repo teaches two students: **you**, and **an AI model** that learns alongside you. Each lesson ends with a **🤖 Train the Model** section. Each module has a `train/` folder with:

- `<topic>.jsonl`: training examples (a question plus the answer we want)
- `<topic>.eval.jsonl`: test questions with a pass/fail rubric

By the end you have a game-dev assistant that knows **your** rules (mobile-first, kid-safe, real Blender art, measure everything). You also have a way to **prove** it got better.

> **What you'll learn:** the 4 ways to "train" a model, which one to use when, and how to run each with the scripts in `scripts/`.

---

## The 4 levels of training

| Level | What it is | Cost | When to use it |
|---|---|---|---|
| **1. Prompt** | A strong system prompt (`prompts/system.md`) | Free | Always. It's the base for every other level. |
| **2. Open-book** | Search the lessons and paste the best ones into each question (`scripts/ask.py`) | Cents per question | Facts change (prices, Roblox APIs, market data). Update a lesson and the model knows it instantly. |
| **3. Fine-tune** | Train an open-weights model on the JSONL examples (`scripts/finetune_lora.py`) | A few dollars of GPU time | You want a small model that answers in your style offline, or you want to learn how fine-tuning works. |
| **4. Skills** | Package the know-how as Claude Code skills (`skills/`) | Free | You want Claude to *do the work* (read your analytics, write Luau, update the vault), not just answer. |

**Rule of thumb:** levels 1 + 2 + 4 with a top model beat a fine-tuned small model for real work. Do level 3 to learn, or when you need something small and offline. You can't fine-tune hosted Claude models yourself. With Claude, the "training" is the prompt, the lessons and the skills.

---

## Quick start

```bash
cd game-dev-academy
pip install -r ai-training/requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...        # or: ant auth login

# 1. Check and build the dataset from every module's train/ folder
python ai-training/scripts/build_dataset.py --check
python ai-training/scripts/build_dataset.py

# 2. Ask the open-book assistant something
python ai-training/scripts/ask.py "My TD game loses 40% of new players before wave 3. What do I check first?"

# 3. Measure it: with the lessons vs. without
python ai-training/scripts/run_evals.py --candidate claude --limit 10
python ai-training/scripts/run_evals.py --candidate claude --no-lessons --limit 10
```

The eval report prints a score per module and the **rubric lines that failed most**. That list is your to-do list: write a lesson or examples that teach exactly that, rebuild, and re-run.

---

## The training loop (do this after every module)

```
 read lesson ──► do the exercise ──► write 5–15 examples ──► write 3–8 evals
      ▲                                                            │
      └──── fix the lesson / add examples ◄── run evals ◄── build ─┘
```

1. **Finish the lesson yourself first.** You can't teach what you haven't done.
2. **Write examples from real work.** Your own bugs, your own analytics, your own design calls make the best data. A real "45 of 110 new players quit in training" beats any made-up example.
3. **Draft faster with Claude, then review.** `scripts/draft_examples.py <lesson.md>` writes drafts to `train/_review/`. Read every line. Delete anything wrong or vague. Then move the good ones into the topic file.
4. **Write evals before you trust it.** Rubric lines are short pass/fail checks, e.g. "says to measure with a funnel step", "doesn't suggest hidden odds".
5. **Build, run, read the failures.** Fix the cause, not the score.

### What makes a good example

| ✅ Good | ❌ Bad |
|---|---|
| Teaches a **decision** ("should I add a forced tutorial?") | Tests trivia ("what year was Roblox founded?") |
| Uses real numbers **with sources** | Invents numbers |
| Says **how to measure** the result | Ends with an opinion only |
| Includes **refusals done right** (asked for a dark pattern → offers the kid-safe version that works) | Lectures without giving an alternative |
| Luau that runs, is server-side, and validates input | Client-trusting code |

Mix of task kinds to aim for: explain 20%, decide 20%, critique 15%, code 15%, debug 10%, plan a test 10%, read a metric 5%, refuse and redirect 5%.

---

## Level 3: fine-tuning walkthrough

```bash
pip install -r ai-training/requirements-finetune.txt   # needs an NVIDIA GPU (Colab T4 is fine for 1.5B)
python ai-training/scripts/build_dataset.py
python ai-training/scripts/finetune_lora.py --base Qwen/Qwen2.5-1.5B-Instruct --epochs 3 --name dosa-v1

# before vs after
python ai-training/scripts/local_answers.py --no-adapter --base Qwen/Qwen2.5-1.5B-Instruct
python ai-training/scripts/local_answers.py --adapter ai-training/runs/dosa-v1
python ai-training/scripts/run_evals.py --answers ai-training/data/answers-base.jsonl
python ai-training/scripts/run_evals.py --answers ai-training/data/answers-dosa-v1.jsonl
```

What happens:

- **LoRA** trains a small set of extra weights (an "adapter") on top of the base model instead of changing all of it. It's cheap, fast, and easy to undo.
- `build_dataset.py` puts the shared system prompt on every example and splits off 10% for validation. The split is stable: the same id always lands in the same set.
- Watch **eval loss**. If training loss keeps falling but eval loss rises, the model is memorising. Stop earlier or add more varied examples.
- A few hundred great examples beat thousands of sloppy ones.

Any chat model on Hugging Face works with `--base`. Bigger models score higher but need more GPU memory. Check each model's license before you ship anything built on it.

---

## Level 4: skills

`skills/game-dev-mentor/SKILL.md` is a Claude Code skill that points Claude at this academy. Copy it into `~/.claude/skills/` (or your project's `.claude/skills/`). It works alongside the skills you already have, like **roblox-player-mind**.

Good next skills to write, each from one module:

| Skill | From module | What it does |
|---|---|---|
| `roblox-luau-reviewer` | 08-roblox | Reviews Luau for security (remote validation), performance and DataStore safety |
| `kid-safe-monetization-check` | 07, 08 | Checks a shop/gacha design against the red-line list |
| `art-critic` | 04-art | Grades a thumbnail, icon or model screenshot against the art checklist |
| `idea-scorer` | 06-market-research | Scores a game idea with the weighted scorecard |
| `liveops-planner` | 07 | Builds a 12-week event calendar |

---

## Files

```
ai-training/
├── README.md                ← you are here
├── prompts/system.md        ← the shared system prompt (level 1)
├── scripts/
│   ├── common.py            ← paths, JSONL helpers, schema checks
│   ├── build_dataset.py     ← collect + validate + split → data/
│   ├── retrieval.py         ← BM25 lesson search (level 2)
│   ├── ask.py               ← ask the open-book assistant
│   ├── run_evals.py         ← rubric-graded evals for any model
│   ├── draft_examples.py    ← Claude drafts examples for your review
│   ├── finetune_lora.py     ← LoRA fine-tune (level 3)
│   └── local_answers.py     ← run evals on a local model
├── skills/game-dev-mentor/  ← Claude Code skill (level 4)
├── requirements.txt
└── requirements-finetune.txt
```

`data/` and `runs/` are build outputs and are git-ignored.
