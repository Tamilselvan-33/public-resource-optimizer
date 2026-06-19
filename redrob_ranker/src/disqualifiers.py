"""JD disqualifier detection."""
from __future__ import annotations

from datetime import datetime

from .config import CONSULTING_FIRMS, REF_DATE


def _career_text(candidate: dict) -> str:
    parts = [
        candidate["profile"].get("summary", ""),
        candidate["profile"].get("headline", ""),
    ]
    for job in candidate["career_history"]:
        parts.extend([job.get("description", ""), job.get("title", ""), job.get("company", "")])
    return " ".join(parts).lower()


def _months_between(start: str, end: str | None) -> int:
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    if end:
        end_dt = datetime.strptime(end, "%Y-%m-%d")
    else:
        end_dt = datetime(REF_DATE.year, REF_DATE.month, REF_DATE.day)
    return (end_dt.year - start_dt.year) * 12 + (end_dt.month - start_dt.month)


def detect_disqualifiers(candidate: dict) -> dict[str, bool]:
    text = _career_text(candidate)
    jobs = candidate["career_history"]
    skills = candidate["skills"]
    flags = {
        "pure_research_only": False,
        "langchain_only": False,
        "no_recent_code": False,
        "consulting_only": False,
        "cv_speech_robotics_only": False,
        "title_chasing": False,
        "framework_enthusiast_only": False,
    }

    research_terms = ("phd", "postdoc", "research scientist", "research fellow", "academic", "university lab")
    production_terms = ("production", "deployed", "shipped", "serving", "users", "a/b", "online")
    if any(term in text for term in research_terms) and not any(term in text for term in production_terms):
        flags["pure_research_only"] = True

    skill_names = " ".join(skill["name"].lower() for skill in skills)
    has_langchain = "langchain" in skill_names or "langchain" in text
    has_pre_llm = any(
        term in text or term in skill_names
        for term in ("xgboost", "spark ml", "tensorflow serving", "recommendation", "ranking", "retrieval", "embedding")
    )
    if has_langchain and not has_pre_llm:
        recent_ai_months = sum(
            skill.get("duration_months", 0) or 0
            for skill in skills
            if any(k in skill["name"].lower() for k in ("langchain", "llm", "openai", "gpt"))
        )
        if recent_ai_months <= 12:
            flags["langchain_only"] = True

    current_title = candidate["profile"]["current_title"].lower()
    if any(term in current_title for term in ("architect", "tech lead", "director", "head of", "principal")):
        if not any(term in text for term in ("implemented", "built", "coded", "wrote", "shipped", "deployed")):
            flags["no_recent_code"] = True

    companies = [job["company"].lower() for job in jobs]
    if companies and all(any(firm in company for firm in CONSULTING_FIRMS) for company in companies):
        flags["consulting_only"] = True

    cv_terms = ("computer vision", "speech recognition", "robotics", "object detection", "gan", "tts")
    nlp_terms = ("nlp", "retrieval", "search", "ranking", "embedding", "language model", "information retrieval")
    cv_hits = sum(1 for skill in skills if any(term in skill["name"].lower() for term in cv_terms))
    nlp_hits = sum(1 for term in nlp_terms if term in text or term in skill_names)
    if cv_hits >= 3 and nlp_hits == 0:
        flags["cv_speech_robotics_only"] = True

    past_jobs = [job for job in jobs if not job["is_current"]]
    short_stints = 0
    for job in past_jobs:
        if job["duration_months"] < 18:
            short_stints += 1
    if len(past_jobs) >= 3 and short_stints >= max(2, len(past_jobs) - 1):
        flags["title_chasing"] = True

    langchain_skill_count = sum(1 for skill in skills if "langchain" in skill["name"].lower())
    systems_terms = sum(
        1 for term in ("retrieval", "ranking", "evaluation", "vector", "embedding", "pipeline", "serving")
        if term in text
    )
    if langchain_skill_count >= 2 and systems_terms <= 1:
        flags["framework_enthusiast_only"] = True

    return flags


def disqualifier_penalty(flags: dict[str, bool]) -> float:
    active = [key for key, value in flags.items() if value]
    if not active:
        return 1.0
    if "consulting_only" in active or "pure_research_only" in active:
        return 0.25
    if len(active) >= 2:
        return 0.35
    return 0.55
