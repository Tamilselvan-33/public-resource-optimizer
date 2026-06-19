#!/usr/bin/env python3
"""Generate top-100 candidate ranking CSV for Redrob hackathon."""
from __future__ import annotations

import argparse
import time
import tracemalloc
from pathlib import Path

from src.honeypot import detect_honeypot_flags, is_hard_honeypot
from src.config import HONEYPOT_HARD_EXCLUDE_MIN_FLAGS
from src.loader import iter_candidates, load_candidates
from src.output import write_submission
from src.reasoning import generate_reasoning
from src.scoring import rank_candidates


def default_candidates_path() -> Path:
    return (
        Path(__file__).resolve().parent.parent
        / "[PUB] India_runs_data_and_ai_challenge"
        / "[PUB] India_runs_data_and_ai_challenge"
        / "India_runs_data_and_ai_challenge"
        / "candidates.jsonl"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Rank candidates for Redrob Senior AI Engineer JD")
    parser.add_argument("--candidates", type=Path, default=default_candidates_path())
    parser.add_argument("--out", type=Path, default=Path(__file__).resolve().parent / "submission.csv")
    parser.add_argument("--top-n", type=int, default=100)
    args = parser.parse_args()

    print("Redrob ranker starting ...", flush=True)
    print(f"Candidates file: {args.candidates}", flush=True)
    print(f"Output file:     {args.out}", flush=True)

    tracemalloc.start()
    t0 = time.perf_counter()

    candidates = load_candidates(args.candidates)
    t_load = time.perf_counter()

    print("Scanning for honeypots ...", flush=True)
    honeypot_excluded = sum(
        1
        for c in candidates
        if is_hard_honeypot(detect_honeypot_flags(c), HONEYPOT_HARD_EXCLUDE_MIN_FLAGS)
    )
    print(f"  found {honeypot_excluded} hard-exclude honeypots.", flush=True)

    print("Ranking candidates (this may take a few minutes) ...", flush=True)
    ranked = rank_candidates(candidates, top_n=args.top_n)
    t_rank = time.perf_counter()

    print("Generating reasoning for top 100 ...", flush=True)
    for index, row in enumerate(ranked, start=1):
        row["reasoning"] = generate_reasoning(row, index)

    print(f"Writing {args.out} ...", flush=True)
    write_submission(ranked, args.out)
    elapsed = time.perf_counter() - t0
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    print(f"Wrote {len(ranked)} rows to {args.out}")
    print(f"Processed {len(candidates)} candidates")
    print(f"Honeypots hard-excluded: {honeypot_excluded}")
    print(f"Load time: {t_load - t0:.2f}s | Rank time: {t_rank - t_load:.2f}s | Total: {elapsed:.2f}s")
    print(f"Peak traced memory: {peak / (1024 * 1024):.1f} MB")
    print("Top 10:")
    for index, row in enumerate(ranked[:10], start=1):
        candidate = row["candidate"]
        print(
            f"  {index}. {candidate['candidate_id']} "
            f"{candidate['profile']['current_title']} "
            f"score={row['score']:.4f} "
            f"loc={candidate['profile']['location']}"
        )


if __name__ == "__main__":
    main()
