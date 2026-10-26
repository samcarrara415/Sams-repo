"""Tiny BM25 search over the academy's lessons, so the model can "open the book".

No vector database and no extra packages: lessons are split at markdown
headings and ranked with BM25. Good enough for a few hundred pages.
"""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from common import ACADEMY_ROOT

WORD = re.compile(r"[a-z0-9]+")
SKIP_DIRS = {"data", ".git", "node_modules"}


@dataclass
class Chunk:
    path: Path
    heading: str
    text: str

    def cite(self) -> str:
        return f"{self.path.relative_to(ACADEMY_ROOT)} > {self.heading}"


def tokens(text: str) -> list[str]:
    return WORD.findall(text.lower())


def load_chunks(max_chars: int = 4000) -> list[Chunk]:
    chunks: list[Chunk] = []
    for path in sorted(ACADEMY_ROOT.rglob("*.md")):
        if SKIP_DIRS & set(path.relative_to(ACADEMY_ROOT).parts):
            continue
        heading, lines = path.stem, []
        for line in path.read_text(encoding="utf-8").splitlines() + ["# <end>"]:
            if line.startswith("#"):
                body = "\n".join(lines).strip()
                for i in range(0, len(body), max_chars):
                    chunks.append(Chunk(path, heading, body[i:i + max_chars]))
                heading, lines = line.lstrip("# ").strip(), []
            else:
                lines.append(line)
    return [c for c in chunks if c.text]


class Index:
    def __init__(self, chunks: list[Chunk], k1: float = 1.4, b: float = 0.75):
        self.chunks, self.k1, self.b = chunks, k1, b
        self.docs = [Counter(tokens(c.heading + " " + c.text)) for c in chunks]
        self.lengths = [sum(d.values()) for d in self.docs]
        self.avg = sum(self.lengths) / max(len(self.lengths), 1)
        df = Counter(t for d in self.docs for t in d)
        n = len(self.docs)
        self.idf = {t: math.log(1 + (n - f + 0.5) / (f + 0.5)) for t, f in df.items()}

    def search(self, query: str, k: int = 6) -> list[Chunk]:
        q = tokens(query)
        scored = []
        for i, doc in enumerate(self.docs):
            s = 0.0
            for t in q:
                f = doc.get(t, 0)
                if f:
                    norm = f + self.k1 * (1 - self.b + self.b * self.lengths[i] / self.avg)
                    s += self.idf[t] * f * (self.k1 + 1) / norm
            if s:
                scored.append((s, i))
        return [self.chunks[i] for _, i in sorted(scored, reverse=True)[:k]]


def context_for(query: str, k: int = 6) -> str:
    hits = Index(load_chunks()).search(query, k)
    return "\n\n".join(f"<lesson source=\"{c.cite()}\">\n{c.text}\n</lesson>" for c in hits)
