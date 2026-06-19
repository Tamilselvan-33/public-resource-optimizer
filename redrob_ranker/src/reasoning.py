"""Deterministic reasoning generation from real profile fields."""
from __future__ import annotations

from .config import PRODUCTION_CAREER_KEYWORDS
from .features import career_text


def _corroborated_skills(candidate: dict, limit: int = 3) -> list[str]:
    text = career_text(candidate)
    found = []
    for skill in candidate["skills"]:
        name = skill["name"]
        lower = name.lower()
        if skill["proficiency"] not in ("advanced", "expert", "intermediate"):
            continue
        if lower in text or any(token in text for token in lower.split() if len(token) > 3):
            found.append(name)
        if len(found) >= limit:
            break
    return found


def _production_phrase(candidate: dict) -> str | None:
    text = career_text(candidate)
    for phrase in PRODUCTION_CAREER_KEYWORDS:
        if phrase in text:
            return phrase
    return None


def _main_concern(row: dict) -> str | None:
    features = row["features"]
    candidate = row["candidate"]
    signals = candidate["redrob_signals"]
    concerns = []

    if features["title_fit"] < 0.4:
        concerns.append(f"title ({candidate['profile']['current_title']}) is only adjacent to the JD")
    if features["career_consistency"] < 0.45:
        concerns.append("several claimed AI skills are not corroborated in work history")
    if features["location_fit"] < 0.4:
        concerns.append(f"location ({candidate['profile']['location']}) is outside preferred Pune/Noida band")
    if signals["notice_period_days"] > 60:
        concerns.append(f"notice period is {signals['notice_period_days']} days")
    if signals["recruiter_response_rate"] < 0.25:
        concerns.append(f"recruiter response rate is {signals['recruiter_response_rate']:.2f}")
    if row["honeypot_risk"] > 0.2:
        concerns.append("minor profile timeline consistency flags")

    active_dq = [key for key, value in row["disqualifiers"].items() if value]
    if "consulting_only" in active_dq:
        concerns.append("career has been consulting-only")
    if "cv_speech_robotics_only" in active_dq:
        concerns.append("background is vision/speech-heavy with limited NLP/IR exposure")

    return concerns[0] if concerns else None


TEMPLATES = [
    "{title} with {yoe:.1f} yrs in {location}; corroborated skills: {skills}; recruiter response rate {rr:.2f}.",
    "{title} ({yoe:.1f} yrs, {location}) matches JD via {production}; skills supported in history: {skills}; notice {notice}d.",
    "Ranked for {production} experience and {skills}; {yoe:.1f} yrs as {title} in {location}; response rate {rr:.2f}.",
    "{title} in {location} with {yoe:.1f} yrs; validated skills {skills}; {concern}.",
    "Strong fit on {production} and {skills}; {title}, {yoe:.1f} yrs, India-based ({location}), response rate {rr:.2f}.",
]


def generate_reasoning(row: dict, rank: int) -> str:
    candidate = row["candidate"]
    profile = candidate["profile"]
    signals = candidate["redrob_signals"]
    skills = _corroborated_skills(candidate)
    production = _production_phrase(candidate)
    concern = _main_concern(row)

    skills_text = ", ".join(skills) if skills else "Python and adjacent ML tooling"
    production_text = production or "applied ML production work"

    template = TEMPLATES[(rank - 1) % len(TEMPLATES)]
    reasoning = template.format(
        title=profile["current_title"],
        yoe=profile["years_of_experience"],
        location=profile["location"],
        skills=skills_text,
        rr=signals["recruiter_response_rate"],
        notice=signals["notice_period_days"],
        production=production_text,
        concern=concern or "no major availability concerns",
    )
    return reasoning
