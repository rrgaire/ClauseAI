import json
import faiss
from sentence_transformers import SentenceTransformer

DATA_PATH = "data/clauses.jsonl"
INDEX_PATH = "data/clauses.index"

def load_clauses(path):
    clauses = []
    with open(path, "r") as f:
        for line in f:
            clauses.append(json.loads(line))
    return clauses

def main():
    clauses = load_clauses(DATA_PATH)
    texts = [c["text"] for c in clauses]

    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(texts, convert_to_numpy=True)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    faiss.write_index(index, INDEX_PATH)
    print(f"Built FAISS index with {len(clauses)} clauses")

if __name__ == "__main__":
    main()
