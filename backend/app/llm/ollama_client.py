import requests
from typing import Any, Dict

class OllamaClient:
    def __init__(self, base_url: str, model: str, timeout_s: int = 120):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout_s = timeout_s

    def generate(self, prompt: str) -> str:
        url = f"{self.base_url}/api/generate"
        payload: Dict[str, Any] = {"model": self.model, "prompt": prompt, "stream": False}
        r = requests.post(url, json=payload, timeout=self.timeout_s)
        r.raise_for_status()
        return r.json().get("response", "")
