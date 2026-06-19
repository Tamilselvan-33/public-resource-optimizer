"""Composite scoring and ranking — single-pass, CPU-budget friendly."""
from __future__ import annotations

import heapq
import math
from typing import Any

from .config import HONEYPOT_HARD_EXCLUDE_MIN_FLAGS, WEIGHTS
from .disqualifiers import detect_disqualifiers, disqualifier_penalty
from .features import (
    assessment_corroboration_score,
    behavioral_availability_score,
    career_consistency_score,
    career_text,
    experience_match_score,
    location_fit_score,
    production_signals_score,
    skill_match_score,
    title_fit_score,
    tokenize,
)
from .honeypot import detect_honeypot_flags, honeypot_risk_score, is_hard_honeypot

# Fixed JD vocabulary for lightweight semantic overlap (no full-corpus IDF pass).
JD_TERMS = frozenset(
    tokenize(
        """
        senior ai engineer ranking retrieval embeddings vector search hybrid search
        sentence-transformers pinecone milvus weaviate qdrant faiss opensearch elasticsearch
        python production ndcg mrr map evaluation a/b testing learning-to-rank
        recommendation system llm fine-tuning lora rag nlp information retrieval
        pune noida india applied machine learning deployment recruiter matching
        """
    )
)


def _fast_semantic(text: str) -> float:
    """Cosine-like overlap on JD term set — O(|doc|), no corpus scan."""
    tokens = tokenize(text)
    if not tokens:
        return 0.0
    doc_tf: dict[str, float] = {}
    for token in tokens:
        doc_tf[token] = doc_tf.get(token, 0.0) + 1.0
    for token in doc_tf:
        doc_tf[token] /= len(tokens)

    dot = 0.0
    norm_jd = math.sqrt(len(JD_TERMS))
    norm_doc = 0.0
    for token, weight in doc_tf.items():
        if token in JD_TERMS:
            dot += weight
        norm_doc += weight * weight
    if norm_doc == 0:
        return 0.0
    return dot / (norm_jd * math.sqrt(norm_doc))


def _skill_match_from_text(candidate: dict, text: str) -> float:
    """Skill match using precomputed career text."""
    from .config import PREFERRED_SKILL_KEYWORDS, REQUIRED_SKILL_KEYWORDS
    from .features import _skill_keyword_score

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
    corroborated = 0.0
    for keyword, importance in REQUIRED_SKILL_KEYWORDS.items():
        if keyword in text:
            corroborated = max(corroborated, importance * 0.9)
    raw = 0.75 * max(required_total, corroborated * 0.95) + 0.25 * preferred_total
    return min(1.0, raw)


def _production_signals_from_text(text: str) -> float:
    from .config import PRODUCTION_CAREER_KEYWORDS

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


def _career_consistency_from_text(candidate: dict, text: str) -> float:
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


def composite_score(
    features: dict[str, float],
    honeypot_risk: float,
    dq_penalty: float,
    country: str,
) -> float:
    base = sum(WEIGHTS[key] * features[key] for key in WEIGHTS)
    behavioral_boost = 0.85 + 0.15 * features["behavioral"]
    adjusted = base * behavioral_boost * dq_penalty * (1.0 - 0.65 * honeypot_risk)
    if country != "India":
        adjusted *= 0.35
    return max(0.0, min(1.0, adjusted))


def rank_candidates(candidates: list[dict], top_n: int = 100) -> list[dict]:
    heap: list[tuple[float, str, dict[str, Any]]] = []

    for candidate in candidates:
        honeypot_flags = detect_honeypot_flags(candidate)
        if is_hard_honeypot(honeypot_flags, HONEYPOT_HARD_EXCLUDE_MIN_FLAGS):
            continue

        profile = candidate["profile"]
        country = profile["country"]
        title_fit = title_fit_score(candidate)

        # Cheap gate before building full career text.
        if title_fit <= 0.1 and country != "India":
            continue

        text = career_text(candidate)
        production = _production_signals_from_text(text)
        if title_fit <= 0.1 and production < 0.4:
            continue

        dq_flags = detect_disqualifiers(candidate)
        doc = text + " " + " ".join(
            f"{skill['name']} {skill['proficiency']}" for skill in candidate["skills"]
        )
        features = {
            "title_fit": title_fit,
            "skill_match": _skill_match_from_text(candidate, text),
            "career_consistency": _career_consistency_from_text(candidate, text),
            "production_signals": production,
            "experience_match": experience_match_score(candidate),
            "semantic_match": _fast_semantic(doc),
            "assessment_corroboration": assessment_corroboration_score(candidate),
            "location_fit": location_fit_score(candidate),
            "behavioral": behavioral_availability_score(candidate),
        }

        risk = honeypot_risk_score(honeypot_flags)
        penalty = disqualifier_penalty(dq_flags)
        score = composite_score(features, risk, penalty, country)

        row = {
            "candidate": candidate,
            "score": score,
            "features": features,
            "honeypot_flags": honeypot_flags,
            "honeypot_risk": risk,
            "disqualifiers": dq_flags,
            "dq_penalty": penalty,
        }
        cid = candidate["candidate_id"]
        entry = (score, cid, row)
        if len(heap) < top_n:
            heapq.heappush(heap, entry)
        elif score > heap[0][0] or (score == heap[0][0] and cid < heap[0][1]):
            heapq.heapreplace(heap, entry)

    ranked = [item[2] for item in heap]
    ranked.sort(key=lambda row: (-row["score"], row["candidate"]["candidate_id"]))
    return ranked
