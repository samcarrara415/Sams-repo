"""Ask the academy-trained assistant a question (Claude + lesson search).

    export ANTHROPIC_API_KEY=...        # or `ant auth login`
    python ai-training/scripts/ask.py "Why do new players leave my tower defense game in round 3?"
    python ai-training/scripts/ask.py --no-lessons "..."   # same model without the book, to compare

This is "training" level 1+2 from ai-training/README.md: a strong system
prompt plus the relevant lessons pulled in on every question.
"""

from __future__ import annotations

import argparse
import sys

import anthropic

from common import system_prompt
from retrieval import context_for

MODEL = "claude-opus-5-5"


def answer(client: anthropic.Anthropic, question: str, use_lessons: bool = True,
           model: str = MODEL, effort: str = "high") -> str:
    content = question
    if use_lessons:
        content = (
            "Lessons from the academy that may help (cite the source path when you use one):\n\n"
            f"{context_for(question)}\n\nQuestion: {question}"
        )
    response = client.beta.messages.create(
        model=model,
        max_tokens=16000,
        system=system_prompt(),
        output_config={"effort": effort},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        messages=[{"role": "user", "content": content}],
    )
    if response.stop_reason == "refusal":
        return "[declined] " + (response.stop_details.explanation if response.stop_details else "")
    return "".join(b.text for b in response.content if b.type == "text")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("question")
    ap.add_argument("--no-lessons", action="store_true")
    ap.add_argument("--model", default=MODEL)
    args = ap.parse_args()
    print(answer(anthropic.Anthropic(), args.question, not args.no_lessons, args.model))
    return 0


if __name__ == "__main__":
    sys.exit(main())
