"""Hand-checked corrections for scanning (OCR) errors that the importers' general rules miss.

Each correction names the passage, the exact wrong text, and the replacement. Every correction must
still match when the build runs; if an importer changes and a correction no longer applies, the build
fails, so stale fixes are noticed instead of silently skipped.

Rules for adding one: fix only what is clearly a scanning error (a digit or symbol inside a word, a
page header, a footnote that ran into the verse). Where the scan cannot be read, say so in brackets
rather than guessing the translator's words.
"""

from __future__ import annotations

import re

from .model import Passage

UNREADABLE = "[a few words are unreadable in the scanned source]"

# passage id -> list of (wrong, right)
FIXES: dict[str, list[tuple[str, str]]] = {
    "bg-telang-15.1": [("the A7andas are", "the Khandas are")],
    "ram-dutt-4.43.3": [("ye shou1d,having", "ye should, having")],
    "ram-dutt-7.20.1": [("hundreds o£ ailments", "hundreds of ailments")],
    "hume-katha-3.12": [("sfynes not forth", "shines not forth")],
    "hume-brihadaranyaka-1.2.7": [("the A4va-medha", "the Asva-medha"), ("the A£vamedha", "the Asvamedha")],
    "hume-brihadaranyaka-1.4.10": [("(at7nan)", "(atman)")],
    "hume-brihadaranyaka-5.5.3": [
        ("there <tre two arms", "there are two arms"),
        ("(upatiisad)", "(upanisad)"),
        ("is 4 Day ’ (ahan)", "is ‘Day’ (ahan)"),
        ("two syllables (s2c-air)", "two syllables (sva-ar)"),
        ("(V h an)", "(√han)"),
        ("(V ha)", "(√ha)"),
    ],
    "devi-7.32.1-50.5": [("re¬ awakening", "re-awakening")],
    "devi-7.33.1-19.3": [("(Mountain¬ like)", "(Mountain-like)")],
    "dm-83.6": [("this me£\\kd!", "this mead!")],
    "dm-89.4": [("SOS CANTO LXXX£X. ", ""), ("ffumbha", "Sumbha"), ("Ssumbha", "Sumbha")],
    "rcm-1.31.1": [("I t6y poor servant", "I thy poor servant")],
    "rcm-1.50": [("Bhrigun6th", "Bhrigunath")],
    "rcm-1.105": [("Ghhand 9., ", ""), ("streaks o£ ashes", "streaks of ashes")],
    "rcm-1.197.1": [("Do7i« 195-196. A''V\\ his mighty arm", f"{UNREADABLE} his mighty arm")],
    "rcm-1.257.1": [("ambr6sia", "ambrosia")],
    "rcm-1.285.1": [("Do}id2S3. ", "")],
    "rcm-1.287": [("Do}id2S(5. Of i this", "Of this")],
    "rcm-1.295": [("man orNiiga. o /3v Dohd2M. on Still", "man or Naga. Still")],
    "rcm-1.361": [("Mah6deva", "Mahadeva"), ("west; «nd the word", "west; and the word")],
    "rcm-2.36": [("who aimm^jat 7 the tiger-ha¥#-4hus «ha-4ea4-t4re cow.", f"who {UNREADABLE} cow.")],
    "rcm-2.99.2": [("Raghun4th", "Raghunath")],
    "rcm-2.130": [("Chitra-k6t;*", "Chitra-kut;")],
    "rcm-2.144": [("Raghun6th", "Raghunath")],
    "rcm-2.154": [("soul: Cha7ipdi. ", "soul: ")],
    "rcm-2.157": [("attire and 320 AY0DHY4. many", "attire and many")],
    "rcm-2.205": [("he was 348 At6DHYA. very", "he was very")],
    "rcm-2.233": [("Sita5o", "Sita so")],
    "rcm-2.270": [("l)ohd2Q9. ", "")],
    "rcm-3.27.2": [("T)nlid2C). ", "")],
    "rcm-4.27": [("behalf o£ gods", "behalf of gods")],
    "rcm-4.28": [
        (
            "In the Treta'age Goci I In the Sanskrit Ramayana he is called Nis4kara, the night-raakei. "
            "which also, like Chandra, is a name for the moon. will take",
            "In the Treta age God will take",
        ),
        ("carried ofE", "carried off"),
        ("mount Triktit is the city of Lank;", "mount Trikut is the city of Lanka;"),
        ("there lives R-Wan", "there lives Ravan"),
    ],
    "rcm-4.31": [("Raghu u6th", "Raghunath")],
    "rcm-5.18": [("Hanum4n", "Hanuman")],
    "rcm-5.34": [("Bhav6ni", "Bhavani"), ("caii take ple;«sure", "can take pleasure")],
    "rcm-6.5": [("monkeys; Do7ia. was", "monkeys; it was")],
    "rcm-6.25": [("snapt o£E", "snapt off")],
    "rcm-6.118": [("was o£E at once", "was off at once")],
    "rcm-7.14.2": [("Pur4nas", "Puranas")],
    "rcm-7.72": [
        (
            re.compile(r"bliss,! the uncreatthe all-wise.*?G66 THE SEQUEL, permeator and the permeated;i", re.S),
            "bliss, the uncreate, the all-wise, the home of beauty and strength; the permeator and the permeated;",
        ),
        ("allseeing,2", "all-seeing,"),
        ("indwelleth/i evey heart", "indwelleth every heart"),
        ("trascending", "transcending"),
    ],
    "rcm-7.89.3": [("Sesh-n4g", "Sesh-nag")],
    "rcm-1.32": [("held d«ar", "held dear")],
    "rcm-1.88": [("Wh«n Bhavani", "When Bhavani")],
    "rcm-1.309": [("of hi« guru", "of his guru")],
    "rcm-1.322": [("cont«ct", "contact"), ("*o«/rt/;yrtfa,", f"{UNREADABLE},")],
    "rcm-2.30": [("t»u«h a statement ia held", "such a statement is held")],
    "rcm-2.74": [("AYODH¥A. 269 ", "")],
    "rcm-2.89": [("tame de«r", "tame deer")],
    "rcm-2.168": [("for the sal«e of", "for the sake of")],
    "rcm-2.169": [("R«Cma knows", "Rama knows")],
    "rcm-2.172": [("happiness ivoiu th« reign", "happiness from the reign")],
    "rcm-2.194": [("ta'«e comfort", "take comfort")],
    "rcm-2.241": [("Nish>«ds'", "Nishads'")],
    "rcm-2.287": [("bein« Rama's", "being Rama's")],
    "rcm-2.302": [("knows th« fancies", "knows the fancies")],
    "rcm-5.60": [("520 T«K BEAUTIFUL. ", "")],
    "rcm-6.101": [("mi«ht", "might")],
    "rcm-7.79": [("thr«)ugh", "through")],
    "rcm-7.97": [("Br«ihmans", "Brahmans")],
    "bg-telang-10.6": [(re.compile(r"\s*«\s*G\s*b\s*h\s*$"), "")],
    "rcm-1.210": [(re.compile(r"\s*a «>\s*$"), "")],
    "rcm-2.60": [("acted ia such-«-i^yay as", f"acted {UNREADABLE} as")],
    "rcm-2.273": [("till Suraitr«l made", "till Sumantra made")],
    "rcm-7.19": [(re.compile(r'go home\." «\s*$'), 'go home."')],
    "rcm-7.104": [(re.compile(r'creatures\.", «,\.\s*$'), 'creatures."')],
    "hume-brihadaranyaka-1.5.3": [("6. 30. «7 Verily", "6. 30. Verily")],
    "rcm-1.179": [(re.compile(r"the «\"+' Do\.\. 178\. T« "), f'the {UNREADABLE} "')],
    "rcm-6.74": [("drew his »K« J*'*J**'.® enlarged", f"drew his {UNREADABLE} enlarged")],
    "rcm-7.16": [("residences 1 ->/a«?/.;rt/;,", f"residences {UNREADABLE},")],
    "hume-prasna-5.4": [("[namely a + «]", "[namely a + u]")],
    "hume-prasna-5.5": [("[namely a +?/ + /«]", "[namely a + u + m]")],
    "dm-92.3": [("of th« world)", "of the world)")],
    "dm-93.2": [("a«cf what", "and what")],
}

