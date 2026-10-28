"""The thousand names of Lalita (Lalita Sahasranama) with R. A. Sastry's short English meanings (1925 ed.).

Only the numbered names and their one-line meanings are used; Bhaskararaya's commentary that
Sastry translates between them is left out. Ten names make one passage.
"""

import re
from pathlib import Path

from ..model import Passage, Translation

ENTRY = re.compile(r"^(\d{1,4})\.\s+(.*)$")


def _fix_sanskrit(name: str) -> str:
    """Common OCR misreadings of accented letters in the transliterated names."""
    name = re.sub(r"(?<=[a-z])[AS](?=[a-z]|\b)", "a", name)  # ā read as A or S ("ChaturbShu")
    name = re.sub(r"(?<=[a-z])d\b", "a", name)  # final ā read as d ("samanvitd")
    name = re.sub(r"(?<=[a-z])(?:fl|ft|tt|O)(?=[a-z])", "u", name)  # ū read as fl/ft/tt/O ("svarflpa")
    name = re.sub(r"(?<=[a-z])J$", "", name).replace(",", "")
    name = re.sub(r"^[^A-Za-z]*[a-z](?=[A-Z])", "", name)  # stray mark before the name ("fNavachampaka")
    name = re.sub(r"(?<=[a-z])I(?=[a-z]|\b)", "i", name)  # ī read as I ("SvadhInavallabha")
    name = re.sub(r"(?<=[a-z])U(?=[a-z]|\b)", "u", name)  # ū read as U ("MahUpasana")
    name = re.sub(r"(?<=[a-z])(?:tl|ll|Q)(?=[a-z])", "u", name)  # ū read as tl/ll/Q ("sambhllta", "prabhupQra")
    name = re.sub(r"(?<=[a-z])!(?=\s|$)", "i", name)  # final ī read as ! ("vidhayin!")
    name = re.sub(r"[0-9/\\^|£»]", "", name)  # digits and stray marks
    name = re.sub(r"(?<=[a-z])[A-Z](?=[a-z])", lambda m: m.group(0).lower(), name)  # any other capital inside a word
    return name


def _clean(text: str) -> str:
    text = re.sub(r"(\w)[-¬]\s+(\w)", r"\1\2", text)
    text = text.replace("S'rl", "Sri").replace("S’rl", "Sri").replace("S'r", "Sr").replace("’ ", "' ")
    text = re.sub(r"(?<=[a-z])l(?=[\s.,)])", "i", text)  # final long i read as l ("MahSrajnl")
    text = re.sub(r"\s+([,;:.!?)])", r"\1", text)
    text = re.sub(r"\(\s+", "(", text)
    return re.sub(r"\s+", " ", text).strip()


def import_lalita(raw_dir: Path) -> list[Passage]:
    lines = (raw_dir / "lalita.txt").read_text(encoding="utf-8").splitlines()
    # Name 1 follows the heading "THE THOUSAND NAMES" without a number (OCR reads Srimata as "Stomata").
    head = next(i for i, ln in enumerate(lines) if ln.strip() == "THE THOUSAND NAMES")
    first = next(i for i in range(head + 1, len(lines)) if lines[i].strip())
    names: dict[int, str] = {1: "The holy Mother (Srimata)."}
    expected = 2
    i = first + 1
    while i < len(lines) and expected <= 1000:
        m = ENTRY.match(lines[i].strip())
        n = int(m.group(1)) if m else None
        if m and n in (expected, expected + 1, expected + 2):
            text = m.group(2).strip()
            j = i
            # An entry ends when its Sanskrit name in brackets closes (it may wrap onto the next lines).
            while ("(" not in text or text.count("(") > text.count(")")) and j < i + 3:
                if ENTRY.match(lines[j + 1].strip()):
                    break  # the next name starts: this one's bracket was misread
                j += 1
                text += " " + lines[j].strip()
            if "(" in text:
                meaning, _, rest = text.partition("(")
                sanskrit = re.split(r"[)]", rest)[0]
                sanskrit = re.split(r"\s+(?=The |It |This |Who |[A-Z][a-z]+ [a-z]+ [a-z]+ )", sanskrit)[0]  # commentary ran on
                sanskrit = " ".join(sanskrit.split()[:4]).rstrip("-")
                text = _clean(f"{meaning.strip()} ({_fix_sanskrit(sanskrit.strip(' .'))})")
            else:
                text = _clean(text)
            names[n] = text
            expected = n + 1
            i = j + 1
            continue
        i += 1
    passages: list[Passage] = []
    for order, start in enumerate(range(1, 1001, 10), start=1):
        group = [(n, names[n]) for n in range(start, start + 10) if n in names]
        if not group:
            continue
        missing = [n for n in range(start, start + 10) if n not in names]
        hundred = (start - 1) // 100
        passages.append(
            Passage(
                id=f"lalita-{start}",
                work_id="lalita-sahasranama",
                work="Lalita Sahasranama",
                section=f"Names {hundred * 100 + 1}–{hundred * 100 + 100}",
                reference=f"Lalita Sahasranama, names {start}–{start + 9}",
                order=order,
                companions=["parvati"],
                translation=Translation("English", "\n".join(f"{n}. {t}" for n, t in group), "R. Ananthakrishna Sastry", "lalita-sastry"),
                verification_status="ocr-cleaned-spot-checked",
                notes=["The thousand names of the Divine Mother from the Brahmanda Purana, with Sastry's short meanings; the Sanskrit names in brackets come from OCR and may contain errors."]
                + ([f"Names {', '.join(map(str, missing))} could not be read in the scan."] if missing else []),
            )
        )
    return passages
