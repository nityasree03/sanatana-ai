"""Register of every source used by the scripture pipeline.

Each entry records where the text comes from and why we may reuse it.
A passage can only be built from a source listed here (see validate.py).
"""

from dataclasses import dataclass, field

UA = "SanatanaAI-pipeline/0.1 (+https://github.com/nityasree03/sanatana-ai)"


@dataclass(frozen=True)
class Source:
    id: str
    title: str
    language: str
    translator: str | None
    edition: str
    year: str
    license: str
    rights_note: str
    url: str  # human-readable page for attribution
    files: dict[str, str] = field(default_factory=dict)  # local name -> download URL
    scan_url: str | None = None  # original printed edition used for verification


WIKISOURCE_BESANT = "https://en.wikisource.org/wiki/Bhagavad-Gita_(Besant_4th)/Discourse_{n}"

SOURCES: dict[str, Source] = {
    s.id: s
    for s in [
        Source(
            id="gita-sanskrit",
            title="Bhagavad Gita — Sanskrit verses (gita/gita open dataset)",
            language="Sanskrit",
            translator=None,
            edition="gita/gita data/verse.json",
            year="ancient text; dataset 2020s",
            license="Unlicense (public-domain dedication); the verse text itself is ancient",
            rights_note=(
                "Only the Devanagari verse text is used. The dataset's English translations, "
                "word meanings and transliterations are NOT used (modern, possibly copyrighted)."
            ),
            url="https://github.com/gita/gita",
            files={"gita_verse.json": "https://raw.githubusercontent.com/gita/gita/main/data/verse.json"},
        ),
        Source(
            id="gita-besant",
            title="The Bhagavad-Gita, translated by Annie Besant (4th edition)",
            language="English",
            translator="Annie Besant",
            edition="4th edition, G. A. Natesan & Co., Madras, 1922 (via Wikisource)",
            year="1922",
            license="Public domain",
            rights_note=(
                "Published before 1931 (public domain in the US); translator died 1933 "
                "(public domain in life+92-or-shorter countries)."
            ),
            url="https://en.wikisource.org/wiki/Bhagavad-Gita_(Besant_4th)",
            files={f"besant_{n:02d}.html": WIKISOURCE_BESANT.format(n=n) for n in range(1, 19)},
        ),
        Source(
            id="ramayana-griffith",
            title="The Rámáyan of Válmíki, translated into English verse by Ralph T. H. Griffith",
            language="English",
            translator="Ralph T. H. Griffith",
            edition="Trübner & Co. / E. J. Lazarus, 1870–1874 (Project Gutenberg eBook #24869)",
            year="1870–1874",
            license="Public domain",
            rights_note="Project Gutenberg: public domain in the USA; translator died 1906.",
            url="https://www.gutenberg.org/ebooks/24869",
            files={"pg24869.txt": "https://www.gutenberg.org/cache/epub/24869/pg24869.txt"},
        ),
        Source(
            id="upanishads-paramananda",
            title="The Upanishads (Isa, Katha, Kena), translated by Swami Paramananda",
            language="English",
            translator="Swami Paramananda",
            edition="The Vedanta Centre, Boston, 1919 (Project Gutenberg eBook #3283)",
            year="1919",
            license="Public domain",
            rights_note=(
                "Published 1919 (public domain in the US); translator died 1940. "
                "Only the translated verses are used, not the translator's commentary."
            ),
            url="https://www.gutenberg.org/ebooks/3283",
            files={"pg3283.txt": "https://www.gutenberg.org/cache/epub/3283/pg3283.txt"},
        ),
        Source(
            id="svetasvatara-muller",
            title="The Svetasvatara Upanishad, translated by F. Max Müller (Sacred Books of the East, vol. 15)",
            language="English",
            translator="F. Max Müller",
            edition="Clarendon Press, Oxford, 1884 (scan via Internet Archive, item wg915)",
            year="1884",
            license="Public domain",
            rights_note="Published 1884; translator died 1900. Text taken from OCR of the scan and cleaned.",
            url="https://archive.org/details/wg915",
            files={
                "sbe15.txt": "https://archive.org/stream/wg915/"
                + "WG915-1884%20-The%20Sacred%20Books%20of%20East%20-%20Vol%2015%20of%2050%20-%20The%20Upanishads%20Part%202%20of%202_djvu.txt"
            },
            scan_url="https://archive.org/details/wg915",
        ),
        Source(
            id="devi-gita-vijnanananda",
            title="The Devi Gita (Srimad Devi Bhagavatam, Book VII, chapters 31–40), translated by Swami Vijnanananda",
            language="English",
            translator="Swami Vijnanananda (Hari Prasanna Chatterji)",
            edition="Sacred Books of the Hindus, Panini Office, Allahabad, 1921–1923",
            year="1921–1923",
            license="Public domain",
            rights_note=(
                "Published before 1931 (public domain in the US). Text from a clean transcription of the "
                "1921–23 translation (Global Grey 2018 ebook, archive.org item the-srimad-devi-bhagawatam-"
                "swami-vijnanananda); every passage is checked against OCR of the original printed scan "
                "(Digital Library of India, archive.org item in.ernet.dli.2015.463317)."
            ),
            url="https://archive.org/details/in.ernet.dli.2015.463317",
            files={
                "devi_clean.txt": "https://archive.org/stream/the-srimad-devi-bhagawatam-swami-vijnanananda/"
                + "The%20Srimad%20Devi%20Bhagawatam%20-%20Swami%20Vijnanananda_djvu.txt",
                "devi_scan.txt": "https://archive.org/stream/in.ernet.dli.2015.463317/2015.463317.The-Srimad_djvu.txt",
            },
            scan_url="https://archive.org/details/in.ernet.dli.2015.463317",
        ),
        Source(
            id="gita-telang",
            title="The Bhagavadgita, translated by Kashinath Trimbak Telang (Sacred Books of the East, vol. 8)",
            language="English",
            translator="Kashinath Trimbak Telang",
            edition="Clarendon Press, Oxford, 1882 (2nd ed. 1898; scan via Internet Archive, item bhagavadgtwithsa00tela)",
            year="1882",
            license="Public domain",
            rights_note="Published 1882; translator died 1893. Text taken from OCR of the scan and cleaned. Telang prints the Gita as running prose without verse numbers, so passages are paragraphs within each chapter.",
            url="https://archive.org/details/bhagavadgtwithsa00tela",
            files={"telang.txt": "https://archive.org/stream/bhagavadgtwithsa00tela/bhagavadgtwithsa00tela_djvu.txt"},
            scan_url="https://archive.org/details/bhagavadgtwithsa00tela",
        ),
        Source(
            id="gita-arnold",
            title="The Song Celestial, or Bhagavad-Gita, a poetic version by Sir Edwin Arnold",
            language="English",
            translator="Sir Edwin Arnold",
            edition="Trübner & Co., London, 1885 (Project Gutenberg eBook #2388)",
            year="1885",
            license="Public domain",
            rights_note="Published 1885; translator died 1904. A free verse rendering, not a literal translation; it has no verse numbers, so passages are stanzas within each chapter.",
            url="https://www.gutenberg.org/ebooks/2388",
            files={"pg2388.txt": "https://www.gutenberg.org/cache/epub/2388/pg2388.txt"},
        ),
        Source(
            id="mahabharata-ganguli",
            title="The Mahabharata of Krishna-Dwaipayana Vyasa, translated into English prose by Kisari Mohan Ganguli",
            language="English",
            translator="Kisari Mohan Ganguli",
            edition="Bharata Press, Calcutta, 1883–1896 (Project Gutenberg eBooks #15475 and #15477)",
            year="1883–1896",
            license="Public domain",
            rights_note="Published 1883–1896; translator died 1908. The Gutenberg text was scanned at sacred-texts.com, whose notice asks for attribution and non-commercial use; this site is non-commercial and credits it.",
            url="https://www.gutenberg.org/ebooks/15475",
            files={"pg15475.txt": "https://www.gutenberg.org/cache/epub/15475/pg15475.txt", "pg15477.txt": "https://www.gutenberg.org/cache/epub/15477/pg15477.txt"},
        ),
        Source(
            id="vishnu-purana-dutt",
            title="A Prose English Translation of Vishnupuranam, by Manmatha Nath Dutt (based on H. H. Wilson's translation)",
            language="English",
            translator="Manmatha Nath Dutt (after H. H. Wilson, 1840)",
            edition="Elysium Press, Calcutta, 1896 (Project Gutenberg eBook #66208)",
            year="1896",
            license="Public domain",
            rights_note="Published 1896; Dutt died 1912, Wilson 1860.",
            url="https://www.gutenberg.org/ebooks/66208",
            files={"pg66208.txt": "https://www.gutenberg.org/cache/epub/66208/pg66208.txt"},
        ),
        Source(
            id="upanishads-hume",
            title="The Thirteen Principal Upanishads, translated by Robert Ernest Hume",
            language="English",
            translator="Robert Ernest Hume",
            edition="Oxford University Press, 1921 (scans via Internet Archive, items thirteenprincipa00hume and thirteenprincipa028442mbp)",
            year="1921",
            license="Public domain",
            rights_note="Published 1921 (public domain in the US); translator died 1948 (public domain in India and in life+70 countries since 2019). Text from OCR of one scan, compared with OCR of a second scan.",
            url="https://archive.org/details/thirteenprincipa00hume",
            files={
                "hume_a.txt": "https://archive.org/stream/thirteenprincipa00hume/thirteenprincipa00hume_djvu.txt",
                "hume_b.txt": "https://archive.org/stream/thirteenprincipa028442mbp/thirteenprincipa028442mbp_djvu.txt",
            },
            scan_url="https://archive.org/details/thirteenprincipa00hume",
        ),
        Source(
            id="kumarasambhava-griffith",
            title="The Birth of the War-God (Kumarasambhava) by Kalidasa, translated into English verse by Ralph T. H. Griffith",
            language="English",
            translator="Ralph T. H. Griffith",
            edition="Trübner & Co., London, 2nd ed. 1879 (Project Gutenberg eBook #31968)",
            year="1879",
            license="Public domain",
            rights_note="Published 1879; translator died 1906.",
            url="https://www.gutenberg.org/ebooks/31968",
            files={"pg31968.txt": "https://www.gutenberg.org/cache/epub/31968/pg31968.txt"},
        ),
        Source(
            id="ramayana-dutt",
            title="The Ramayana, translated into English prose from the original Sanskrit of Valmiki by Manmatha Nath Dutt",
            language="English",
            translator="Manmatha Nath Dutt",
            edition="Calcutta, 1891–1894 (Project Gutenberg eBooks #57265, #57826, #60188, #62496)",
            year="1891–1894",
            license="Public domain",
            rights_note="Published 1891–1894; translator died 1912.",
            url="https://www.gutenberg.org/ebooks/57265",
            files={"pg57265.txt": "https://www.gutenberg.org/cache/epub/57265/pg57265.txt", "pg57826.txt": "https://www.gutenberg.org/cache/epub/57826/pg57826.txt", "pg60188.txt": "https://www.gutenberg.org/cache/epub/60188/pg60188.txt", "pg62496.txt": "https://www.gutenberg.org/cache/epub/62496/pg62496.txt"},
        ),
        Source(
            id="ramcharitmanas-growse",
            title="The Ramayana of Tulsi Das (Ramcharitmanas), translated from the original Hindi by F. S. Growse",
            language="English",
            translator="Frederic Salmon Growse",
            edition="Ram Narain Lal, Allahabad, 6th ed. 1914 (first published 1877–1883; scan via Internet Archive, item rmyanaoftuls00tulauoft)",
            year="1877–1883",
            license="Public domain",
            rights_note="Translator died 1893; this edition was published 1914. Text taken from OCR of the scan and cleaned.",
            url="https://archive.org/details/rmyanaoftuls00tulauoft",
            files={"growse.txt": "https://archive.org/stream/rmyanaoftuls00tulauoft/rmyanaoftuls00tulauoft_djvu.txt"},
            scan_url="https://archive.org/details/rmyanaoftuls00tulauoft",
        ),
        Source(
            id="markandeya-pargiter",
            title="The Markandeya Purana (including the Devi Mahatmya), translated with notes by F. Eden Pargiter",
            language="English",
            translator="F. Eden Pargiter",
            edition="Asiatic Society of Bengal, Calcutta, 1904 (Bibliotheca Indica; scan via Internet Archive, item cu31924022991974)",
            year="1904",
            license="Public domain",
            rights_note="Published 1904; translator died 1927. Text taken from OCR of the scan and cleaned; only cantos 81–93 (the Devi Mahatmya) are used.",
            url="https://archive.org/details/cu31924022991974",
            files={"pargiter.txt": "https://archive.org/stream/cu31924022991974/cu31924022991974_djvu.txt"},
            scan_url="https://archive.org/details/cu31924022991974",
        ),
        Source(
            id="lalita-sastry",
            title="Lalita Sahasranama with Bhaskararaya's commentary, translated into English by R. Ananthakrishna Sastry",
            language="English",
            translator="R. Ananthakrishna Sastry",
            edition="2nd ed., Madras, 1925 (1st ed. Theosophical Society, 1899; scan via Internet Archive, item pli.kerala.rare.25882)",
            year="1899 / 1925",
            license="Public domain in the US (published before 1931)",
            rights_note="Public domain in the US because it was published before 1931. The translator's death date could not be confirmed, so public-domain status in India and other life+60/70 countries is unconfirmed. Only the thousand names and their short meanings are used, not Bhaskararaya's commentary.",
            url="https://archive.org/details/pli.kerala.rare.25882",
            files={"lalita.txt": "https://archive.org/stream/pli.kerala.rare.25882/pli.kerala.rare.25882_djvu.txt"},
            scan_url="https://archive.org/details/pli.kerala.rare.25882",
        ),
    ]
}

