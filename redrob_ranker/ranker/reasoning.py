"""Deterministic reasoning strings built only from candidate field values."""
from __future__ import annotations

from ranker.features import CandidateFeatures


def _pick_phrase(seed: int, options: list[str]) -> str:
    return options[seed % len(options)]


def generate_reasoning(candidate: dict, features: CandidateFeatures, rank: int) -> str:
    profile = candidate["profile"]
    signals = candidate["redrob_signals"]
    title = profile["current_title"]
    yoe = profile["years_of_experience"]
    location = profile["location"]
    country = profile["country"]

    opener = _pick_phrase(
        hash(candidate["candidate_id"]) % 7,
        [
            f"{title} with {yoe:.1f} yrs experience",
            f"{title} ({yoe:.1f} yrs) based in {location}",
            f"Profile: {title}, {yoe:.1f} yrs, {location}, {country}",
        ],
    )

    parts: list[str] = [opener]

    if features.career_highlights:
        parts.append(
            _pick_phrase(
                rank,
                [
                    f"Career history shows {features.career_highlights[0]}",
                    f"Work history includes {features.career_highlights[0]}",
                    f"Demonstrated {features.career_highlights[0]} in prior roles",
                ],
            )
        )
    elif features.corroborated_skills:
        skills_str = ", ".join(features.corroborated_skills[:3])
        parts.append(f"Corroborated skills in career text: {skills_str}")

    response = signals["recruiter_response_rate"]
    notice = signals["notice_period_days"]
    parts.append(
        _pick_phrase(
            rank + len(title),
            [
                f"Recruiter response rate {response:.2f}, notice {notice} days",
                f"Availability signals: response rate {response:.2f}, {notice}-day notice",
                f"Platform signals — response {response:.2f}, notice period {notice} days",
            ],
        )
    )

    if features.concerns:
        concern = features.concerns[0]
        parts.append(
            _pick_phrase(
                rank * 3,
                [
                    f"Note: {concern}.",
                    f"Concern: {concern}.",
                    f"Gap flagged: {concern}.",
                ],
            )
        )
    elif rank <= 20:
        parts.append(
            _pick_phrase(
                rank,
                [
                    "Strong alignment with JD retrieval/ranking/production requirements.",
                    "Matches the product-engineering AI profile described in the JD.",
                    "Good fit on title, career evidence, and availability for this role.",
                ],
            )
        )

    text = " ".join(parts[:3])
    if len(text) > 320:
        text = text[:317] + "..."
    return text
