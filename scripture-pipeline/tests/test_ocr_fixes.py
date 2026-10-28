import json
from pathlib import Path

import pytest

from sanatana_pipeline.model import Passage, Translation
from sanatana_pipeline.ocr_fixes import FIXES, SUSPICIOUS

DATA = Path(__file__).resolve().parents[2] / "src" / "data" / "scripture" / "passages.json"


def _passage(pid: str, text: str) -> Passage:
    p = Passage.__new__(Passage)
    p.id = pid
    p.translation = Translation.__new__(Translation)
    p.translation.text = text
    return p


def test_corrections_apply_to_every_occurrence():
    p = _passage("rcm-5.18", "Hanum4n roared; Hanum4n leapt.")
    apply_fixes_only = {k: v for k, v in FIXES.items() if k == "rcm-5.18"}
    from sanatana_pipeline import ocr_fixes

    saved = ocr_fixes.FIXES
    ocr_fixes.FIXES = apply_fixes_only
    try:
        assert ocr_fixes.apply_fixes([p]) == 1
    finally:
        ocr_fixes.FIXES = saved
    assert p.translation.text == "Hanuman roared; Hanuman leapt."


def test_stale_correction_fails_the_build():
    from sanatana_pipeline import ocr_fixes

    saved = ocr_fixes.FIXES
    ocr_fixes.FIXES = {"rcm-5.18": [("Hanum4n", "Hanuman")]}
    try:
        with pytest.raises(SystemExit, match="no longer match"):
            ocr_fixes.apply_fixes([_passage("rcm-5.18", "already clean")])
    finally:
        ocr_fixes.FIXES = saved


def test_published_data_has_no_known_scan_damage():
    records = json.loads(DATA.read_text(encoding="utf-8"))
    bad = [(r["id"], m.group(0)) for r in records for m in SUSPICIOUS.finditer(r["translation"]["text"])]
    assert bad == []
    ids = {r["id"] for r in records}
    assert "hume-katha-3.12" in ids  # was merged into 3.11 when "12." was scanned as "£2."
