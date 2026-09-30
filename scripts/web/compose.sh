#!/usr/bin/env bash
# The hero master (plan §2): mask the K7 ghost figure, lay the two app screens over K7 and K8 at the
# MEASURED geometry (layout.json), join K5·K7·K8 with 0.5 s dissolves, close with a dissolve into a
# held K5 frame 0 so the browser's loop lands on the picture it just reached, strip audio, encode.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
W="$ROOT/input/kickstarter/web"; C=~/job_stuff/prj/geggen/products/ironpal/clips/web; V="$ROOT/web/public/video"
mkdir -p "$V"
g(){ python3 -c "import json;l=json.load(open('$W/layout.json'));print(l['$1']['inset']['$2'])"; }
XF=0.5

if [ "${1:-}" != "--join-only" ]; then
echo "1/5 mask the K7 ghost figure"
ffmpeg -loglevel error -y -i "$C/K7.mp4" -i "$W/k7_ghost_mask.png" \
  -filter_complex "[0:v][1:v]overlay=0:0:format=auto[v]" -map "[v]" -an \
  -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p "$W/k7_masked.mp4"

echo "2/5 overlay the screens (K7 $(g K7 w)@$(g K7 x),$(g K7 y) · K8 $(g K8 w)@$(g K8 x),$(g K8 y))"
"$ROOT/scripts/k7/compose_inset.sh" "$W/k7_masked.mp4" "$W/k7_web_inset.mp4" "$W/k7_web_composed.mp4" "$(g K7 w)" "$(g K7 x)" "$(g K7 y)" 0.0
"$ROOT/scripts/k7/compose_inset.sh" "$C/K8.mp4"        "$W/k8_web_inset.mp4" "$W/k8_web_composed.mp4" "$(g K8 w)" "$(g K8 x)" "$(g K8 y)" 0.0

fi
echo "3/5 join with dissolves + loop seam"
# K5 (8) ⨯ K7c (8) ⨯ K8c (8), each dissolve overlaps 0.5 s → 23.0 s; then dissolve into K5 frame 0
# held for 0.5 s → the file ends ON frame 0 of K5, so the loop continues seamlessly into frame 1.
ffmpeg -loglevel error -y -i "$C/K5.mp4" -i "$W/k7_web_composed.mp4" -i "$W/k8_web_composed.mp4" \
  -filter_complex "
    [0:v]fps=24,format=yuv420p,setpts=PTS-STARTPTS,split=2[a][a2];
    [1:v]fps=24,format=yuv420p,setpts=PTS-STARTPTS[b];
    [2:v]fps=24,format=yuv420p,setpts=PTS-STARTPTS[c];
    [a2]trim=end_frame=1,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=$XF[hold];
    [a][b]xfade=transition=fade:duration=$XF:offset=7.5[ab];
    [ab][c]xfade=transition=fade:duration=$XF:offset=15.0[abc];
    [abc][hold]xfade=transition=fade:duration=$XF:offset=22.5[v]" \
  -map "[v]" -an -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p "$C/hero_master.mp4"

echo "4/5 web encodes"
ffmpeg -loglevel error -y -i "$C/hero_master.mp4" -an -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart "$V/hero.mp4"
ffmpeg -loglevel error -y -i "$C/hero_master.mp4" -an -c:v libvpx-vp9 -crf 33 -b:v 0 -deadline good -cpu-used 2 -row-mt 1 -pix_fmt yuv420p "$V/hero.webm"

echo "5/5 result"
for f in "$C/hero_master.mp4" "$V/hero.mp4" "$V/hero.webm"; do
  printf "  %-60s %6.2fs  %5.1f MB\n" "$(basename "$f")" "$(ffprobe -v error -show_entries format=duration -of csv=p=0:nk=1 "$f")" "$(python3 -c "import os;print(os.path.getsize('$f')/1e6)")"
done
