#!/usr/bin/env bash
#
# K7 inset (take 2) — record the real IronPal HUD running a curl set.
#
# Mirrors scripts/e2e/run.sh's fixture mechanism, which is the only reason the reps are
# deterministic: push the IMU trace, push its meta, then write the marker file the app reads at
# session start. Without the marker the app uses the real sensor and a phone on a desk shows zero.
#
# Fixture: case001-curl-6reps — "alternating DB curl, 6 reps/arm confirmed", 15 s, from KB case 001.
#
# Usage: scripts/k7/record_hud.sh [fixture] [out.mp4]
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MOBILE="$ROOT/poc/mobile"
FIXTURES="$MOBILE/e2e/fixtures"
FLOW="${FLOW:-$ROOT/scripts/k7/liveset_demo.yaml}"
APP_ID="com.twentydeka.ironpal"
DEVICE_FILES="/sdcard/Android/data/$APP_ID/files"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"
FX="${1:-case001-curl-6reps}"
OUT="${2:-$ROOT/input/kickstarter/k7/k7_liveset.mp4}"

C_G=$'\033[32m'; C_R=$'\033[31m'; C_B=$'\033[34m'; C_0=$'\033[0m'
ok(){ printf '  %s✓%s %s\n' "$C_G" "$C_0" "$*"; }
info(){ printf '%s\n' "$*"; }
die(){ printf '%sk7: %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 2; }

command -v adb >/dev/null || die "adb not found"
[ -x "$MAESTRO" ] || MAESTRO="maestro"
[ -f "$FIXTURES/$FX.jsonl" ] || die "fixture not found: $FIXTURES/$FX.jsonl"

DEVICE="${DEVICE:-$(adb devices | awk '$2=="device"{print $1; exit}')}"
[ -n "$DEVICE" ] || die "no device"
adb -s "$DEVICE" shell pm list packages | grep -q "$APP_ID" || die "$APP_ID not installed on $DEVICE"
info "device: ${C_B}$DEVICE${C_0}   fixture: ${C_B}$FX${C_0}"
mkdir -p "$(dirname "$OUT")"

# ---- install the replay fixture ------------------------------------------
# Only the mission-HUD flow needs this. The Live set screen is tap-driven, so the fixture is
# skipped unless FIXTURE_NEEDED=1 — pushing a replay marker for a flow that does not read the
# sensor would leave the app in replay mode for no reason.
if [ "${FIXTURE_NEEDED:-0}" = 1 ]; then
adb -s "$DEVICE" shell "mkdir -p $DEVICE_FILES/e2e" >/dev/null 2>&1
adb -s "$DEVICE" push "$FIXTURES/$FX.jsonl" "$DEVICE_FILES/e2e/replay.jsonl" >/dev/null 2>&1 \
  || die "fixture push failed"
[ -f "$FIXTURES/$FX.meta.json" ] && \
  adb -s "$DEVICE" push "$FIXTURES/$FX.meta.json" "$DEVICE_FILES/e2e/meta.json" >/dev/null 2>&1
MARKER="$(mktemp)"
printf '{"file":"e2e/replay.jsonl","loop":true,"label":"%s"}\n' "$FX" > "$MARKER"
adb -s "$DEVICE" push "$MARKER" "$DEVICE_FILES/e2e/replay.json" >/dev/null 2>&1 \
  || die "marker push failed"
rm -f "$MARKER"
ok "replay fixture installed"
fi

# The marker is what makes a normal install behave differently, so it is always removed again —
# leaving it behind would silently put the founder's own phone into replay mode.
cleanup(){ [ "${FIXTURE_NEEDED:-0}" = 1 ] && adb -s "$DEVICE" shell "rm -f $DEVICE_FILES/e2e/replay.json" >/dev/null 2>&1; }
trap cleanup EXIT

WORK="$(mktemp -d)"
info "running flow…"
( cd "$WORK" && "$MAESTRO" --device "$DEVICE" test "$FLOW" ) 2>&1 \
  | grep -vE "^(Tap|Assert|Wait|Scroll|Launch|Start|Stop|Extended)" | sed '/^$/d'
RC=${PIPESTATUS[0]}

RAW="$(ls "$WORK"/k7_* 2>/dev/null | head -1)"
if [ -n "$RAW" ]; then
  cp "$RAW" "$OUT"
  ok "$(basename "$OUT")  $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s"
else
  printf '%sno recording produced (flow exit %s)%s\n' "$C_R" "$RC" "$C_0"
fi
rm -rf "$WORK"
[ "$RC" = 0 ] || die "flow exited $RC"
