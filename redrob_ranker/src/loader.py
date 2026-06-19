"""Load candidate records from JSONL."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterator


def iter_candidates(path: Path) -> Iterator[dict]:
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def load_candidates(path: Path, progress_every: int = 10_000) -> list[dict]:
    candidates: list[dict] = []
    print(f"Loading candidates from {path} ...", flush=True)
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            candidates.append(json.loads(line))
            if progress_every and line_number % progress_every == 0:
                print(f"  loaded {line_number:,} rows ...", flush=True)
    print(f"  done — {len(candidates):,} candidates loaded.", flush=True)
    return candidates
