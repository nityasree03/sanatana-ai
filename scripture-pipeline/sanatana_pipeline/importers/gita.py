"""Bhagavad Gita: Sanskrit (gita/gita) + English (Annie Besant, 1922), aligned verse by verse."""

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup
from indic_transliteration import sanscript

from ..model import Original, Passage, Translation, Transliteration

DEVANAGARI = re.compile(r"[ऀ-ॿ]")
# Verse markers like "(12)" or "(12-13)". The Wikisource transcription has a few typing slips
# such as "(42 " or "32)", so a missing opening or closing bracket is tolerated.
VERSE_MARK = re.compile(
    r"\((\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\)"  # (12) or (12-13)
    r"|\((\d{1,2})(?=\s)"  # (12  -- missing ")"
    r"|(?<=[\s.;!?])(\d{1,2})\)"  # 12)  -- missing "("
)
SPEAKER = re.compile(r"^((?:[A-Z][\wÀ-ɏ\-]*\s?){1,3}) said:\s*")

CHAPTER_TITLES: dict[int, str] = {}


def clean_sanskrit(text: str) -> str:
    text = re.sub(r"[।॥]+\s*\d+\.\d+\s*[।॥]+", "", text)  # verse number markers like ।।1.1।।
    text = re.sub(r"।\s*", "।\n", text)  # one half-verse per line
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    return "\n".join(lines)


def to_iast(devanagari: str) -> str:
    return sanscript.transliterate(devanagari, sanscript.DEVANAGARI, sanscript.IAST)


DEV_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
DEV_VERSE_NO = re.compile(r"॥\s*([०-९]+)\s*॥")


def besant_chapter(raw: Path, n: int) -> tuple[dict[int, str], str]:
    """Return {verse number: Besant's English} for one chapter, plus the chapter title.

    Two numbering signals are used: Besant's English markers "(12)" and the Sanskrit verse
    numbers "॥ १२ ॥" printed just before each English verse. The transcription has a few
    duplicated or mistyped English markers, so when the English number does not continue the
    sequence, the Sanskrit number is used instead.
    """
    soup = BeautifulSoup(raw.read_text(encoding="utf-8"), "lxml")
    root = soup.select_one(".mw-parser-output")
    for sel in ["style", "link", ".wst-header", "sup.reference", ".reference", ".references",
                ".reflist", ".pagenum", ".ws-pagenum", ".mw-editsection", "table"]:
        for el in root.select(sel):
            el.decompose()
    text = re.sub(r"\s+", " ", root.get_text(" ")).replace("\u200b", "")
    start = re.search(r"DISCOURSE\.", text)
    end = text.find("Thus in the glorious Upanishads")
    body = text[start.end() : end if end > 0 else None]
    colophon = text[end:] if end > 0 else ""
    title_match = re.search(r"entitled:?\s*(.+?)\.?\s*(?:Thus the|$)", colophon)
    title = title_match.group(1).strip().rstrip(".").title() if title_match else f"Chapter {n}"

    verses: dict[int, str] = {}
    prev = 0
    last_dev = 0
    pos = 0
    english_buf: list[str] = []
    tokens = sorted(
        [(m.start(), m.end(), "dev", m) for m in DEV_VERSE_NO.finditer(body)]
        + [(m.start(), m.end(), "eng", m) for m in VERSE_MARK.finditer(body)],
        key=lambda t: t[0],
    )
    for s_, e_, kind, m in tokens:
        segment = body[pos:s_]
        english_buf.append(" ".join(w for w in segment.split(" ") if not DEVANAGARI.search(w)))
        pos = e_
        if kind == "dev":
            # English with no "(n)" marker of its own (a transcription slip) still belongs to the
            # verse whose Sanskrit came just before it.
            pending = re.sub(r"\s+", " ", " ".join(english_buf)).strip()
            if len(pending) > 20 and last_dev == prev + 1 and not verses.get(prev + 1):
                verses[prev + 1] = re.sub(r"\s+([,.;:!?])", r"\1", pending)
                prev += 1
            last_dev = int(m.group(1).translate(DEV_DIGITS))
            english_buf = []  # text before a Sanskrit verse number is Sanskrit or headings
            continue
        chunk = re.sub(r"\s+", " ", " ".join(english_buf)).strip()
        chunk = re.sub(r"\s+([,.;:!?])", r"\1", chunk)
        english_buf = []
        first = int(m.group(1) or m.group(3) or m.group(4))
        last = int(m.group(2) or first)
        if first != prev + 1 and last_dev == prev + 1:
            first = last = last_dev  # English marker mistyped; trust the Sanskrit number
        if chunk:
            verses[first] = chunk
            for v in range(first + 1, last + 1):
                verses.setdefault(v, "")
        prev = last
    return verses, title


def import_gita(raw_dir: Path) -> list[Passage]:
    sanskrit = json.loads((raw_dir / "gita_verse.json").read_text(encoding="utf-8"))
    by_ref = {(v["chapter_number"], v["verse_number"]): clean_sanskrit(v["text"]) for v in sanskrit}
    passages: list[Passage] = []
    order = 0
    for ch in range(1, 19):
        english, title = besant_chapter(raw_dir / f"besant_{ch:02d}.html", ch)
        CHAPTER_TITLES[ch] = title
        count = max(v for (c, v) in by_ref if c == ch)
        for v in range(1, count + 1):
            order += 1
            text = english.get(v, "").strip()
            speaker = None
            m = SPEAKER.match(text)
            if m:
                speaker = m.group(1).strip()
            notes = []
            if not text:
                notes.append("English translation for this verse is combined with a neighbouring verse in the Besant edition.")
            dev = by_ref[(ch, v)]
            passages.append(
                Passage(
                    id=f"bg-{ch}.{v}",
                    work_id="bhagavad-gita",
                    work="Bhagavad Gita",
                    section=f"Chapter {ch}: {title}",
                    reference=f"Bhagavad Gita {ch}.{v}",
                    order=order,
                    companions=["krishna"],
                    speaker=speaker,
                    original=Original("Sanskrit", "Devanagari", dev, "gita-sanskrit"),
                    transliteration=Transliteration(
                        "IAST", to_iast(dev), "Generated from the Devanagari with indic-transliteration (MIT)"
                    ),
                    translation=Translation("English", text, "Annie Besant", "gita-besant"),
                    verification_status="verified-clean-source",
                    notes=notes,
                )
            )
    return passages
