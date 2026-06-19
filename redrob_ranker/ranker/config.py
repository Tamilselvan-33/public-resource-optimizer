"""JD keywords, weights, and thresholds for the ranking pipeline."""
from __future__ import annotations

from datetime import date

REF_DATE = date(2026, 6, 18)

# --- Required / preferred skill tokens (matched against skills + career text) ---
REQUIRED_SKILL_GROUPS = {
    "retrieval": [
        "retrieval",
        "embedding",
        "embeddings",
        "sentence-transform",
        "dense retrieval",
        "hybrid search",
        "semantic search",
    ],
    "vector_db": [
        "vector",
        "pinecone",
        "weaviate",
        "qdrant",
        "milvus",
        "faiss",
        "opensearch",
        "elasticsearch",
    ],
    "python": ["python"],
    "ranking_eval": [
        "ndcg",
        "mrr",
        "map",
        "learning-to-rank",
        "learning to rank",
        "ranking system",
        "ranking engine",
        "recommendation system",
        "recommendation engine",
        "a/b test",
        "offline eval",
    ],
}

PREFERRED_SKILL_GROUPS = {
    "llm_finetune": ["lora", "qlora", "peft", "fine-tun", "fine tun"],
    "ltr": ["xgboost", "learning-to-rank", "learning to rank"],
    "hr_tech": ["recruit", "talent", "hr-tech", "marketplace"],
    "distributed": ["distributed", "inference", "serving", "scale"],
    "oss": ["open source", "open-source", "github", "contribution"],
}

AI_SKILL_KEYWORDS = (
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
    "tensorflow",
    "pytorch",
    "transformer",
)

STRONG_AI_TITLES = (
    "ai engineer",
    "ml engineer",
    "machine learning engineer",
    "nlp engineer",
    "applied ml",
    "research engineer",
    "recommendation",
    "data scientist",
    "senior ai",
    "senior ml",
)

WEAK_NON_AI_TITLES = (
    "hr manager",
    "accountant",
    "marketing manager",
    "content writer",
    "graphic designer",
    "customer support",
    "sales executive",
    "civil engineer",
    "mechanical engineer",
    "operations manager",
    "business analyst",
    "project manager",
)

CONSULTING_FIRMS = (
    "tcs",
    "tata consultancy",
    "infosys",
    "wipro",
    "accenture",
    "cognizant",
    "capgemini",
    "mindtree",
    "ltimindtree",
    "hcl",
    "tech mahindra",
    "mphasis",
)

PRODUCT_INDUSTRIES = {
    "software",
    "saas",
    "fintech",
    "e-commerce",
    "ai/ml",
    "edtech",
    "food delivery",
    "adtech",
}

LOCATION_PREFERRED = ("pune", "noida")
LOCATION_ACCEPTABLE = (
    "hyderabad",
    "mumbai",
    "delhi",
    "gurgaon",
    "gurugram",
    "bangalore",
    "bengaluru",
    "chennai",
    "ncr",
)

PROFICIENCY_WEIGHT = {
    "beginner": 0.25,
    "intermediate": 0.55,
    "advanced": 0.85,
    "expert": 1.0,
}

# Composite feature weights (sum to 1.0 before behavioral multiplier)
WEIGHTS = {
    "title_fit": 0.22,
    "career_consistency": 0.20,
    "skill_match": 0.16,
    "assessment_corroboration": 0.12,
    "experience_match": 0.10,
    "semantic_match": 0.07,
    "location_fit": 0.08,
    "product_company_signal": 0.05,
}

# Hard gate: exclude candidates with honeypot_risk >= this (count of refined flags)
HONEYPOT_EXCLUDE_FLAGS = 2

# Heavy penalty threshold for single critical honeypot flag
HONEYPOT_CRITICAL_FLAGS = {"expert_zero_duration", "multi_high_prof_near_zero_dur"}

JD_TEXT = """
Senior AI Engineer founding team ranking retrieval embeddings vector search hybrid
production Python evaluation NDCG MRR MAP learning-to-rank recommendation system
LLM fine-tuning LoRA product company ship recruiter matching talent intelligence
"""
