"""The Devi Mahatmya (Markandeya Purana cantos 81–93) in F. E. Pargiter's translation (1904), from OCR of a scan.

Pargiter prints verse numbers in the margin, so each passage records the verses it spans.
His canto summaries (his own words) and footnotes are left out.
"""

import re
from pathlib import Path

from ..model import Passage, Translation
from .common import roman

FIRST, LAST = 81, 93
CANTO = re.compile(r"^Canto\s+([IVXLCO]+)\.\s*'?\s*$", re.I)
TITLES = {
    81: "The slaying of Madhu and Kaitabha", 82: "The slaying of Mahisha's army", 83: "The slaying of Mahishasura",
    84: "The gods praise the Goddess", 85: "The Goddess and the messenger", 86: "The slaying of Dhumralochana",
    87: "The slaying of Chanda and Munda", 88: "The slaying of Raktabija", 89: "The slaying of Nisumbha",
    90: "The slaying of Sumbha", 91: "The gods' hymn to Narayani", 92: "The Goddess's promise of protection",
    93: "The boons to Suratha and the merchant",
}
FIXES = [
    (r"C'and", "Chand"), (r"c'and", "chand"), (r"C'a", "Cha"), (r"c'a", "cha"), (r"C'", "Ch"), (r"c'", "ch"),
    (r"Sdvarni", "Savarni"), (r"Savai'ioi", "Savarni"), (r"Mahd-mdyd", "Maha-maya"), (r"Mdhdtmya", "Mahatmya"),
    (r"vai\^ya", "vaisya"), (r"\^", "s"), (r"Siirya", "Surya"), (r"Me (?=(met|ascribes))", "He "), (r"/oes\b", "foes"), (r"(?<=[a-z])H(?=\s|$)", "?"), (r"(?<=[a-z])J(?=\s|$)", ""),
]


