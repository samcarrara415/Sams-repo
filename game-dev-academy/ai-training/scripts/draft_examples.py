"""Have Claude draft new training examples from a lesson, for YOU to review.

    python ai-training/scripts/draft_examples.py 08-roblox/14-launch-and-liveops.md --count 10

Drafts go to <module>/train/_review/<lesson>.jsonl. Read every one, fix or
delete what's wrong, then move the good lines into <module>/train/<topic>.jsonl.
Never skip the review: a model trained on wrong examples learns wrong things
with confidence.
"""

from __future__ import annotations

import argparse
import sys
from typing import Literal

import anthropic
from pydantic import BaseModel

from common import ACADEMY_ROOT, write_jsonl

MODEL = "claude-opus-5-5"

TaskKind = Literal["explain", "decide", "critique", "code", "debug", "plan-test", "read-metric", "refuse-and-redirect"]


class Example(BaseModel):
    kind: TaskKind
    skill: str
    user: str
    assistant: str


class Drafts(BaseModel):
    examples: list[Example]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("lesson", help="path relative to game-dev-academy/")
    ap.add_argument("--count", type=int, default=10)
    args = ap.parse_args()

    lesson = ACADEMY_ROOT / args.lesson
    module = lesson.relative_to(ACADEMY_ROOT).parts[0]
    style = (ACADEMY_ROOT / "CONTRIBUTING.md").read_text(encoding="utf-8")

    response = anthropic.Anthropic().messages.parse(
        model=MODEL,
        max_tokens=32000,
        output_config={"effort": "high"},
        system="You write fine-tuning examples that teach a model to be a strong, honest game developer for kids' Roblox games.",
        messages=[{"role": "user", "content": (
            f"House rules:\n{style}\n\nLesson ({args.lesson}):\n{lesson.read_text(encoding='utf-8')}\n\n"
            f"Write {args.count} varied examples that teach the SKILLS in this lesson, not trivia. "
            "Mix task kinds. Users sound like a real solo dev (casual, sometimes vague). "
            "Assistant answers follow the house rules, use only facts that appear in the lesson, "
            "and keep its source tags on any number."
        )}],
        output_format=Drafts,
    )
    drafts = response.parsed_output
    stem = lesson.stem
    rows = [{
        "id": f"{module}-{stem}-draft-{i:03}", "module": module, "skill": ex.skill, "kind": ex.kind,
        "messages": [{"role": "user", "content": ex.user}, {"role": "assistant", "content": ex.assistant}],
        "source": f"draft from {args.lesson}; needs human review",
    } for i, ex in enumerate(drafts.examples, start=1)]

    out = ACADEMY_ROOT / module / "train" / "_review" / f"{stem}.jsonl"
    write_jsonl(out, rows)
    print(f"wrote {len(rows)} drafts to {out.relative_to(ACADEMY_ROOT)}. Review them before use.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
