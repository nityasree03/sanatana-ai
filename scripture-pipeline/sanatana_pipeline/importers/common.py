"""Shared helpers for importers: Gutenberg boilerplate, paragraph splitting and passage sizing."""

import re

ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}


def roman(s: str) -> int:
    s = s.upper()
    total = 0
    for i, ch in enumerate(s):
        v = ROMAN[ch]
        total += -v if i + 1 < len(s) and ROMAN[s[i + 1]] > v else v
    return total


def gutenberg_body(text: str) -> str:
    """Return only the book text between Project Gutenberg's START and END markers."""
    start = re.search(r"^\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*$", text, re.M)
    end = re.search(r"^\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG EBOOK.*$", text, re.M)
    if not start or not end:
        raise ValueError("Gutenberg markers not found")
    return text[start.end() : end.start()]


def paragraphs(lines: list[str]) -> list[str]:
    """Join lines into paragraphs separated by blank lines."""
    out, cur = [], []
    for ln in lines + [""]:
        if ln.strip():
            cur.append(ln.strip())
        elif cur:
            out.append(" ".join(cur))
            cur = []
    return out


def pack(paras: list[str], target_words: int = 140, max_words: int = 260) -> list[str]:
    """Group short paragraphs into passages of a readable size; split very long ones at sentences."""
    pieces: list[str] = []
    for p in paras:
        words = p.split()
        if len(words) <= max_words:
            pieces.append(p)
            continue
        sentences = re.split(r"(?<=[.!?;])\s+(?=[A-Z“\"'(])", p)
        cur: list[str] = []
        for s in sentences:
            if cur and len(" ".join(cur).split()) + len(s.split()) > target_words + 60:
                pieces.append(" ".join(cur))
                cur = []
            cur.append(s)
        if cur:
            pieces.append(" ".join(cur))
    out: list[str] = []
    for p in pieces:
        if out and len(out[-1].split()) < target_words * 0.5 and len(out[-1].split()) + len(p.split()) <= max_words:
            out[-1] = out[-1] + "\n\n" + p
        else:
            out.append(p)
    return out


def verse_chunks(stanzas: list[list[str]], max_lines: int = 16) -> list[list[str]]:
    """Split verse stanzas into chunks of at most max_lines, merging tiny fragments."""
    out: list[list[str]] = []
    for st in stanzas:
        for i in range(0, len(st), max_lines):
            piece = st[i : i + max_lines]
            if out and len(piece) < 4 and len(out[-1]) + len(piece) <= max_lines + 4:
                out[-1] = out[-1] + piece
            else:
                out.append(piece)
    return out


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def renumber(raw: list[tuple[str, list[str]]]) -> tuple[list[tuple[int, list[str]]], dict[int, str]]:
    """Follow printed roman section numbers, fixing typos.

    A printed number is kept only if it fits between its neighbours; otherwise the section gets
    the next number, and the printed numeral is returned so a note can record it.
    """

    def val(numeral: str) -> int | None:
        try:
            return roman(numeral)
        except KeyError:
            return None

    out: list[tuple[int, list[str]]] = []
    printed: dict[int, str] = {}
    for i, (numeral, body) in enumerate(raw):
        prev = out[-1][0] if out else 0
        v = val(numeral)
        nxt = val(raw[i + 1][0]) if i + 1 < len(raw) else None
        if not (v is not None and v > prev and (nxt is None or v < nxt or nxt <= prev)):
            printed[prev + 1] = numeral
            v = prev + 1
        out.append((v, body))
    return out, printed