def _clean(text: str) -> str:
    text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)
    text = re.sub(r"(?<=[a-z])\d{1,3}(?=[a-z])|(?<=[a-z])\d{1,3}\b", "", text)  # margin verse numbers glued to words
    text = re.sub(r"\|\||‖|¶|»|\{\||\[\[|\\\\", "", text)  # footnote markers ‖ ¶ and OCR debris
    text = re.sub(r"(?<=\S)\s*[*†‡§]|\s[fJ](?=\s)", "", text)  # footnote markers (OCR reads † as f, ‡ as J)
    text = re.sub(r"(?<!\S)[‘'■•\"]{0,2}\d{1,3}(?=\s)", "", text)  # margin verse numbers (Pargiter writes numbers as words)
    text = re.sub(r"\b0 (?=[A-Za-z])", "O ", text)
    text = text.replace("reverence he to thee", "reverence be to thee").replace("Intelligfence", "Intelligence")
    text = re.sub(r"(?<=[a-z])©", "e", text)  # OCR reads a final e as © ("wif©")
    for pat, rep in FIXES:
        text = re.sub(pat, rep, text)
    text = re.sub(r"\s+([,;:.!?])", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    # Sentences from Pargiter's notes that slipped past the footnote filter.
    note = re.compile(r"Bombay|\bedition\b|commentary|\bcanto [ivxlc]+, verse|\bverse \d|\bOr [a-z]+-[a-z]+,", re.I)
    return " ".join(x for x in re.split(r"(?<=[.!?])\s+", text) if not note.search(x))


def import_devi_mahatmya(raw_dir: Path) -> list[Passage]:
    lines = (raw_dir / "pargiter.txt").read_text(encoding="utf-8").splitlines()
    heads = []
    for i, ln in enumerate(lines):
        m = CANTO.match(ln.strip())
        if m:
            try:
                n = roman(m.group(1).upper().replace("O", "C").replace("Y", "V"))
            except KeyError:
                continue
            if FIRST <= n <= LAST + 1 and (not heads or n > heads[-1][1]):
                heads.append((i, n))
    heads = [h for h in heads if h[1] >= FIRST]
    passages: list[Passage] = []
    order = 0
    for k, (start, num) in enumerate(heads):
        if num > LAST:
            break
        end = heads[k + 1][0] if k + 1 < len(heads) else len(lines)
        body = lines[start + 1 : end]
        # Skip Pargiter's title and summary: the translation starts at "Om !" or the first "X spoke :".
        begin = next(i for i, ln in enumerate(body) if re.match(r"^\s*(Om\b|[A-Z][\w' -]{2,40} spoke\s*:)", ln))
        words: list[tuple[str, int | None]] = []  # (line text, verse number starting on this line)
        verse = 1
        in_note = False
        prev_blank = True
        for ln in body[begin:]:
            s = ln.strip()
            blank, prev_blank = prev_blank, not s
            if not s:
                continue
            if re.match(r"^\d{2,3}\s+CANTO", s, re.I) or re.match(r"^-?canto\s", s, re.I):
                in_note = False  # page header: a new page starts
                continue
            if re.fullmatch(r"\d{1,3}", s):
                continue
            # Page headers: "MAHISHA SLAIN.  493" or "494  CANTO LXXXIII." (pages 460–530 hold these cantos).
            hm = re.match(r"^(\d{3})\b.{0,50}$|^.{0,60}\s(\d{3})\s*$", s)
            if hm and 440 <= int(hm.group(1) or hm.group(2)) <= 560 and len(s.split()) <= 9:
                in_note = False  # a new page
                continue
            # A footnote block starts after a blank line with a note mark (OCR: † as "t"/"f", ‡ as "J")
            # and runs, unmarked, to the foot of the page.
            if blank and re.match(r"^([*†‡§¶‖»]|[tfJ]\s+[A-Z(\"']|\|\||\{\|)", s):
                in_note = True
            vm = re.match(r"^(\d{1,3})\s{1,3}\S", s)
            if in_note and vm and verse < int(vm.group(1)) <= verse + 8:
                in_note = False  # numbered verses resume: the footnotes ended at an unreadable page header
            if in_note:
                continue
            # Footnote lines start with a mark; OCR reads † as "f" and ‡ as "J", so require a space after
            # them ("f Or ..."), otherwise verse lines such as "fear," would be lost.
            if re.match(r"^([*†‡§¶‖»]|[fJ]\s|\|\||\{\|)\s?", s) or re.match(r"^\d{1,2}\s*[*†‡]", s) or re.match(r"^LXX|^XC", s):
                continue  # footnote lines
            m = re.match(r"^(\d{1,3})\s{1,3}(\S.*)$", s)
            mark = None
            if m and verse < int(m.group(1)) <= verse + 8:
                verse, s, mark = int(m.group(1)), m.group(2), int(m.group(1))
            elif m and int(m.group(1)) <= 120:
                s = m.group(2)  # a margin verse number out of sequence: drop it from the text
            words.append((s, mark))
        # Group into passages of about 130 words, breaking at sentence ends; record verse ranges.
        chunk: list[str] = []
        first_v, last_v, n = 1, 1, 0
        for i, (s, mark) in enumerate(words):
            if mark:
                last_v = mark
            chunk.append(s)
            text = " ".join(chunk)
            done = i == len(words) - 1
            if done or (len(text.split()) >= 130 and re.search(r"[.!?]['’”]?$", s)):
                cleaned = _clean(text)
                if len(cleaned.split()) < 8:
                    chunk = []
                    continue  # only editorial notes or debris
                n += 1
                order += 1
                rng = f"verse {first_v}" if first_v == last_v else f"verses {first_v}–{last_v}"
                passages.append(
                    Passage(
                        id=f"dm-{num}.{n}",
                        work_id="devi-mahatmya",
                        work="Devi Mahatmya (Markandeya Purana)",
                        section=f"Canto {num} (Devi Mahatmya ch. {num - 80}): {TITLES[num]}",
                        reference=f"Markandeya Purana {num}, {rng}",
                        order=order,
                        companions=["parvati"],
                        translation=Translation("English", cleaned, "F. Eden Pargiter", "markandeya-pargiter"),
                        verification_status="ocr-cleaned-spot-checked",
                        notes=["Pargiter prints verse numbers in the margin; the verse range is approximate."],
                    )
                )
                chunk = []
                first_v = last_v
    return passages
