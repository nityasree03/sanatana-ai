"""Build the website's scripture data: import every source, validate, and write versioned JSON.

Usage:  python -m sanatana_pipeline.build
Writes:  ../src/data/scripture/passages.json, works.json, manifest.json
"""

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from .fetch import MANIFEST, RAW
from .importers.devi_gita import import_devi_gita
from .importers.gita import import_gita
from .importers.ramayana import import_ramayana
from .importers.svetasvatara import import_svetasvatara
from .importers.upanishads import import_upanishads
from .provenance import validate
from .sources import SOURCES

DATA_VERSION = "1.0.0"
OUT = Path(__file__).resolve().parents[2] / "src" / "data" / "scripture"

# Minimum counts guard against an importer silently breaking.
EXPECTED_MIN = {
    "bhagavad-gita": 701,
    "valmiki-ramayana": 200,
    "isa-upanishad": 18,
    "katha-upanishad": 119,
    "kena-upanishad": 34,
    "svetasvatara-upanishad": 100,
    "devi-gita": 120,
}

WORK_INFO = {
    "bhagavad-gita": ("Krishna's teaching to Arjuna on the battlefield of Kurukshetra.", ["gita-sanskrit", "gita-besant"]),
    "valmiki-ramayana": ("Book V (Sundar): Hanuman's leap to Lanka and his search for Sita.", ["ramayana-griffith"]),
    "isa-upanishad": ("A short Upanishad on seeing the Lord in all things.", ["upanishads-paramananda"]),
    "katha-upanishad": ("Nachiketas questions Yama, the Ruler of Death, about the Self.", ["upanishads-paramananda"]),
    "kena-upanishad": ("On the power behind mind and senses; includes the appearance of Uma Haimavati.", ["upanishads-paramananda"]),
    "svetasvatara-upanishad": ("An Upanishad praising Rudra-Siva as the one God.", ["svetasvatara-muller"]),
    "devi-gita": ("The Goddess teaches the Himalaya king about Herself, knowledge, yoga and devotion.", ["devi-gita-vijnanananda"]),
}


def build() -> dict:
    passages = (
        import_gita(RAW)
        + import_ramayana(RAW)
        + import_upanishads(RAW)
        + import_svetasvatara(RAW)
        + import_devi_gita(RAW)
    )
    records = [p.to_json() for p in passages]
    problems = validate(records)
    counts = Counter(r["work_id"] for r in records)
    for work, minimum in EXPECTED_MIN.items():
        if counts[work] < minimum:
            problems.append(f"{work}: only {counts[work]} passages (expected at least {minimum})")
    if problems:
        raise SystemExit("Validation failed:\n" + "\n".join(problems[:50]))

    sections: dict[str, list[str]] = defaultdict(list)
    companions: dict[str, set[str]] = defaultdict(set)
    titles: dict[str, str] = {}
    for r in records:
        if r["section"] not in sections[r["work_id"]]:
            sections[r["work_id"]].append(r["section"])
        companions[r["work_id"]].update(r["companions"])
        titles[r["work_id"]] = r["work"]
    works = []
    for wid in EXPECTED_MIN:
        desc, source_ids = WORK_INFO[wid]
        works.append(
            {
                "id": wid,
                "title": titles[wid],
                "description": desc,
                "companions": sorted(companions[wid]),
                "passageCount": counts[wid],
                "sections": sections[wid],
                "sources": [
                    {
                        "id": s.id,
                        "title": s.title,
                        "translator": s.translator,
                        "edition": s.edition,
                        "year": s.year,
                        "license": s.license,
                        "rightsNote": s.rights_note,
                        "url": s.url,
                        "scanUrl": s.scan_url,
                        "language": s.language,
                    }
                    for s in (SOURCES[i] for i in source_ids)
                ],
            }
        )
    manifest = {
        "dataVersion": DATA_VERSION,
        "builtAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "passageCount": len(records),
        "byWork": dict(counts),
        "byStatus": dict(Counter(r["verification_status"] for r in records)),
        "rawFiles": json.loads(MANIFEST.read_text()),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "passages.json").write_text(json.dumps(records, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    (OUT / "works.json").write_text(json.dumps(works, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


if __name__ == "__main__":
    m = build()
    print(f"Built {m['passageCount']} passages (data v{m['dataVersion']}):")
    for k, v in m["byWork"].items():
        print(f"  {k:24s} {v}")
    print("  status:", m["byStatus"])
