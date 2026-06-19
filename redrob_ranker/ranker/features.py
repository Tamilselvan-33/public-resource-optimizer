"""Per-candidate feature extraction."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from ranker.config import (
    AI_SKILL_KEYWORDS,
    CONSULTING_FIRMS,
    JD_TEXT,
    LOCATION_ACCEPTABLE,
    LOCATION_PREFERRED,
    PREFERRED_SKILL_GROUPS,
    PRODUCT_INDUSTRIES,
    PROFICIENCY_WEIGHT,
    REF_DATE,
    REQUIRED_SKILL_GROUPS,
    STRONG_AI_TITLES,
    WEAK_NON_AI_TITLES,
)


@dataclass
class CandidateFeatures:
    candidate_id: str
    title_fit: float = 0.0
    career_consistency: float = 0.0
    skill_match: float = 0.0
    assessment_corroboration: float = 0.0
    experience_match: float = 0.0
    semantic_match: float = 0.0
    location_fit: float = 0.0
    product_company_signal: float = 0.0
    behavioral: float = 0.0
    disqualifiers: list[str] = field(default_factory=list)
    corroborated_skills: list[str] = field(default_factory=list)
    career_highlights: list[str] = field(default_factory=list)
    concerns: list[str] = field(default_factory=list)


def career_text(candidate: dict) -> str:
    parts = [
        candidate["profile"].get("summary", ""),
        candidate["profile"].get("headline", ""),
        candidate["profile"].get("current_title", ""),
    ]
    for job in candidate["career_history"]:
        parts.extend([job.get("description", ""), job.get("title", ""), job.get("company", "")])
    return " ".join(parts).lower()


def _group_hits(text: str, groups: dict[str, list[str]]) -> dict[str, bool]:
    return {name: any(token in text for token in tokens) for name, tokens in groups.items()}


def _is_ai_skill(name: str) -> bool:
    lower = name.lower()
    return any(k in lower for k in AI_SKILL_KEYWORDS)


def _skill_in_text(name: str, text: str) -> bool:
    lower = name.lower()
    if lower in text:
        return True
    return any(token in text for token in lower.split() if len(token) > 3)


def score_title_fit(candidate: dict, text: str) -> tuple[float, list[str]]:
    title = candidate["profile"]["current_title"].lower()
    concerns: list[str] = []

    if any(t in title for t in STRONG_AI_TITLES):
        base = 0.95
    elif any(k in title for k in ("software", "backend", "data engineer", "full stack", "devops")):
        base = 0.45
    elif any(t in title for t in WEAK_NON_AI_TITLES):
        base = 0.08
        concerns.append(f"non-AI title ({candidate['profile']['current_title']})")
    else:
        base = 0.25

    ai_in_career = any(
        k in text
        for k in (
            "machine learning",
            "ml ",
            " ai ",
            "nlp",
            "retrieval",
            "embedding",
            "ranking",
            "recommendation",
            "llm",
        )
    )
    if ai_in_career and base < 0.7:
        base = min(0.75, base + 0.35)

    ai_skill_count = sum(1 for s in candidate["skills"] if _is_ai_skill(s["name"]))
    if ai_skill_count >= 6 and base < 0.4:
        concerns.append("keyword-heavy skills vs weak title fit")
        base *= 0.5

    return base, concerns


def score_career_consistency(candidate: dict, text: str) -> tuple[float, list[str], list[str]]:
    required_hits = _group_hits(text, REQUIRED_SKILL_GROUPS)
    required_score = sum(required_hits.values()) / max(len(required_hits), 1)

    plain_language = any(
        phrase in text
        for phrase in (
            "recommendation system",
            "recommendation engine",
            "search ranking",
            "ranking system",
            "retrieval system",
            "vector search",
            "hybrid search",
            "offline benchmark",
        )
    )
    if plain_language:
        required_score = min(1.0, required_score + 0.25)

    corroborated: list[str] = []
    unsupported = 0
    advanced_claims = 0
    for skill in candidate["skills"]:
        if skill["proficiency"] not in ("advanced", "expert") or not _is_ai_skill(skill["name"]):
            continue
        advanced_claims += 1
        if _skill_in_text(skill["name"], text):
            corroborated.append(skill["name"])
        else:
            unsupported += 1

    if advanced_claims == 0:
        consistency = required_score * 0.85
    else:
        corroboration_ratio = len(corroborated) / advanced_claims
        consistency = 0.55 * required_score + 0.45 * corroboration_ratio

    concerns: list[str] = []
    if unsupported >= 3:
        concerns.append(f"{unsupported} advanced AI skills not reflected in career history")

    return consistency, corroborated, concerns


def score_skill_match(candidate: dict, text: str, corroborated: list[str]) -> float:
    required_hits = _group_hits(text, REQUIRED_SKILL_GROUPS)
    preferred_hits = _group_hits(text, PREFERRED_SKILL_GROUPS)

    req_score = sum(required_hits.values()) / max(len(required_hits), 1)
    pref_score = sum(preferred_hits.values()) / max(len(preferred_hits), 1)

    skill_score = 0.0
    weight_sum = 0.0
    for skill in candidate["skills"]:
        name = skill["name"]
        if not _is_ai_skill(name):
            continue
        weight = PROFICIENCY_WEIGHT.get(skill["proficiency"], 0.3)
        if _skill_in_text(name, text) or name in corroborated:
            skill_score += weight
        elif skill["proficiency"] in ("advanced", "expert"):
            skill_score += weight * 0.15
        else:
            skill_score += weight * 0.35
        weight_sum += 1.0

    listed = skill_score / weight_sum if weight_sum else 0.0
    return 0.5 * req_score + 0.2 * pref_score + 0.3 * listed


def score_assessment_corroboration(candidate: dict) -> tuple[float, list[str]]:
    scores = candidate["redrob_signals"]["skill_assessment_scores"]
    if not scores:
        return 0.55, []

    gaps: list[str] = []
    values: list[float] = []
    for skill in candidate["skills"]:
        if skill["proficiency"] not in ("advanced", "expert"):
            continue
        assess = scores.get(skill["name"])
        if assess is None:
            continue
        values.append(assess / 100.0)
        if assess < 45:
            gaps.append(f"{skill['name']} assess {assess:.0f}")

    if not values:
        return 0.55, gaps

    avg = sum(values) / len(values)
    penalty = min(0.4, 0.08 * len(gaps))
    return max(0.0, avg - penalty), gaps


def score_experience_match(candidate: dict) -> tuple[float, list[str]]:
    yoe = candidate["profile"]["years_of_experience"]
    concerns: list[str] = []
    if 5 <= yoe <= 9:
        score = 1.0
    elif 4 <= yoe < 5 or 9 < yoe <= 11:
        score = 0.72
    elif yoe < 4:
        score = 0.35
        concerns.append(f"below preferred YoE band ({yoe:.1f} yrs)")
    else:
        score = 0.5
        concerns.append(f"above preferred YoE band ({yoe:.1f} yrs)")
    return score, concerns


def score_location_fit(candidate: dict) -> tuple[float, list[str]]:
    profile = candidate["profile"]
    loc = profile["location"].lower()
    country = profile["country"]
    signals = candidate["redrob_signals"]
    concerns: list[str] = []

    if country != "India":
        if signals.get("willing_to_relocate"):
            return 0.35, ["outside India but willing to relocate"]
        return 0.05, [f"located in {profile['location']}, {country}"]

    if any(c in loc for c in LOCATION_PREFERRED):
        return 1.0, []
    if any(c in loc for c in LOCATION_ACCEPTABLE):
        return 0.82, []
    return 0.55, [f"India location {profile['location']} outside preferred hubs"]


def score_product_company_signal(candidate: dict) -> float:
    industries = {j["industry"].lower() for j in candidate["career_history"]}
    if any(ind in PRODUCT_INDUSTRIES or any(p in ind for p in PRODUCT_INDUSTRIES) for ind in industries):
        return 0.9
    if candidate["profile"]["current_industry"].lower() in PRODUCT_INDUSTRIES:
        return 0.75
    if candidate["profile"]["current_industry"].lower() == "it services":
        return 0.35
    return 0.5


def score_behavioral(candidate: dict) -> tuple[float, list[str]]:
    signals = candidate["redrob_signals"]
    concerns: list[str] = []

    response = signals["recruiter_response_rate"]
    notice = signals["notice_period_days"]
    interview = signals["interview_completion_rate"]
    active_days = (
        REF_DATE - datetime.strptime(signals["last_active_date"], "%Y-%m-%d").date()
    ).days

    response_s = min(1.0, response / 0.75)
    notice_s = 1.0 if notice <= 30 else max(0.35, 1.0 - (notice - 30) / 120)
    active_s = 1.0 if active_days <= 60 else max(0.25, 1.0 - (active_days - 60) / 240)
    interview_s = interview
    open_s = 0.08 if signals["open_to_work_flag"] else 0.0

    if response < 0.15:
        concerns.append(f"low recruiter response rate ({response:.2f})")
    if active_days > 180:
        concerns.append(f"last active {active_days} days ago")
    if notice > 60:
        concerns.append(f"notice period {notice} days")

    score = 0.35 * response_s + 0.25 * active_s + 0.2 * notice_s + 0.15 * interview_s + open_s
    return min(1.0, score), concerns


def detect_disqualifiers(candidate: dict, text: str) -> list[str]:
    flags: list[str] = []
    companies = [j["company"].lower() for j in candidate["career_history"]]
    if companies and all(any(cf in co for cf in CONSULTING_FIRMS) for co in companies):
        flags.append("consulting_only")

    durations = [j["duration_months"] for j in candidate["career_history"] if not j["is_current"]]
    short_stints = sum(1 for d in durations if d < 18)
    if len(durations) >= 3 and short_stints / len(durations) >= 0.7:
        flags.append("title_chasing")

    langchain_only = "langchain" in text and not any(
        k in text for k in ("production", "deploy", "serving", "ndcg", "retrieval", "embedding", "pytorch", "tensorflow")
    )
    if langchain_only:
        flags.append("langchain_only")

    cv_only = any(k in text for k in ("computer vision", "speech recognition", "robotics", "object detection"))
    nlp_ir = any(k in text for k in ("nlp", "retrieval", "embedding", "search", "ranking", "llm", "ir "))
    if cv_only and not nlp_ir:
        flags.append("cv_speech_robotics_only")

    research_only = all(
        any(k in j["title"].lower() for k in ("research", "phd", "scientist"))
        for j in candidate["career_history"]
    ) and "production" not in text and "deploy" not in text
    if research_only:
        flags.append("pure_research_only")

    return flags


def extract_career_highlights(text: str) -> list[str]:
    highlights: list[str] = []
    checks = [
        ("retrieval", "retrieval/embedding production experience"),
        ("ranking system", "ranking system experience"),
        ("recommendation", "recommendation systems experience"),
        ("vector search", "vector/hybrid search experience"),
        ("ndcg", "ranking evaluation (NDCG/MRR) experience"),
        ("fine-tun", "LLM fine-tuning experience"),
        ("a/b test", "A/B testing for ML systems"),
    ]
    for token, label in checks:
        if token in text and label not in highlights:
            highlights.append(label)
    return highlights[:3]


class SemanticMatcher:
    """TF-IDF cosine similarity between JD and candidate profile text."""

    def __init__(self) -> None:
        self._scores: dict[str, float] = {}

    def fit(self, candidates: list[dict]) -> None:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import linear_kernel

        texts = [JD_TEXT.strip().lower()]
        ids = ["__jd__"]
        for candidate in candidates:
            texts.append(career_text(candidate))
            ids.append(candidate["candidate_id"])

        vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=5)
        matrix = vectorizer.fit_transform(texts)
        sims = linear_kernel(matrix[0:1], matrix[1:]).flatten()
        self._scores = {
            candidate_id: float(sim)
            for candidate_id, sim in zip(ids[1:], sims, strict=True)
        }

    def score(self, candidate: dict, semantic_index: int) -> float:
        return self._scores.get(candidate["candidate_id"], 0.0)


def build_features(
    candidate: dict,
    semantic: SemanticMatcher,
    semantic_index: int,
) -> CandidateFeatures:
    text = career_text(candidate)
    title_fit, title_concerns = score_title_fit(candidate, text)
    career_consistency, corroborated, career_concerns = score_career_consistency(candidate, text)
    skill_match = score_skill_match(candidate, text, corroborated)
    assessment, assess_concerns = score_assessment_corroboration(candidate)
    experience, exp_concerns = score_experience_match(candidate)
    location, loc_concerns = score_location_fit(candidate)
    product = score_product_company_signal(candidate)
    behavioral, beh_concerns = score_behavioral(candidate)
    disqualifiers = detect_disqualifiers(candidate, text)

    concerns = title_concerns + career_concerns + assess_concerns + exp_concerns + loc_concerns + beh_concerns
    return CandidateFeatures(
        candidate_id=candidate["candidate_id"],
        title_fit=title_fit,
        career_consistency=career_consistency,
        skill_match=skill_match,
        assessment_corroboration=assessment,
        experience_match=experience,
        semantic_match=semantic.score(candidate, semantic_index),
        location_fit=location,
        product_company_signal=product,
        behavioral=behavioral,
        disqualifiers=disqualifiers,
        corroborated_skills=corroborated[:5],
        career_highlights=extract_career_highlights(text),
        concerns=concerns[:4],
    )
