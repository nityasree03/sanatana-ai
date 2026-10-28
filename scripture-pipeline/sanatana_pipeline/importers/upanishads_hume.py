"""R. E. Hume's 'Thirteen Principal Upanishads' (Oxford, 1921), from OCR of a scan.

Every verse is compared with OCR of a second, independent scan of the same edition: when the
two readings agree, the passage is marked as checked against a scan.
"""

import re
from pathlib import Path

from ..model import Passage, Translation

UPANISHADS = [
    ("BRIHAD", "Brihad-Aranyaka", "brihadaranyaka"),
    ("CHANDOGYA", "Chandogya", "chandogya"),
    ("TAITTIRIYA", "Taittiriya", "taittiriya"),
    ("AITAREYA", "Aitareya", "aitareya"),
    ("KAUSHITAKI", "Kaushitaki", "kaushitaki"),
    ("KENA", "Kena", "kena"),
    ("KATHA", "Katha", "katha"),
    ("ISA", "Isa", "isa"),
    ("MUNDAKA", "Mundaka", "mundaka"),
    ("PRASNA", "Prasna", "prasna"),
    ("MANDUKYA", "Mandukya", "mandukya"),
    ("SVETASVATARA", "Svetasvatara", "svetasvatara"),
    ("MAITRI", "Maitri", "maitri"),
]
ORDINALS = (
    "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth "
    "fifteenth sixteenth seventeenth eighteenth nineteenth twentieth"
).split()
LEVEL1 = {"adhyaya": "Adhyaya", "prapathaka": "Prapathaka", "valli": "Valli", "prasna": "Question", "mundaka": "Mundaka", "question": "Question"}
LEVEL2 = {"brahmana": "Brahmana", "khanda": "Khanda", "anuvaka": "Anuvaka", "section": "Section", "valli": "Valli"}
# Verse numbers as OCR reads them: "1.", "i .", "io." (10), "j i ." (11), "1 2." (12).
# Kena is numbered continuously with the local number in brackets: "9 (1)." = part 2, verse 1.
VERSE = re.compile(r"^((?:\d|[iIlj])(?: ?(?:\d|[iIlo]))?)(?:\s*\((\d{1,2})\))?\s?\.\s+(.*)$")
TITLE_KEY = {"ISA": r"[Il1][S£$]A"}


def _verse_no(token: str) -> int | None:
    digits = token.replace(" ", "").translate(str.maketrans("iIljoO", "111100"))
    return int(digits) if digits.isdigit() else None


def _ordinal(word: str) -> int | None:
    w = word.lower().replace("—", "-")
    if w.startswith("twenty-"):
        rest = _ordinal(w[7:])
        return 20 + rest if rest else None
    return ORDINALS.index(w) + 1 if w in ORDINALS else None


def _division(s: str) -> tuple[int, str, int] | None:
    """Recognise headings like 'FIRST ADHYAYA', 'first adhyAya', 'Third Khanda' (OCR: 'Ruanda')."""
    s = re.sub(r"KHAN\s+DA", "KHANDA", s)
    m = re.match(r"^\(?([A-Za-z]+(?:-[a-z]+)?)\s+([A-Za-z]+)\)?\d?\s*$", s)
    if not m:
        return None
    n = _ordinal(m.group(1))
    if n is None:
        return None
    word = m.group(2).lower()
    if word in LEVEL1 and (m.group(2).isupper() or m.group(2)[1:].islower() is False or word != "valli"):
        level = 1 if (m.group(2).isupper() or m.group(1).islower()) else 2
        if word in ("prasna", "mundaka", "adhyaya", "prapathaka", "question"):
            level = 1
        return (level, LEVEL1.get(word) or LEVEL2.get(word, word.title()), n)
    if word in LEVEL2:
        return (2, LEVEL2[word], n)
    if re.fullmatch(r"[a-z]+anda|khakda|kiianda", word):  # OCR variants of 'Khanda'
        return (2, "Khanda", n)
    return None


def _is_page_furniture(s: str) -> bool:
    if re.fullmatch(r"\d{1,3}", s):
        return True
    if "-]" in s or "[-" in s:
        return True
    return bool(re.search(r"upa.{0,2}ishad", s, re.I)) and len(s) < 60 and not re.search(r"[a-z]{3,}\s+[a-z]{3,}\s+[a-z]{3,}", s)


def _clean(text: str) -> str:
    text = re.sub(r"\s+[A-Z]{3,}[- ]+(?:[A-Z]+ +)?UPA.{0,2}ISHAD\b.*$", "", text)  # a running header glued to the end
    text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)
    text = re.sub(r"(?<=[A-Za-z,.;:!?\]’'”)])\d{1,2}\b", "", text)  # footnote markers
    text = re.sub(r"\{(?=[A-Za-z])", "(", text)  # italic opening bracket read as a brace ("{prana)")
    text = re.sub(r"(?<=[A-Za-z])\}", ")", text)
    text = re.sub(r"\(<\s*", "(", text)
    text = re.sub(r"\b(Rig|Yajur|Sama|Atharva)(Veda)", r"\1-\2", text)
    text = re.sub(r"(?<=[a-z])I(?=[,.;:’'!?\s])", "i", text)  # long i read as capital I ("GargI")
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)
    text = re.sub(r"\s+([,;:.!?])", r"\1", text)
    return re.sub(r"[ \t]+", " ", text).strip()


def _fingerprint(text: str) -> set[str]:
    words = re.sub(r"[^a-z ]", " ", text.lower()).split()
    return {" ".join(words[i : i + 4]) for i in range(len(words) - 3)}


