"""Rule-based honeypot detection."""
from __future__ import annotations

from datetime import datetime

from .config import REF_DATE


def _months_between(start: str, end: str | None) -> int:
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    if end:
        end_dt = datetime.strptime(end, "%Y-%m-%d")
    else:
        end_dt = datetime(REF_DATE.year, REF_DATE.month, REF_DATE.day)
    return (end_dt.year - start_dt.year) * 12 + (end_dt.month - start_dt.month)


def detect_honeypot_flags(candidate: dict) -> list[str | tuple]:
    """Return honeypot indicator flags for a candidate."""
    flags: list[str | tuple] = []
    profile = candidate["profile"]
    yoe = profile["years_of_experience"]
    skills = candidate["skills"]
    signals = candidate["redrob_signals"]
    assessments = signals.get("skill_assessment_scores", {})

    near_zero = [
        (skill["name"], skill["proficiency"], skill.get("duration_months", 0) or 0)
        for skill in skills
        if skill["proficiency"] in ("expert", "advanced")
        and (skill.get("duration_months", 0) or 0) <= 1
    ]
    if len(near_zero) >= 2:
        flags.append(("multi_high_prof_near_zero_dur", near_zero[:3]))
    if any(skill["proficiency"] == "expert" and (skill.get("duration_months", 0) or 0) == 0 for skill in skills):
        flags.append("expert_zero_duration")

    advanced = [skill for skill in skills if skill["proficiency"] in ("expert", "advanced")]
    if len(advanced) >= 8:
        avg_duration = sum(skill.get("duration_months", 0) or 0 for skill in advanced) / len(advanced)
        if avg_duration < 6:
            flags.append(("many_adv_low_avg_dur", len(advanced), round(avg_duration, 1)))

    total_skill_months = sum(skill.get("duration_months", 0) or 0 for skill in skills)
    if total_skill_months > yoe * 12 * 2.5:
        flags.append(("skill_months_exceed_yoe", total_skill_months, yoe))

    job_months = sum(job["duration_months"] for job in candidate["career_history"])
    if job_months > yoe * 12 + 24:
        flags.append(("job_months_exceed_yoe", job_months, yoe))

    for job in candidate["career_history"]:
        if job["is_current"] and job["duration_months"] > yoe * 12 + 6:
            flags.append(("current_job_longer_than_yoe", job["company"], job["duration_months"], yoe))

    earliest = min(job["start_date"] for job in candidate["career_history"])
    start_year = int(earliest[:4])
    if yoe > 12 and start_year > 2012:
        flags.append(("yoe_vs_start_mismatch", yoe, earliest))

    assessment_gaps = [
        (skill["name"], skill["proficiency"], assessments[skill["name"]])
        for skill in skills
        if skill["proficiency"] in ("expert", "advanced")
        and skill["name"] in assessments
        and assessments[skill["name"]] < 40
    ]
    if len(assessment_gaps) >= 3:
        flags.append(("multi_assessment_gap", assessment_gaps[:3]))

    for job in candidate["career_history"]:
        calc = _months_between(job["start_date"], job["end_date"])
        if calc is not None and abs(calc - job["duration_months"]) > 12:
            flags.append("duration_date_mismatch")
            break

    return flags


def honeypot_risk_score(flags: list[str | tuple]) -> float:
    """Continuous honeypot risk in [0, 1]."""
    if not flags:
        return 0.0
    critical = {"expert_zero_duration", "duration_date_mismatch"}
    score = 0.0
    for flag in flags:
        if isinstance(flag, str):
            if flag in critical:
                score += 0.45
            else:
                score += 0.2
        else:
            score += 0.25
    return min(1.0, score)


def is_hard_honeypot(flags: list[str | tuple], min_flags: int = 2) -> bool:
    if any(flag == "expert_zero_duration" for flag in flags if isinstance(flag, str)):
        return True
    return len(flags) >= min_flags
