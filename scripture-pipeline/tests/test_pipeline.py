"""Tests for the scripture pipeline: validation rules, cleaning helpers and the published dataset."""

import copy
import json
from pathlib import Path

import pytest

from sanatana_pipeline.importers.gita import clean_sanskrit, to_iast
from sanatana_pipeline.importers.ramayana import roman_to_int
from sanatana_pipeline.importers.svetasvatara import _clean
from sanatana_pipeline.provenance import validate

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src" / "data" / "scripture"
RAW = Path(__file__).resolve().parents[1] / "raw"


@pytest.fixture(scope="module")
def passages() -> list[dict]:
    return json.loads((DATA / "passages.json").read_text(encoding="utf-8"))


@pytest.fixture
def good(passages) -> dict:
    return copy.deepcopy(passages[0])


# --- validation catches problems -------------------------------------------------


def test_published_dataset_is_valid(passages):
    assert validate(passages) == []


def test_duplicate_id_is_caught(good):
    assert any("duplicate id" in p for p in validate([good, copy.deepcopy(good)]))


@pytest.mark.parametrize(
    "text",
    ["Produced by Project Gutenberg volunteers and friends", "See https://example.com for more", "© 2020 Some Publisher text here"],
)
def test_boilerplate_or_links_are_caught(good, text):
    good["translation"]["text"] = text
    assert any("boilerplate" in p for p in validate([good]))


def test_unknown_source_is_caught(good):
    good["translation"]["source_id"] = "random-website"
    assert any("unknown source" in p for p in validate([good]))


def test_bad_companion_and_status_are_caught(good):
    good["companions"] = ["zeus"]
    good["verification_status"] = "trust-me"
    problems = validate([good])
    assert any("bad companions" in p for p in problems)
    assert any("bad verification status" in p for p in problems)


def test_non_devanagari_original_is_caught(good):
    good["original"]["text"] = "dharmakshetre kurukshetre"
    assert any("not Devanagari" in p for p in validate([good]))


# --- cleaning helpers -------------------------------------------------------------


def test_clean_sanskrit_removes_verse_markers():
    raw = "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय।।1.1।।"
    out = clean_sanskrit(raw)
    assert "1.1" not in out and "।।" not in out
    assert out.splitlines()[0].endswith("।")


def test_iast_transliteration():
    assert to_iast("धर्म") == "dharma"


def test_roman_numerals():
    assert [roman_to_int(s) for s in ("I", "IV", "IX", "XL", "LXVIII")] == [1, 4, 9, 40, 68]


def test_svetasvatara_ocr_corrections():
    text, _ = _clean("Hira^yagarbha and the prazzava, the god 6iva")
    assert "Hiranyagarbha" in text and "pranava" in text and "Siva" in text


# --- the published dataset --------------------------------------------------------


def test_expected_counts(passages):
    counts: dict[str, int] = {}
    for p in passages:
        counts[p["work_id"]] = counts.get(p["work_id"], 0) + 1
    assert counts["bhagavad-gita"] == 701
    assert counts["svetasvatara-upanishad"] >= 100
    assert len(passages) == 1341


def test_gita_2_47_is_correct(passages):
    v = next(p for p in passages if p["id"] == "bg-2.47")
    assert "कर्मण्येवाधिकारस्ते" in v["original"]["text"]
    assert "action" in v["translation"]["text"].lower()
    assert v["transliteration"]["scheme"] == "IAST"


def test_every_gita_verse_has_english_and_sanskrit(passages):
    gita = [p for p in passages if p["work_id"] == "bhagavad-gita"]
    assert all(p["translation"]["text"].strip() and p["original"]["text"].strip() for p in gita)


def test_ids_unique_and_order_increasing(passages):
    assert len({p["id"] for p in passages}) == len(passages)
    by_work: dict[str, list[int]] = {}
    for p in passages:
        by_work.setdefault(p["work_id"], []).append(p["order"])
    for orders in by_work.values():
        assert orders == sorted(orders)


def test_embeddings_cover_every_passage(passages):
    emb = json.loads((DATA / "embeddings.json").read_text())
    assert emb["dims"] == 384
    assert emb["ids"] == [p["id"] for p in passages]


def test_works_counts_match(passages):
    works = json.loads((DATA / "works.json").read_text())
    for w in works:
        assert w["passageCount"] == sum(p["work_id"] == w["id"] for p in passages)
        assert w["sources"], f"{w['id']} lists no sources"


@pytest.mark.skipif(not (RAW / "besant_01.html").exists(), reason="raw downloads not present (run fetch)")
def test_raw_manifest_matches_downloads():
    import hashlib

    manifest = json.loads((RAW.parent / "raw_manifest.json").read_text())
    assert len(manifest) == 24  # 18 Besant chapters + 6 other files
    for name, info in manifest.items():
        assert hashlib.sha256((RAW / name).read_bytes()).hexdigest() == info["sha256"], name


def test_devi_gita_has_no_capital_v_artifacts(passages):
    import re

    bad = [
        m
        for p in passages
        if p["work_id"] == "devi-gita"
        for m in re.findall(r"\b\w*[a-z]sV[a-z]\w*", p["translation"]["text"])
    ]
    assert bad == []