SA_WS = "https://sa.wikisource.org/wiki/{}?action=raw"


def _sa(title: str) -> str:
    from urllib.parse import quote

    return SA_WS.format(quote(title.replace(" ", "_")))


SANSKRIT_UPANISHAD_PAGES = {
    "sa_isa.txt": "ईशोपनिषत्",
    "sa_kena.txt": "केनोपनिषद्",
    **{f"sa_katha_{a}_{v}.txt": f"कठोपनिषत्/{ad}/{vl}" for a, ad in ((1, "प्रथमोध्यायः"), (2, "द्वितीयोध्यायः")) for v, vl in ((1, "प्रथमवल्ली"), (2, "द्वितीयवल्ली"), (3, "तृतीयवल्ली"))},
    "sa_mundaka.txt": "मुण्डकोपनिषद्",
    "sa_prasna.txt": "प्रश्न उपनिषद्",
    "sa_mandukya.txt": "माण्डुक्योपनिषत्",
    **{f"sa_svet_{n}.txt": f"श्वेताश्वतरोपनिषत्/{t} अध्यायः" for n, t in enumerate(("प्रथमः", "द्वितीयः", "तृतीयः", "चतुर्थः", "पञ्चमः", "षष्ठः"), 1)},
}
DEVANAGARI_DIGITS = "०१२३४५६७८९"
# Chapters 81–93 are transcribed on three grouped pages (the single-chapter pages are empty links).
SANSKRIT_MARKANDEYA_PAGES = {
    "sa_markandeya_081-085.txt": "मार्कण्डेयपुराणम्/अध्यायः ०८१-०८५",
    "sa_markandeya_086-090.txt": "मार्कण्डेयपुराणम्/अध्यायः ०८६-०९०",
    "sa_markandeya_091-093.txt": "मार्कण्डेयपुराणम्/अध्यायः ९१-९३",
}

