"""Two more English Gitas: Edwin Arnold's verse 'Song Celestial' (1885) and K. T. Telang's prose (1882).

Neither edition prints verse numbers, so passages are stanzas (Arnold) or paragraphs (Telang)
within each chapter, never claimed to match a specific verse.
"""

import re
from pathlib import Path

from ..model import Passage, Translation
from .common import gutenberg_body, pack, roman, verse_chunks

CHAPTER_NAMES = [
    "Arjuna's Despondency", "Sankhya Yoga", "Karma Yoga", "Jnana Yoga", "Renunciation of Action",
    "Self-Restraint", "Knowledge and Discernment", "The Imperishable Brahman", "The Royal Secret",
    "Divine Manifestations", "The Vision of the Universal Form", "Devotion", "The Field and its Knower",
    "The Three Qualities", "The Supreme Person", "Divine and Demoniac Natures", "The Threefold Faith",
    "Liberation through Renunciation",
]
SPEAKER = re.compile(r"^(Arjuna|Krishna|Sanjaya|Dhritirashtra)[:.]?$")


def import_arnold(raw_dir: Path) -> list[Passage]:
    body = gutenberg_body((raw_dir / "pg2388.txt").read_text(encoding="utf-8")).splitlines()
    starts = [i for i, ln in enumerate(body) if re.match(r"^\s*CHAPTER ([IVXL]+)\s*$", ln)]
    passages: list[Passage] = []
    order = 0
    for ci, start in enumerate(starts):
        num = roman(body[start].strip().split()[1])
        end = starts[ci + 1] if ci + 1 < len(starts) else len(body)
        lines = body[start + 1 : end]
        stop = next((i for i, ln in enumerate(lines) if re.match(r"^\s*HERE END", ln)), len(lines))
        lines = lines[:stop]
        stanzas: list[tuple[str | None, list[str]]] = []
        speaker: str | None = None
        cur: list[str] = []
        for ln in lines + [""]:
            s = ln.strip()
            if SPEAKER.match(s):
                if cur:
                    stanzas.append((speaker, cur))
                    cur = []
                speaker = SPEAKER.match(s).group(1)
                continue
            if not s:
                if cur:
                    stanzas.append((speaker, cur))
                    cur = []
                continue
            cur.append(s)
        n = 0
        section = f"Chapter {num}: {CHAPTER_NAMES[num - 1]}"
        # Keep speaker changes as passage boundaries; chunk long speeches.
        for spk, st in stanzas:
            for chunk in verse_chunks([st]):
                n += 1
                order += 1
                passages.append(
                    Passage(
                        id=f"bg-arnold-{num}.{n}",
                        work_id="gita-arnold",
                        work="Bhagavad Gita (The Song Celestial)",
                        section=section,
                        reference=f"Song Celestial {num}, stanza {n}",
                        order=order,
                        companions=["krishna"],
                        translation=Translation("English", re.sub(r"\[FN#\w+\]", "", "\n".join(chunk)), "Sir Edwin Arnold", "gita-arnold"),
                        verification_status="verified-clean-source",
                        speaker=spk,
                        notes=["A free English verse rendering (1885); it does not follow the Sanskrit verse by verse."],
                    )
                )
    return passages


# ---------------------------------------------------------------- Telang (OCR)

# Proper names in the Gita. The 1882 print uses accented letters that OCR garbles
# ("Ar^una", "Dhr/tarash/ra"); garbled words are matched to this list.
# (Telang always writes "son of Pritha", never "Partha", so Partha is left out to avoid mis-matches.)
GITA_NAMES = """Arjuna Arjuna's Krishna Krishna's Sanjaya Dhritarashtra Dhritarashtra's Pandavas Pandava Pandu Pritha
Kesava Madhava Madhusudana Janardana Govinda Vasudeva Hrishikesa Achyuta Keshava Yadava Varshneya Gudakesa
Dhananjaya Kaunteya Kunti Bharata Bharatas Kurus Kuru Kurukshetra Duryodhana Drona Bhishma Karna Kripa
Asvatthaman Vikarna Saumadatti Yuyudhana Virata Drupada Dhrishtaketu Chekitana Kasi Purujit Kuntibhoja Saibya
Yudhamanyu Uttamaujas Subhadra Draupadi Yudhishthira Nakula Sahadeva Bhima Sikhandin Dhrishtadyumna
Panchajanya Devadatta Paundra Anantavijaya Sughosha Manipushpaka Gandiva Brahmana Brahmanas Brahman Brahma
Kshatriya Kshatriyas Vaisya Vaisyas Sudra Sudras Kshetrajna Adhiyajna Adhibhuta Adhidaiva Adhyatma Asvattha
Vedas Veda Vedanta Yoga Sankhya Samkhya Prakriti Purusha Purushottama Sattva Rajas Tamas Nirvana Om Tat Sat
Indra Vishnu Siva Sankara Rudras Vasus Adityas Maruts Gandharvas Yakshas Rakshasas Asuras Daityas Prahlada
Narada Asita Devala Vyasa Kapila Bhrigu Vasuki Ananta Varuna Aryaman Yama Chitraratha Airavata Uchchaihsravas
Kandarpa Meru Himalaya Ganga Jahnavi Rama Usanas Brihaspati Skanda Mrigendra Vainateya Gayatri Margasirsha
Kusumakara Vrishnis Pandavas Brihatsaman Agni Soma Vivasvat Manu Ikshvaku Janaka Sakuntala""".split()

