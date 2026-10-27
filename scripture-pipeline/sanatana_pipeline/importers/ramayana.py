"""Valmiki Ramayana, Book V (Sundar / Sundara Kanda), translated into English verse by Ralph Griffith."""

import re
from pathlib import Path

from ..model import Passage, Translation

CANTO = re.compile(r"^Canto ([IVXLC]+)\.\s*(.*?)\.?\s*$")
FOOTNOTE_REF = re.compile(r"\(\d+\)")
MAX_LINES = 16

ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}


def roman_to_int(s: str) -> int:
    total = 0
    for i, ch in enumerate(s):
        v = ROMAN[ch]
        total += -v if i + 1 < len(s) and ROMAN[s[i + 1]] > v else v
    return total


def _book_lines(text: str, book: str, next_book: str) -> list[str]:
    lines = text.splitlines()
    start = next(i for i, ln in enumerate(lines) if re.match(rf"^BOOK {book}\.\(\d+\)", ln))
    end = next(i for i, ln in enumerate(lines[start + 1 :], start + 1) if re.match(rf"^BOOK {next_book}\.\(\d+\)", ln))
    return lines[start + 1 : end]


def _stanzas(lines: list[str]) -> list[list[str]]:
    blocks, cur = [], []
    for ln in lines:
        if not ln.strip():
            if cur:
                blocks.append(cur)
                cur = []
            continue
        cur.append(FOOTNOTE_REF.sub("", ln).strip())
    if cur:
        blocks.append(cur)
    out: list[list[str]] = []
    for b in blocks:
        for i in range(0, len(b), MAX_LINES):
            piece = b[i : i + MAX_LINES]
            # Very short fragments read badly alone; attach them to the previous passage.
            if out and len(piece) < 4 and len(out[-1]) + len(piece) <= MAX_LINES + 4:
                out[-1] = out[-1] + piece
            else:
                out.append(piece)
    return out


def import_ramayana(raw_dir: Path) -> list[Passage]:
    text = (raw_dir / "pg24869.txt").read_text(encoding="utf-8")
    lines = _book_lines(text, "V", "VI")
    cantos: list[tuple[int, str, list[str]]] = []
    for ln in lines:
        m = CANTO.match(ln.strip())
        if m:
            cantos.append((roman_to_int(m.group(1)), m.group(2).strip(), []))
        elif cantos:
            cantos[-1][2].append(ln)
    passages: list[Passage] = []
    order = 0
    for num, title, body in cantos:
        line_no = 1
        for stanza in _stanzas(body):
            order += 1
            first, last = line_no, line_no + len(stanza) - 1
            line_no = last + 1
            passages.append(
                Passage(
                    id=f"ram-5.{num}.{first}",
                    work_id="valmiki-ramayana",
                    work="Valmiki Ramayana",
                    section=f"Book V (Sundar), Canto {num}: {title}",
                    reference=f"Ramayana V.{num}, lines {first}–{last}",
                    order=order,
                    companions=["hanuman"],
                    translation=Translation("English", "\n".join(stanza), "Ralph T. H. Griffith", "ramayana-griffith"),
                    verification_status="verified-clean-source",
                    notes=["Griffith's translation is in rhyming English verse and condenses some passages of the Sanskrit."],
                )
            )
    return passages
