#!/usr/bin/env python3
"""Fix tie-break ordering in an existing submission.csv without re-ranking."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

from src.output import write_submission


def load_submission(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = []
        for item in reader:
            rows.append(
                {
                    "candidate": {"candidate_id": item["candidate_id"]},
                    "score": float(item["score"]),
                    "reasoning": item["reasoning"],
                }
            )
        return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Fix submission CSV tie-break ordering")
    parser.add_argument("--in", dest="input_path", type=Path, default=Path("submission.csv"))
    parser.add_argument("--out", type=Path, default=Path("submission.csv"))
    args = parser.parse_args()

    rows = load_submission(args.input_path)
    write_submission(rows, args.out)
    print(f"Fixed {len(rows)} rows -> {args.out}")


if __name__ == "__main__":
    main()
