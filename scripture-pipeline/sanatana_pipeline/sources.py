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
    ]
}
