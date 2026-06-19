"""Composite scoring from extracted features."""
from __future__ import annotations

from dataclasses import dataclass

from ranker.config import WEIGHTS
from ranker.features import CandidateFeatures
from ranker.gates import GateDecision


@dataclass
class ScoredCandidate:
    candidate_id: str
    score: float
    features: CandidateFeatures
    gate: GateDecision
    honeypot_flags: list[str]


def composite_score(features: CandidateFeatures, gate: GateDecision, honeypot_risk: float) -> float:
    base = (
        WEIGHTS["title_fit"] * features.title_fit
        + WEIGHTS["career_consistency"] * features.career_consistency
        + WEIGHTS["skill_match"] * features.skill_match
        + WEIGHTS["assessment_corroboration"] * features.assessment_corroboration
        + WEIGHTS["experience_match"] * features.experience_match
        + WEIGHTS["semantic_match"] * features.semantic_match
        + WEIGHTS["location_fit"] * features.location_fit
        + WEIGHTS["product_company_signal"] * features.product_company_signal
    )

    behavioral_multiplier = 0.65 + 0.35 * features.behavioral
    score = base * behavioral_multiplier
    score *= max(0.05, 1.0 - gate.penalty)
    score *= max(0.05, 1.0 - 0.12 * honeypot_risk)

    if features.disqualifiers:
        score *= 0.75

    return round(max(0.0, min(1.0, score)), 6)


def rank_candidates(scored: list[ScoredCandidate], top_n: int = 100) -> list[ScoredCandidate]:
    eligible = [s for s in scored if s.gate.passed]
    eligible.sort(key=lambda s: (-round(s.score, 4), s.candidate_id))
    return eligible[:top_n]


def format_scores_for_output(ranked: list[ScoredCandidate]) -> list[float]:
    """Round scores for CSV output; sort order already handles tie-breaks."""
    output: list[float] = []
    prev = float("inf")
    for item in ranked:
        value = round(item.score, 4)
        if value > prev:
            value = prev
        output.append(value)
        prev = value
    return output
