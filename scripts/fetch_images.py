#!/usr/bin/env python3
"""
Download species thumbnail photos from the Wikipedia REST API into images/.

Run this from a network environment that can reach en.wikipedia.org
(this repo's build environment could not - see README.md).

Usage:
    python3 scripts/fetch_images.py

Reads data/species.tsv (name<TAB>wiki-slug<TAB>output-filename) and, for each
row, fetches:
    https://en.wikipedia.org/api/rest_v1/page/summary/<slug>
takes thumbnail.source (falling back to originalimage.source), bumps any
"/NNNpx-" thumbnail width to "/400px-", and saves the image to
images/<output-filename>.

Species with no usable image are skipped (left as graceful placeholders
in the UI) and reported at the end so they can be revisited by hand.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPECIES_TSV = ROOT / "data" / "species.tsv"
IMAGES_DIR = ROOT / "images"

API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/{}"
USER_AGENT = "GalapagosTracker/1.0 (educational personal project; contact via GitHub)"
THUMB_WIDTH_RE = re.compile(r"/\d+px-")


def load_species():
    rows = []
    for line in SPECIES_TSV.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        name, slug, filename = line.split("\t")
        rows.append((name, slug, filename))
    return rows


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp)


def pick_image_url(summary):
    thumb = summary.get("thumbnail", {}).get("source")
    if thumb:
        return THUMB_WIDTH_RE.sub("/400px-", thumb)
    original = summary.get("originalimage", {}).get("source")
    if original:
        return original
    return None


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        dest.write_bytes(resp.read())


def main():
    IMAGES_DIR.mkdir(exist_ok=True)
    species = load_species()
    failed = []

    for i, (name, slug, filename) in enumerate(species, 1):
        dest = IMAGES_DIR / filename
        if dest.exists():
            print(f"[{i}/{len(species)}] {name}: already have {filename}, skipping")
            continue
        try:
            summary = fetch_json(API_URL.format(urllib.parse.quote(slug, safe="")))
        except urllib.error.HTTPError as e:
            print(f"[{i}/{len(species)}] {name}: API error {e.code} for slug '{slug}'")
            failed.append((name, slug, f"HTTP {e.code}"))
            continue
        except Exception as e:
            print(f"[{i}/{len(species)}] {name}: API request failed: {e}")
            failed.append((name, slug, str(e)))
            continue

        image_url = pick_image_url(summary)
        if not image_url:
            print(f"[{i}/{len(species)}] {name}: no thumbnail/originalimage in summary")
            failed.append((name, slug, "no image in summary"))
            continue

        try:
            download(image_url, dest)
            print(f"[{i}/{len(species)}] {name}: saved {filename}")
        except Exception as e:
            print(f"[{i}/{len(species)}] {name}: download failed: {e}")
            failed.append((name, slug, f"download failed: {e}"))
            continue

        time.sleep(0.2)  # be polite to the API

    print()
    print(f"Done. {len(species) - len(failed)}/{len(species)} images saved to {IMAGES_DIR}/")
    if failed:
        print(f"{len(failed)} species need manual attention:")
        for name, slug, reason in failed:
            print(f"  - {name} ({slug}): {reason}")
        sys.exit(1)


if __name__ == "__main__":
    main()