TELANG_PUNCT = [
    (r"(?<=[A-Za-z,;:)'.!?])\s+\d{1,2}(?=[\s,;.:)!?]|$)", ""),  # footnote markers printed after words
    (r"(?<=[a-z])[:;]?\d{1,2}(?=[.,;:!?\s])", ""),  # footnote numbers glued to words ("it:5.")
    (r"(?<=[a-z)]) [B-HJ-NP-Z] (?=[a-z(])", " "),  # stray footnote letters ("(this) D unavoidable")
    (r"(\bO [^.!?]{1,40}?) I (?=[a-z])", r"\1! "),  # "O son of Pritha I who" -> "O son of Pritha! who"
    (r"\b[lI]V[/z]?tha\b", "Pritha"),  # "son of lV/tha" (italic r with dot below)
    (r"\b([wW])[T7](?=h)", r"\1"),  # italic "wh" misread: "wThose", "w7hose", "wTho"
    (r"\b([wW])[T7](?=[aeiou])", r"\1h"),
    (r"(?<=[a-z]) [B-HJ-NP-Z](?=[,;.:])", ""),  # footnote letter before punctuation ("wrath G,")
    (r"\S*(?:AGAVADG|agavadg)\S*", ""),  # running page title ("r.HAGAVADGlTA.")
    (r"\b(?=[IlO]*\d)[IlO\d]{2,3}\b", ""),  # page numbers read with letters ("IO3", "I05")
    (r"\s+([;:,.!?])", r"\1"), (r"\(\s+", "("), (r"\s+\)", ")"), (r"\b0 (?=[A-Z])", "O "), (r"[.:;,]{2,}", "."),
]
TELANG_WORDS = {"Fandu": "Pandu", "iTekitana": "Chekitana", "iTekitana,": "Chekitana,", "DhanazZfaya!": "Dhananjaya!", "6Vapaka,": "Svapaka,", "Purufit": "Purujit", "Jives": "lives", "Kesava.": "Kesava", "Yeclic": "Vedic", "Veclas": "Vedas", "Yedas": "Vedas", "Veclic": "Vedic"}
GARBLE = re.compile(r"[/\^;£»\]\[\\|<>{}~%*]|(?<=[a-z])[0-9]|^[0-9](?=[a-z])|[A-Za-z][0-9][A-Za-z]|^[A-Z][a-y]*z[a-y]+|^[A-Z][a-z]*'[a-rt-z][a-z]*")
SPEAKERS = {"Arjuna": "Arjuna", "Sanjaya": "Sanjaya", "Dhritarashtra": "Dhritarashtra", "The Deity": "Krishna"}


def _skeleton(w: str) -> str:
    return re.sub(r"[^a-z]", "", w.lower().replace("5", "s").replace("6", "s").replace("7", "n"))


def _fix_word(tok: str) -> str:
    from rapidfuzz import fuzz, process

    m = re.match(r"^([\"'(‘“]*)(.*?)([.,;:!?)\"'’”]*)$", tok)
    lead, core, trail = m.group(1), m.group(2), m.group(3)
    if not core or not GARBLE.search(core):
        return tok
    poss = core.endswith("'s")
    base = core[:-2] if poss else core
    sk = _skeleton(base)
    if base[:1].isupper() or base[:1] in "]>6£»^(" or len(sk) >= 4:
        hit = process.extractOne(sk, {n: n.lower() for n in GITA_NAMES}, scorer=fuzz.ratio, score_cutoff=80)
        if hit and base and not base[0].islower():
            return lead + hit[2] + ("'s" if poss else "") + trail
    # Not a known name: a superscript footnote number glued to a word, or stray OCR marks.
    cleaned = re.sub(r"(?<=[a-z])[0-9]+$", "", core)
    cleaned = re.sub(r"[/\^;£»\]\[\\|<>{}~]", "", cleaned)
    return lead + cleaned + trail


NOTE_MARK = re.compile(r"\b(Cf\.|cf\.|See p\.|pp?\.\s?\d|supra|infra|Professor|Lectures|Sutta|Nipata|Dhammapada|-upanishad|Max M|commentator|I\. e\.|Scil\.|scil\.|Vide\b)")


