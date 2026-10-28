"""Download every registered source file into raw/ and record checksums.

Usage:  python -m sanatana_pipeline.fetch

- Files already present are not downloaded again (delete raw/ to refresh).
- archive.org "stream" pages wrap the text in HTML; we extract the <pre> block.
- Requests are spaced out politely (Wikimedia and archive.org rate-limit).
"""

import hashlib
import html
import json
import re
import time
import urllib.request
from pathlib import Path

from .sources import SOURCES, UA

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
MANIFEST = ROOT / "raw_manifest.json"


def _download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001 - retry any network error
            if attempt == 3:
                raise RuntimeError(f"Could not download {url}: {e}") from e
            time.sleep(5 * (attempt + 1))
    raise AssertionError("unreachable")


def _unwrap_archive_stream(data: bytes) -> bytes:
    m = re.search(rb"<pre[^>]*>(.*?)</pre>", data, re.S)
    if not m:
        raise RuntimeError("archive.org stream page had no <pre> text block")
    return html.unescape(m.group(1).decode("utf-8")).encode("utf-8")


def fetch_all() -> dict:
    RAW.mkdir(exist_ok=True)
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    for src in SOURCES.values():
        for name, url in src.files.items():
            path = RAW / name
            if not path.exists():
                data = _download(url)
                if "archive.org/stream/" in url:
                    data = _unwrap_archive_stream(data)
                if re.match(rb"\s*#(REDIRECT|\xe0\xa4\xaa\xe0\xa5\x81\xe0\xa4\xa8)", data, re.I):
                    raise RuntimeError(f"{name}: the page is a redirect; register the target title instead")
                path.write_bytes(data)
                time.sleep(4 if "wikisource" in url else 2)
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            manifest[name] = {"source": src.id, "url": url, "sha256": digest, "bytes": path.stat().st_size}
            print(f"{name:20s} {path.stat().st_size:>9,d} bytes  {digest[:12]}")
    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    return manifest


if __name__ == "__main__":
    fetch_all()
