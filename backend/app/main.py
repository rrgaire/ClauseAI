from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.rag.embedder import Embedder
from app.rag.store import ClauseStore
from app.llm.ollama_client import OllamaClient
from app.llm.prompts import build_prompt
from app.schemas.models import AnalyzeRequest, AnalyzeResponse, EvidenceItem

app = FastAPI(title="ClauseAI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

store: ClauseStore | None = None
embedder: Embedder | None = None
ollama: OllamaClient | None = None
rubric_text: str = ""
schema_text: str = ""

@app.on_event("startup")
def startup():
    global store, embedder, ollama, rubric_text, schema_text

    rubric_path = Path(settings.RUBRIC_PATH)
    schema_path = Path(settings.SCHEMA_PATH)

    if not rubric_path.exists():
        raise RuntimeError(f"rubric.md not found at {rubric_path}")
    if not schema_path.exists():
        raise RuntimeError(f"schema.json not found at {schema_path}")

    rubric_text = rubric_path.read_text(encoding="utf-8")
    schema_text = schema_path.read_text(encoding="utf-8")

    store = ClauseStore(settings.DATA_JSONL_PATH, settings.DATA_FAISS_INDEX_PATH)
    store.load()

    embedder = Embedder("all-MiniLM-L6-v2")
    ollama = OllamaClient(settings.LLM_BASE_URL, settings.LLM_MODEL, timeout_s=settings.REQUEST_TIMEOUT_S)

@app.get("/health")
def health():
    return {
        "ok": True,
        "model": settings.LLM_MODEL,
        "llm_base_url": settings.LLM_BASE_URL,
        "faiss_ntotal": store.index.ntotal if store else None,
    }

@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    if not store or not embedder or not ollama:
        raise HTTPException(status_code=500, detail="Service not initialized")

    clause = req.clause_text.strip()

    # RAG: retrieve evidence
    qvec = embedder.encode(clause)
    evidence_records = store.search(qvec, k=settings.TOP_K)

    # Prompt
    prompt = build_prompt(clause, rubric_text, schema_text, evidence_records)

    # LLM call
    raw = ollama.generate(prompt)

    # Parse JSON (strict + fallback)
    try:
        obj = json.loads(raw)
    except Exception:
        start, end = raw.find("{"), raw.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise HTTPException(status_code=500, detail=f"LLM did not return JSON. Raw: {raw[:300]}")
        try:
            obj = json.loads(raw[start:end+1])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON from LLM: {e}. Raw: {raw[:300]}")

    evidence = [
        EvidenceItem(
            id=r.id,
            clause_type=r.clause_type,
            clause_type_display=r.clause_type_display,
            text=r.text,
            notes=r.notes,
            source=r.source,
            cuad_id=r.cuad_id,
        )
        for r in evidence_records
    ]

    try:
        return AnalyzeResponse(
            clause_type=obj["clause_type"],
            risk_level=obj["risk_level"],
            risk_score=int(obj["risk_score"]),
            reasons=obj["reasons"],
            safer_rewrite=obj["safer_rewrite"],
            evidence=evidence,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema mismatch: {e}. Raw JSON: {obj}")
