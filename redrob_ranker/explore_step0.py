"""Step 0 data exploration for Redrob hackathon."""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path

BASE = (
    Path(__file__).resolve().parents[1]
    / "[PUB] India_runs_data_and_ai_challenge"
    / "[PUB] India_runs_data_and_ai_challenge"
    / "India_runs_data_and_ai_challenge"
)
CAND = BASE / "candidates.jsonl"
REF = date(2026, 6, 18)

FICTIONAL = {
    "Dunder Mifflin",
    "Stark Industries",
    "Wayne Enterprises",
    "Wonka Industries",
    "Acme Corp",
    "Globex Corporation",
    "Initech",
    "Umbrella Corporation",
}
CONSULTING = (
    "TCS",
    "Tata Consultancy Services",
    "Infosys",
    "Wipro",
    "Accenture",
    "Cognizant",
    "Capgemini",
    "Mindtree",
    "LTIMindtree",
    "HCL",
    "Tech Mahindra",
)
AI_KEYWORDS = (
    "nlp",
    "llm",
    "rag",
    "embed",
    "retriev",
    "rank",
    "vector",
    "fine-tun",
    "lora",
    "sentence-transform",
    "pinecone",
    "milvus",
    "weaviate",
    "faiss",
    "opensearch",
    "elasticsearch",
    "xgboost",
    "speech",
    "gan",
    "tts",
    "classification",
)


def months_between(start: str, end: str | None) -> int | None:
    s = datetime.strptime(start, "%Y-%m-%d")
    e = datetime.strptime(end, "%Y-%m-%d") if end else datetime(2026, 6, 18)
    return (e.year - s.year) * 12 + (e.month - s.month)


def career_text(candidate: dict) -> str:
    parts = [
        candidate["profile"].get("summary", ""),
        candidate["profile"].get("headline", ""),
    ]
    for job in candidate["career_history"]:
        parts.extend([job.get("description", ""), job.get("title", "")])
    return " ".join(parts).lower()


def is_ai_skill(name: str, proficiency: str) -> bool:
    if proficiency not in ("advanced", "expert"):
        return False
    lower = name.lower()
    return any(k in lower for k in AI_KEYWORDS)


def skill_corroborated(name: str, text: str) -> bool:
    lower = name.lower()
    if lower in text:
        return True
    return any(token in text for token in lower.split() if len(token) > 3)


