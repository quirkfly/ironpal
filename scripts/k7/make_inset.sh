#!/usr/bin/env bash
#
# K7 inset — record the IronPal "Live set" screen as video for the composite.
#
# Why a built screen and not a POC recording: the app classifies a bicep curl as its NEGATIVE
# class (poc/mobile/src/controller/labels.ts seeds `unknown` with "UNKNOWN: Off-target (Bicep
# Curl)"), so a real recording would display "—". K7 therefore shows a designed interface,
# labelled "Product interface concept" in-frame — see docs/K7_design_plan.md §2.2. K8, which is
# the Bulgarian split squat, is where a real POC recording belongs.
#
# Why not a still with a push-in, as K5: a frozen counter beside a moving arm contradicts the
# only claim this clip makes. The counter has to tick with the curls.
#
# Chrome renders the page and captures frames one at a time against a virtual clock, so the
# output is deterministic — recording a live page in real time drops frames and the counter
# drifts off the curls it is supposed to match.
#
# Usage: scripts/k7/make_inset.sh [seconds] [out.mp4]
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PAGE="${PAGE:-$ROOT/scripts/k7/live_set.html}"   # override for other screens (K8 uses scripts/k8/squat_screen.html)
DUR="${1:-7.0}"   # on-screen time
QUERY="${QUERY:-}"   # screen config, see live_set.html (exercise, weight, reps, ...)
OUT="${2:-$ROOT/input/kickstarter/k7/k7_app_inset.mp4}"
FPS=24

C_G=$'\033[32m'; C_R=$'\033[31m'; C_0=$'\033[0m'
ok(){ printf '  %s✓%s %s\n' "$C_G" "$C_0" "$*"; }
die(){ printf '%sk7: %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 2; }

[ -f "$PAGE" ] || die "page not found: $PAGE"
command -v ffmpeg >/dev/null || die "ffmpeg not found"
mkdir -p "$(dirname "$OUT")"
FRAMES="$(python3 -c "print(int(round($DUR*$FPS)))")"
WORK="$(mktemp -d)"

python3 - "$PAGE" "$WORK" "$FRAMES" "$FPS" "$QUERY" <<'PY' || die "render failed"
import sys, asyncio, pathlib
from playwright.async_api import async_playwright

page_path, work, frames, fps = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--force-color-profile=srgb",
                                          "--disable-lcd-text"])
        pg = await b.new_page(viewport={"width": 620, "height": 1000},
                              device_scale_factor=1)
        # Freeze the page clock BEFORE any page script runs. add_init_script survives
        # navigation; add_script_tag + reload does not — the reload discards the injection and
        # the page silently runs on the wall clock, which makes the counter saturate long
        # before the first screenshot. That bug produced two plausible-looking but untimed takes.
        await pg.add_init_script("""
          window.__t = 0;
          performance.now = () => window.__t * 1000;
          const q = [];
          window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
          window.__step = (t) => { window.__t = t;
            const due = q.splice(0, q.length); due.forEach(cb => cb(t * 1000)); };
        """)
        await pg.goto(pathlib.Path(page_path).absolute().as_uri() + (sys.argv[5] if len(sys.argv) > 5 else ""))
        await pg.wait_for_timeout(250)
        for i in range(frames):
            t = i / fps
            await pg.evaluate("t => window.__step && window.__step(t)", t)
            await pg.screenshot(path=f"{work}/f{i:04d}.png")
        await b.close()

asyncio.run(main())
PY

ffmpeg -loglevel error -y -framerate "$FPS" -i "$WORK/f%04d.png" \
  -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -an "$OUT" || die "encode failed"
rm -rf "$WORK"
ok "$(basename "$OUT")  $(ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$OUT")  ${DUR}s"
