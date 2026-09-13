#!/usr/bin/env python3
"""Draw the IronPal Campaign HUD glyphs locally as SVG (+ PNG previews).

Why code and not Leonardo: a crosshair, hit marker, bracket pair, ammo row or six-segment
gauge must be exact, symmetrical and tintable at runtime. The first Leonardo test turned
`hud_hitmarker` into a 3D crystal (docs/ironpal-game-asset-prompts.md, "hud-drawn-locally").

Output:
  poc/mobile/assets/game/hud/<id>.svg      -- runtime asset (react-native-svg), currentColor-tinted
  input/game-assets/hud-preview/<id>.png   -- 512 px preview on the brand charcoal, for review

Usage:
  python3 scripts/game/draw-hud.py            # all glyphs
  python3 scripts/game/draw-hud.py --only hud_hitmarker
"""
import argparse, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SVG_OUT = os.path.join(ROOT, "poc/mobile/assets/game/hud")
PNG_OUT = os.path.join(ROOT, "input/game-assets/hud-preview")

TEAL, LIME, GUN, ICE, WARN, CHAR = "#00E5CC", "#BFFF00", "#8E8E9A", "#F0F4F8", "#FF6B35", "#1A1A2E"
S = 256  # viewBox size; glyphs are drawn in a 256 x 256 box, centred at (128,128)


def svg(body, glow=None):
    """Wrap a body in an SVG with an optional soft glow filter."""
    defs = ""
    if glow:
        defs = ('<defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%">'
                '<feGaussianBlur stdDeviation="4" result="b"/>'
                '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>'
                '</filter></defs>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" fill="none" '
            'stroke-linecap="square" stroke-linejoin="miter">%s%s</svg>' % (S, S, defs, body))


def crosshair(locked):
    c, r_ring = 128, 60
    tick_len, gap = (26, 22) if locked else (22, 34)
    col = TEAL if locked else GUN
    ring = ('<circle cx="%d" cy="%d" r="%d" stroke="%s" stroke-width="%s" opacity="%s"%s/>'
            % (c, c, r_ring, TEAL, 4 if locked else 2, "1" if locked else "0.45",
               ' filter="url(#g)"' if locked else ""))
    ticks = ""
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        x1, y1 = c + dx * gap, c + dy * gap
        x2, y2 = c + dx * (gap + tick_len), c + dy * (gap + tick_len)
        ticks += '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="6"/>' % (x1, y1, x2, y2, col)
    brackets = ""
    if locked:
        b = 44
        for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
            x, y = c + sx * b, c + sy * b
            brackets += ('<path d="M%d %d h%d M%d %d v%d" stroke="%s" stroke-width="5" filter="url(#g)"/>'
                         % (x, y, -sx * 16, x, y, -sy * 16, TEAL))
    dot = '<circle cx="%d" cy="%d" r="3" fill="%s"/>' % (c, c, ICE)
    return svg(ring + ticks + brackets + dot, glow=locked)


def hitmarker(color, ring):
    c, inner, outer = 128, 22, 58
    body = ""
    for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        body += ('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="9" filter="url(#g)"/>'
                 % (c + sx * inner, c + sy * inner, c + sx * outer, c + sy * outer, color))
    if ring:
        body += '<circle cx="128" cy="128" r="84" stroke="%s" stroke-width="3" opacity="0.8"/>' % color
    return svg(body, glow=True)


def gate(open_):
    if open_:
        body = ('<path d="M92 76 h-30 v104 h30" stroke="%s" stroke-width="7" filter="url(#g)"/>'
                '<path d="M164 76 h30 v104 h-30" stroke="%s" stroke-width="7" filter="url(#g)"/>'
                '<circle cx="128" cy="128" r="7" fill="%s"/>' % (TEAL, TEAL, ICE))
        return svg(body, glow=True)
    body = ('<rect x="62" y="118" width="132" height="20" fill="%s"/>'
            '<rect x="62" y="118" width="132" height="20" stroke="%s" stroke-width="2" opacity="0.5"/>'
            % (GUN, TEAL))
    return svg(body)


def link_lost():
    arcs = "".join('<path d="M%d 168 a%d %d 0 0 1 %d 0" stroke="%s" stroke-width="7" opacity="%s"/>'
                   % (128 - r, r, r, 2 * r, GUN, o) for r, o in ((30, "1"), (56, "0.75"), (82, "0.5")))
    slash = '<line x1="70" y1="196" x2="186" y2="60" stroke="%s" stroke-width="10" filter="url(#g)"/>' % WARN
    dot = '<circle cx="128" cy="170" r="8" fill="%s"/>' % GUN
    return svg(arcs + dot + slash, glow=True)