def main() -> None:
    schema = json.loads((BASE / "candidate_schema.json").read_text(encoding="utf-8"))
    required_top = set(schema["required"])

    candidates: list[dict] = []
    with CAND.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                candidates.append(json.loads(line))

    print("=== ROW COUNT ===")
    print("Count:", len(candidates))
    print("File:", CAND.name, "(uncompressed jsonl; README mentions .jsonl.gz)")

    issues = [
        (c.get("candidate_id"), required_top - set(c.keys()))
        for c in candidates[:1000]
        if required_top - set(c.keys())
    ]
    print("Schema spot-check (first 1000):", len(issues), "issues")

    id_pat = re.compile(r"^CAND_[0-9]{7}$")
    bad_ids = [c["candidate_id"] for c in candidates if not id_pat.match(c["candidate_id"])]
    print("Bad candidate_id format:", len(bad_ids))
    print("Duplicate IDs:", len(candidates) - len({c["candidate_id"] for c in candidates}))

    yoe = [c["profile"]["years_of_experience"] for c in candidates]
    countries = Counter(c["profile"]["country"] for c in candidates)
    locations = Counter(c["profile"]["location"] for c in candidates)
    industries = Counter(c["profile"]["current_industry"] for c in candidates)
    titles = Counter(c["profile"]["current_title"] for c in candidates)

    print("\n=== YEARS OF EXPERIENCE ===")
    print("Min:", min(yoe), "Max:", max(yoe), "Mean:", round(sum(yoe) / len(yoe), 2))
    bands = Counter()
    for years in yoe:
        if years < 5:
            bands["<5"] += 1
        elif years <= 9:
            bands["5-9"] += 1
        elif years <= 15:
            bands["10-15"] += 1
        else:
            bands[">15"] += 1
    print("Bands:", dict(bands))

    print("\n=== TOP 15 COUNTRIES ===")
    for key, value in countries.most_common(15):
        print(f"  {key}: {value}")

    print("\n=== TOP 15 LOCATIONS ===")
    for key, value in locations.most_common(15):
        print(f"  {key}: {value}")

    print("\n=== TOP 15 INDUSTRIES ===")
    for key, value in industries.most_common(15):
        print(f"  {key}: {value}")

    print("\n=== TOP 20 CURRENT TITLES ===")
    for key, value in titles.most_common(20):
        print(f"  {key}: {value}")

    prof = Counter()
    skill_counts: list[int] = []
    for candidate in candidates:
        skill_counts.append(len(candidate["skills"]))
        for skill in candidate["skills"]:
            prof[skill["proficiency"]] += 1
    print("\n=== SKILL PROFICIENCY ===")
    print(dict(prof))
    print(
        "Skills per candidate: min",
        min(skill_counts),
        "max",
        max(skill_counts),
        "mean",
        round(sum(skill_counts) / len(skill_counts), 2),
    )

    assess_vals: list[float] = []
    assess_coverage = 0
    for candidate in candidates:
        scores = candidate["redrob_signals"].get("skill_assessment_scores", {})
        if scores:
            assess_coverage += 1
            assess_vals.extend(scores.values())
    print("\n=== ASSESSMENT SCORES ===")
    print("Candidates with any assessment:", assess_coverage)
    if assess_vals:
        print(
            "Score min/max/mean:",
            round(min(assess_vals), 1),
            round(max(assess_vals), 1),
            round(sum(assess_vals) / len(assess_vals), 1),
        )

    rr = [c["redrob_signals"]["recruiter_response_rate"] for c in candidates]
    notice = [c["redrob_signals"]["notice_period_days"] for c in candidates]
    github = [c["redrob_signals"]["github_activity_score"] for c in candidates]
    open_work = sum(1 for c in candidates if c["redrob_signals"]["open_to_work_flag"])
    recency = [
        (REF - datetime.strptime(c["redrob_signals"]["last_active_date"], "%Y-%m-%d").date()).days
        for c in candidates
    ]

    print("\n=== BEHAVIORAL SIGNALS ===")
    print("recruiter_response_rate mean:", round(sum(rr) / len(rr), 3))
    print("notice_period <=30:", sum(1 for n in notice if n <= 30))
    print("notice_period >30:", sum(1 for n in notice if n > 30))
    print("github -1 (no link):", sum(1 for g in github if g == -1))
    print("open_to_work:", open_work)
    print(
        "last_active days ago: min",
        min(recency),
        "max",
        max(recency),
        "mean",
        round(sum(recency) / len(recency), 1),
    )
    print("Inactive >180 days:", sum(1 for r in recency if r > 180))
    print("Inactive >365 days:", sum(1 for r in recency if r > 365))

    print("\n=== HONEYPOT PATTERN HUNTING ===")
    honeypot_flags: dict[str, set[str]] = defaultdict(set)
    for candidate in candidates:
        cid = candidate["candidate_id"]
        for skill in candidate["skills"]:
            if skill["proficiency"] in ("expert", "advanced"):
                duration = skill.get("duration_months", 0) or 0
                if duration <= 3:
                    honeypot_flags[cid].add("high_prof_low_duration")
                if duration == 0:
                    honeypot_flags[cid].add("high_prof_zero_duration")
            assess = candidate["redrob_signals"]["skill_assessment_scores"].get(skill["name"])
            if assess is not None and skill["proficiency"] in ("expert", "advanced") and assess < 50:
                honeypot_flags[cid].add("prof_assessment_gap")

        for job in candidate["career_history"]:
            if job["company"] in FICTIONAL:
                honeypot_flags[cid].add("fictional_company")
            calc = months_between(job["start_date"], job["end_date"])
            if calc is not None and job["duration_months"] is not None:
                if abs(calc - job["duration_months"]) > 6:
                    honeypot_flags[cid].add("duration_date_mismatch")
            if job["start_date"] < "1990-01-01":
                honeypot_flags[cid].add("impossible_start_date")

        past_jobs = [j for j in candidate["career_history"] if not j["is_current"]]
        for i, job_a in enumerate(past_jobs):
            for job_b in past_jobs[i + 1 :]:
                s1, e1 = job_a["start_date"], job_a["end_date"] or "2026-06-18"
                s2, e2 = job_b["start_date"], job_b["end_date"] or "2026-06-18"
                if s1 <= e2 and s2 <= e1:
                    honeypot_flags[cid].add("overlapping_roles")
                    break
            if "overlapping_roles" in honeypot_flags[cid]:
                break

        advanced_count = sum(
            1 for s in candidate["skills"] if s["proficiency"] in ("expert", "advanced")
        )
        years = candidate["profile"]["years_of_experience"]
        if advanced_count >= 8 and years < 3:
            honeypot_flags[cid].add("many_advanced_low_yoe")
        if len(candidate["skills"]) >= 15 and years < 2:
            honeypot_flags[cid].add("skill_count_yoe_mismatch")

    flag_counts = Counter()
    for flags in honeypot_flags.values():
        for flag in flags:
            flag_counts[flag] += 1
    print("Flag type counts:")
    for flag, count in flag_counts.most_common():
        print(f"  {flag}: {count}")

    high_risk = [
        cid
        for cid, flags in honeypot_flags.items()
        if len(flags) >= 2
        or "fictional_company" in flags
        or "high_prof_zero_duration" in flags
        or "impossible_start_date" in flags
    ]
    medium_risk = [cid for cid in honeypot_flags if cid not in high_risk]
    print("Candidates with any honeypot flag:", len(honeypot_flags))
    print("High-risk estimate:", len(high_risk))
    print("Medium-risk (single flag):", len(medium_risk))

    print("\n=== PROFILE CONSISTENCY GAP ===")
    gap_count = 0
    gap_with_assess_low = 0
    samples: list[tuple] = []
    for candidate in candidates:
        text = career_text(candidate)
        unsupported = []
        for skill in candidate["skills"]:
            name = skill["name"]
            if not is_ai_skill(name, skill["proficiency"]):
                continue
            assess = candidate["redrob_signals"]["skill_assessment_scores"].get(name)
            if not skill_corroborated(name, text) and (assess is None or assess < 55):
                unsupported.append((name, skill["proficiency"], assess))
        if unsupported:
            gap_count += 1
            if any(a is not None and a < 50 for _, _, a in unsupported):
                gap_with_assess_low += 1
            if len(samples) < 5:
                samples.append(
                    (candidate["candidate_id"], candidate["profile"]["current_title"], unsupported[:4])
                )

    print(
        "Advanced/expert AI skills not corroborated in career text (and low/missing assessment):",
        gap_count,
    )
    print("Of those, with assessment <50 on at least one:", gap_with_assess_low)
    print("Sample gap cases:")
    for sample in samples:
        print(" ", sample)

    c1 = candidates[0]
    print("\n=== SAMPLE CAND_0000001 ===")
    print("Title:", c1["profile"]["current_title"])
    print("Location:", c1["profile"]["location"], c1["profile"]["country"])
    print(
        "Advanced/expert skills (name, prof, months, assess):",
        [
            (
                s["name"],
                s["proficiency"],
                s.get("duration_months"),
                c1["redrob_signals"]["skill_assessment_scores"].get(s["name"]),
            )
            for s in c1["skills"]
            if s["proficiency"] in ("advanced", "expert")
        ],
    )
    print("Honeypot flags:", sorted(honeypot_flags.get("CAND_0000001", set())))

    india_fit = sum(
        1
        for c in candidates
        if c["profile"]["country"] == "India" and 5 <= c["profile"]["years_of_experience"] <= 9
    )
    ai_titles = sum(
        1
        for c in candidates
        if any(
            k in c["profile"]["current_title"].lower()
            for k in ("ai", "ml", "machine learning", "data scientist", "nlp", "research engineer")
        )
    )
    print("\n=== JD-RELEVANT POOL ESTIMATE ===")
    print("India + 5-9 YoE:", india_fit)
    print("AI/ML-ish titles:", ai_titles)

    consult_only = 0
    for candidate in candidates:
        companies = {job["company"] for job in candidate["career_history"]}
        if companies and all(
            any(con in company for con in CONSULTING) or company in CONSULTING
            for company in companies
        ):
            consult_only += 1
    print("Consulting-only careers (approx):", consult_only)

    print("\nDONE")


if __name__ == "__main__":
    main()
