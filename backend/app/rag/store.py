from __future__ import annotations

import json
from dataclasses import dataclass
from typing import List

import faiss
import numpy as np

@dataclass(frozen=True)
class ClauseRecord:
    id: int
    clause_type: str
    clause_type_display: str
    text: str
    notes: str
    source: str
    cuad_id: str

class ClauseStore:
    def __init__(self, jsonl_path: str, faiss_index_path: str):
        self.jsonl_path = jsonl_path
        self.faiss_index_path = faiss_index_path
        self.records: List[ClauseRecord] = []
        self.index = None

    def load(self) -> None:
        self.records = []
        with open(self.jsonl_path, "r", encoding="utf-8") as f:
            for line in f:
                obj = json.loads(line)
                self.records.append(
                    ClauseRecord(
                        id=int(obj["id"]),
                        clause_type=obj.get("clause_type", "Unknown"),
                        clause_type_display=obj.get("clause_type_display", obj.get("clause_type", "Unknown")),
                        text=obj.get("text", ""),
                        notes=obj.get("notes", ""),
                        source=obj.get("source", ""),
                        cuad_id=obj.get("cuad_id", ""),
                    )
                )

        self.index = faiss.read_index(self.faiss_index_path)

        if self.index.ntotal != len(self.records):
            raise RuntimeError(
                f"FAISS index ntotal={self.index.ntotal} but records={len(self.records)}. "
                f"Rebuild index to match clauses.jsonl."
            )

    def search(self, query_vec: np.ndarray, k: int) -> List[ClauseRecord]:
        if query_vec.ndim == 1:
            query_vec = query_vec.reshape(1, -1)
        _, I = self.index.search(query_vec.astype("float32"), k)
        return [self.records[int(idx)] for idx in I[0] if idx >= 0]
