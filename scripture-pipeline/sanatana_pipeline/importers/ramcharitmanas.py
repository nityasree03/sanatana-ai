"""Tulsidas's Ramcharitmanas in F. S. Growse's English prose (1877–83; 1914 edition), from OCR of a scan.

Growse marks the Hindi poem's dohas ("Doha 12."); passages run from one doha to the next, and
sections group ten dohas so pages stay readable. Garbled accented names are corrected against
names found in clean texts (Dutt's and Griffith's Ramayana).
"""

import re
from collections import Counter
from pathlib import Path

from ..model import Passage, Translation
from .common import gutenberg_body, pack, roman

BOOKS = {1: "Childhood", 2: "Ayodhya", 3: "The Forest", 4: "Kishkindha", 5: "The Beautiful (Sundar Kand)", 6: "Lanka", 7: "The Sequel (Uttar Kand)"}
# A doha label line: "Doha 12.", but OCR garbles both the word and the number ("DohdSO." = 80,
# "Doha  no." = 110, "Doh4Ql." = 91). Sorathas have their own numbering and are not boundaries.
DOHA_LINE = re.compile(r"^Do[hb][a-z0-9áà]{0,2}\s*(\S{0,5}?)\s*[.:;,]?(?:\s|$)")
OCR_DIGITS = str.maketrans({"O": "0", "o": "0", "Q": "9", "S": "8", "l": "1", "I": "1", "i": "1", "|": "1", "Z": "2", "B": "8", "s": "8"})
MAX_WORDS = 420
# Running page headers ("AYODHYA.  257", "340  AYODHYA.", "THE   SEQUEL.  639") and printer's
# signatures ("R-36") are not part of the text.
PAGE_HEADER = re.compile(r"^[\W\d]{0,8}\s*(?:THE\s+)?[A-Z][A-Za-z]{2,}[A-Z]\.?\s*[\W\d]{0,8}$")
SIGNATURE = re.compile(r"^[A-Z]{1,2}\s?-\s?\d{1,3}\s*$")
# Growse's footnotes sit at the foot of a page and start with a note number: "1  For the legends...".
FOOTNOTE_START = re.compile(r"^[1-9*†]\s{1,3}[A-Z\"'‘“(]")
SKIP = re.compile(r"^(Chaup\w{1,3}|Chhand\w?|Sanskrit\s+Invocation)\.?\s*$|^THE\s+[A-Z ]+\.?\s*\d*$|^\d{1,4}\s+THE\s", re.I)


def _name_index(raw_dir: Path) -> tuple[set[str], list[str]]:
    words: Counter[str] = Counter()
    for f in ("pg57826.txt", "pg60188.txt", "pg57265.txt", "pg62496.txt", "pg24869.txt"):
        for w in re.findall(r"[A-Za-z][a-z]+", gutenberg_body((raw_dir / f).read_text(encoding="utf-8"))):
            words[w] += 1
    vocab = {w.lower() for w in words}
    names = [w for w, c in words.items() if w[0].isupper() and c >= 5 and w.lower() not in {x for x in vocab if x != w.lower()}]
    return vocab, names


def _fixer(vocab: set[str], names: list[str]):
    """Correct garbled names only. A word is touched if it is visibly garbled (^, \\, a capital
    inside the word) or unknown; the accented a that OCR reads as 'd' or 'A' is tried first."""
    from rapidfuzz import fuzz, process

    cache: dict[str, str] = {}
    lowered = {n: n.lower() for n in names}
    known = {n.lower(): n for n in names}

    def fix(tok: str) -> str:
        m = re.match(r"^([\"'(‘“]*)([A-Za-z^\\]+(?:'s)?)([.,;:!?)\"'’”]*)$", tok)
        if not m:
            return tok
        lead, core, trail = m.groups()
        poss = core.endswith("'s")
        base = core[:-2] if poss else core
        garbled = bool(re.search(r"[\^\\]|[a-z][A-Z]", base))
        if not base[:1].isupper() or (base.lower() in vocab and not garbled):
            return tok
        if base not in cache:
            clean = base.replace("^", "a").replace("\\", "")
            result = clean
            for cand in {clean.replace("d", "a"), clean.replace("A", "a"), re.sub(r"(?<=[a-z])A", "a", clean)}:
                if cand.lower() in known:
                    result = known[cand.lower()]
                    break
            else:
                hit = process.extractOne(clean.lower(), lowered, scorer=fuzz.ratio, score_cutoff=85)
                if hit and (garbled or clean.lower() not in vocab):
                    result = hit[2]
            cache[base] = result
        return lead + cache[base] + ("'s" if poss else "") + trail

    return fix


def _clean_line(s: str) -> str:
    # Margin marks (garbled Hindi verse numbers) at the start of a line: short junk tokens.
    s = re.sub(r"^(?:(?:[^\w\s\"'‘“(]{1,3}|[A-HJ-NP-Za-z]{1,2}[^\w\s]{0,2}|[^\w\s]?\d[^\w\s]?|[A-Za-z]?[\\^'][A-Za-z^\\']{0,2})\s+)+(?=[A-Z\"'‘“(]|[a-z]{3,})", "", s)
    return s


