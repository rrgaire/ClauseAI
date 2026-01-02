import numpy as np
from sentence_transformers import SentenceTransformer

class Embedder:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def encode(self, text: str) -> np.ndarray:
        vec = self.model.encode([text], convert_to_numpy=True)
        return vec[0]
