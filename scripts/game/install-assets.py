#!/usr/bin/env python3
"""Install curated Leonardo output into the app and build a review contact sheet.

  input/game-assets/leonardo/<id>/<id>_0.{jpg,png}
      -> poc/mobile/assets/game/<section>/<id>.png        (square emblems: rembg cut + trim + 512²;
                                                           backdrops: resized to 1360x768, no cut)
  input/game-assets/contact-sheet.png                      (every raw generation, labelled)

Usage:
  python3 scripts/game/install-assets.py            # everything not yet installed
  python3 scripts/game/install-assets.py --force
  python3 scripts/game/install-assets.py --sheet    # contact sheet only, no install
"""
import argparse, glob, os, re, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "input/game-assets/leonardo")
DST = os.path.join(ROOT, "poc/mobile/assets/game")
PROMPTS = os.path.join(ROOT, "docs/ironpal-game-asset-prompts.md")
SHEET = os.path.join(ROOT, "input/game-assets/contact-sheet.png")

WIDE = {"backdrops"}


def sections():
    """id -> section, from the prompt sheet's fenced blocks."""
    out, cur, in_block = {}, None, False
    for line in open(PROMPTS, encoding="utf-8"):
        if line.startswith("## "):
            cur = line[3:].strip().split()[0].lower()
        if line.startswith("```"):
            in_block = not in_block; continue
        if in_block:
            m = re.match(r'^([a-z0-9_]+):\s', line)
            if m:
                out[m.group(1)] = cur
    return out


def raw_for(wid):
    files = sorted(glob.glob(os.path.join(SRC, wid, wid + "_0.*")))
    return files[0] if files else None


def cutout(img):
    from rembg import remove
    out = remove(img.convert("RGBA"))
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    side = max(out.size) + 40
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.width) // 2, (side - out.height) // 2), out)
    return canvas.resize((512, 512), Image.LANCZOS)


def install(wid, section, force):
    src = raw_for(wid)
    if not src:
        return "missing"
    ext = ".jpg" if section in WIDE else ".png"   # backdrops sit behind UI: JPEG q85 (~150 kB, not ~1.5 MB PNG)
    dst = os.path.join(DST, section, wid + ext)
    if os.path.exists(dst) and not force:
        return "kept"
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img = Image.open(src)
    if section in WIDE:
        stale = os.path.join(DST, section, wid + ".png")
        if os.path.exists(stale):
            os.remove(stale)
        img.convert("RGB").resize((1360, 768), Image.LANCZOS).save(dst, quality=85, optimize=True)
    else:
        cutout(img).save(dst, optimize=True)
    return "installed"


def contact_sheet(ids):
    cell, cols = 256, 6
    rows = (len(ids) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 24)), (26, 26, 46))
    d = ImageDraw.Draw(sheet)
    for i, wid in enumerate(ids):
        src = raw_for(wid)
        x, y = (i % cols) * cell, (i // cols) * (cell + 24)
        if src:
            im = Image.open(src).convert("RGB")
            im.thumbnail((cell, cell))
            sheet.paste(im, (x + (cell - im.width) // 2, y))
        d.text((x + 4, y + cell + 4), wid, fill=(0, 229, 204) if src else (255, 107, 53))
    sheet.save(SHEET)
    return SHEET


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--sheet", action="store_true")
    args = ap.parse_args()
    secs = sections()
    ids = list(secs)
    if not args.sheet:
        for wid in ids:
            print("%-24s %s" % (wid, install(wid, secs[wid], args.force)))
    print("contact sheet:", contact_sheet(ids))


if __name__ == "__main__":
    main()