def import_ramcharitmanas(raw_dir: Path) -> list[Passage]:
    lines = (raw_dir / "growse.txt").read_text(encoding="utf-8").splitlines()
    vocab, names = _name_index(raw_dir)
    fix = _fixer(vocab, names)
    starts = [(i, roman(m.group(1))) for i, ln in enumerate(lines) if (m := re.match(r"^BOOK\s+([IVX]+)\.?\s*$", ln.strip()))]
    passages: list[Passage] = []
    order = 0
    for k, (start, book) in enumerate(starts):
        end = starts[k + 1][0] if k + 1 < len(starts) else len(lines)
        chunks: list[tuple[int, list[str]]] = []  # (doha number that closes the chunk, lines)
        cur: list[str] = []
        last_doha = 0
        in_note = False
        prev_blank = True
        for ln in lines[start + 1 : end]:
            s = ln.strip()
            blank, prev_blank = prev_blank, not s
            if not s:
                continue
            if (PAGE_HEADER.match(s) and len(s) < 40 and sum(c.isupper() for c in s) >= 4) or SIGNATURE.match(s):
                in_note = False  # a new page starts
                continue
            if blank and FOOTNOTE_START.match(s):
                in_note = True
            if re.fullmatch(r"[\W\d]{1,8}", s) or SKIP.match(s):
                continue
            dm = DOHA_LINE.match(s)
            if dm and len(s) < 60:
                in_note = False
            elif in_note:
                continue
            if dm and len(s) < 60:
                token = dm.group(1)
                digits = token.translate(OCR_DIGITS)
                n = int(digits) if digits.isdigit() else None
                # Labels come in order. A cleanly printed number may jump ahead (OCR lost some
                # labels entirely); a repaired number must continue the sequence closely.
                ok = n is not None and (
                    (token.isdigit() and last_doha < n <= last_doha + 15) or last_doha < n <= last_doha + 3
                )
                if not ok:
                    n = last_doha + 1
                last_doha = n
                if cur:
                    chunks.append((n, cur))
                    cur = []
                continue
            cur.append(_clean_line(s))
        if cur:
            chunks.append((last_doha + 1, cur))
        prev = 0
        for n, body in chunks:
            text = re.sub(r"(\w)-\s+(\w)", r"\1\2", " ".join(body))
            text = re.sub(r"\s+([,;:.!?])", r"\1", text)  # attach punctuation first
            text = re.sub(r"(?<!\w)[A-Za-z]?\^{2,}|[•]+|(?<!\w)\^+|\^+(?!\w)", "", text)  # margin debris ("l^^and", "•^once")
            text = re.sub(r"(?<=\s)(?:[^\w\s\"'‘“(,;:.!?—-]{1,2}|[b-hj-np-zB-HJ-NP-Z]['’]?)(?=\s)", "", text)  # stray marks
            text = re.sub(r"\(?\b(?:[CG]?h(?:a|o)u?[pw]\w{0,4}|Chhand\w{0,2})\.\s*\d{0,4}\.?\s*", "", text)
            text = re.sub(r"\b([A-Z][a-z]?)[46<]i?(?=[a-z]|\b)", r"\1a", text)  # "R4ma", "R<ima", "Um4"
            text = re.sub(r"(?<=[a-z])A(?=[a-z])", "a", text)  # accented a read as capital A ("VedAnta")
            # Verse-form labels left in the prose ("Chaupai", "Ghaupdi,", "Chhand", "('haup&i").
            label = re.compile(r"^[(\[']*[CGO(']?['(]?(?:haup|Chaup)\S{0,6}$|^[(']?Chhand\S{0,4}$|^chaupai\.?$|^Sorath\S{0,5}$|^Do[Tt]?[hM]?[ia3]\S{0,5}$")
            text = " ".join(fix(t) for t in text.split() if not label.match(t))
            text = re.sub(r"(?<![\d,.])\b0 (?=[A-Za-z])", "O ", text)
            text = re.sub(r"(?<=[a-z]{2})\d{1,2}(?=[\s,.;:!?)'\"]|$)", "", text)  # footnote numbers ("bards2")
            text = re.sub(r"\s+([,;:.!?])", r"\1", re.sub(r"\s+", " ", text)).strip()
            if len(text.split()) < 8:
                prev = n
                continue
            group = (n - 1) // 10
            span = f"doha {n}" if n == prev + 1 else f"dohas {prev + 1}–{n}"
            parts = pack([text], target_words=260, max_words=MAX_WORDS) if len(text.split()) > MAX_WORDS else [text]
            for j, part in enumerate(parts, 1):
                order += 1
                passages.append(
                    Passage(
                        id=f"rcm-{book}.{n}" + (f".{j}" if len(parts) > 1 else ""),
                        work_id="ramcharitmanas",
                        work="Ramcharitmanas of Tulsidas (Growse)",
                        section=f"Book {book} ({BOOKS[book]}), dohas {group * 10 + 1}–{group * 10 + 10}",
                        reference=f"Ramcharitmanas {book}, {span}" + (f" (part {j})" if len(parts) > 1 else ""),
                        order=order,
                        companions=["hanuman"],
                        translation=Translation("English", part, "Frederic Salmon Growse", "ramcharitmanas-growse"),
                        verification_status="ocr-cleaned-spot-checked",
                        notes=["Growse translates Tulsidas's Hindi verse into English prose; the passage covers the verses up to the doha named."],
                    )
                )
            prev = n
    return passages
