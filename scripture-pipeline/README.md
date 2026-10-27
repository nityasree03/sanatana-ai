# Scripture pipeline

Offline Python tools that will import, validate and index licensed scripture
passages (Phase 3). Right now it contains the provenance checklist and its tests.

```bash
cd scripture-pipeline
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m pytest -q
```
