import json
import re
from pathlib import Path

CUAD_PATH = Path("data/cuad/CUAD_v1.json")
OUTPUT_JSONL_PATH = Path("data/clauses.jsonl")

# A small mapping; we’ll expand later to cover more CUAD clause labels
NOTES_BY_TYPE = {
    "Anti-Assignment": "Risk increases if assignment is allowed without consent or if consent is easy to obtain; consent requirements reduce risk.",
    "Cap On Liability": "A clear liability cap reduces risk; check exclusions and whether the cap is mutual.",
    "Uncapped Liability": "High risk if liability is uncapped or if exclusions undermine practical limits.",
    "Indemnification": "Risk increases if indemnity is broad, uncapped, or covers third-party claims without clear limits.",
    "Governing Law": "Risk may arise if governing law or venue is unfavorable or exclusive.",
    "Termination For Convenience": "Risk increases if termination is unilateral or notice is short; mutual termination is more balanced.",
    "Renewal Term": "Auto-renewal and strict notice windows can create lock-in; longer notice periods increase risk.",
    "Expiration Date": "Term length affects flexibility; long initial terms can increase lock-in risk.",
    "Liquidated Damages": "Risk increases if liquidated damages are punitive or poorly justified; check whether it's a penalty in disguise.",
    "Minimum Commitment": "Risk increases with guaranteed minimum purchase/volume obligations and penalties for underperformance.",
    "Insurance": "Check whether coverage requirements are reasonable and whether additional insured/waiver of subrogation are one-sided.",
    "Warranty Duration": "Check whether warranty is short, remedies are limited, and disclaimers are broad."
}
DISPLAY = {
    "Rofr/Rofo/Rofn": "Right of First Refusal / Offer / Negotiation",
}
TYPE_KEYWORDS = {
    "Renewal Term": ["renew", "renewal", "extend", "extension", "term", "automatic"],
    "Expiration Date": ["expire", "expiration", "term", "effective date", "commence"],
    "Anti-Assignment": ["assign", "assignment", "transfer"],
    "Governing Law": ["governed by", "laws of", "jurisdiction", "venue"],
    "Cap On Liability": ["liable", "liability", "damages", "consequential", "indirect"],
    "Limitation of Liability": ["liable", "liability", "damages", "consequential", "cap"],
    "Indemnification": ["indemnify", "indemnification", "hold harmless", "defend"],
    "Confidentiality": ["confidential", "confidentiality", "non-disclosure"],
}


def normalize_text(text: str) -> str:
    # Replace newlines and tabs with spaces
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def passes_keyword_check(clause_type: str, text: str) -> bool:
    kws = TYPE_KEYWORDS.get(clause_type)
    if not kws:
        return True  # don't block unknown types
    t = text.lower()
    return any(k in t for k in kws)

def normalize_clause_type(raw_id: str) -> str:
    # Keep only the part after "__" if present
    if "__" in raw_id:
        return raw_id.split("__")[-1].strip()
    return raw_id.strip()

def is_low_quality_span(text: str) -> bool:
    t = text.strip()
    words = t.split()
    if len(t) < 80:
        return True
    if len(words) < 15:
        return True
    if len(words) > 250:
        return True
    if len(t) > 2000:
        return True
    return False


def main():
    with CUAD_PATH.open("r", encoding="utf-8") as f:
        cuad = json.load(f)

    rows = []
    idx = 1
    seen = set()  # deduplicate (clause_type, text)

    for doc in cuad.get("data", []):
        title = doc.get("title", "unknown_contract")
        for para in doc.get("paragraphs", []):
            for qa in para.get("qas", []):
                raw_id = qa.get("id", "Unknown")
                clause_type = normalize_clause_type(raw_id)

                answers = qa.get("answers", [])
                if not answers:
                    continue

                note = NOTES_BY_TYPE.get(
                    clause_type,
                    "Assess scope, symmetry, limitations, notice periods, and any uncapped obligations; risk increases with broad, one-sided, or ambiguous language."
                )

                for ans in answers:
                    text = ans.get("text", "")
                    text = normalize_text(text).strip()

                    if is_low_quality_span(text):
                        continue

                    key = (clause_type, text)
                    if key in seen:
                        continue
                    seen.add(key)
                    clause_type_display = DISPLAY.get(clause_type, clause_type)
                    if not passes_keyword_check(clause_type, text):
                        continue

                    rows.append({
                        "id": idx,
                        "clause_type": clause_type,
                        "clause_type_display": clause_type_display,
                        "text": text,
                        "notes": note,
                        "source": title,
                        "cuad_id": raw_id
                    })
                    idx += 1

    OUTPUT_JSONL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_JSONL_PATH.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"Wrote {len(rows)} cleaned clauses from CUAD to {OUTPUT_JSONL_PATH}")

if __name__ == "__main__":
    main()
