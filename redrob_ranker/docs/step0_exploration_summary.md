# Step 0 — Data Exploration Summary

**Dataset path:** `[PUB] India_runs_data_and_ai_challenge/.../India_runs_data_and_ai_challenge/candidates.jsonl`

## Bundle vs README discrepancies

| README says | Actual bundle |
|---|---|
| `candidates.jsonl.gz` | `candidates.jsonl` (already uncompressed, 100,000 lines) |
| `job_description.md`, `submission_spec.md`, `redrob_signals_doc.md` | `.docx` versions (content equivalent; extracted to `redrob_ranker/docs_extracted/`) |
| `sample_submission.csv` is format-only | Confirmed — ranks HR Managers, Accountants, etc. with "AI core skills"; **not** a good ranking |

## Row count & schema

- **100,000** candidates, **0** duplicate IDs, **0** malformed IDs
- Spot-check of first 1,000 rows: all required top-level fields present (`candidate_id`, `profile`, `career_history`, `education`, `skills`, `redrob_signals`)
- Skills per candidate: min 5, max 23, mean **9.6**

## Profile distributions

### Years of experience
- Min 1.0, max 16.9, mean **7.17**
- Bands: `<5` → 33,870 | `5-9` → 34,375 | `10-15` → 31,748 | `>15` → 7

### Geography
- **India: 75,113 (75%)** — rest spread across USA, Australia, Canada, UK, etc.
- Top cities evenly distributed (~4,100–4,300 each): Noida, Hyderabad, Bangalore, Pune, Delhi, Chennai, etc.

### Current titles (trap signal)
Most common titles are **non-AI**:
- Business Analyst (5,833), HR Manager (5,830), Mechanical Engineer (5,791), Accountant (5,764)…
- AI/ML-ish titles: only **994** total across 100K
- Software/ML titles exist but are minority (Software Engineer 3,450; Full Stack 2,873)

**Implication:** A keyword or embedding matcher will rank "Marketing Manager with 8 AI skills" highly. The JD explicitly says this is wrong. The included `sample_submission.csv` demonstrates exactly this failure mode.

### Industries
- IT Services 29,881 | Software 22,417 | Manufacturing 22,305 | AI/ML industry tag only **278**

## Skills & assessments

### Proficiency distribution (958K skill entries)
- beginner: 379,097 | intermediate: 470,309 | advanced: 109,585 | **expert: 1,311**

### Assessment scores (`skill_assessment_scores`)
- Only **24,244** candidates (24%) have any assessment
- Score range: 20.0–97.3, mean **52.9**
- Large gaps between claimed advanced/expert proficiency and low assessment scores are common trap signal

## Behavioral signals

| Signal | Finding |
|---|---|
| `recruiter_response_rate` | Mean **0.437** |
| `notice_period_days` | ≤30 days: **13,809** \| >30 days: **86,191** |
| `github_activity_score == -1` | **64,637** (no GitHub linked) |
| `open_to_work_flag` | **35,339** |
| `last_active_date` recency (ref 2026-06-18) | Mean **131 days** ago; **26,505** inactive >180 days |

JD says down-weight stale/inactive/low-response candidates even if skills look perfect.

## Honeypot analysis

Organizers claim **~80 honeypots** (tier 0 ground truth). Naive flags over-fire:

| Naive flag | Count | Problem |
|---|---|---|
| `fictional_company` (Dunder Mifflin, etc.) | 66,560 | Fictional names used broadly for anonymization, **not** honeypot-specific |
| `overlapping_roles` | 40,242 | Too sensitive for this dataset |

### Refined honeypot rules (2+ flags)
**83 candidates** — aligns with ~80 honeypot claim.

Rules that work:
1. **Multiple expert/advanced skills with duration ≤1 month** (21 with `expert_zero_duration`)
2. **Total skill duration months >> plausible given YoE** (`skill_months_exceed_yoe`)
3. **Sum of job duration months >> YoE** (`job_months_exceed_yoe`)
4. **Current job duration > total YoE**
5. **YoE vs earliest career start date mismatch** (claims 14+ years but started 2019)
6. **≥3 advanced/expert skills with assessment score <40**

Example honeypots:
- `CAND_0003582` Mobile Developer — 3 expert skills at 0 months duration
- `CAND_0019480` NLP Engineer — 501 skill-months claimed with 2.8 YoE
- `CAND_0016000` Full Stack Developer — TypeScript/Go/Docker all expert, 0 months

## Profile consistency gap ("skills say X, career says not-X")

**17,283 candidates** have advanced/expert AI-related skills **not corroborated** in career text (summary + job descriptions) AND missing/low assessment (<55).

**3,792** of those also have assessment **<50** on at least one claimed skill.

Canonical example — `CAND_0000001`:
- Title: **Backend Engineer**, location: **Toronto, Canada**
- Claims advanced: NLP (assess 38.8), Fine-tuning LLMs (41.6), Speech Recognition, GANs, Milvus, TTS
- Career text: data engineering, Spark, Airflow — **no NLP/IR production work described**
- This is exactly the trap described in the JD's hackathon note

## Other trap populations

| Pattern | Count |
|---|---|
| Keyword stuffers (6+ AI skills, non-AI title) | **1,272** |
| Plain-language fits (rec/search/ranking in career, no buzzword skills, 5-9 YoE) | **171** |
| Consulting-only careers (approx) | **8,991** |
| India + 5-9 YoE | **25,884** |
| India + 5-9 YoE + AI title + retrieval/ranking in career text | **416** |

The last number is a rough upper bound on "plausibly strong" candidates before behavioral/honeypot/disqualifier filtering. JD says they expect ~10 great matches — consistent with narrow pool.

## Assumptions validated / invalidated

| Assumption in prompt | Verdict |
|---|---|
| ~80 honeypots | **Confirmed** (83 with refined 2+ flag rules) |
| Keyword matching fails | **Strongly confirmed** — title distribution + sample_submission.csv |
| Profile consistency gap is common | **Confirmed** — 17K+ candidates |
| Behavioral signals matter | **Confirmed** in docs + data (wide variance in response rate, recency) |
| Fictional company = honeypot | **Invalidated** — used for normal anonymization |
| Dataset is candidates.jsonl.gz | **Invalidated in this bundle** — plain `.jsonl` present |

## Recommended pipeline implications (for Steps 1–6)

1. **Title/role fit** must be a primary signal, not skills alone
2. **Career corroboration** and **assessment corroboration** are essential trap defenses
3. **Honeypot gate** should use refined timeline/skill-duration rules, not fictional company names
4. **Behavioral multiplier** on availability (response rate, last active, notice period)
5. **Location gate** for India / Pune-Noida preference
6. **Semantic similarity** (TF-IDF or small local embeddings) as one feature only
7. Keep top-100 honeypot rate **≤10** (≤10%) — hard exclude high-confidence honeypots
