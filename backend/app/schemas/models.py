from typing import List
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    clause_text: str = Field(..., min_length=20)

class EvidenceItem(BaseModel):
    id: int
    clause_type: str
    clause_type_display: str
    text: str
    notes: str
    source: str
    cuad_id: str

class AnalyzeResponse(BaseModel):
    clause_type: str
    risk_level: str
    risk_score: int
    reasons: List[str]
    safer_rewrite: str
    evidence: List[EvidenceItem]
