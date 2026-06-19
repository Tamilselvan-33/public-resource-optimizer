"""Rule-based honeypot detection (refined rules from Step 0 exploration)."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class HoneypotResult:
    flags: list[str] = field(default_factory=list)
    risk_score: float = 0.0
    is_honeypot: bool = False


def _months_between(start: str, end: str | None) -> int:
    from datetime import datetime

    s = datetime.strptime(start, "%Y-%m-%d")
    e = datetime.strptime(end, "%Y-%m-%d") if end else datetime(2026, 6, 18)
    return (e.year - s.year) * 12 + (e.month - s.month)


def detect_honeypot(candidate: dict) -> HoneypotResult:
    flags: list[str] = []
    yoe = candidate["profile"]["years_of_experience"]
    skills = candidate["skills"]
    signals = candidate["redrob_signals"]

    near_zero = [
        (s["name"], s["proficiency"], s.get("duration_months", 0) or 0)
        for s in skills
        if s["proficiency"] in ("expert", "advanced") and (s.get("duration_months", 0) or 0) <= 1
    ]
    if len(near_zero) >= 2:
        flags.append("multi_high_prof_near_zero_dur")
    if any(s["proficiency"] == "expert" and (s.get("duration_months", 0) or 0) == 0 for s in skills):
        flags.append("expert_zero_duration")

    advanced = [s for s in skills if s["proficiency"] in ("expert", "advanced")]
    if len(advanced) >= 8:
        avg_dur = sum(s.get("duration_months", 0) or 0 for s in advanced) / len(advanced)
        if avg_dur < 6:
            flags.append("many_adv_low_avg_dur")

    total_skill_months = sum(s.get("duration_months", 0) or 0 for s in skills)
    if total_skill_months > yoe * 12 * 2.5:
        flags.append("skill_months_exceed_yoe")

    job_months = sum(j["duration_months"] for j in candidate["career_history"])
    if job_months > yoe * 12 + 24:
        flags.append("job_months_exceed_yoe")

    for job in candidate["career_history"]:
        if job["is_current"] and job["duration_months"] > yoe * 12 + 6:
            flags.append("current_job_longer_than_yoe")
            break

    earliest = min(j["start_date"] for j in candidate["career_history"])
    start_year = int(earliest[:4])
    if yoe > 12 and start_year > 2012:
        flags.append("yoe_vs_start_mismatch")

    assess_gaps = [
        s["name"]
        for s in skills
        if s["proficiency"] in ("expert", "advanced")
        and (score := signals["skill_assessment_scores"].get(s["name"])) is not None
        and score < 40
    ]
    if len(assess_gaps) >= 3:
        flags.append("multi_assessment_gap")

    risk = float(len(flags))
    if "expert_zero_duration" in flags or "multi_high_prof_near_zero_dur" in flags:
        risk += 1.0

    from ranker.config import HONEYPOT_EXCLUDE_FLAGS

    is_honeypot = len(flags) >= HONEYPOT_EXCLUDE_FLAGS or bool(
        {"expert_zero_duration", "multi_high_prof_near_zero_dur"} & set(flags)
        and len(flags) >= 1
    )
    return HoneypotResult(flags=flags, risk_score=risk, is_honeypot=is_honeypot)
