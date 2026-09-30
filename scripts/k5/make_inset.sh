#!/usr/bin/env bash
#
# K5 product inset — a slow push-in on the branded product still.
#
# Why a still and not generated footage: every attempt in this project to have a model render
# the band's branding has failed. Kling floated the logo off the surface under motion; Leonardo
# produced a competitor lookalike. The only asset that carries the ring mark, the wordmark, the
# teal stripe, the lens and the lit LED correctly is this still. Feeding it in as an inset means
# the branding is never Veo's job — the same reasoning as the K3 tracker inset.
#
# The real `reveal.mp4` is NOT the source: it is the anonymous-hand shot that was rejected
# outright, and it is unbranded anyway (frame-checked, no ring, no LED).
#
# A static image sitting on screen for six seconds is dead, so it gets a slow push-in.
#
# Usage: scripts/k5/make_inset.sh [seconds] [out.mp4]
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$ROOT/input/kickstarter/storyboarding/S3/selected.jpg"
DUR="${1:-6.4}"
OUT="${2:-$ROOT/input/kickstarter/k5/k5_product_inset.mp4}"
FPS=24

# Crop to the band itself. The source is 1024x1024 with the band across the upper half and the
# open gym bag below it; the bag is context the inset does not need and detail it cannot spare.
CROP_W=940; CROP_H=560; CROP_X=42; CROP_Y=210
ZOOM_END=1.08      # gentle: enough to feel alive, not enough to read as a move

C_G=$'\033[32m'; C_R=$'\033[31m'; C_0=$'\033[0m'
ok(){ printf '  %s✓%s %s\n' "$C_G" "$C_0" "$*"; }
die(){ printf '%sk5: %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 2; }

[ -f "$SRC" ] || die "product still not found: $SRC"
command -v ffmpeg >/dev/null || die "ffmpeg not found"
mkdir -p "$(dirname "$OUT")"

FRAMES=$(python3 -c "print(int(round($DUR*$FPS)))")
# zoompan works on an upscaled source: zooming a 1x image quantises the motion into visible steps.
ffmpeg -loglevel error -y -loop 1 -framerate $FPS -t "$DUR" -i "$SRC" -filter_complex "
  crop=$CROP_W:$CROP_H:$CROP_X:$CROP_Y,
  scale=$((CROP_W*3)):$((CROP_H*3)),
  zoompan=z='min(1+($ZOOM_END-1)*on/$FRAMES\,$ZOOM_END)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${CROP_W}x${CROP_H}:fps=$FPS,
  format=yuv420p
" -frames:v "$FRAMES" -c:v libx264 -crf 16 -preset slow -an "$OUT" || die "render failed"

ok "$(basename "$OUT")  ${CROP_W}x${CROP_H}  ${DUR}s  push-in to ${ZOOM_END}x"
