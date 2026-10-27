"""Svetasvatara Upanishad, translated by F. Max Müller (SBE vol. 15, 1884), from OCR of the scan.

The OCR text interleaves the translation with Müller's footnotes and page headers. A small
state machine keeps only the translation:
- a paragraph starting "N." (verse number) begins a verse,
- a paragraph starting "N word" (footnote number) begins footnotes, which run to the page end,
- a page header ("232 SVETASVATARA-UPANISHAD.") ends the footnotes; unnumbered text after it
  continues the current verse.
Suspicious OCR fragments are recorded in each passage's notes for human review.
"""

import re
from pathlib import Path

from ..model import Passage, Translation

ADHYAYA = re.compile(r"^(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH) ADHYAYA\.?(?:\s*\d{1,2}\s*\.)?\s*$")
ADHYAYA_NO = {"FIRST": 1, "SECOND": 2, "THIRD": 3, "FOURTH": 4, "FIFTH": 5, "SIXTH": 6}
VERSE_START = re.compile(r"^([0-9il]{1,2})\s*(?:\d{1,2}\s*)?\.\s+(.*)$", re.S)
FOOTNOTE_START = re.compile(r"^\d{1,2}\s+\S")
PAGE_HEADER = re.compile(r"(UPANISHAD|ADHYAYA)", re.I)
SUSPICIOUS = re.compile(r"[\^/\\|~{}<>]|[a-z][A-Z]{1,3}[a-z]|\b[A-Za-z]*\d[A-Za-z]+\b")
EXPECTED_VERSES = {1: 16, 2: 17, 3: 21, 4: 22, 5: 14, 6: 23}

# OCR damage in Müller's transliterated Sanskrit terms, corrected by hand after reading the
# scan text. Diacritics are not restored; terms are given in plain romanization.
CORRECTIONS: list[tuple[str, str]] = [
    ("vif-oMnatma", "vijnanatma"),
    ("(gu^a)", "(guna)"),
    ("(/iva)", "(jiva)"),
    ("(Lvara)", "(isvara)"),
    ("(La)", "(isa)"),
    ("Pradhana:)", "Pradhana"),
    ("under-wood®", "under-wood"),
    ("prazzava", "pranava"),
    ("Savitrz", "Savitri"),
    ("Savitrf", "Savitri"),
    ("Hira^yagarbha", "Hiranyagarbha"),
    ("Hira/zyagarbha", "Hiranyagarbha"),
    ("(Vira^)", "(Viraj)"),
    ("6iva", "Siva"),
    ("unborn/with", "unborn, with"),
    ("wise.SVeta^va-tara", "wise Svetasvatara"),
    ("company of?fshis", "company of Rishis"),
    ("(.Viva)", "(Siva)"),
    ("(6\"iva)", "(Siva)"),
    ("Guwas", "Gunas"),
    ("i?zg-veda", "Rig-veda"),
    ("Y oga", "Yoga"),
]


def _is_page_header(p: str) -> bool:
    s = p.strip()
    if "\n" in s:
        return False
    if re.fullmatch(r"\d{1,3}", s):  # a page number on its own line
        return True
    return bool(PAGE_HEADER.search(s)) and len(s) < 60


def _clean(text: str) -> tuple[str, bool]:
    """Return cleaned text and whether a hand correction was applied."""
    text = text.replace("¬\n", "").replace("¬ ", "").replace("-\n", "-")
    text = re.sub(r"\s+", " ", text)
    while True:  # footnote numbers, sometimes two in a row ("everything 5 6 ,")
        cleaned = re.sub(r"(?<=[A-Za-z,;:.)?!'’\"])\s+\d{1,3}l?(?=\s*[,.;:?!)]|\s|$)", "", text)
        if cleaned == text:
            break
        text = cleaned
    text = re.sub(r"\s+[*lx®](?=[.,;:]?(\s|$))", "", text)  # stray footnote symbols
    text = re.sub(r"\s+\)\s*$", "", text)
    text = re.sub(r"\s+([,.;:?!])", r"\1", text)
    corrected = False
    for wrong, right in CORRECTIONS:
        if wrong in text:
            text, corrected = text.replace(wrong, right), True
    text = re.sub(r"\s+([,.;:?!])", r"\1", text)
    return text.strip(), corrected


