import faiss
import json
from sentence_transformers import SentenceTransformer

INDEX_PATH = "data/clauses.index"
DATA_PATH = "data/clauses.jsonl"

def load_clauses(path):
    with open(path) as f:
        return [json.loads(line) for line in f]

clauses = load_clauses(DATA_PATH)
index = faiss.read_index(INDEX_PATH)
model = SentenceTransformer("all-MiniLM-L6-v2")

query = "This contract renews automatically unless notice is provided."
query_vec = model.encode([query], convert_to_numpy=True)

D, I = index.search(query_vec, k=2)

for idx in I[0]:
    print(clauses[idx]["clause_type"], ":", clauses[idx]["text"])
    break
