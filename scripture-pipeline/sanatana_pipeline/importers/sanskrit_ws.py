"""Sanskrit (Devanagari) originals from Sanskrit Wikisource, paired with English passages.

Wikisource marks the end of each verse with its number: "... ॥ १२ ॥" (or "॥ १.१.३ ॥", "॥ ८१.४ ॥").
Lines ending in an unnumbered "॥" are invocations, headings or closing lines, except where a
transcriber left out a verse number (Katha 1.1.1): an unnumbered segment directly before a gap in
the numbering is taken to be the missing verse.

Pairing is deliberately conservative. A Sanskrit section is attached to an English translation only
when both have the same number of verses in that section; otherwise the section stays English-only.
"""

import re
from collections import defaultdict
from pathlib import Path

from ..model import Original, Transliteration
from .gita import to_iast

DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
# A numbered verse end "॥ १२ ॥", or a lone "॥" (an unnumbered line end: heading, invocation, colophon).
MARK = re.compile(r"॥\s*([०-९0-9]+(?:\s*\.\s*[०-९0-9]+)*)\s*॥|॥(?:\s*॥)?")
IAST_METHOD = "Generated from the Devanagari with indic-transliteration (MIT)"


def wikitext_to_text(t: str) -> str:
    for _ in range(5):  # templates can nest
        t = re.sub(r"\{\{[^{}]*\}\}", "", t)
    t = re.sub(r"<[^>]+>", "\n", t)
    t = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", t)
    t = re.sub(r"^=+.*?=+\s*$", "", t, flags=re.M)
    t = re.sub(r"&nbsp;|‌|‍", " ", t)
    t = t.replace("'''", "").replace("''", "")  # wiki bold/italic marks
    return t


def _clean_verse(s: str) -> str:
    lines = [ln.strip().rstrip("-").strip() for ln in s.splitlines()]
    lines = [ln for ln in lines if ln and re.search(r"[ऀ-ॿ]", ln)]
    # Chapter headings ("एकाशीतितमोऽध्यायः- ८१ ।") and section titles are not verse text.
    lines = [ln for ln in lines if not re.search(r"अध्यायः[\s\-–]*[०-९]*\s*।?$|^देवीमाहात्म्यम्$", ln.replace("ऽ", "अ"))]
    lines = [ln for ln in lines if not (ln.startswith("इति ") and re.search(r"[धद]्यायः|खण्डः|वल्ली|प्रश्नः", ln))]  # closing colophons
    text = "\n".join(lines)
    text = re.sub(r"[ \t]+", " ", text)
    return re.sub(r"\s*।\s*", " ।\n", text).replace(" ।\n\n", " ।\n").strip().rstrip("।").strip()


def parse(text: str) -> list[tuple[tuple[int, ...], str]]:
    """Return [(number tuple, verse text)] in order; numbers as printed (no section inference)."""
    body = wikitext_to_text(text)
    segments: list[tuple[tuple[int, ...] | None, str]] = []
    pos = 0
    for m in MARK.finditer(body):
        seg = body[pos : m.start()]
        num = tuple(int(x) for x in re.sub(r"\s", "", m.group(1)).translate(DIGITS).split(".")) if m.group(1) else None
        segments.append((num, seg))
        pos = m.end()
    out: list[tuple[tuple[int, ...], str]] = []
    for i, (num, seg) in enumerate(segments):
        if num is None:
            # A verse whose number the transcriber left out: the next numbered verse skips exactly one.
            nxt = next((n for n, _ in segments[i + 1 : i + 2] if n), None)
            prev = out[-1][0] if out else None
            expected = (prev[:-1] + (prev[-1] + 1,)) if prev else None
            missing_first = prev is None and nxt is not None and nxt[-1] == 2
            if nxt and ((expected and nxt == expected[:-1] + (expected[-1] + 1,)) or missing_first):
                num = nxt[:-1] + (nxt[-1] - 1,)
            else:
                continue
        verse = _clean_verse(seg)
        if verse:
            out.append((num, verse))
    return out


def sectioned(verses: list[tuple[tuple[int, ...], str]]) -> dict[int, dict[int, str]]:
    """For single-number texts, start a new section whenever the numbering restarts."""
    sections: dict[int, dict[int, str]] = defaultdict(dict)
    sec, last = 1, 0
    for num, text in verses:
        n = num[-1]
        if n <= last:
            sec += 1
        sections[sec][n] = text
        last = n
    return sections


# Peace invocations (shanti mantras) that some pages number as if they were verses.
SHANTI = re.compile(r"सह\s*नाववतु|शान्तिः\s*शान्तिः|भद्रं\s*कर्णेभिः|पूर्णमदः\s*पूर्णमिदं|आप्यायन्तु\s*ममाङ्गानि")


def _read(raw_dir: Path, name: str) -> list[tuple[tuple[int, ...], str]]:
    return [(n, t) for n, t in parse((raw_dir / name).read_text(encoding="utf-8")) if not SHANTI.search(t)]


