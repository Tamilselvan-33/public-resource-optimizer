"""Per-candidate feature extraction."""
from __future__ import annotations

import math
import re
from datetime import datetime

from .config import (
    AI_TITLE_MEDIUM,
    AI_TITLE_STRONG,
    LOCATION_ACCEPTABLE,
    LOCATION_PREFERRED,
    PREFERRED_SKILL_KEYWORDS,
    PRODUCTION_CAREER_KEYWORDS,
    PROFICIENCY_WEIGHT,
    REF_DATE,
    REQUIRED_SKILL_KEYWORDS,
    TRAP_TITLES,
)


def career_text(candidate: dict) -> str:
    parts = [
        candidate["profile"].get("summary", ""),
        candidate["profile"].get("headline", ""),
    ]
    for job in candidate["career_history"]:
        parts.extend([job.get("description", ""), job.get("title", "")])
    return " ".join(parts).lower()


def profile_document(candidate: dict) -> str:
    return career_text(candidate) + " " + " ".join(
        f"{skill['name']} {skill['proficiency']}" for skill in candidate["skills"]
    )


def title_fit_score(candidate: dict) -> float:
    title = candidate["profile"]["current_title"].lower()
    if any(token in title for token in AI_TITLE_STRONG):
        return 1.0
    if any(token in title for token in AI_TITLE_MEDIUM):
        text = career_text(candidate)
        if any(k in text for k in ("machine learning", "ml ", " ai", "ranking", "retrieval", "embedding")):
            return 0.72
        return 0.45
    if any(token in title for token in TRAP_TITLES):
        return 0.05
    return 0.25


def _skill_keyword_score(skill_name: str, proficiency: str, keyword_map: dict[str, float]) -> float:
    lower = skill_name.lower()
    weight = PROFICIENCY_WEIGHT.get(proficiency, 0.3)
    best = 0.0
    for keyword, importance in keyword_map.items():
        if keyword in lower:
            best = max(best, importance * weight)
    return best


def skill_match_score(candidate: dict) -> float:
    required_total = 0.0
    preferred_total = 0.0
    for skill in candidate["skills"]:
        required_total = max(
            required_total,
            _skill_keyword_score(skill["name"], skill["proficiency"], REQUIRED_SKILL_KEYWORDS),
        )
        preferred_total = max(
            preferred_total,
            _skill_keyword_score(skill["name"], skill["proficiency"], PREFERRED_SKILL_KEYWORDS),
        )
    # Also reward corroborated skills in career text
    text = career_text(candidate)
    corroborated = 0.0
    for keyword, importance in REQUIRED_SKILL_KEYWORDS.items():
        if keyword in text:
            corroborated = max(corroborated, importance * 0.9)
    raw = 0.75 * max(required_total, corroborated * 0.95) + 0.25 * preferred_total
    return min(1.0, raw)


def production_signals_score(candidate: dict) -> float:
    text = career_text(candidate)
    hits = sum(1 for keyword in PRODUCTION_CAREER_KEYWORDS if keyword in text)
    if hits >= 4:
        return 1.0
    if hits == 3:
        return 0.85
    if hits == 2:
        return 0.65
    if hits == 1:
        return 0.4
    return 0.0


def experience_match_score(candidate: dict) -> float:
    yoe = candidate["profile"]["years_of_experience"]
    if 6 <= yoe <= 8:
        return 1.0
    if 5 <= yoe <= 9:
        return 0.85
    if 4 <= yoe < 5 or 9 < yoe <= 10:
        return 0.55
    if 10 < yoe <= 12:
        return 0.35
    return 0.15


def career_consistency_score(candidate: dict) -> float:
    text = career_text(candidate)
    skills = candidate["skills"]
    if not skills:
        return 0.0

    ai_related = [
        skill
        for skill in skills
        if skill["proficiency"] in ("advanced", "expert")
        or any(
            k in skill["name"].lower()
            for k in ("nlp", "llm", "rag", "embed", "retriev", "rank", "vector", "python", "ml", "ai")
        )
    ]
    if not ai_related:
        return 0.5

    supported = 0
    for skill in ai_related:
        name = skill["name"].lower()
        if name in text or any(token in text for token in name.split() if len(token) > 3):
            supported += 1
    ratio = supported / len(ai_related)
    return min(1.0, 0.25 + 0.75 * ratio)


