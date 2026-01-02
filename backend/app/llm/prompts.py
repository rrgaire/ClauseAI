from typing import List
from app.rag.store import ClauseRecord

def format_evidence(evidence: List[ClauseRecord]) -> str:
    parts = []
    for i, e in enumerate(evidence, 1):
        parts.append(
            f"[E{i}] type={e.clause_type_display}\n"
            f"notes={e.notes}\n"
            f"text={e.text}\n"
            f"source={e.source}\n"
        )
    return "\n".join(parts)

def build_prompt(user_clause: str, rubric_text: str, schema_text: str, evidence: List[ClauseRecord]) -> str:
    ev = format_evidence(evidence)
    return f"""
You are ClauseAI, an assistant that analyzes contract clauses for legal/commercial risk.
Follow the RUBRIC. Output ONLY valid JSON matching the SCHEMA (no extra keys).

RUBRIC:
{rubric_text}

SCHEMA (return ONLY JSON matching this):
{schema_text}

EVIDENCE (similar clauses + notes):
{ev}

USER CLAUSE:
{user_clause}

Return ONLY valid JSON. Use exactly these keys:
- clause_type (string)
- risk_level ("Low"|"Medium"|"High")
- risk_score (0-10 integer)
- reasons (list of strings; cite evidence like "E1", "E2" when used)
- safer_rewrite (string)
""".strip()
