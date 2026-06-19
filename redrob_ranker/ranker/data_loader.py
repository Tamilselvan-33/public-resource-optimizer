"""Load candidate records from JSONL."""
from __future__ import annotations

import gzip
import json
from pathlib import Path
from typing import Iterator


def iter_candidates(path: Path) -> Iterator[dict]:
    opener = gzip.open if path.suffix == ".gz" or path.name.endswith(".jsonl.gz") else open
    mode = "rt" if path.suffix in {".gz", ""} or path.name.endswith(".gz") else "r"
    with opener(path, mode, encoding="utf-8") as handle:  # type: ignore[arg-type]
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def load_candidates(path: Path) -> list[dict]:
    return list(iter_candidates(path))
