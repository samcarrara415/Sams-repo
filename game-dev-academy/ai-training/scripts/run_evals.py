"""Score a model on the academy's evals with a rubric grader.

    # Claude with the lessons (level 1+2)
    python ai-training/scripts/run_evals.py --candidate claude
    # Claude without the lessons, to see what the book adds
    python ai-training/scripts/run_evals.py --candidate claude --no-lessons
    # Any other model (e.g. your fine-tuned one): give it a JSONL of {"id", "answer"}
    python ai-training/scripts/run_evals.py --answers data/answers-finetuned.jsonl
    # Just one module while you work on it
    python ai-training/scripts/run_evals.py --candidate claude --module 08-roblox

Every rubric line is graded pass/fail by Claude. The report shows the score per
module and the rubric lines that failed most, which tells you what to teach next.
Run build_dataset.py first so data/evals.jsonl exists. Each run calls the API
once per eval item (twice with --candidate), so try --limit 5 first.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

import anthropic
from pydantic import BaseModel

from ask import answer
from common import DATA_DIR, read_jsonl, write_jsonl

GRADER_MODEL = "claude-opus-5-5"


class RubricCheck(BaseModel):
    item: str
    passed: bool
    why: str


class Grade(BaseModel):
    checks: list[RubricCheck]


def grade(client: anthropic.Anthropic, item: dict, reply: str) -> Grade:
    rubric = "\n".join(f"- {r}" for r in item["rubric"])
    reference = f"\nReference answer (for guidance, not required wording):\n{item['reference']}\n" if item.get("reference") else ""
    response = client.messages.parse(
        model=GRADER_MODEL,
        max_tokens=4000,
        output_config={"effort": "low"},
        system="You grade answers from a game-development assistant. Judge each rubric line strictly and independently. A line passes only if the answer clearly satisfies it.",
        messages=[{"role": "user", "content": (
            f"Question:\n{item['prompt']}\n{reference}\nAnswer to grade:\n{reply}\n\n"
            f"Rubric (one check per line, keep the same wording in `item`):\n{rubric}"
        )}],
        output_format=Grade,
    )
    return response.parsed_output


def main() -> int:
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--candidate", choices=["claude"])
    src.add_argument("--answers", help="JSONL of {id, answer} from any model")
    ap.add_argument("--no-lessons", action="store_true")
    ap.add_argument("--module")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--out", default=str(DATA_DIR / "eval-report.jsonl"))
    args = ap.parse_args()

    items = read_jsonl(DATA_DIR / "evals.jsonl")
    if args.module:
        items = [i for i in items if i["module"] == args.module]
    items = items[: args.limit] if args.limit else items
    given = {r["id"]: r["answer"] for r in read_jsonl(Path(args.answers))} if args.answers else {}

    client = anthropic.Anthropic()
    results, per_module, failed_lines = [], defaultdict(lambda: [0, 0]), Counter()
    for n, item in enumerate(items, start=1):
        if args.answers:
            if item["id"] not in given:
                print(f"skip {item['id']}: no answer in {args.answers}", file=sys.stderr)
                continue
            reply = given[item["id"]]
        else:
            reply = answer(client, item["prompt"], use_lessons=not args.no_lessons)
        g = grade(client, item, reply)
        passed = sum(c.passed for c in g.checks)
        per_module[item["module"]][0] += passed
        per_module[item["module"]][1] += len(g.checks)
        failed_lines.update(f"{item['module']}: {c.item}" for c in g.checks if not c.passed)
        results.append({"id": item["id"], "module": item["module"], "answer": reply,
                        "score": passed / max(len(g.checks), 1), "checks": [c.model_dump() for c in g.checks]})
        print(f"[{n}/{len(items)}] {item['id']}: {passed}/{len(g.checks)}")

    write_jsonl(Path(args.out), results)
    print("\nScore by module")
    total_p = total_n = 0
    for module, (p, t) in sorted(per_module.items()):
        total_p, total_n = total_p + p, total_n + t
        print(f"  {module:32} {p:4}/{t:<4} {100 * p / max(t, 1):5.1f}%")
    print(f"  {'ALL':32} {total_p:4}/{total_n:<4} {100 * total_p / max(total_n, 1):5.1f}%")
    print("\nMost-failed rubric lines (teach these next)")
    for line, count in failed_lines.most_common(10):
        print(f"  {count}x {line}")
    print(f"\nfull report: {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
