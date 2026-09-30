#!/usr/bin/env python3
"""SASK 2026 pitch deck — HTML → PDF, with the checks the form implies.

  python3 scripts/deck/build.py                 # assets, screens, PDF, preview, checks
  python3 scripts/deck/build.py --allow-placeholders

Plan: docs/ironpal_pitch_deck_plan.md (§5 Build). Same method as the film's insets and captions:
Chrome renders scripts/deck/deck.html one 1920×1080 page per slide; the two app screens are the
film's own HTML screens captured at a frozen instant (add_init_script clock stub — the reload
variant silently runs on the wall clock, see scripts/k7/make_inset.sh).

Checks before the PDF is called done: ≤ 15 pages, ≤ 30 MB, every referenced asset present, no
`[ask]`/`[N]` placeholder left in the text (unless --allow-placeholders), fonts actually loaded.
"""
import json, os, pathlib, re, subprocess, sys, urllib.parse
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
HTML = ROOT / "scripts/deck/deck.html"
OUT = ROOT / "docs/pitch_deck"; ASSETS = OUT / "assets"; ASSETS.mkdir(parents=True, exist_ok=True)
PDF = OUT / "IronPal_PitchDeck_2026.pdf"
WEB = ROOT / "web/public"
ALLOW = "--allow-placeholders" in sys.argv

STILLS = {  # deck name -> source (all frames of the campaign film; none mirrored, ledger Q16)
    "cover.jpg":   WEB / "video/hero-poster.jpg",
    "typing.jpg":  WEB / "assets/peter/peter-typing.jpg",
    "bandout.jpg": WEB / "assets/peter/peter-band-out.jpg",
    "tolens.jpg":  WEB / "assets/peter/peter-band-to-lens.jpg",
    "walk.jpg":    WEB / "assets/peter/peter-walk-band.jpg",
    "close.jpg":   WEB / "assets/peter/peter-close.jpg",
    "squat.jpg":   WEB / "assets/peter/peter-squat.jpg",
}

def stills():
    for name, src in STILLS.items():
        im = Image.open(src).convert("RGB")
        if im.width > 1920:
            im = im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)
        im.save(ASSETS / name, "JPEG", quality=82, optimize=True)
    print(f"  stills: {len(STILLS)}")

FREEZE = """
  window.__t = 0;
  performance.now = () => window.__t * 1000;
  const q = [];
  window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
  window.__step = (t) => { window.__t = t; const due = q.splice(0, q.length); due.forEach(cb => cb(t * 1000)); };
"""

def screens(p):
    """The film's two app screens, captured at one instant each (plan §3 slide 7, ledger Q18)."""
    b = p.chromium.launch()
    def grab(page, query, t, out):
        pg = b.new_page(viewport={"width": 620, "height": 1000}, device_scale_factor=2)
        pg.add_init_script(FREEZE)
        pg.goto(page.absolute().as_uri() + query)
        pg.wait_for_timeout(300)
        for k in range(1, int(t * 24) + 1):           # advance the stubbed clock frame by frame
            pg.evaluate(f"window.__step({k / 24:.4f})")
        pg.wait_for_timeout(100)
        pg.screenshot(path=str(out))
        pg.close()
    live = ROOT / "scripts/k7/live_set.html"
    grab(live, "?exercise=Dumbbell%20Biceps%20Curl&weight=12&dur=8&reps=0.67,3.29,5.38,6.96&start=6&done=2&setno=3",
         4.5, ASSETS / "screen_live.png")
    d = json.load(open(ROOT / "input/kickstarter/k8/k8_depth.json"))
    a = json.load(open(ROOT / "input/kickstarter/k8/k8_anchors.json"))
    img = (ROOT / "input/kickstarter/k8/k8_figure.png").as_uri()
    q = ("?fps=%d&img=%s&depth=%s&" % (d["fps"], urllib.parse.quote(img, safe=""), ",".join(str(x) for x in d["depth"]))
         + "&".join(f"{k}={v[0]},{v[1]}" for k, v in a.items()))
    tmax = max(range(len(d["depth"])), key=lambda i: d["depth"][i]) / d["fps"]
    grab(ROOT / "scripts/k8/squat_screen.html", q, tmax, ASSETS / "screen_form.png")
    b.close(); print(f"  screens: live @4.5 s, form @{tmax:.2f} s (deepest)")

def render(p):
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto(HTML.absolute().as_uri()); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(500)
    fonts = pg.evaluate("Promise.all([document.fonts.check('800 20px Montserrat'), document.fonts.check('400 20px Inter')])")
    if not all(fonts): print("  ! Google Fonts not loaded — rendering with the fallback stack", file=sys.stderr)
    missing = pg.evaluate("[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)")
    if missing: sys.exit(f"missing images: {missing}")
    text = pg.evaluate("document.body.innerText")
    ph = re.findall(r"\[(?:ask|N)\]", text)
    if ph and not ALLOW: sys.exit(f"placeholder left in the deck text: {ph} (use --allow-placeholders to override)")
    n = pg.evaluate("document.querySelectorAll('section.slide').length")
    pg.emulate_media(media="print")
    pg.pdf(path=str(PDF), width="1920px", height="1080px", print_background=True, prefer_css_page_size=True,
           margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
    b.close(); return n, all(fonts)

def checks(n_slides):
    info = subprocess.run(["pdfinfo", str(PDF)], capture_output=True, text=True).stdout
    pages = int(re.search(r"Pages:\s+(\d+)", info).group(1)); size = PDF.stat().st_size
    assert pages == n_slides, f"{pages} pages for {n_slides} slides — a slide overflowed its page"
    assert pages <= 15, f"{pages} pages > 15"
    assert size <= 30 * 2**20, f"{size/2**20:.1f} MB > 30 MB"
    return pages, size

def preview(pages):
    subprocess.run(["pdftoppm", "-r", "24", "-png", str(PDF), str(OUT / "_pg")], check=True)
    pngs = sorted(OUT.glob("_pg-*.png")); w, h = Image.open(pngs[0]).size; cols = 4; rows = -(-len(pngs) // cols)
    sheet = Image.new("RGB", (cols * w + (cols + 1) * 12, rows * h + (rows + 1) * 12), (10, 10, 20))
    for i, f in enumerate(pngs):
        sheet.paste(Image.open(f), (12 + (i % cols) * (w + 12), 12 + (i // cols) * (h + 12))); f.unlink()
    sheet.save(OUT / "preview.png"); print(f"  preview: {OUT/'preview.png'} ({cols}×{rows})")

if __name__ == "__main__":
    from playwright.sync_api import sync_playwright
    print("1  stills"); stills()
    with sync_playwright() as p:
        print("2  app screens"); screens(p)
        print("3  render"); n, fonts_ok = render(p)
    print("4  checks"); pages, size = checks(n)
    print("5  preview"); preview(pages)
    print(f"-> {PDF}  {pages} pages  {size/2**20:.2f} MB  fonts={'google' if fonts_ok else 'FALLBACK'}")
