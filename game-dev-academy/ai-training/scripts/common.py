"""Shared helpers for the ai-training scripts. Standard library only."""

from __future__ import annotations

import json
from pathlib import Path

ACADEMY_ROOT = Path(__file__).resolve().parents[2]
AI_ROOT = ACADEMY_ROOT / "ai-training"
SYSTEM_PROMPT_PATH = AI_ROOT / "prompts" / "system.md"
DATA_DIR = AI_ROOT / "data"

TRAIN_REQUIRED = {"id", "module", "skill", "messages"}
EVAL_REQUIRED = {"id", "module", "prompt", "rubric"}


def system_prompt() -> str:
    return SYSTEM_PROMPT_PATH.read_text(encoding="utf-8").strip()


def module_dirs() -> list[Path]:
    """Lesson modules are the numbered folders, e.g. 08-roblox."""
    return sorted(p for p in ACADEMY_ROOT.iterdir() if p.is_dir() and p.name[:2].isdigit())


def read_jsonl(path: Path) -> list[dict]:
    rows = []
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as e:
            raise ValueError(f"{path}:{n}: invalid JSON ({e})") from e
    return rows


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def train_files() -> list[Path]:
    return sorted(
        p for d in module_dirs() for p in (d / "train").glob("*.jsonl")
        if not p.name.endswith(".eval.jsonl")
    )


def eval_files() -> list[Path]:
    return sorted(p for d in module_dirs() for p in (d / "train").glob("*.eval.jsonl"))


def check_train_row(row: dict) -> list[str]:
    problems = [f"missing '{k}'" for k in TRAIN_REQUIRED - row.keys()]
    msgs = row.get("messages") or []
    if not msgs:
        problems.append("no messages")
    roles = [m.get("role") for m in msgs]
    if any(r not in ("user", "assistant") for r in roles):
        problems.append("roles must be user/assistant (system is added at build time)")
    if roles and (roles[0] != "user" or roles[-1] != "assistant"):
        problems.append("must start with user and end with assistant")
    if any(a == b for a, b in zip(roles, roles[1:])):
        problems.append("roles must alternate")
    if any(not str(m.get("content", "")).strip() for m in msgs):
        problems.append("empty message content")
    return problems


def check_eval_row(row: dict) -> list[str]:
    problems = [f"missing '{k}'" for k in EVAL_REQUIRED - row.keys()]
    rubric = row.get("rubric")
    if not isinstance(rubric, list) or not rubric:
        problems.append("rubric must be a non-empty list")
    return problems
