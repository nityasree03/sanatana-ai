"""Kalidasa's Kumarasambhava ('Birth of the War-God'), cantos 1–7, in Ralph Griffith's English verse (1879).

The story of Uma (Parvati): her birth on Himalaya, her penance, and her marriage to Siva.
"""

import re
from pathlib import Path

from ..model import Passage, Translation
from .common import gutenberg_body, verse_chunks

ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh"]


def _clean_line(line: str) -> str:
    line = line.replace("['S]", "S").replace("['s]", "s").replace("[N.]", "N")
    line = re.sub(r"_([^_]+)_", r"\1", line)
    # Griffith prints names in capitals (HIMÁLAYA, KÁMA); show them in normal case.
    line = re.sub(r"\b[A-ZÁÍÚÉÓ]{2,}(?:'S)?\b", lambda m: m.group(0).capitalize().replace("'s", "'s"), line)
    return line.strip()


def import_kumarasambhava(raw_dir: Path) -> list[Passage]:
    body = gutenberg_body((raw_dir / "pg31968.txt").read_text(encoding="utf-8")).splitlines()
    starts = {i: ORDINALS.index(m.group(1)) + 1 for i, ln in enumerate(body) if (m := re.match(r"^Canto (\w+)\.$", ln))}
    notes_at = next(i for i, ln in enumerate(body) if ln.strip() == "NOTES.")
    idx = sorted(starts)
    passages: list[Passage] = []
    order = 0
    for k, start in enumerate(idx):
        num = starts[start]
        end = idx[k + 1] if k + 1 < len(idx) else notes_at
        lines = body[start + 1 : end]
        title_line = next(ln for ln in lines if ln.strip())
        title = re.sub(r"\b(Of|To|The|And)\b(?!$)", lambda m: m.group(1).lower(), _clean_line(title_line).strip(".").title().replace("'S", "'s"))
        title = title[0].upper() + title[1:]
        lines = lines[lines.index(title_line) + 1 :]
        # A new paragraph starts at a blank line or at an extra-indented line.
        stanzas: list[list[str]] = []
        cur: list[str] = []
        for ln in lines:
            if not ln.strip() or (ln.startswith("    ") and cur):
                if cur:
                    stanzas.append(cur)
                    cur = []
                if not ln.strip():
                    continue
            cur.append(_clean_line(ln))
        if cur:
            stanzas.append(cur)
        line_no = 1
        for chunk in verse_chunks(stanzas, max_lines=14):
            order += 1
            first, last = line_no, line_no + len(chunk) - 1
            line_no = last + 1
            passages.append(
                Passage(
                    id=f"kumara-{num}.{first}",
                    work_id="kumarasambhava",
                    work="Kumarasambhava (Birth of the War-God)",
                    section=f"Canto {num}: {title}",
                    reference=f"Kumarasambhava {num}, lines {first}–{last}",
                    order=order,
                    companions=["parvati", "shiva"],
                    translation=Translation("English", "\n".join(chunk), "Ralph T. H. Griffith", "kumarasambhava-griffith"),
                    verification_status="verified-clean-source",
                    notes=["Kalidasa's classical poem (c. 5th century), not a scripture; Griffith renders it in rhymed English couplets."],
                )
            )
    return passages