def import_upanishads_hume(raw_dir: Path) -> list[Passage]:
    lines = (raw_dir / "hume_a.txt").read_text(encoding="utf-8").splitlines()
    second = _fingerprint((raw_dir / "hume_b.txt").read_text(encoding="utf-8"))
    starts = []
    after = 4400  # the translation begins after Hume's long introduction
    for key, name, slug in UPANISHADS:
        pat = TITLE_KEY.get(key, key)
        i = next(i for i, ln in enumerate(lines) if i > after and re.match(rf"^\s*{pat}[\w-]*\s+UPANISHAD", ln, re.I))
        starts.append((i, name, slug))
        after = i
    end_all = next(i for i, ln in enumerate(lines) if i > starts[-1][0] and ln.strip() == "A BIBLIOGRAPHY")

    passages: list[Passage] = []
    order = 0
    for k, (start, name, slug) in enumerate(starts):
        end = starts[k + 1][0] if k + 1 < len(starts) else end_all
        region = [ln.strip() for ln in lines[start:end]]
        l1: tuple[str, int] | None = None
        l2: tuple[str, int] | None = None
        verses: list[dict] = []
        cur: dict | None = None
        heading: str | None = None
        in_note = False
        after_division = False
        for idx, s in enumerate(region):
            if not s:
                continue
            if _is_page_furniture(s):
                in_note = False
                continue
            vm_try = VERSE.match(s)
            expected = (cur["n"] + 1) if (cur and cur["n"]) else 1
            vno = (int(vm_try.group(2)) if vm_try.group(2) else _verse_no(vm_try.group(1))) if vm_try else None
            plausible = bool(vm_try) and vno in (expected, expected + 1, 1)
            if in_note:
                if _division(s) or plausible:
                    in_note = False  # a page without a printed page number: notes end at the next verse
                else:
                    continue
            if re.match(r"^(\d{1,2}|[-*•'])\s+\S", s) and not plausible:
                in_note = True  # footnotes at the bottom of the page, until the next page
                continue
            div = _division(s)
            if div:
                level, label, n = div
                if level == 1:
                    l1, l2 = (label, n), None
                else:
                    l2 = (label, n)
                cur = None
                after_division = True
                continue
            if re.fullmatch(r"\[[^\]]{1,30}\]", s) or (after_division and re.fullmatch(r"\(.*\)", s)):
                continue  # Hume's labels such as "[Question :]" or a division's subtitle
            vm = vm_try if plausible else None
            if vm:
                after_division = False
                if vno == 2 and cur is not None and cur["n"] is None and cur["l1"] == l1 and cur["l2"] == l2:
                    cur["n"] = 1  # the unnumbered text just before verse 2 is verse 1 (its number was unreadable)
                    cur.setdefault("unclear", True)
                cur = {"n": vno, "l1": l1, "l2": l2, "lines": [vm.group(3)], "heading": heading}
                heading = None
                verses.append(cur)
                continue
            # A short title-like line followed by a verse number is one of Hume's topic headings.
            nxt = next((x for x in region[idx + 1 :] if x and not _is_page_furniture(x)), "")
            if len(s) < 80 and not re.search(r"[.,;:!?—\-’'”)]$", s) and s[:1].isupper() and (bool(VERSE.match(nxt)) or (after_division and cur is None)):
                heading = re.sub(r"\s*\d+$", "", s)
                continue
            if cur is None and (l1 or l2):
                # A division without verse numbers (e.g. many Taittiriya anuvakas): one passage for it.
                cur = {"n": None, "l1": l1, "l2": l2, "lines": [], "heading": heading}
                heading = None
                verses.append(cur)
            after_division = False
            if cur is not None:
                cur["lines"].append(s)
        seen: set[str] = set()
        for v in verses:
            parts = [str(p[1]) for p in (v["l1"], v["l2"]) if p] + ([str(v["n"])] if v["n"] is not None else [])
            ref = ".".join(parts)
            pid = f"hume-{slug}-{ref}"
            if pid in seen:
                continue  # an OCR misreading repeated a verse number; keep the first
            seen.add(pid)
            text = _clean(" ".join(v["lines"]))
            if len(text) < 15 or (v["n"] is None and len(text.split()) < 12):
                continue  # a heading on its own, not text
            fp = _fingerprint(text)
            agree = len(fp & second) / len(fp) if fp else 0
            div_name = ", ".join(f"{p[0]} {p[1]}" for p in (v["l1"], v["l2"]) if p)
            order += 1
            notes = []
            if v["heading"]:
                notes.append(f"Hume's heading: {v['heading']}.")
            if v.get("unclear"):
                notes.append("The verse number is not legible in the scan; it is inferred from the verses around it.")
            notes.append(
                "Compared with OCR of a second scan of the same edition: the readings agree."
                if agree >= 0.8
                else "Cleaned from OCR; a second scan could not confirm every word."
            )
            companions = ["parvati", "shiva"] if slug == "kena" and v["l1"] and v["l1"][1] >= 3 else ["shiva"]
            passages.append(
                Passage(
                    id=pid,
                    work_id="upanishads-hume",
                    work="The Thirteen Principal Upanishads (Hume)",
                    section=f"{name} Upanishad" + (f", {div_name}" if div_name else ""),
                    reference=f"{name} Upanishad {ref} (Hume)",
                    order=order,
                    companions=companions,
                    translation=Translation("English", text, "Robert Ernest Hume", "upanishads-hume"),
                    verification_status="checked-against-scan" if agree >= 0.8 else "ocr-cleaned-spot-checked",
                    notes=notes,
                )
            )
    return passages
