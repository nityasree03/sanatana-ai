from sanatana_pipeline.provenance import REQUIRED_FIELDS, missing_provenance


def test_complete_passage_has_no_missing_fields():
    passage = {field: "example" for field in REQUIRED_FIELDS}
    assert missing_provenance(passage) == []


def test_missing_license_is_reported():
    passage = {field: "example" for field in REQUIRED_FIELDS}
    passage["license"] = "  "
    assert missing_provenance(passage) == ["license"]