def import_svetasvatara(raw_dir: Path) -> list[Passage]:
    lines = (raw_dir / "sbe15.txt").read_text(encoding="utf-8").splitlines()
    # The translation (not the introduction) starts at the second "FIRST ADHYAYA." heading
    # that comes after the Svetasvatara title page; it ends at the Prasna Upanishad.
    end = next(i for i, ln in enumerate(lines) if re.fullmatch(r"First Question\.?", ln.strip()))
    start = max(i for i in range(end) if re.match(r"^FIRST ADHYAYA", lines[i].strip()))
    # Split into paragraphs at blank lines, and also wherever a line starts with "N." —
    # in the scan text a new verse often begins without a blank line before it.
    paragraphs, cur = [], []
    for ln in lines[start:end]:
        starts_verse = bool(VERSE_START.match(ln.strip())) and cur
        if not ln.strip() or starts_verse:
            if cur:
                paragraphs.append("\n".join(cur))
                cur = []
            if not ln.strip():
                continue
        cur.append(ln.rstrip())
    if cur:
        paragraphs.append("\n".join(cur))

    verses: dict[tuple[int, int], str] = {}
    chapter, current, in_footnotes, expected, crossed_page = 0, None, False, 1, False
    for p in paragraphs:
        s = p.strip()
        m_ad = ADHYAYA.match(s)
        if m_ad:
            chapter, current, in_footnotes, expected = ADHYAYA_NO[m_ad.group(1)], None, False, 1
            continue
        m_v = VERSE_START.match(s)
        if m_v:
            num = int(m_v.group(1).replace("i", "1").replace("l", "1"))
            # Only the next verse in sequence (or one after, if a verse was lost) counts as a
            # verse. Numbered lists inside Müller's footnotes therefore can't be mistaken for verses.
            if num in (expected, expected + 1) and len(m_v.group(2)) > 15:
                current = (chapter, num)
                verses[current] = m_v.group(2)
                expected, in_footnotes, crossed_page = num + 1, False, False
                continue
        if _is_page_header(s):
            in_footnotes, crossed_page = False, True
            continue
        if FOOTNOTE_START.match(s) or (m_v and current):
            in_footnotes = True
            continue
        # A paragraph without a number continues the current verse only when the verse ran over
        # a page break: we have just passed a page header and the verse's sentence is unfinished.
        # (Unnumbered text before the page break is a footnote carried over from the previous page.)
        unfinished = not re.search(r"[.!?]['\")\]]?\s*\d*\s*$", verses[current].strip()) if current else False
        if not in_footnotes and current and crossed_page and unfinished:
            verses[current] += "\n" + s
            crossed_page = False

    passages: list[Passage] = []
    for order, ((ch, v), raw_text) in enumerate(sorted(verses.items()), start=1):
        text, corrected = _clean(raw_text)
        notes = ["Text cleaned from OCR of the 1884 printed edition; awaiting full human proofreading."]
        if corrected:
            notes.append("OCR-damaged Sanskrit terms were corrected by hand (see CORRECTIONS in the importer).")
        if (ch, v + 1) not in verses and v < EXPECTED_VERSES.get(ch, 0):
            notes.append(
                f"Verse {ch}.{v + 1} has no readable number in the scan, so its text is probably included here."
            )
        odd = sorted(set(SUSPICIOUS.findall(text)))
        if odd:
            notes.append("Possible OCR errors to review: " + ", ".join(odd[:8]))
        passages.append(
            Passage(
                id=f"svet-{ch}.{v}",
                work_id="svetasvatara-upanishad",
                work="Svetasvatara Upanishad",
                section=f"Chapter {ch}",
                reference=f"Svetasvatara Upanishad {ch}.{v}",
                order=order,
                companions=["shiva"],
                translation=Translation("English", text, "F. Max Müller", "svetasvatara-muller"),
                verification_status="ocr-cleaned-spot-checked",
                notes=notes,
            )
        )
    return passages
