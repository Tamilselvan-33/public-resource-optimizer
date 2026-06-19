"""Hard gating before final ranking."""
from __future__ import annotations

from dataclasses import dataclass

from ranker.features import CandidateFeatures
from ranker.honeypot import HoneypotResult


@dataclass
class GateDecision:
    passed: bool
    penalty: float
    reasons: list[str]


DISQUALIFIER_PENALTY = {
    "consulting_only": 0.55,
    "title_chasing": 0.45,
    "langchain_only": 0.50,
    "cv_speech_robotics_only": 0.60,
    "pure_research_only": 0.70,
}


def apply_gates(features: CandidateFeatures, honeypot: HoneypotResult) -> GateDecision:
    reasons: list[str] = []
    penalty = 0.0

    if honeypot.is_honeypot:
        return GateDecision(passed=False, penalty=1.0, reasons=[f"honeypot: {', '.join(honeypot.flags)}"])

    if features.title_fit < 0.12 and features.career_consistency < 0.35:
        return GateDecision(
            passed=False,
            penalty=1.0,
            reasons=["non-AI role with no credible ML/IR career evidence"],
        )

    for flag in features.disqualifiers:
        penalty += DISQUALIFIER_PENALTY.get(flag, 0.35)
        reasons.append(f"JD disqualifier: {flag}")

    if features.title_fit < 0.15 and features.skill_match > 0.55:
        penalty += 0.45
        reasons.append("keyword skills without matching title")

    penalty = min(0.95, penalty)
    passed = penalty < 0.85
    return GateDecision(passed=passed, penalty=penalty, reasons=reasons)
