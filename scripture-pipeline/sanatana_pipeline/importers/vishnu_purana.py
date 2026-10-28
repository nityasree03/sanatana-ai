"""The Vishnu Purana in M. N. Dutt's English prose (1896, after H. H. Wilson). Part V tells Krishna's life."""

import re
from pathlib import Path

from ..model import Passage, Translation
from .common import gutenberg_body, pack, renumber, roman

PART = re.compile(r"^PART ([IVX]+)[.:]$")
SECTION = re.compile(r"^SECTION ([IVXLC]+)\.?$")
TOC_ENTRY = re.compile(r"^Section ([IVXLC]+)\.\s*[—-]\s*(.*)$")


def _clean(text: str) -> str:
    text = re.sub(r"\[\d+\]", "", text)
    text = re.sub(r"_([^_]+)_", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def import_vishnu_purana(raw_dir: Path) -> list[Passage]:
    lines = gutenberg_body((raw_dir / "pg66208.txt").read_text(encoding="utf-8")).splitlines()
    parts = [(i, roman(m.group(1))) for i, ln in enumerate(lines) if (m := PART.match(ln.strip()))]
    # The contents list repeats PART I–VI before the text; the text is the second run.
    toc_parts, text_parts = parts[:6], parts[6:12]
    notes_at = next(i for i, ln in enumerate(lines) if i > text_parts[-1][0] and re.match(r"^\[1\] ", ln))

    # Section titles from the contents list: first clause of each summary.
    titles: dict[tuple[int, int], str] = {}
    for k, (start, part) in enumerate(toc_parts):
        end = toc_parts[k + 1][0] if k + 1 < len(toc_parts) else text_parts[0][0]
        block = " ".join(ln.strip() for ln in lines[start + 1 : end])
        for m in re.finditer(r"Section ([IVXLC]+)\.\s*[—-]\s*(.*?)(?=Section [IVXLC]+\.|$)", block):
            first = re.split(r"(?<=[.;])\s", m.group(2).strip())[0].rstrip(".;,")
            titles[(part, roman(m.group(1)))] = first[:90]

    passages: list[Passage] = []
    order = 0
    for k, (start, part) in enumerate(text_parts):
        end = text_parts[k + 1][0] if k + 1 < len(text_parts) else notes_at
        raw_sections: list[tuple[str, list[str]]] = []
        for ln in lines[start + 1 : end]:
            m = SECTION.match(ln.strip())
            if m:
                raw_sections.append((m.group(1), []))
            elif raw_sections:
                raw_sections[-1][1].append(ln)
        sections, printed = renumber(raw_sections)
        for num, sec_lines in sections:
            paras = [_clean(p) for p in re.split(r"\n\s*\n", "\n".join(sec_lines)) if p.strip()]
            title = titles.get((part, num))
            for n, chunk in enumerate(pack([p for p in paras if len(p) > 20], target_words=150, max_words=260), start=1):
                order += 1
                passages.append(
                    Passage(
                        id=f"vp-{part}.{num}.{n}",
                        work_id="vishnu-purana",
                        work="Vishnu Purana",
                        section=f"Part {part}, Section {num}" + (f": {title}" if title else ""),
                        reference=f"Vishnu Purana {part}.{num}, passage {n}",
                        order=order,
                        companions=["krishna"],
                        translation=Translation("English", chunk, "Manmatha Nath Dutt (after H. H. Wilson)", "vishnu-purana-dutt"),
                        verification_status="verified-clean-source",
                        notes=[f"The printed edition numbers this section {printed[num]}."] if num in printed else [],
                    )
                )
    return passages