# Patterns that should not survive in any OCR-derived passage after the fixes above.
SUSPICIOUS = re.compile(r"£|¬|¥|«|\b[A-Za-z]+[0-9][a-z]+\b")


def apply_fixes(passages: list[Passage]) -> int:
    """Apply FIXES in place; raise if any correction no longer matches. Returns corrections made."""
    by_id = {p.id: p for p in passages}
    stale: list[str] = []
    done = 0
    for pid, fixes in FIXES.items():
        p = by_id.get(pid)
        if p is None:
            stale.append(f"{pid}: passage not found")
            continue
        text = p.translation.text
        for wrong, right in fixes:
            if isinstance(wrong, re.Pattern):
                new, n = wrong.subn(right, text, count=1)
            else:
                n = text.count(wrong)
                new = text.replace(wrong, right)
            if n == 0:
                stale.append(f"{pid}: {getattr(wrong, 'pattern', wrong)[:60]!r} not found")
                continue
            text = new
            done += 1
        p.translation.text = re.sub(r"[ \t]{2,}", " ", text).strip()
    if stale:
        raise SystemExit("OCR corrections no longer match:\n" + "\n".join(stale))
    return done


def remaining_suspicious(passages: list[Passage]) -> list[tuple[str, str]]:
    """Report leftover symbol/digit-in-word tokens, for the build log and tests."""
    out = []
    for p in passages:
        for m in SUSPICIOUS.finditer(p.translation.text):
            out.append((p.id, m.group(0)))
    return out
