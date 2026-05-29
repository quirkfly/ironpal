#!/usr/bin/env python3
"""
Build the IronPal lockup brand asset for post-comp use.

Reads:  input/images/logo/v4/Geometric teal circle on navy.png
Writes: post/assets/IronPal_logo_circle_v01.png   (2048x2048, transparent BG)
        post/assets/IronPal_wordmark_v01.png      (2048x512, transparent BG)
        post/assets/IronPal_lockup_v01.png        (combined, transparent BG)

Per docs/s3-post-production-pipeline.md §11.1 + docs/color-schemes.md.
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_LOGO    = PROJECT_ROOT / "input/images/logo/v4/Geometric teal circle on navy.png"
ASSETS_DIR  = PROJECT_ROOT / "post/assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# Brand teal, per docs/color-schemes.md (the campaign-wide accent constant)
BRAND_TEAL = (0, 229, 204, 255)   # #00E5CC

FONT_PATH = "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"


def strip_navy_to_alpha(src_path: Path) -> Image.Image:
    """Color-key the navy background of the source logo to transparent.

    Sample the corner pixel as the navy reference, then build an alpha
    channel based on Euclidean distance from that color in RGB space.
    Pixels close to navy -> fully transparent; pixels far from navy
    (i.e. the teal logo) -> fully opaque; intermediate distances get
    a smooth ramp to preserve anti-aliased edges.
    """
    src = Image.open(src_path).convert("RGBA")
    arr = np.array(src).astype(np.int32)

    # Sample navy from the top-left corner (a guaranteed-background pixel)
    navy = arr[0, 0, :3]

    # Per-pixel Euclidean distance from navy
    dist = np.linalg.norm(arr[:, :, :3] - navy[None, None, :], axis=2)

    # Soft threshold: <30 -> transparent, >80 -> opaque, ramp in between.
    alpha = np.clip((dist - 30) / 50, 0.0, 1.0)
    arr[:, :, 3] = (alpha * 255).astype(np.uint8)

    # Force the colored pixels toward the brand teal so the cleaned PNG
    # matches campaign palette exactly (the source teal is close but not
    # identical to #00E5CC).
    mask = arr[:, :, 3] > 32  # only re-color visible pixels
    arr[mask, 0] = BRAND_TEAL[0]
    arr[mask, 1] = BRAND_TEAL[1]
    arr[mask, 2] = BRAND_TEAL[2]

    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def crop_to_content(img: Image.Image, padding: int = 24) -> Image.Image:
    """Trim transparent padding around the visible content, leaving a small uniform margin."""
    bbox = img.getbbox()
    if bbox is None:
        return img
    cropped = img.crop(bbox)
    w, h = cropped.size
    side = max(w, h) + padding * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(cropped, ((side - w) // 2, (side - h) // 2), cropped)
    return canvas


def build_circle_asset(target_size: int = 2048) -> Image.Image:
    """Cleaned circle logo at target_size x target_size, transparent BG."""
    cleaned = strip_navy_to_alpha(SRC_LOGO)
    centered = crop_to_content(cleaned, padding=64)
    return centered.resize((target_size, target_size), Image.LANCZOS)


def build_wordmark_asset(width: int = 2048, height: int = 512, text: str = "IronPal") -> Image.Image:
    """'IronPal' wordmark in brand teal on transparent background."""
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # Find the font size that fits the text inside (width - 2*pad) x (height - 2*pad)
    pad = 48
    target_w = width - 2 * pad
    target_h = height - 2 * pad

    # Binary search the font size
    lo, hi, best_size = 32, 700, 32
    while lo <= hi:
        mid = (lo + hi) // 2
        font = ImageFont.truetype(FONT_PATH, size=mid)
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        if tw <= target_w and th <= target_h:
            best_size = mid
            lo = mid + 1
        else:
            hi = mid - 1

    font = ImageFont.truetype(FONT_PATH, size=best_size)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    # Center horizontally and vertically (account for textbbox y-offset)
    x = (width - tw) // 2 - bbox[0]
    y = (height - th) // 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=BRAND_TEAL)
    return canvas


def build_lockup(circle_img: Image.Image, wordmark_img: Image.Image) -> Image.Image:
    """Compose circle + wordmark side-by-side on a transparent canvas.

    Layout per docs/s3-post-production-pipeline.md §11.1:
      [circle]  [IronPal wordmark]
    with ~20% wordmark-height of clear space between.
    """
    target_height = 512
    # Resize circle to match wordmark height
    circle = circle_img.resize((target_height, target_height), Image.LANCZOS)

    # Trim the wordmark to its actual content width so the gap is consistent
    wm_bbox = wordmark_img.getbbox()
    wm = wordmark_img.crop(wm_bbox)
    # Re-pad vertically so wm height == target_height
    wm_canvas = Image.new("RGBA", (wm.width, target_height), (0, 0, 0, 0))
    wm_canvas.paste(wm, (0, (target_height - wm.height) // 2), wm)

    gap = int(target_height * 0.20)  # ~102 px
    total_w = circle.width + gap + wm_canvas.width
    lockup = Image.new("RGBA", (total_w, target_height), (0, 0, 0, 0))
    lockup.paste(circle, (0, 0), circle)
    lockup.paste(wm_canvas, (circle.width + gap, 0), wm_canvas)
    return lockup


def main() -> None:
    print(f"Reading source: {SRC_LOGO}")

    circle = build_circle_asset(target_size=2048)
    circle_path = ASSETS_DIR / "IronPal_logo_circle_v01.png"
    circle.save(circle_path)
    print(f"  wrote {circle_path}  ({circle.size[0]}x{circle.size[1]})")

    wordmark = build_wordmark_asset(width=2048, height=512, text="IronPal")
    wordmark_path = ASSETS_DIR / "IronPal_wordmark_v01.png"
    wordmark.save(wordmark_path)
    print(f"  wrote {wordmark_path}  ({wordmark.size[0]}x{wordmark.size[1]})")

    lockup = build_lockup(circle, wordmark)
    lockup_path = ASSETS_DIR / "IronPal_lockup_v01.png"
    lockup.save(lockup_path)
    print(f"  wrote {lockup_path}  ({lockup.size[0]}x{lockup.size[1]})")


if __name__ == "__main__":
    main()
