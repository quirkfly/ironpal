#!/usr/bin/env bash
# Autonomous motion-energy profile for a workout clip — the model-free triage
# primitive that routes frame extraction WITHOUT a human pointing at timestamps.
#
# Prints, for the WHOLE clip (t=0 -> end), a per-window motion-energy profile plus
# the auto-detected STILL windows (staging -> weight OCR) and MOTION plateau
# (perform -> exercise/reps). See docs/video-analysis-kb/autonomous-frame-selection.md.
#
# Usage: scripts/kb/motion_profile.sh <clip> [sample_fps] [window_s]
#   sample_fps  motion samples per second (default 2)
#   window_s    aggregation window in seconds for the profile (default 5)
#
# Signal source: ffmpeg `scdet` filter emits a per-frame lavfi.scd.score (frame-to-
# frame change energy). High score = motion; low score = still. It is a poor-man's
# IMU: on the product the headband IMU supplies this; on a raw KB clip, pixels do.
set -euo pipefail

clip="${1:?usage: motion_profile.sh <clip> [sample_fps] [window_s]}"
sfps="${2:-2}"
win="${3:-5}"

# Header (duration / resolution) for the report.
ffmpeg -i "$clip" 2>&1 | grep -E "Duration|Stream.*Video" || true

# Raw per-sample motion timeline: "<time> <score>" lines. Downscale to 160px — we
# want gross motion energy, not detail, and it keeps the pass fast on 4K HEVC.
raw="$(ffmpeg -nostdin -hide_banner -i "$clip" \
        -vf "scale=160:-1,fps=${sfps},scdet=s=1:t=0" -f null - 2>&1 \
      | sed -n 's/.*lavfi.scd.score: \([0-9.]*\), lavfi.scd.time: \([0-9.]*\).*/\2 \1/p')"

WIN="$win" python3 - "$raw" <<'PY'
import os, sys, statistics
win = float(os.environ["WIN"])
rows = [l.split() for l in sys.argv[1].splitlines() if l.strip()]
t = [float(a) for a, _ in rows]; s = [float(b) for _, b in rows]
if not s:
    print("no motion samples — clip unreadable or filter unsupported"); sys.exit(1)
med = statistics.median(s)
buckets = {}
for ti, si in zip(t, s):
    buckets.setdefault(int(ti // win), []).append(si)
means = {b: statistics.mean(v) for b, v in buckets.items()}
mx = max(means.values()) or 1.0
print(f"\nsamples={len(s)}  dur~{t[-1]:.0f}s  median={med:.1f}  max={max(s):.1f}\n")
print(f"{'window':>11} | {'motion':>6} | profile")
for b in sorted(means):
    m = means[b]; bar = "#" * int(round(m / mx * 40))
    print(f"{b*win:4.0f}-{b*win+win:>4.0f}s | {m:6.1f} | {bar}")
# Auto-route: still windows (< median) = staging/weight-OCR candidates;
# sustained above-median run = the perform window.
still = [b for b in sorted(means) if means[b] < med]
active = [b for b in sorted(means) if means[b] >= med]
def spans(bs):
    out=[];
    for b in bs:
        if out and b == out[-1][1] + 1: out[-1][1] = b
        else: out.append([b, b])
    return out
w = lambda b: f"{b*win:.0f}s"
print("\n-- auto-route --")
print("STILL windows (weight OCR — extract face-on high-res here, no downscale):",
      ", ".join(f"{w(a)}-{w(z)+win if False else (z+1)*win:.0f}s" for a,z in spans(still)) or "none")
print("PERFORM window (exercise + reps — re-extract >=3fps here):",
      ", ".join(f"{w(a)}-{(z+1)*win:.0f}s" for a,z in spans(active)) or "none")
print("\nAbstain-on-reps check: if the PERFORM window's motion is only marginally")
print("above median and shows no periodicity, this is likely an axial/head-still")
print("lift (e.g. cable pushdown, case 003) — reps are NOT vision-certifiable; say so.")
PY
