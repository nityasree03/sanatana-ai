"""Selected parts of the Mahabharata in K. M. Ganguli's English prose (1883–1896):

- Udyoga Parva, Bhagavat-yana (sections 72–150): Krishna's peace mission to the Kauravas.
- Bhishma Parva, Bhagavad Gita (sections 25–42): Ganguli's Gita, a third full translation.
- Anushasana Parva, section 17: Upamanyu's thousand names of Mahadeva (Shiva).
"""

import re
from pathlib import Path

from ..model import Passage, Translation
from .common import gutenberg_body, pack, roman

SECTION = re.compile(r"^SECTION ([IVXLC]+)$")


def _lines(raw_dir: Path, name: str) -> list[str]:
    return gutenberg_body((raw_dir / name).read_text(encoding="utf-8").replace("\r", "")).splitlines()


def _sections(lines: list[str], parva: str, first: int, last: int) -> list[tuple[int, list[str]]]:
    starts = [i for i, ln in enumerate(lines) if ln.strip() == parva]
    begin = starts[-1]
    out: list[tuple[int, list[str]]] = []
    current: list[str] | None = None
    for ln in lines[begin:]:
        m = SECTION.match(ln.strip())
        if m:
            n = roman(m.group(1))
            if n > last or (out and n < out[-1][0]):
                break
            current = [] if n >= first else None
            if current is not None:
                out.append((n, current))
            continue
        if re.match(r"^The [Ee]nd of ", ln.strip()):
            break
        if current is not None:
            current.append(ln)
    return out


def _clean(text: str) -> str:
    text = re.sub(r"\[\([^)]*\)\]", "", text)  # "[(Bhagavad Gita Chapter I)]" headings added by the e-text editor
    text = re.sub(r"\(\[.*?Hare\]\)", "", text, flags=re.S)  # editor's notes
    text = re.sub(r"^\((?:[A-Za-z-]+ ?)+Parva\)$", "", text)
    text = re.sub(r"\[\d+\]", "", text)
    text = re.sub(r"\[Here ends [^\]]*\]", "", text)  # chapter-end lines added by the e-text editor  # footnote markers (the notes themselves are at the end of each book)
    text = text.replace("--", "—")
    return re.sub(r"\s+", " ", text).strip()


def _passages(sections, *, prefix, work_id, work, label, companions, start_order) -> list[Passage]:
    out: list[Passage] = []
    order = start_order
    for num, body in sections:
        paras = [_clean(p) for p in re.split(r"\n\s*\n", "\n".join(body)) if p.strip()]
        paras = [p for p in paras if len(p) > 15]
        for n, chunk in enumerate(pack(paras, target_words=150, max_words=260), start=1):
            order += 1
            section_name, ref = label(num)
            out.append(
                Passage(
                    id=f"{prefix}-{num}.{n}",
                    work_id=work_id,
                    work=work,
                    section=section_name,
                    reference=f"{ref}, passage {n}",
                    order=order,
                    companions=companions,
                    translation=Translation("English", chunk, "Kisari Mohan Ganguli", "mahabharata-ganguli"),
                    verification_status="verified-clean-source",
                )
            )
    return out


def import_mahabharata(raw_dir: Path) -> list[Passage]:
    vol2 = _lines(raw_dir, "pg15475.txt")
    vol4 = _lines(raw_dir, "pg15477.txt")
    peace = _sections(vol2, "UDYOGA PARVA", 72, 150)
    gita = _sections(vol2, "BHISHMA PARVA", 25, 42)
    shiva = _sections(vol4, "ANUSASANA PARVA", 17, 17)
    if len(peace) < 75 or len(gita) != 18 or len(shiva) != 1:
        raise ValueError(f"Mahabharata sections: peace {len(peace)}, gita {len(gita)}, shiva {len(shiva)}")
    out = _passages(
        peace, prefix="mbh-5", work_id="mahabharata", work="Mahabharata (Ganguli)",
        label=lambda n: (f"Udyoga Parva {n} (Bhagavat-yana: Krishna's peace mission)", f"Mahabharata 5.{n}"),
        companions=["krishna"], start_order=0,
    )
    out += _passages(
        gita, prefix="mbh-6", work_id="mahabharata", work="Mahabharata (Ganguli)",
        label=lambda n: (f"Bhishma Parva {n}: Bhagavad Gita, chapter {n - 24}", f"Mahabharata 6.{n} (Gita ch. {n - 24})"),
        companions=["krishna"], start_order=len(out),
    )
    out += _passages(
        shiva, prefix="mbh-13", work_id="mahabharata", work="Mahabharata (Ganguli)",
        label=lambda n: (f"Anushasana Parva {n}: The thousand names of Shiva", f"Mahabharata 13.{n}"),
        companions=["shiva"], start_order=len(out),
    )
    return out
