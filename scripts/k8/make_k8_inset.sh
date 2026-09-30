#!/usr/bin/env bash
#
# Render the K8 form-analytics inset: the squat screen over the chosen Leonardo figure, driven by
# the per-frame depth signal measured from K8.mp4.
#
# Usage: scripts/k8/make_k8_inset.sh <figure.jpg> [out.mp4]
#   Joint anchors (fractions of the figure panel, x,y) are set per image via env, e.g.
#   SHOULDER=0.46,0.34 HIP=0.60,0.58 KNEE=0.40,0.72 ANKLE=0.47,0.93
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
IMG="${1:?figure image}"; OUT="${2:-$ROOT/input/kickstarter/k8/k8_form_inset.mp4}"
DEPTH_JSON="$ROOT/input/kickstarter/k8/k8_depth.json"
[ -f "$IMG" ] || { echo "no such image: $IMG" >&2; exit 2; }
[ -f "$DEPTH_JSON" ] || { echo "missing $DEPTH_JSON" >&2; exit 2; }

DEPTH="$(python3 -c "import json;d=json.load(open('$DEPTH_JSON'));print(','.join(str(x) for x in d['depth']))")"
FPS="$(python3 -c "import json;print(json.load(open('$DEPTH_JSON'))['fps'])")"
IMGURL="file://$(python3 -c "import os,sys;print(os.path.abspath(sys.argv[1]))" "$IMG")"
Q="?fps=$FPS&img=$IMGURL&depth=$DEPTH"
Q="$Q&shoulder=${SHOULDER:-0.46,0.34}&hip=${HIP:-0.60,0.58}&knee=${KNEE:-0.40,0.72}&ankle=${ANKLE:-0.47,0.93}"

# 8.0 s: he is mid-squat on frame one, so the inset runs the whole clip (design plan §4, ledger Q6).
PAGE="$ROOT/scripts/k8/squat_screen.html" QUERY="$Q" "$ROOT/scripts/k7/make_inset.sh" 8.0 "$OUT"
