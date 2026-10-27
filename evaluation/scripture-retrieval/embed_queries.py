"""Embed the evaluation queries with the same model the browser uses, so the TypeScript
evaluation can test meaning search without a browser. Run from scripture-pipeline/:
    PYTHONPATH=. python ../evaluation/scripture-retrieval/embed_queries.py
"""

import json
from pathlib import Path

from sanatana_pipeline.embed import Embedder

HERE = Path(__file__).resolve().parent
queries = json.loads((HERE / "queries.json").read_text())["queries"]
vectors = Embedder().embed([q["query"] for q in queries])
out = {q["id"]: [round(float(x), 6) for x in v] for q, v in zip(queries, vectors)}
(HERE / "query_vectors.json").write_text(json.dumps(out))
print(f"embedded {len(out)} queries")
