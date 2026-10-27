"""The shape of one scripture passage, as stored in the website's JSON."""

from dataclasses import asdict, dataclass, field
from datetime import date

INGESTED_AT = date.today().isoformat()


@dataclass
class Original:
    language: str
    script: str
    text: str
    source_id: str


@dataclass
class Transliteration:
    scheme: str
    text: str
    method: str


@dataclass
class Translation:
    language: str
    text: str
    translator: str
    source_id: str


@dataclass
class Passage:
    id: str  # stable id, e.g. "bg-2.47"
    work_id: str  # e.g. "bhagavad-gita"
    work: str  # display title, e.g. "Bhagavad Gita"
    section: str  # e.g. "Chapter 2"
    reference: str  # human citation, e.g. "Bhagavad Gita 2.47"
    order: int  # position within the work, for browsing
    companions: list[str]
    translation: Translation
    verification_status: str  # "verified-clean-source" | "ocr-cleaned-spot-checked" | "checked-against-scan"
    original: Original | None = None
    transliteration: Transliteration | None = None
    speaker: str | None = None
    notes: list[str] = field(default_factory=list)
    ingested_at: str = INGESTED_AT

    def to_json(self) -> dict:
        return asdict(self)
