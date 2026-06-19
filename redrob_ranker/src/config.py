"""JD keywords, skill taxonomies, and scoring constants."""
from __future__ import annotations

from datetime import date

REF_DATE = date(2026, 6, 18)

REQUIRED_SKILL_KEYWORDS = {
    "embeddings": 1.0,
    "sentence-transform": 1.0,
    "retrieval": 1.0,
    "vector": 0.9,
    "pinecone": 0.9,
    "milvus": 0.9,
    "weaviate": 0.9,
    "qdrant": 0.9,
    "faiss": 0.9,
    "opensearch": 0.85,
    "elasticsearch": 0.85,
    "hybrid search": 1.0,
    "python": 0.8,
    "ndcg": 1.0,
    "mrr": 0.9,
    "map": 0.7,
    "ranking": 0.85,
    "learning-to-rank": 0.9,
    "a/b test": 0.7,
}

PREFERRED_SKILL_KEYWORDS = {
    "lora": 0.6,
    "qlora": 0.6,
    "peft": 0.6,
    "fine-tun": 0.7,
    "xgboost": 0.5,
    "recruiting": 0.4,
    "hr-tech": 0.4,
    "distributed": 0.4,
    "inference": 0.4,
    "rag": 0.5,
    "llm": 0.5,
}

PRODUCTION_CAREER_KEYWORDS = [
    "recommendation system",
    "recommendation engine",
    "ranking system",
    "search ranking",
    "retrieval system",
    "vector search",
    "hybrid retrieval",
    "hybrid search",
    "embedding",
    "embeddings",
    "semantic search",
    "learning to rank",
    "ndcg",
    "mrr",
    "recruiter search",
    "candidate matching",
    "deployed to production",
    "production deployment",
    "a/b test",
    "online evaluation",
    "offline benchmark",
]

AI_TITLE_STRONG = (
    "ai engineer",
    "ml engineer",
    "machine learning engineer",
    "nlp engineer",
    "applied ml",
    "research engineer",
    "senior ai",
    "staff ai",
    "principal ai",
    "recommendation systems engineer",
    "search engineer",
    "retrieval engineer",
)

AI_TITLE_MEDIUM = (
    "data scientist",
    "data engineer",
    "software engineer",
    "backend engineer",
    "full stack",
    "platform engineer",
    "ml ops",
    "mlops",
)

TRAP_TITLES = (
    "hr manager",
    "accountant",
    "marketing manager",
    "content writer",
    "graphic designer",
    "civil engineer",
    "mechanical engineer",
    "customer support",
    "sales executive",
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
    "bangalore",
    "bengaluru",
    "chennai",
    "gurgaon",
    "gurugram",
    "ncr",
)

PROFICIENCY_WEIGHT = {
    "expert": 1.0,
    "advanced": 0.85,
    "intermediate": 0.55,
    "beginner": 0.25,
}

# Composite score weights (must sum to 1.0 for base components)
WEIGHTS = {
    "title_fit": 0.22,
    "skill_match": 0.16,
    "career_consistency": 0.16,
    "production_signals": 0.14,
    "experience_match": 0.10,
    "semantic_match": 0.08,
    "assessment_corroboration": 0.06,
    "location_fit": 0.08,
    "behavioral": 0.02,
}

HONEYPOT_HARD_EXCLUDE_MIN_FLAGS = 2
