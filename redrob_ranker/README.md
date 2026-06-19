# Redrob Hackathon — Candidate Ranking System

Rule-based recruiter-style ranker for the **Senior AI Engineer — Founding Team** JD. Designed to avoid keyword-stuffer and honeypot traps in the 100K candidate pool.

## Quick start

### 1. Place the Dataset
Because the candidate database is very large (~487MB), it is ignored in Git. You must:
1. Obtain the `[PUB] India_runs_data_and_ai_challenge` directory.
2. Place it in the root folder of this project (parent of `redrob_ranker`), so the path looks like:
   `../[PUB] India_runs_data_and_ai_challenge/[PUB] India_runs_data_and_ai_challenge/India_runs_data_and_ai_challenge/candidates.jsonl`

### 2. Run the Ranker
```bash
cd redrob_ranker
python rank.py
```
This will automatically scan 100K candidates, filter honeypots, calculate the composite score, and write `submission.csv`.

### 3. Validate Submission
```bash
python validate_submission.py submission.csv
```

**Dependencies:** Python 3.10+ stdlib only (`requirements.txt` is documentation-only).

## Architecture

```
candidates.jsonl
      │
      ▼
 loader.py          ── load 100K JSONL records
      │
      ▼
 honeypot.py        ── hard-exclude ~80 impossible profiles (2+ timeline/skill flags)
 disqualifiers.py  ── JD explicit disqualifiers (consulting-only, LangChain-only, etc.)
      │
      ▼
 features.py        ── per-candidate signals (title, skills, career corroboration, …)
 scoring.py         ── weighted composite + behavioral multiplier + heap top-100
      │
      ▼
 reasoning.py       ── deterministic 1–2 sentence justification from real fields
 output.py          ── UTF-8 CSV (candidate_id, rank, score, reasoning)
```

### Design principles (from JD + Step 0 exploration)

1. **Title fit is primary** — Marketing Manager / Accountant with AI keywords in skills is penalized hard.
2. **Career corroboration** — advanced AI skills must appear in job descriptions, not just self-tags.
3. **Assessment corroboration** — advanced/expert claims with Redrob assessment &lt;45 are penalized.
4. **Honeypot gate** — exclude candidates with 2+ impossible-profile flags (skill-months ≫ YoE, expert@0 months, etc.). Fictional company names (Dunder Mifflin) are **not** used — they appear in normal profiles.
5. **Behavioral multiplier** — response rate, notice period, last-active recency adjust final score.
6. **Semantic match** — lightweight JD-term overlap (8% weight), not embedding similarity alone.

## Scoring formula

Base score (weights sum to 1.0):

| Feature | Weight | Rationale |
|---------|--------|-----------|
| `title_fit` | 0.22 | Defeats keyword-stuffer trap (wrong titles with AI skills) |
| `skill_match` | 0.16 | JD required/preferred skills, corroborated in career text |
| `career_consistency` | 0.16 | Skills list vs work-history alignment |
| `production_signals` | 0.14 | Ranking/retrieval/recommendation language in career |
| `experience_match` | 0.10 | 5–9 year band (ideal 6–8) |
| `semantic_match` | 0.08 | JD vocabulary overlap (one signal among many) |
| `assessment_corroboration` | 0.06 | Redrob skill assessments vs claimed proficiency |
| `location_fit` | 0.08 | Pune/Noida preferred; India required for full score |
| `behavioral` | 0.02 | Direct component + multiplier below |

Final score:

```
base = Σ(weight × feature)
behavioral_boost = 0.85 + 0.15 × behavioral
score = base × behavioral_boost × dq_penalty × (1 - 0.65 × honeypot_risk)
if country != "India": score ×= 0.35
```

**Disqualifier penalties:** consulting-only or pure-research → ×0.25; 2+ flags → ×0.35; single flag → ×0.55.

**Hard honeypot exclude:** `expert` skill at 0 months, or **≥2** refined honeypot flags.

## Honeypot detection rules

| Flag | Trigger |
|------|---------|
| `multi_high_prof_near_zero_dur` | ≥2 expert/advanced skills with ≤1 month duration |
| `expert_zero_duration` | Any expert skill at 0 months |
| `skill_months_exceed_yoe` | Total skill-months > 2.5× YoE×12 |
| `job_months_exceed_yoe` | Sum of job durations > YoE×12 + 24 |
| `current_job_longer_than_yoe` | Current role duration > total YoE |
| `yoe_vs_start_mismatch` | YoE >12 but earliest start after 2012 |
| `multi_assessment_gap` | ≥3 advanced/expert skills with assessment &lt;40 |

Step 0 found **83** candidates matching 2+ flags — consistent with organizer claim of ~80 honeypots.

## Compute budget

Target: **≤5 min**, **≤16 GB RAM**, **CPU only**, **no network**.

Re-run `python rank.py` locally to measure on your machine. Prior full-corpus TF-IDF pass exceeded budget; current version uses single-pass scoring with fixed JD-term semantic overlap.

## Project layout

```
redrob_ranker/
├── rank.py                 # CLI entrypoint
├── submission.csv          # Generated output (top 100)
├── requirements.txt
├── docs/
│   ├── step0_exploration_summary.md
│   └── structured_jd.json
└── src/
    ├── config.py           # Weights, keywords, constants
    ├── loader.py
    ├── honeypot.py
    ├── disqualifiers.py
    ├── features.py
    ├── scoring.py
    ├── reasoning.py
    └── output.py
```

## Stage 5 interview prep

Be ready to explain:

- Why title_fit has the highest weight (sample_submission.csv ranks HR Managers — intentional trap).
- How CAND_0000001 (Backend Engineer + NLP/GANs skills, low assessments) is filtered.
- Why honeypot detection uses timeline math, not fictional company names.
- How reasoning is template-rotated but every fact comes from profile fields.

## AI tools declaration

Cursor/Claude used for architecture and implementation. No candidate data sent to hosted LLMs during ranking execution.