def upanishad_verses(raw_dir: Path) -> dict[str, dict[tuple, str]]:
    """Map our verse keys to Devanagari, per Upanishad: key = tuple used in passage ids."""
    out: dict[str, dict[tuple, str]] = {}
    out["isa"] = {(n,): t for n, t in sectioned(_read(raw_dir, "sa_isa.txt"))[1].items()}
    out["kena"] = {(s, n): t for s, vs in sectioned(_read(raw_dir, "sa_kena.txt")).items() for n, t in vs.items()}
    out["katha"] = {}
    for a in (1, 2):
        for v in (1, 2, 3):
            for n, t in sectioned(_read(raw_dir, f"sa_katha_{a}_{v}.txt"))[1].items():
                out["katha"][(a, v, n)] = t
    out["mundaka"] = {num: t for num, t in _read(raw_dir, "sa_mundaka.txt") if len(num) == 3}
    out["prasna"] = {(s, n): t for s, vs in sectioned(_read(raw_dir, "sa_prasna.txt")).items() for n, t in vs.items()}
    out["mandukya"] = {(n,): t for n, t in sectioned(_read(raw_dir, "sa_mandukya.txt"))[1].items()}
    out["svetasvatara"] = {}
    for c in range(1, 7):
        for n, t in sectioned(_read(raw_dir, f"sa_svet_{c}.txt"))[1].items():
            out["svetasvatara"][(c, n)] = t
    return out


def markandeya_verses(raw_dir: Path) -> dict[tuple[int, int], str]:
    out: dict[tuple[int, int], str] = {}
    for name in ("sa_markandeya_081-085.txt", "sa_markandeya_086-090.txt", "sa_markandeya_091-093.txt"):
        for num, t in _read(raw_dir, name):
            if len(num) == 2 and 81 <= num[0] <= 93:
                out.setdefault(num, t)
    return out


def _keys_for(pid: str) -> tuple[str, tuple] | None:
    """Translate one of our passage ids into (upanishad, Sanskrit key)."""
    m = re.match(r"^hume-(\w+)-([\d.]+)$", pid)
    if m:
        up, nums = m.group(1), tuple(int(x) for x in m.group(2).split("."))
        if up == "katha" and len(nums) == 2:  # Hume counts Katha by valli 1–6
            valli, n = nums
            return up, ((valli - 1) // 3 + 1, (valli - 1) % 3 + 1, n)
        return up, nums
    m = re.match(r"^(isa|kena|katha|svet)-([\d.]+)$", pid)
    if m:
        up = {"svet": "svetasvatara"}.get(m.group(1), m.group(1))
        return up, tuple(int(x) for x in m.group(2).split("."))
    return None


def attach_upanishads(passages: list, raw_dir: Path) -> dict[str, int]:
    """Attach Devanagari + IAST to Upanishad passages where whole sections line up."""
    sa = upanishad_verses(raw_dir)
    groups: dict[tuple[str, str, tuple], list] = defaultdict(list)  # (work, upanishad, section) -> passages
    for p in passages:
        k = _keys_for(p.id)
        if not k or k[0] not in sa or p.original:
            continue
        up, key = k
        groups[(p.work_id, up, key[:-1])].append((p, key))
    stats = {"attached": 0, "sections_skipped": 0}
    for (work, up, section), items in groups.items():
        sa_section = {k: t for k, t in sa[up].items() if k[:-1] == section}
        if len(sa_section) != len(items) or any(key not in sa_section for _, key in items):
            stats["sections_skipped"] += 1
            continue
        for p, key in items:
            dev = sa_section[key]
            p.original = Original("Sanskrit", "Devanagari", dev, "upanishads-sanskrit")
            p.transliteration = Transliteration("IAST", to_iast(dev), IAST_METHOD)
            stats["attached"] += 1
    return stats


def attach_devi_mahatmya(passages: list, raw_dir: Path) -> int:
    """Pargiter's passages name a verse range; attach the Sanskrit for that range (approximate)."""
    sa = markandeya_verses(raw_dir)
    count = 0
    for p in passages:
        if p.work_id != "devi-mahatmya":
            continue
        m = re.match(r"^Markandeya Purana (\d+), verses? (\d+)(?:–(\d+))?$", p.reference)
        if not m:
            continue
        canto, a = int(m.group(1)), int(m.group(2))
        b = int(m.group(3) or a)
        verses = [sa[(canto, v)] for v in range(a, b + 1) if (canto, v) in sa]
        if not verses or len(verses) < (b - a + 1) * 0.8:
            continue
        dev = "\n".join(verses)
        p.original = Original("Sanskrit", "Devanagari", dev, "markandeya-sanskrit")
        p.transliteration = Transliteration("IAST", to_iast(dev), IAST_METHOD)
        p.notes.append(
            f"The Sanskrit shown is verses {a}–{b} of chapter {canto}; Pargiter's verse numbers are approximate, so it may not match the English line for line."
        )
        count += 1
    return count
