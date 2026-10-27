"""Provenance and quality rules every scripture passage must satisfy before it reaches the website."""

import re

from .sources import SOURCES

REQUIRED_FIELDS: tuple[str, ...] = (
    "id",
    "scripture",
    "section",
    "language",
    "translation",
    "translator",
    "edition",
    "source_url",
    "license",
    "verification_status",
)

VERIFICATION_STATUSES = {"verified-clean-source", "checked-against-scan", "ocr-cleaned-spot-checked"}
COMPANION_IDS = {"krishna", "shiva", "hanuman", "parvati"}
FORBIDDEN = re.compile(r"Project Gutenberg|gutenberg\.org|www\.|http|©|All rights reserved", re.I)
DEVANAGARI = re.compile(r"[ऀ-ॿ]")


def missing_provenance(passage: dict) -> list[str]:
    """Return the required fields that are missing or empty in a flat passage record."""
    return [f for f in REQUIRED_FIELDS if not str(passage.get(f, "")).strip()]


def flatten(p: dict) -> dict:
    """Flatten a stored passage into the provenance fields shown on every verse card."""
    src = SOURCES.get(p["translation"]["source_id"])
    return {
        "id": p["id"],
        "scripture": p["work"],
        "section": p["section"],
        "language": p["translation"]["language"],
        "translation": p["translation"]["text"],
        "translator": p["translation"]["translator"],
        "edition": src.edition if src else "",
        "source_url": src.url if src else "",
        "license": src.license if src else "",
        "verification_status": p["verification_status"],
    }


def validate(passages: list[dict]) -> list[str]:
    """Return a list of problems. An empty list means every passage may be published."""
    problems: list[str] = []
    seen: set[str] = set()
    for p in passages:
        pid = p.get("id", "?")
        if pid in seen:
            problems.append(f"{pid}: duplicate id")
        seen.add(pid)
        if p["translation"]["source_id"] not in SOURCES:
            problems.append(f"{pid}: unknown source {p['translation']['source_id']}")
        for f in missing_provenance(flatten(p)):
            problems.append(f"{pid}: missing {f}")
        if p["verification_status"] not in VERIFICATION_STATUSES:
            problems.append(f"{pid}: bad verification status")
        if not p["companions"] or not set(p["companions"]) <= COMPANION_IDS:
            problems.append(f"{pid}: bad companions {p['companions']}")
        if FORBIDDEN.search(p["translation"]["text"]):
            problems.append(f"{pid}: boilerplate or URL in text")
        if len(p["translation"]["text"]) < 15:
            problems.append(f"{pid}: translation too short")
        orig = p.get("original")
        if orig:
            if orig["source_id"] not in SOURCES:
                problems.append(f"{pid}: unknown original source")
            if orig["script"] == "Devanagari" and not DEVANAGARI.search(orig["text"]):
                problems.append(f"{pid}: original is not Devanagari")
    return problems
