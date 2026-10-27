"""Provenance rules every scripture passage must satisfy.

This is the first building block for Phase 3: no passage may enter the
website unless we know exactly where it came from and that we may reuse it.
"""

REQUIRED_FIELDS: tuple[str, ...] = (
    "id",
    "scripture",
    "section",
    "language",
    "translation",
    "translator",
    "edition",
    "source_url",
    "license",
    "verification_status",
)


def missing_provenance(passage: dict) -> list[str]:
    """Return the required fields that are missing or empty in a passage."""
    return [f for f in REQUIRED_FIELDS if not str(passage.get(f, "")).strip()]