SOURCES["upanishads-sanskrit"] = Source(
    id="upanishads-sanskrit",
    title="Upanishads in Sanskrit (Devanagari), from Sanskrit Wikisource",
    language="Sanskrit",
    translator=None,
    edition="Volunteer transcriptions on sa.wikisource.org (Isa, Kena, Katha, Mundaka, Prasna, Mandukya, Svetasvatara)",
    year="ancient text",
    license="Public domain (ancient text); Wikisource transcription shared under CC BY-SA 4.0",
    rights_note="The Upanishads are ancient and in the public domain. The Devanagari is taken from Sanskrit Wikisource, credited here; a verse is paired with an English verse only when the section has the same number of verses in both.",
    url="https://sa.wikisource.org/wiki/%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%BF%E0%A4%B7%E0%A4%A4%E0%A5%8D",
    files={name: _sa(title) for name, title in SANSKRIT_UPANISHAD_PAGES.items()},
)
SOURCES["markandeya-sanskrit"] = Source(
    id="markandeya-sanskrit",
    title="Markandeya Purana chapters 81–93 (Devi Mahatmya) in Sanskrit, from Sanskrit Wikisource",
    language="Sanskrit",
    translator=None,
    edition="Volunteer transcription on sa.wikisource.org (मार्कण्डेयपुराणम्)",
    year="ancient text",
    license="Public domain (ancient text); Wikisource transcription shared under CC BY-SA 4.0",
    rights_note="Ancient text in the public domain; Devanagari from Sanskrit Wikisource, credited here. Pargiter's English passages cover approximate verse ranges, so the Sanskrit shown with them is approximate too.",
    url=_sa("मार्कण्डेयपुराणम्").replace("?action=raw", ""),
    files={name: _sa(title) for name, title in SANSKRIT_MARKANDEYA_PAGES.items()},
)
