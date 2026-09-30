#!/usr/bin/env bash
#
# K3 PIP recorder — screen-records a real workout tracker being thumb-typed.
#
# The flow (scripts/k3/manual-log.yaml) does the driving AND the recording: Maestro's
# startRecording/stopRecording bracket the capture inside the run, which is the only way to
# avoid the 60-70s of static screen Maestro's own driver install puts in front of an
# externally started recorder. This script does what Maestro cannot: touch indicators, and
# the crop.
#
# The crop is not cosmetic. The full screen carries the app's name, its orange primary button
# and its bottom navigation, and the promo frames this UI as the clumsy old way — an
# identifiable competitor's branding in that role is the exact problem this project already
# ruled out once (the "never a Fitbod screenshot and never the name" note on `old_log_typing`
# in the promo config, and docs/video-production-execution-plan.md). Cropping to the set block
# keeps the real interaction and drops every identifying mark.
#
# Usage:
#   scripts/k3/record.sh                  # record, crop
#   scripts/k3/record.sh --raw            # keep the uncropped capture as well
#   DEVICE=R58T13ECWNL scripts/k3/record.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FLOW="$ROOT/scripts/k3/manual-log.yaml"
OUTDIR="$ROOT/input/kickstarter/k3"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"
STAMP="$(date +%Y%m%d-%H%M%S)"
EXERCISE="${EXERCISE:-Front Squat}"   # must match the movement in the generated K3 clip

# Crop: x y w h on the 1080x2400 panel. Measured, not guessed: the ink bounding box over a
# whole take runs y 290-1340, so the top edge sits just above the exercise title and the
# bottom edge just under the keypad's last row. Everything identifying is outside it — the
# app's back-arrow row above, its orange primary button and bottom navigation below.
CROP_W=1080; CROP_H=1050; CROP_X=0; CROP_Y=290

C_G=$'\033[32m'; C_R=$'\033[31m'; C_B=$'\033[34m'; C_0=$'\033[0m'
ok(){   printf '  %s✓%s %s\n' "$C_G" "$C_0" "$*"; }
info(){ printf '%s\n' "$*"; }
die(){  printf '%sk3: %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 2; }

KEEP_RAW=0
for a in "$@"; do
  case "$a" in
    --raw) KEEP_RAW=1 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
  esac
done

command -v adb >/dev/null || die "adb not found"
[ -x "$MAESTRO" ] || MAESTRO="maestro"
command -v "$MAESTRO" >/dev/null || die "maestro not found (set \$MAESTRO)"
command -v ffmpeg >/dev/null || die "ffmpeg not found"
[ -f "$FLOW" ] || die "flow missing: $FLOW"

DEVICE="${DEVICE:-$(adb devices | awk '$2=="device"{print $1; exit}')}"
[ -n "$DEVICE" ] || die "no device in state 'device' (adb devices)"
info "device: ${C_B}$DEVICE${C_0}"
mkdir -p "$OUTDIR"

# Touch indicators: the PIP has to show the thumb landing, and a screen capture does not
# composite the pointer otherwise. Restored on exit however this script leaves.
PREV_TOUCHES="$(adb -s "$DEVICE" shell settings get system show_touches 2>/dev/null | tr -d '\r')"
[ "$PREV_TOUCHES" = "null" ] && PREV_TOUCHES=0
cleanup(){ adb -s "$DEVICE" shell settings put system show_touches "$PREV_TOUCHES" >/dev/null 2>&1; }
trap cleanup EXIT
adb -s "$DEVICE" shell settings put system show_touches 1 >/dev/null

# startRecording writes relative to the working directory, so run from a scratch dir and
# collect the file from there rather than letting it land wherever the shell happens to be.
WORK="$(mktemp -d)"
info "running flow… (exercise: ${C_B}$EXERCISE${C_0})"
( cd "$WORK" && "$MAESTRO" --device "$DEVICE" test -e EXERCISE="$EXERCISE" "$FLOW" ) 2>&1 | grep -vE "^(Tap|Assert|Wait|Start|Stop)" | sed '/^$/d'
FLOW_RC=${PIPESTATUS[0]}

RAW="$(ls "$WORK"/k3_take* 2>/dev/null | head -1)"
[ -n "$RAW" ] || die "flow produced no recording (exit $FLOW_RC)"
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$RAW")"
ok "captured $(basename "$RAW")  ${DUR}s"

CUT="$OUTDIR/k3_manual_log_$STAMP.mp4"
ffmpeg -loglevel error -y -i "$RAW" \
  -vf "crop=$CROP_W:$CROP_H:$CROP_X:$CROP_Y" \
  -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -an "$CUT" || die "crop failed"
ok "cropped $(basename "$CUT")  ${CROP_W}x${CROP_H}"

# First frame as a still, so the exercise on screen can be confirmed at a glance — the
# assertion alone cannot, see the caveat in the flow.
ffmpeg -loglevel error -y -i "$CUT" -frames:v 1 "${CUT%.mp4}_frame1.png" && ok "$(basename "${CUT%.mp4}_frame1.png")"

[ "$KEEP_RAW" = 1 ] && { cp "$RAW" "$OUTDIR/k3_raw_$STAMP.mp4"; ok "kept raw"; }
rm -rf "$WORK"

[ "$FLOW_RC" = 0 ] || die "flow exited $FLOW_RC (recording kept)"
ok "done — $CUT"
