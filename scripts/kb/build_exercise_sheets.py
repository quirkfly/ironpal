#!/usr/bin/env python3
"""Render Tier-1 exercise reference sheets for gym-session labeling.

During labeling the recurring question is "is this a front raise or a lateral
raise?" -- a naming/disambiguation problem. These sheets answer it at a glance:
one tile per Tier-1 exercise, showing the start and end position side by side
(the pair IS the movement), grouped by equipment class, captioned with the two
IronPal fields a labeler needs to think about.

WHAT THESE ARE NOT: the photos are third-person gym-catalogue shots. They do NOT
show what the headband camera sees, and egocentric recognition is the entire
problem. Use them to pin down WHICH exercise a set is, never as a visual
reference for what the model will see -- for that, use the extracted frames in
docs/video-analysis-kb/cases/. The caption exists to keep this honest: a tile
reading "[imu | occluded]" is telling you the implement dominating the photo is
invisible to our camera.

Images come from free-exercise-db (Unlicense / public domain), so redistributing
them here carries no attribution or share-alike obligation. Output is JPEG, not
PNG: these are photographs, and PNG made the set ~10x larger for no gain in a
repo that otherwise gitignores regenerable imagery.

Usage:
    python3 scripts/kb/build_exercise_sheets.py            # uses cached images
    python3 scripts/kb/build_exercise_sheets.py --fetch    # download images first

Requires ImageMagick (convert, montage).
"""
import argparse
import collections
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/"
UA = "IronPal-ontology-build/1.0 (github.com/quirkfly/ironpal)"
TILE_W, TILE_H = 520, 190


def norm(s):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", (s or "").lower())).strip()


def load_pairs(ontology, source, cache, fetch):
    """Return [(entry, [image paths])] for every Tier-1 exercise with a source join."""
    fed = json.load(open(source))
    by_name = {norm(r["name"]): r for r in fed}
    onto = json.load(open(ontology))
    os.makedirs(cache, exist_ok=True)

    out, missing = [], []
    for e in [x for x in onto["exercises"] if x["tier"] == 1]:
        rec = by_name.get(e["source_match"]) if e.get("source_match") else None
        if not rec or not rec.get("images"):
            missing.append(e["canonical_name"])
            continue
        paths = []
        for i, img in enumerate(rec["images"][:2]):
            dest = os.path.join(cache, f"{e['id']}_{i}.jpg")
            if not os.path.exists(dest):
                if not fetch:
                    continue
                req = urllib.request.Request(IMG_BASE + img, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=45) as r, open(dest, "wb") as f:
                    f.write(r.read())
                time.sleep(0.15)          # be polite to the source host
            paths.append(dest)
        if paths:
            out.append((e, paths))
        else:
            missing.append(e["canonical_name"])
    return out, missing


def build(pairs, outdir, workdir):
    """One sheet per equipment class. Every tile is normalised to the same box --
    the source photos have wildly different aspect ratios, and letting montage
    size tiles freely broke row alignment and silently dropped captions."""
    os.makedirs(outdir, exist_ok=True)
    os.makedirs(workdir, exist_ok=True)
    groups = collections.defaultdict(list)

    for e, paths in pairs:
        strip = os.path.join(workdir, f"{e['id']}.jpg")
        subprocess.run([
            "convert", *paths, "+append",
            "-resize", f"{TILE_W}x{TILE_H}", "-background", "#1b1b22",
            "-gravity", "center", "-extent", f"{TILE_W}x{TILE_H}",
            "-bordercolor", "#3a3a46", "-border", "2", strip,
        ], check=True)
        caption = f"{e['canonical_name']}\n[{e['rep_signal']} | {e['egocentric_visibility']}]"
        groups[e["equipment_class"]].append((strip, caption))

    written = []
    for cls, items in sorted(groups.items()):
        dest = os.path.join(outdir, f"tier1-{cls}.jpg")
        args = ["montage"]
        for strip, caption in sorted(items, key=lambda x: x[1]):
            args += ["-label", caption, strip]
        args += [
            "-tile", "2x", "-geometry", f"{TILE_W + 4}x{TILE_H + 4}+12+12",
            "-background", "#1b1b22", "-fill", "#e8e8ee",
            "-pointsize", "18", "-font", "DejaVu-Sans",
            "-quality", "82", dest,
        ]
        subprocess.run(args, check=True)
        written.append((dest, len(items)))
    return written


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ontology", default="docs/video-analysis-kb/ontology.json")
    ap.add_argument("--source", default="input/kb/ontology-sources/free-exercise-db.json")
    ap.add_argument("--cache", default="input/kb/ontology-sources/images")
    ap.add_argument("--out", default="docs/video-analysis-kb/reference")
    ap.add_argument("--fetch", action="store_true", help="download missing images")
    args = ap.parse_args()

    if not os.path.exists(args.source):
        sys.exit(f"missing {args.source}; run: python3 scripts/kb/build_ontology.py --fetch")

    pairs, missing = load_pairs(args.ontology, args.source, args.cache, args.fetch)
    if not pairs:
        sys.exit("no images cached; re-run with --fetch")

    workdir = os.path.join(args.cache, "_strips")
    for dest, n in build(pairs, args.out, workdir):
        size = os.path.getsize(dest) / 1024
        print(f"  {dest}  ({n} exercises, {size:.0f} KB)")
    print(f"rendered {len(pairs)} Tier-1 exercises")
    if missing:
        print(f"no source imagery ({len(missing)}): {', '.join(missing)}")


if __name__ == "__main__":
    main()