def armor(lit=4, total=6):
    """Six hexagonal segments in a row; the first `lit` are teal."""
    body = ""
    w, h, gap = 30, 38, 6
    x0 = 128 - (total * (w + gap) - gap) / 2
    for i in range(total):
        x = x0 + i * (w + gap)
        col = TEAL if i < lit else GUN
        pts = "%s,%s %s,%s %s,%s %s,%s %s,%s %s,%s" % (
            x + w / 2, 128 - h / 2, x + w, 128 - h / 4, x + w, 128 + h / 4,
            x + w / 2, 128 + h / 2, x, 128 + h / 4, x, 128 - h / 4)
        body += '<polygon points="%s" fill="%s" opacity="%s"%s/>' % (
            pts, col, "1" if i < lit else "0.45", ' filter="url(#g)"' if i < lit else "")
    return svg(body, glow=True)


def magazine(lit=3, total=5):
    body = ""
    w, h, gap = 22, 70, 10
    x0 = 128 - (total * (w + gap) - gap) / 2
    for i in range(total):
        x = x0 + i * (w + gap)
        col = TEAL if i < lit else GUN
        body += '<rect x="%s" y="%s" width="%s" height="%s" rx="4" fill="%s" opacity="%s"%s/>' % (
            x, 128 - h / 2, w, h, col, "1" if i < lit else "0.4", ' filter="url(#g)"' if i < lit else "")
    return svg(body, glow=True)


def target_plate():
    body = ('<circle cx="128" cy="128" r="62" fill="%s"/><circle cx="128" cy="128" r="14" fill="%s"/>'
            '<circle cx="128" cy="128" r="92" stroke="%s" stroke-width="3" stroke-dasharray="14 10" filter="url(#g)"/>'
            % (GUN, CHAR, TEAL))
    return svg(body, glow=True)


def target_pin(lit=3, total=7):
    body = ""
    ph, gap, w = 14, 4, 90
    y0 = 128 - (total * (ph + gap) - gap) / 2
    for i in range(total):
        y = y0 + i * (ph + gap)
        body += '<rect x="%s" y="%s" width="%s" height="%s" rx="2" fill="%s"/>' % (128 - w / 2, y, w, ph, GUN)
        if i == lit:
            body += ('<rect x="%s" y="%s" width="30" height="%s" rx="3" fill="%s" filter="url(#g)"/>'
                     % (128 + w / 2 - 6, y - 1, ph + 2, TEAL))
    body += '<circle cx="128" cy="128" r="96" stroke="%s" stroke-width="3" stroke-dasharray="14 10"/>' % TEAL
    return svg(body, glow=True)


def target_dumbbell():
    body = ('<rect x="70" y="112" width="116" height="32" rx="6" fill="%s"/>'
            '<rect x="40" y="92" width="34" height="72" rx="6" fill="%s"/>'
            '<rect x="182" y="92" width="34" height="72" rx="6" fill="%s"/>'
            '<circle cx="128" cy="128" r="100" stroke="%s" stroke-width="3" stroke-dasharray="14 10" filter="url(#g)"/>'
            % (GUN, GUN, GUN, TEAL))
    return svg(body, glow=True)


GLYPHS = {
    "hud_crosshair_idle": lambda: crosshair(False),
    "hud_crosshair_locked": lambda: crosshair(True),
    "hud_hitmarker": lambda: hitmarker(ICE, False),
    "hud_hitmarker_bonus": lambda: hitmarker(LIME, True),
    "hud_gate_open": lambda: gate(True),
    "hud_gate_close": lambda: gate(False),
    "hud_link_lost": link_lost,
    "hud_armor_meter": lambda: armor(4, 6),
    "hud_magazine": lambda: magazine(3, 5),
    "hud_target_plate": target_plate,
    "hud_target_pin": target_pin,
    "hud_target_dumbbell": target_dumbbell,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only")
    args = ap.parse_args()
    os.makedirs(SVG_OUT, exist_ok=True); os.makedirs(PNG_OUT, exist_ok=True)
    try:
        import cairosvg
    except ImportError:
        cairosvg = None
        print("cairosvg missing: SVGs only, no PNG previews", file=sys.stderr)
    for wid, fn in GLYPHS.items():
        if args.only and wid != args.only:
            continue
        doc = fn()
        with open(os.path.join(SVG_OUT, wid + ".svg"), "w") as f:
            f.write(doc)
        if cairosvg:
            preview = doc.replace('fill="none"', 'fill="none" style="background:%s"' % CHAR, 1)
            preview = preview.replace('>', '><rect width="256" height="256" fill="%s"/>' % CHAR, 1)
            cairosvg.svg2png(bytestring=preview.encode(), write_to=os.path.join(PNG_OUT, wid + ".png"),
                             output_width=512, output_height=512)
        print("drew", wid)


if __name__ == "__main__":
    main()
