#!/usr/bin/env bash
#
# IronPal self-training e2e harness.
#
# Each scenario needs a DIFFERENT IMU fixture, and Maestro has no shell escape, so fixture
# selection happens here: push the .jsonl, push the marker file the app reads
# (`<externalFilesDir>/e2e/replay.json`), then run the flow. Without a marker the app uses the
# real sensor, so nothing here changes how a normal install behaves.
#
# Usage:
#   scripts/e2e/run.sh                 # every scenario
#   scripts/e2e/run.sh 03              # just the flows whose name starts with 03
#   scripts/e2e/run.sh --no-install    # skip build+install, use what is on the device
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MOBILE="$ROOT/poc/mobile"
E2E="$MOBILE/e2e"
FIXTURES="$E2E/fixtures"
APP_ID="com.twentydeka.ironpal"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"
APK="$MOBILE/android/app/build/outputs/apk/release/app-release.apk"
DEVICE_FILES="/sdcard/Android/data/$APP_ID/files"

C_G=$'\033[32m'; C_R=$'\033[31m'; C_Y=$'\033[33m'; C_B=$'\033[34m'; C_0=$'\033[0m'
ok(){ printf '  %s✓%s %s\n' "$C_G" "$C_0" "$*"; }
bad(){ printf '  %s✗%s %s\n' "$C_R" "$C_0" "$*"; }
info(){ printf '%s\n' "$*"; }
die(){ printf '%se2e: %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 2; }

FILTER=""; DO_INSTALL=1
for a in "$@"; do
  case "$a" in
    --no-install) DO_INSTALL=0 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) FILTER="$a" ;;
  esac
done

command -v adb >/dev/null || die "adb not found"
[ -x "$MAESTRO" ] || command -v maestro >/dev/null || die "maestro not found (set \$MAESTRO)"
[ -x "$MAESTRO" ] || MAESTRO="maestro"

# ---- device ---------------------------------------------------------------
DEVICE="${DEVICE:-$(adb devices | awk '$2=="device"{print $1; exit}')}"
[ -n "$DEVICE" ] || die "no device in state 'device' (adb devices)"
info "device: ${C_B}$DEVICE${C_0}"

# ---- fixtures -------------------------------------------------------------
[ -d "$FIXTURES" ] || python3 "$ROOT/scripts/e2e/make_imu_fixtures.py" || die "fixture generation failed"

# ---- build + install ------------------------------------------------------
if [ "$DO_INSTALL" = 1 ]; then
  info "building release APK…"
  ( cd "$MOBILE/android" \
    && JAVA_HOME="${JAVA_HOME:-$HOME/.gradle/jdks/eclipse_adoptium-17-amd64-linux.2}" \
       ./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a --console=plain -q ) \
    || die "build failed"
  ok "built $(basename "$APK")"
  # Play Protect blocks sideloads behind a dialog; bypass for the install, restore straight after.
  PREV_VERIFY="$(adb -s "$DEVICE" shell settings get global verifier_verify_adb_installs | tr -d '\r')"
  adb -s "$DEVICE" shell settings put global verifier_verify_adb_installs 0 >/dev/null 2>&1
  adb -s "$DEVICE" install -r -d "$APK" >/dev/null 2>&1 || die "install failed"
  if [ "$PREV_VERIFY" = "null" ] || [ -z "$PREV_VERIFY" ]; then
    adb -s "$DEVICE" shell settings delete global verifier_verify_adb_installs >/dev/null 2>&1
  else
    adb -s "$DEVICE" shell settings put global verifier_verify_adb_installs "$PREV_VERIFY" >/dev/null 2>&1
  fi
  ok "installed $APP_ID (install verification restored)"
fi

# The app must have been launched once for its external files dir to exist.
adb -s "$DEVICE" shell "mkdir -p $DEVICE_FILES/e2e" >/dev/null 2>&1 || true

