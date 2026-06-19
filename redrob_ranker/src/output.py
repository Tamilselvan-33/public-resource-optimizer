"""CSV submission writer."""
from __future__ import annotations

import csv
from pathlib import Path


def _prepare_rows(rows: list[dict]) -> list[tuple[str, float, str]]:
    """Sort and format scores for validator tie-break rules."""
    prepared = [
        (
            row["candidate"]["candidate_id"],
            row["score"],
            row["reasoning"],
        )
        for row in rows
    ]
    # Sort by score desc, then candidate_id asc (validator tie-break rule).
    prepared.sort(key=lambda item: (-round(item[1], 4), item[0]))

    output: list[tuple[str, float, str]] = []
    prev_score: float | None = None
    for cid, raw_score, reasoning in prepared:
        score = round(raw_score, 4)
        if prev_score is not None and score > prev_score:
            score = prev_score
        prev_score = score
        output.append((cid, score, reasoning))
    return output


def write_submission(rows: list[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    prepared = _prepare_rows(rows)
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["candidate_id", "rank", "score", "reasoning"])
        for rank, (cid, score, reasoning) in enumerate(prepared, start=1):
            writer.writerow([cid, rank, f"{score:.4f}", reasoning])