def _is_note_start(s: str) -> bool:
    first = s.split()[0]
    if first in {"O", "I", "A", "a"}:
        return False
    return len(first.strip(".,'")) <= 2 and not first[0].isalpha() or (len(first) <= 2 and len(s.split()) > 1 and (s.split()[1][:1].isupper() or s.split()[1].startswith(("Cf", "cf", "See", "I."))))


def _drop_note_sentences(text: str) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return " ".join(x for x in sentences if not NOTE_MARK.search(x))


def _telang_clean(text: str) -> str:
    text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)  # re-join words hyphenated at line ends
    text = " ".join(TELANG_WORDS.get(t, _fix_word(t)) for t in text.split())
    for _ in range(2):  # two passes: removing spaces can expose glued footnote numbers
        for pat, rep in TELANG_PUNCT:
            text = re.sub(pat, rep, text)
    return _drop_note_sentences(re.sub(r"\s+", " ", text).strip())


SAID = re.compile(r"^(.{3,25}?)\s+said\s*:\s*[-—]*\s*$")


def import_telang(raw_dir: Path) -> list[Passage]:
    lines = (raw_dir / "telang.txt").read_text(encoding="utf-8").splitlines()
    first = next(i for i, ln in enumerate(lines) if re.match(r"^\s*Chapter\s+I\.\s*$", ln))
    end_all = next(i for i, ln in enumerate(lines) if i > first and re.match(r"^\s*sanatsug", ln, re.I))
    # "Chatter XIII." is how the OCR reads one heading.
    heads = [
        (i, roman(m.group(1)))
        for i, ln in enumerate(lines[:end_all])
        if i >= first and (m := re.match(r"^\s*Cha[pt]ter\s+([IVXL]+)\.\s*$", ln))
    ]
    seq = [(i, n) for k, (i, n) in enumerate(heads) if n == k + 1]
    if len(seq) != 18:
        raise ValueError(f"Telang: found {len(seq)} chapter headings")
    passages: list[Passage] = []
    order = 0
    for k, (start, num) in enumerate(seq):
        end = seq[k + 1][0] if k + 1 < len(seq) else end_all
        # Walk the chapter: skip page headers/numbers and footnote blocks; record the verse
        # number printed in each page header ("CHAPTER II, 27.") as a location hint.
        speeches: list[tuple[str | None, list[tuple[str, int | None]]]] = [(None, [])]
        verse_hint: int | None = 1
        in_note = False
        prev_blank = True
        for ln in lines[start + 1 : end]:
            s = ln.strip()
            if not s:
                in_note = False
                prev_blank = True
                continue
            hm = re.match(r"^\S{0,4}\s*CHAPTER\s+[IVXL1l]+\s*[,.]?\s*([0-9 IlO]*)\W{0,2}\s*\d*$", s)
            if hm:
                digits = hm.group(1).replace(" ", "").replace("I", "1").replace("l", "1").replace("O", "0")
                if digits.isdigit():
                    verse_hint = int(digits)
                continue
            if re.match(r"^\d+$", s) or re.match(r"^bhagavadg.t.\.?$", s, re.I):
                continue
            if prev_blank and _is_note_start(s):
                in_note = True  # footnotes begin with their number (often misread as a letter or symbol)
                prev_blank = False
                continue
            prev_blank = False
            if in_note:
                continue
            sm = SAID.match(s)
            if sm:
                from rapidfuzz import fuzz, process

                hit = process.extractOne(sm.group(1), list(SPEAKERS), scorer=fuzz.ratio, score_cutoff=50)
                speeches.append((SPEAKERS[hit[0]] if hit else None, []))
                continue
            speeches[-1][1].append((s, verse_hint))
        n = 0
        for speaker, body in speeches:
            if not body:
                continue
            text = _telang_clean(" ".join(t for t, _ in body))
            hints = [h for _, h in body if h]
            for chunk in pack([text], target_words=120, max_words=200):
                n += 1
                order += 1
                where = f", around verse {num}.{hints[0]}" if hints else ""
                passages.append(
                    Passage(
                        id=f"bg-telang-{num}.{n}",
                        work_id="gita-telang",
                        work="Bhagavad Gita (Telang)",
                        section=f"Chapter {num}: {CHAPTER_NAMES[num - 1]}",
                        reference=f"Bhagavad Gita (Telang) ch. {num}, passage {n}",
                        order=order,
                        companions=["krishna"],
                        translation=Translation("English", chunk, "Kashinath Trimbak Telang", "gita-telang"),
                        verification_status="ocr-cleaned-spot-checked",
                        speaker=speaker,
                        notes=[
                            "Telang's edition has no verse numbers; this passage is part of the chapter's running prose"
                            + (f" (its page begins{where.replace(', around', ' at')})." if hints else ".")
                        ],
                    )
                )
    return passages
