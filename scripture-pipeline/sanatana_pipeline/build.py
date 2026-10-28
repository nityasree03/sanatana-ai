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
from .importers.devi_mahatmya import import_devi_mahatmya
from .importers.gita import import_gita
from .importers.gita_alt import import_arnold, import_telang
from .importers.kumarasambhava import import_kumarasambhava
from .importers.lalita import import_lalita
from .importers.mahabharata import import_mahabharata
from .importers.ramayana import import_ramayana
from .importers.ramayana_dutt import import_ramayana_dutt
from .importers.ramcharitmanas import import_ramcharitmanas
from .importers.sanskrit_ws import attach_devi_mahatmya, attach_upanishads
from .importers.svetasvatara import import_svetasvatara
from .importers.upanishads import import_upanishads
from .importers.upanishads_hume import import_upanishads_hume
from .importers.vishnu_purana import import_vishnu_purana
from .ocr_fixes import apply_fixes, remaining_suspicious
from .provenance import validate
from .sources import SOURCES

DATA_VERSION = "1.1.1"
OUT = Path(__file__).resolve().parents[2] / "src" / "data" / "scripture"

# Minimum counts guard against an importer silently breaking. The order here is the order
# texts are listed on the website (grouped by companion).
EXPECTED_MIN = {
    "bhagavad-gita": 701,
    "gita-telang": 130,
    "gita-arnold": 250,
    "mahabharata": 500,
    "vishnu-purana": 800,
    "valmiki-ramayana": 200,
    "ramayana-dutt": 3000,
    "ramcharitmanas": 700,
    "isa-upanishad": 18,
    "katha-upanishad": 119,
    "kena-upanishad": 34,
    "svetasvatara-upanishad": 100,
    "upanishads-hume": 1400,
    "kumarasambhava": 200,
    "devi-gita": 120,
    "devi-mahatmya": 80,
    "lalita-sahasranama": 95,
}

WORK_INFO = {
    "bhagavad-gita": ("Krishna's teaching to Arjuna on the battlefield of Kurukshetra: Sanskrit verses with Annie Besant's translation.", ["gita-sanskrit", "gita-besant"]),
    "gita-telang": ("K. T. Telang's careful, literal prose translation of the Gita (1882), for comparison.", ["gita-telang"]),
    "gita-arnold": ("Edwin Arnold's English verse Gita, 'The Song Celestial' (1885), the version Gandhi first read.", ["gita-arnold"]),
    "mahabharata": ("From Ganguli's Mahabharata: Krishna's peace mission, his Gita, and the thousand names of Shiva.", ["mahabharata-ganguli"]),
    "vishnu-purana": ("The Vishnu Purana; Part V tells Krishna's life from his birth to Dwaraka.", ["vishnu-purana-dutt"]),
    "valmiki-ramayana": ("Book V (Sundar) in Griffith's verse: Hanuman's leap to Lanka and his search for Sita.", ["ramayana-griffith"]),
    "ramayana-dutt": ("The complete Valmiki Ramayana, all seven books, in M. N. Dutt's prose.", ["ramayana-dutt"]),
    "ramcharitmanas": ("Tulsidas's Hindi Ramayana, the Ramcharitmanas, in F. S. Growse's prose.", ["ramcharitmanas-growse"]),
    "isa-upanishad": ("A short Upanishad on seeing the Lord in all things.", ["upanishads-paramananda", "upanishads-sanskrit"]),
    "katha-upanishad": ("Nachiketas questions Yama, the Ruler of Death, about the Self.", ["upanishads-paramananda", "upanishads-sanskrit"]),
    "kena-upanishad": ("On the power behind mind and senses; includes the appearance of Uma Haimavati.", ["upanishads-paramananda", "upanishads-sanskrit"]),
    "svetasvatara-upanishad": ("An Upanishad praising Rudra-Siva as the one God.", ["svetasvatara-muller", "upanishads-sanskrit"]),
    "upanishads-hume": ("Thirteen principal Upanishads in R. E. Hume's translation, including the complete Svetasvatara.", ["upanishads-hume", "upanishads-sanskrit"]),
    "kumarasambhava": ("Kalidasa's poem of Uma (Parvati): her birth, her penance and her marriage to Siva.", ["kumarasambhava-griffith"]),
    "devi-gita": ("The Goddess teaches the Himalaya king about Herself, knowledge, yoga and devotion.", ["devi-gita-vijnanananda"]),
    "devi-mahatmya": ("The Glory of the Goddess (Durga Saptashati): her battles with Mahisha and other demons, and the gods' hymns.", ["markandeya-pargiter", "markandeya-sanskrit"]),
    "lalita-sahasranama": ("The thousand names of the Divine Mother Lalita, with short meanings.", ["lalita-sastry"]),
}


def build() -> dict:
    passages = (
        import_gita(RAW)
        + import_telang(RAW)
        + import_arnold(RAW)
        + import_mahabharata(RAW)
        + import_vishnu_purana(RAW)
        + import_ramayana(RAW)
        + import_ramayana_dutt(RAW)
        + import_ramcharitmanas(RAW)
        + import_upanishads(RAW)
        + import_svetasvatara(RAW)
        + import_upanishads_hume(RAW)
        + import_kumarasambhava(RAW)
        + import_devi_gita(RAW)
        + import_devi_mahatmya(RAW)
        + import_lalita(RAW)
    )
    fixed = apply_fixes(passages)
    left = remaining_suspicious(passages)
    print(f"OCR corrections applied: {fixed}; suspicious tokens left: {len(left)} {left[:10]}")
    sa_stats = attach_upanishads(passages, RAW)
    sa_dm = attach_devi_mahatmya(passages, RAW)
    print(f"Sanskrit attached: {sa_stats['attached']} Upanishad verses ({sa_stats['sections_skipped']} sections skipped: verse counts differ), {sa_dm} Devi Mahatmya passages")
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
