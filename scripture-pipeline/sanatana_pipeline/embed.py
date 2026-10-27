"""Compute meaning ("semantic") vectors for every passage.

Uses the sentence-transformers model all-MiniLM-L6-v2 in its ONNX form (Xenova/all-MiniLM-L6-v2,
Apache-2.0). The website's browser search loads the *same* model file with transformers.js, so
query vectors and passage vectors are directly comparable.

Usage:  python -m sanatana_pipeline.embed     (run after build)
Writes: ../src/data/scripture/embeddings.json  (int8-quantised, base64)
"""

import base64
import hashlib
import json
import time
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

from .build import OUT
from .fetch import RAW
from .sources import UA

MODEL_ID = "Xenova/all-MiniLM-L6-v2"
MODEL_REVISION = "main"
MODEL_FILES = {
    "model_quantized.onnx": f"https://huggingface.co/{MODEL_ID}/resolve/{MODEL_REVISION}/onnx/model_quantized.onnx",
    "tokenizer.json": f"https://huggingface.co/{MODEL_ID}/resolve/{MODEL_REVISION}/tokenizer.json",
}
MAX_TOKENS = 256
SCALE = 127  # vectors are unit length, so every component fits in int8 after * 127


def _model_dir() -> Path:
    d = RAW / "model"
    d.mkdir(parents=True, exist_ok=True)
    for name, url in MODEL_FILES.items():
        path = d / name
        for attempt in range(5):
            if path.exists():
                break
            try:
                req = urllib.request.Request(url, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=300) as r:
                    path.write_bytes(r.read())
            except Exception:  # noqa: BLE001 - Hugging Face rate-limits shared connections
                if attempt == 4:
                    raise
                time.sleep(15 * (attempt + 1))
    return d


def passage_text(p: dict) -> str:
    """The text that represents a passage for meaning search."""
    return f"{p['work']}. {p['section']}. {p['translation']['text']}"


class Embedder:
    def __init__(self) -> None:
        d = _model_dir()
        self.tok = Tokenizer.from_file(str(d / "tokenizer.json"))
        self.tok.enable_truncation(MAX_TOKENS)
        self.tok.enable_padding()
        self.session = ort.InferenceSession(str(d / "model_quantized.onnx"), providers=["CPUExecutionProvider"])
        self.input_names = {i.name for i in self.session.get_inputs()}
        self.model_sha256 = hashlib.sha256((d / "model_quantized.onnx").read_bytes()).hexdigest()

    def embed(self, texts: list[str], batch: int = 32) -> np.ndarray:
        out = []
        for i in range(0, len(texts), batch):
            enc = self.tok.encode_batch(texts[i : i + batch])
            ids = np.array([e.ids for e in enc], dtype=np.int64)
            mask = np.array([e.attention_mask for e in enc], dtype=np.int64)
            feeds = {"input_ids": ids, "attention_mask": mask}
            if "token_type_ids" in self.input_names:
                feeds["token_type_ids"] = np.zeros_like(ids)
            hidden = self.session.run(None, feeds)[0]  # (batch, tokens, 384)
            m = mask[..., None].astype(np.float32)
            pooled = (hidden * m).sum(1) / np.clip(m.sum(1), 1e-9, None)  # mean pooling
            pooled /= np.linalg.norm(pooled, axis=1, keepdims=True)  # unit length
            out.append(pooled)
        return np.vstack(out)


def embed_all() -> dict:
    passages = json.loads((OUT / "passages.json").read_text(encoding="utf-8"))
    manifest = json.loads((OUT / "manifest.json").read_text(encoding="utf-8"))
    emb = Embedder()
    vectors = emb.embed([passage_text(p) for p in passages])
    q = np.clip(np.round(vectors * SCALE), -127, 127).astype(np.int8)
    payload = {
        "model": MODEL_ID,
        "modelFile": "onnx/model_quantized.onnx",
        "modelSha256": emb.model_sha256,
        "pooling": "mean",
        "normalized": True,
        "maxTokens": MAX_TOKENS,
        "dims": int(q.shape[1]),
        "scale": SCALE,
        "dataVersion": manifest["dataVersion"],
        "ids": [p["id"] for p in passages],
        "vectors": base64.b64encode(q.tobytes()).decode("ascii"),
    }
    (OUT / "embeddings.json").write_text(json.dumps(payload) + "\n", encoding="utf-8")
    return payload


if __name__ == "__main__":
    p = embed_all()
    print(f"Embedded {len(p['ids'])} passages, {p['dims']} dims, model {p['model']}")
