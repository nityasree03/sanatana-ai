"""Devi Gita: Srimad Devi Bhagavatam Book VII, chapters 31-40, translated by Swami Vijnanananda.

Text comes from a transcription of the 1921-23 translation; each passage is then compared with
OCR of the original printed scan and its similarity score is stored. Known transcription
artefacts (e.g. "T" for "ī") are normalised with the documented rules below.
"""

import re
from pathlib import Path

from rapidfuzz import fuzz

from ..model import Passage, Translation

CHAPTER = re.compile(r"^Chapter (\d+)\.\s*(.*)$")
RANGE = re.compile(r"^(\d+)(?:\s*-\s*(\d+))?\.\s+(.*)$", re.S)

# Documented normalisation of transcription artefacts.
FIXES: list[tuple[str, str]] = [
    (r"(?<=[A-Za-z'’])T(?=[a-z])", "i"),  # JTvas -> Jivas, ParvatTs -> Parvatis
    (r"(?<=[a-z])T\b", "i"),  # DevT -> Devi, S'aktT -> S'akti
    (r"\bDev!", "Devi"),  # heading artefact "The Dev!"
    (r"\b1 (?=[a-z])", "I "),  # "1 become" -> "I become"
    (r"/\. a,", "i.e.,"),
    (r"\bJhana", "Jnana"),
    (r"\bJhanl", "Jnani"),
    (r"elennent", "element"),
    (r"(?<=[A-Za-z]s)V(?=[a-z])", "v"),  # the transcription's mark for ś: IsVara -> Isvara
]


def _normalise(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    for pat, rep in FIXES:
        text = re.sub(pat, rep, text)
    return text


def _norm_for_compare(text: str) -> str:
    return re.sub(r"[^a-z ]", "", re.sub(r"\s+", " ", text.lower()))


def import_devi_gita(raw_dir: Path) -> list[Passage]:
    lines = (raw_dir / "devi_clean.txt").read_text(encoding="utf-8").splitlines()
    scan = _norm_for_compare((raw_dir / "devi_scan.txt").read_text(encoding="utf-8"))
    start = next(i for i, ln in enumerate(lines) if i > 30000 and re.match(r"^Chapter 31\. On The Birth Of PARVAT", ln))
    end = next(i for i in range(start, len(lines)) if lines[i].strip() == "THE EIGHTH BOOK")

    # Paragraphs; a page break can split a sentence, so join paragraphs that end mid-sentence.
    paras: list[str] = []
    cur: list[str] = []
    for ln in lines[start:end] + [""]:
        if ln.strip():
            cur.append(ln.strip())
            continue
        if cur:
            block = " ".join(cur)
            if paras and not re.search(r"[.!?\"”’)]$", paras[-1]) and not CHAPTER.match(block) and not RANGE.match(block):
                paras[-1] += " " + block
            else:
                paras.append(block)
            cur = []

    passages: list[Passage] = []
    chapter, title, rng, part, order = 0, "", "", 0, 0
    for p in paras:
        m_c = CHAPTER.match(p)
        if m_c:
            chapter, title, rng, part = int(m_c.group(1)), m_c.group(2).strip(), "", 0
            continue
        if not chapter or p.lower().startswith("here ends"):
            continue
        m_r = RANGE.match(p)
        if m_r:
            a, b = m_r.group(1), m_r.group(2)
            rng, part, p = (f"{a}–{b}" if b else a), 0, m_r.group(3)
        text = _normalise(p)
        if len(text) < 40:
            continue
        part += 1
        order += 1
        # Similarity with the original printed scan (OCR), as a check on the transcription.
        probe = _norm_for_compare(text)[:300]
        score = fuzz.partial_ratio(probe, scan, score_cutoff=0) if probe else 0
        notes = [f"Similarity with the original 1921-23 scan (OCR): {score:.0f}%."]
        status = "checked-against-scan" if score >= 85 else "ocr-cleaned-spot-checked"
        title_clean = _normalise(title)
        ref_range = f", verses {rng}" if rng else ""
        passages.append(
            Passage(
                id=f"devi-7.{chapter}.{rng.replace('–', '-') or '0'}.{part}",
                work_id="devi-gita",
                work="Devi Gita (Srimad Devi Bhagavatam)",
                section=f"Book VII, Chapter {chapter}: {title_clean}",
                reference=f"Devi Bhagavatam 7.{chapter}{ref_range} (paragraph {part})",
                order=order,
                companions=["parvati"],
                translation=Translation("English", text, "Swami Vijnanananda", "devi-gita-vijnanananda"),
                verification_status=status,
                notes=notes,
            )
        )
    return passages
