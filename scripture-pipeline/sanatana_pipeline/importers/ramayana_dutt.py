"""The complete Valmiki Ramayana (all seven books) in Manmatha Nath Dutt's English prose (1891–1894)."""

import re
from pathlib import Path

from ..model import Passage, Translation
from .common import gutenberg_body, pack, renumber

BOOKS = [
    # (file, heading pattern, book number, name)
    ("pg57265.txt", r"^BALAKANDAM\.?$", 1, "Bala Kanda"),
    ("pg57265.txt", r"^AYODHYAKANDAM\.?$", 2, "Ayodhya Kanda"),
    ("pg57826.txt", r"^ARANYA KANDAM\.?$", 3, "Aranya Kanda"),
    ("pg57826.txt", r"^KISHKINDHA KANDAM\.?$", 4, "Kishkindha Kanda"),
    ("pg57826.txt", r"^SUNDARA KANDAM\.?$", 5, "Sundara Kanda"),
    ("pg60188.txt", r"^YUDDHAKANDAM\.?$", 6, "Yuddha Kanda"),
    ("pg62496.txt", r"^UTTARAK[ĀA]NDAM\.?$", 7, "Uttara Kanda"),
]
END = re.compile(r"^(THE )?END OF [A-Z]")
SECTION = re.compile(r"^SECTION ([IVXLC]+)\.?$")


def _strip_notes(lines: list[str]) -> list[str]:
    """Remove indented footnote blocks ('  [1] ...' plus their indented continuation lines)."""
    out: list[str] = []
    in_note = False
    for ln in lines:
        if re.match(r"^\s*\[\d+\]", ln):
            in_note = True
            continue
        if in_note and (ln.startswith("  ") or not ln.strip()):
            if not ln.strip():
                in_note = False
            continue
        in_note = False
        out.append(ln)
    return out


def _clean(text: str) -> str:
    text = re.sub(r"\[\d+\]", "", text)
    text = re.sub(r"_([^_]+)_", r"\1", text)
    text = text.replace("--", "—")
    return re.sub(r"\s+", " ", text).strip()


def import_ramayana_dutt(raw_dir: Path) -> list[Passage]:
    passages: list[Passage] = []
    order = 0
    cache: dict[str, list[str]] = {}
    for fname, head, book, name in BOOKS:
        if fname not in cache:
            cache[fname] = gutenberg_body((raw_dir / fname).read_text(encoding="utf-8")).splitlines()
        lines = cache[fname]
        start = next(i for i, ln in enumerate(lines) if re.match(head, ln))
        # The book ends at the next unindented book heading, an "END OF" line, or the file end.
        nxt = [i for i, ln in enumerate(lines) if i > start and any(re.match(h, ln) for f, h, _, _ in BOOKS if f == fname)]
        end = min([*nxt, *[i for i, ln in enumerate(lines) if i > start and END.match(ln.strip())], len(lines)])
        body = _strip_notes(lines[start + 1 : end])
        # Follow the printed section numbers. The 1890s print has typos (a stray "XXXI" between
        # XXV and XXVII, "LXIXII"); a number is kept only if it fits between its neighbours,
        # otherwise the section gets the next number and a note records what was printed.
        raw_sections: list[tuple[str, list[str]]] = []
        for ln in body:
            m = SECTION.match(ln.strip().rstrip(".") + ".")
            if m:
                raw_sections.append((m.group(1), []))
            elif raw_sections:
                raw_sections[-1][1].append(ln)

        sections, printed = renumber(raw_sections)
        for num, sec_lines in sections:
            paras = [_clean(p) for p in re.split(r"\n\s*\n", "\n".join(sec_lines)) if p.strip()]
            paras = [p for p in paras if len(p) > 20 and not p.isupper()]
            for n, chunk in enumerate(pack(paras, target_words=150, max_words=260), start=1):
                order += 1
                passages.append(
                    Passage(
                        id=f"ram-dutt-{book}.{num}.{n}",
                        work_id="ramayana-dutt",
                        work="Valmiki Ramayana (Dutt)",
                        section=f"Book {book} ({name}), Section {num}",
                        reference=f"Ramayana (Dutt) {book}.{num}, passage {n}",
                        order=order,
                        companions=["hanuman"],
                        translation=Translation("English", chunk, "Manmatha Nath Dutt", "ramayana-dutt"),
                        verification_status="verified-clean-source",
                        notes=[f"The printed edition numbers this section {printed[num]}."] if num in printed else [],
                    )
                )
    return passages