def assessment_corroboration_score(candidate: dict) -> float:
    assessments = candidate["redrob_signals"].get("skill_assessment_scores", {})
    if not assessments:
        return 0.5

    scores = []
    for skill in candidate["skills"]:
        if skill["name"] not in assessments:
            continue
        assess = assessments[skill["name"]]
        prof = skill["proficiency"]
        if prof in ("expert", "advanced"):
            if assess >= 70:
                scores.append(1.0)
            elif assess >= 55:
                scores.append(0.7)
            elif assess >= 45:
                scores.append(0.45)
            else:
                scores.append(0.1)
        elif prof == "intermediate":
            scores.append(min(1.0, assess / 100))
    if not scores:
        return 0.5
    return sum(scores) / len(scores)


def location_fit_score(candidate: dict) -> float:
    profile = candidate["profile"]
    if profile["country"] != "India":
        if candidate["redrob_signals"].get("willing_to_relocate"):
            return 0.2
        return 0.05
    location = profile["location"].lower()
    if any(city in location for city in LOCATION_PREFERRED):
        return 1.0
    if any(city in location for city in LOCATION_ACCEPTABLE):
        return 0.75
    if candidate["redrob_signals"].get("willing_to_relocate"):
        return 0.55
    return 0.35


def behavioral_availability_score(candidate: dict) -> float:
    signals = candidate["redrob_signals"]
    response = signals["recruiter_response_rate"]
    notice = signals["notice_period_days"]
    interview = signals["interview_completion_rate"]
    active_days = (
        REF_DATE - datetime.strptime(signals["last_active_date"], "%Y-%m-%d").date()
    ).days

    score = 0.0
    score += min(1.0, response / 0.75) * 0.35
    score += (1.0 if notice <= 30 else 0.45 if notice <= 60 else 0.2) * 0.25
    score += interview * 0.2
    score += (1.0 if active_days <= 60 else 0.6 if active_days <= 120 else 0.25 if active_days <= 180 else 0.05) * 0.2
    if signals.get("open_to_work_flag"):
        score += 0.05
    return min(1.0, score)


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9][a-z0-9+.#-]{1,}", text.lower())


class TfidfMatcher:
    """Lightweight TF-IDF matcher for JD-to-profile semantic similarity."""

    def __init__(self, jd_text: str) -> None:
        self.jd_tokens = tokenize(jd_text)
        self.jd_tf: dict[str, float] = {}
        for token in self.jd_tokens:
            self.jd_tf[token] = self.jd_tf.get(token, 0.0) + 1.0
        for token in self.jd_tf:
            self.jd_tf[token] /= len(self.jd_tokens)

    def fit_idf(self, documents: list[str]) -> None:
        doc_count = len(documents)
        df: dict[str, int] = {}
        for doc in documents:
            for token in set(tokenize(doc)):
                df[token] = df.get(token, 0) + 1
        self.idf = {token: math.log((1 + doc_count) / (1 + count)) + 1.0 for token, count in df.items()}

    def score(self, document: str) -> float:
        tf: dict[str, float] = {}
        tokens = tokenize(document)
        if not tokens:
            return 0.0
        for token in tokens:
            tf[token] = tf.get(token, 0.0) + 1.0
        for token in tf:
            tf[token] /= len(tokens)

        dot = 0.0
        norm_jd = 0.0
        norm_doc = 0.0
        for token, jd_weight in self.jd_tf.items():
            jd_tfidf = jd_weight * self.idf.get(token, 1.0)
            doc_tfidf = tf.get(token, 0.0) * self.idf.get(token, 1.0)
            dot += jd_tfidf * doc_tfidf
            norm_jd += jd_tfidf * jd_tfidf
        for token, doc_weight in tf.items():
            doc_tfidf = doc_weight * self.idf.get(token, 1.0)
            norm_doc += doc_tfidf * doc_tfidf
        if norm_jd == 0 or norm_doc == 0:
            return 0.0
        return dot / (math.sqrt(norm_jd) * math.sqrt(norm_doc))


def extract_features(candidate: dict, semantic_matcher: TfidfMatcher) -> dict[str, float]:
    return {
        "title_fit": title_fit_score(candidate),
        "skill_match": skill_match_score(candidate),
        "career_consistency": career_consistency_score(candidate),
        "production_signals": production_signals_score(candidate),
        "experience_match": experience_match_score(candidate),
        "semantic_match": semantic_matcher.score(profile_document(candidate)),
        "assessment_corroboration": assessment_corroboration_score(candidate),
        "location_fit": location_fit_score(candidate),
        "behavioral": behavioral_availability_score(candidate),
    }