# --no-install is a footgun: a stale APK fails every flow for reasons that look like app bugs
# (it cost a full 6/6 red run once). Compare what is installed against the local artefact and
# say so loudly rather than letting the suite lie.
if [ "$DO_INSTALL" = 0 ] && [ -f "$APK" ]; then
  REMOTE_PATH="$(adb -s "$DEVICE" shell pm path "$APP_ID" 2>/dev/null | tr -d '\r' | sed 's/^package://')"
  if [ -n "$REMOTE_PATH" ]; then
    REMOTE_MD5="$(adb -s "$DEVICE" shell md5sum "$REMOTE_PATH" 2>/dev/null | awk '{print $1}')"
    LOCAL_MD5="$(md5sum "$APK" | awk '{print $1}')"
    if [ -n "$REMOTE_MD5" ] && [ "$REMOTE_MD5" != "$LOCAL_MD5" ]; then
      printf '%s!%s the installed APK differs from %s\n' "$C_Y" "$C_0" "${APK#$ROOT/}"
      printf '   flows will exercise a STALE build — re-run without --no-install\n'
    else
      ok "installed APK matches the local build"
    fi
  fi
fi

# ---- scenarios: flow -> fixture -------------------------------------------
# A flow that needs no particular motion still gets a fixture, so every run is deterministic.
declare -A FIXTURE=(
  [01-campaign-map]=split-squat-8reps
  [02-session-and-hud]=split-squat-8reps
  [03-labeling-round]=split-squat-8reps
  [04-quality-gates]=real-stationary
  [05-hard-class]=case003-pushdown-5reps
  [06-inspector-benchmark]=split-squat-8reps
)
ORDER=(01-campaign-map 02-session-and-hud 03-labeling-round 04-quality-gates 05-hard-class 06-inspector-benchmark)

push_fixture() { # $1 = fixture basename
  local fx="$1"
  local src="$FIXTURES/$fx.jsonl"
  [ -f "$src" ] || die "fixture not found: $src"
  # Clear app state HERE rather than via Maestro's `clearState`: `pm clear` also wipes
  # /sdcard/Android/data/<pkg>/, so clearing after the push would delete the fixture and the
  # app would quietly fall back to the real sensor — a green flow proving nothing.
  adb -s "$DEVICE" shell pm clear "$APP_ID" >/dev/null 2>&1 || true
  adb -s "$DEVICE" shell "mkdir -p $DEVICE_FILES/e2e" >/dev/null 2>&1 || true
  adb -s "$DEVICE" push "$src" "$DEVICE_FILES/e2e/replay.jsonl" >/dev/null 2>&1 || die "push failed"
  [ -f "$FIXTURES/$fx.meta.json" ] && \
    adb -s "$DEVICE" push "$FIXTURES/$fx.meta.json" "$DEVICE_FILES/e2e/meta.json" >/dev/null 2>&1
  # The marker is what makes the app choose the REPLAY source at session start.
  local marker; marker="$(mktemp)"
  printf '{"file":"e2e/replay.jsonl","loop":true,"label":"%s"}\n' "$fx" > "$marker"
  adb -s "$DEVICE" push "$marker" "$DEVICE_FILES/e2e/replay.json" >/dev/null 2>&1 || die "marker push failed"
  rm -f "$marker"
}

RESULTS=(); FAILED=0
mkdir -p "$ROOT/out/e2e"

for flow in "${ORDER[@]}"; do
  [ -n "$FILTER" ] && [[ "$flow" != "$FILTER"* ]] && continue
  fx="${FIXTURE[$flow]}"
  info ""
  info "${C_B}── $flow${C_0}  (fixture: $fx)"
  push_fixture "$fx"
  log="$ROOT/out/e2e/$flow.log"
  if "$MAESTRO" --device "$DEVICE" test "$E2E/$flow.yaml" >"$log" 2>&1; then
    ok "$flow"
    RESULTS+=("PASS $flow")
  else
    bad "$flow  (log: out/e2e/$flow.log)"
    tail -20 "$log" | sed 's/^/      /'
    RESULTS+=("FAIL $flow")
    FAILED=$((FAILED+1))
  fi
done

# Leave the device in its normal state: no marker = real sensor.
adb -s "$DEVICE" shell "rm -f $DEVICE_FILES/e2e/replay.json" >/dev/null 2>&1 || true

info ""
info "════ summary ════"
for r in "${RESULTS[@]}"; do
  case "$r" in PASS*) ok "${r#PASS }";; *) bad "${r#FAIL }";; esac
done
if [ "$FAILED" -gt 0 ]; then
  printf '%se2e: %d flow(s) failed%s\n' "$C_R" "$FAILED" "$C_0"
  exit 1
fi
printf '%se2e: all flows passed%s  (replay marker removed — device back on the real sensor)\n' "$C_G" "$C_0"
