import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parents[2]  # .../backend

class Settings(BaseModel):
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "http://localhost:11434")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama3.1:8b")

    DATA_JSONL_PATH: str = os.getenv("DATA_JSONL_PATH", str(BASE_DIR / "data" / "clauses.jsonl"))
    DATA_FAISS_INDEX_PATH: str = os.getenv("DATA_FAISS_INDEX_PATH", str(BASE_DIR / "data" / "clauses.index"))

    RUBRIC_PATH: str = os.getenv("RUBRIC_PATH", str(BASE_DIR / "rubric.md"))
    SCHEMA_PATH: str = os.getenv("SCHEMA_PATH", str(BASE_DIR / "schema.json"))

    TOP_K: int = int(os.getenv("TOP_K", "6"))
    REQUEST_TIMEOUT_S: int = int(os.getenv("REQUEST_TIMEOUT_S", "600"))

settings = Settings()
