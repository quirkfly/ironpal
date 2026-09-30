#!/usr/bin/env bash
# Render the two app screens for the web hero, from the measured files (plan §6.2). Nothing typed.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
W="$ROOT/input/kickstarter/web"
REPS="$(python3 -c "import json;print(','.join(str(t) for t in json.load(open('$W/k7_web_reps.json'))['tops_s']))")"
DEPTH="$(python3 -c "import json;print(','.join(str(x) for x in json.load(open('$W/k8_web_depth.json'))['depth']))")"
A="$(python3 -c "import json;a=json.load(open('$ROOT/input/kickstarter/k8/k8_anchors.json'));print('&'.join(f'{k}={v[0]},{v[1]}' for k,v in a.items()))")"
IMG="file://$ROOT/input/kickstarter/k8/k8_figure.png"

echo "K7 screen: reps=$REPS"
QUERY="?exercise=Dumbbell%20Biceps%20Curl&weight=5&dur=8&reps=$REPS&start=6&done=2&setno=3" \
  "$ROOT/scripts/k7/make_inset.sh" 8.0 "$W/k7_web_inset.mp4"

echo "K8 screen: $(python3 -c "import json;d=json.load(open('$W/k8_web_depth.json'));print(len(d['depth']),'depth values, bottoms',d['bottoms'])")"
PAGE="$ROOT/scripts/k8/squat_screen.html" QUERY="?fps=24&img=$IMG&depth=$DEPTH&$A" \
  "$ROOT/scripts/k7/make_inset.sh" 8.0 "$W/k8_web_inset.mp4"
