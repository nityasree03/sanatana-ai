"""Isa, Katha and Kena Upanishads, translated by Swami Paramananda (1919).

Each verse in this edition is a Roman numeral followed by one paragraph of translation and
then the translator's own commentary. Only the translation paragraph is used.
"""

import re
from pathlib import Path

from ..model import Passage, Translation
from .ramayana import roman_to_int

TITLES = {"isa-upanishad": "Isa Upanishad", "katha-upanishad": "Katha Upanishad", "kena-upanishad": "Kena Upanishad"}
PART = re.compile(r"^Part (First|Second|Third|Fourth|Fifth|Sixth)$", re.I)
PART_NO = {"first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5, "sixth": 6}
NUMERAL = re.compile(r"^([IVXL]+)$")


def _companions(work: str, part: int) -> list[str]:
    if work == "Kena Upanishad" and part >= 3:
        return ["parvati", "shiva"]  # the story of Uma Haimavati
    return ["shiva"]


def import_upanishads(raw_dir: Path) -> list[Passage]:
    lines = (raw_dir / "pg3283.txt").read_text(encoding="utf-8").splitlines()
    end = next(i for i, ln in enumerate(lines) if "END OF THE PROJECT GUTENBERG" in ln.upper())
    passages: list[Passage] = []
    work = None
    part = 1
    i = 0
    order = 0
    while i < end:
        s = lines[i].strip()
        if s.lower() in TITLES:
            work, part = TITLES[s.lower()], 1
        elif work and PART.match(s):
            part = PART_NO[PART.match(s).group(1).lower()]
        elif work and NUMERAL.match(s):
            num = roman_to_int(NUMERAL.match(s).group(1))
            # skip blank lines, then read one paragraph
            j = i + 1
            while j < end and not lines[j].strip():
                j += 1
            para = []
            while j < end and lines[j].strip():
                para.append(lines[j].strip())
                j += 1
            text = re.sub(r"\s+", " ", " ".join(para)).strip()
            slug = work.split()[0].lower()
            has_parts = work != "Isa Upanishad"
            if work == "Katha Upanishad":
                # Paramananda's six Parts are the six Vallis: chapter (adhyaya) 1 = Parts 1-3, 2 = Parts 4-6.
                ref_num = f"{(part - 1) // 3 + 1}.{(part - 1) % 3 + 1}.{num}"
            else:
                ref_num = f"{part}.{num}" if has_parts else f"{num}"
            order += 1
            passages.append(
                Passage(
                    id=f"{slug}-{ref_num}",
                    work_id=f"{slug}-upanishad",
                    work=work,
                    section=(
                        f"Chapter {(part - 1) // 3 + 1}, Valli {(part - 1) % 3 + 1}"
                        if work == "Katha Upanishad"
                        else (f"Part {part}" if has_parts else "Verses")
                    ),
                    reference=f"{work} {ref_num}",
                    order=order,
                    companions=_companions(work, part),
                    translation=Translation("English", text, "Swami Paramananda", "upanishads-paramananda"),
                    verification_status="verified-clean-source",
                )
            )
            i = j
            continue
        i += 1
    return passages
