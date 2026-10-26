"""Collect every module's train/*.jsonl into one fine-tuning dataset.

    python ai-training/scripts/build_dataset.py            # build data/train.jsonl + data/val.jsonl
    python ai-training/scripts/build_dataset.py --check    # only validate, exit 1 on problems

Each output row is {"messages": [system, user, assistant, ...], "id", "module", "skill"}:
the chat format that Hugging Face TRL, Unsloth, Axolotl and most fine-tuning
services accept. Evals are validated too, and copied to data/evals.jsonl.
"""

from __future__ import annotations

import argparse
import hashlib
import sys
from collections import Counter

from common import (
    DATA_DIR, check_eval_row, check_train_row, eval_files, read_jsonl,
    system_prompt, train_files, write_jsonl,
)


def val_bucket(row_id: str, val_percent: int) -> bool:
    """Stable split: the same id always lands in the same set."""
    return int(hashlib.sha256(row_id.encode()).hexdigest(), 16) % 100 < val_percent


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="validate only")
    ap.add_argument("--val-percent", type=int, default=10)
    args = ap.parse_args()

    problems: list[str] = []
    train_rows: list[dict] = []
    eval_rows: list[dict] = []
    seen: set[str] = set()

    for path in train_files():
        for row in read_jsonl(path):
            where = f"{path.relative_to(path.parents[2])} id={row.get('id')}"
            problems += [f"{where}: {p}" for p in check_train_row(row)]
            if row.get("id") in seen:
                problems.append(f"{where}: duplicate id")
            seen.add(row.get("id"))
            train_rows.append(row)

    for path in eval_files():
        for row in read_jsonl(path):
            where = f"{path.relative_to(path.parents[2])} id={row.get('id')}"
            problems += [f"{where}: {p}" for p in check_eval_row(row)]
            if row.get("id") in seen:
                problems.append(f"{where}: duplicate id")
            seen.add(row.get("id"))
            eval_rows.append(row)

    for p in problems:
        print("PROBLEM", p, file=sys.stderr)

    by_module = Counter(r["module"] for r in train_rows if "module" in r)
    evals_by_module = Counter(r["module"] for r in eval_rows if "module" in r)
    print(f"{len(train_rows)} training examples, {len(eval_rows)} eval items")
    for module in sorted(set(by_module) | set(evals_by_module)):
        print(f"  {module:32} train={by_module[module]:4}  eval={evals_by_module[module]:3}")

    if problems:
        return 1
    if args.check:
        return 0

    system = {"role": "system", "content": system_prompt()}
    train, val = [], []
    for row in train_rows:
        out = {
            "id": row["id"], "module": row["module"], "skill": row["skill"],
            "messages": [system, *row["messages"]],
        }
        (val if val_bucket(row["id"], args.val_percent) else train).append(out)

    write_jsonl(DATA_DIR / "train.jsonl", train)
    write_jsonl(DATA_DIR / "val.jsonl", val)
    write_jsonl(DATA_DIR / "evals.jsonl", eval_rows)
    print(f"wrote {len(train)} train / {len(val)} val / {len(eval_rows)} evals to {DATA_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
