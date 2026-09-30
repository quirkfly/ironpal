#!/usr/bin/env bash
#
# Lay an app-screen inset over a generated clip (K3's mechanism, generalised).
#
# Geometry is NOT reused between clips: K5's numbers failed to transfer twice, so the caller
# passes the measured values and the defaults here are only a starting point. Measure the
# subject's right edge in the actual clip first.
#
# Usage: scripts/k7/compose_inset.sh CLIP INSET OUT [W] [X] [Y] [IN_AT]
set -uo pipefail
CLIP="$1"; INSET="$2"; OUT="$3"
IW="${4:-500}"; IX="${5:-1380}"; IY="${6:-90}"; IN_AT="${7:-0.0}"
FADE_IN=0.30; FADE_OUT=0.35

C_G=$'\033[32m'; C_R=$'\033[31m'; C_0=$'\033[0m'
die(){ printf '%scompose: %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 2; }
[ -f "$CLIP" ] || die "clip not found: $CLIP"
[ -f "$INSET" ] || die "inset not found: $INSET"

CDUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP")"
ON="$(python3 -c "print(round($CDUR - $IN_AT, 3))")"
FOUT="$(python3 -c "print(round($CDUR - $IN_AT - $FADE_OUT, 3))")"

# tpad holds the inset's last frame to the end of the clip; without it the screen vanishes
# mid-shot. The trim makes the fade-out arithmetic well defined.
ffmpeg -loglevel error -y -i "$CLIP" -i "$INSET" -filter_complex "
  [1:v]scale=$IW:-2,fps=24,tpad=stop=-1:stop_mode=clone,trim=duration=$ON,setpts=PTS-STARTPTS,
       format=yuva420p,
       fade=t=in:st=0:d=$FADE_IN:alpha=1,
       fade=t=out:st=$FOUT:d=$FADE_OUT:alpha=1,
       setpts=PTS-STARTPTS+$IN_AT/TB[pip];
  [0:v][pip]overlay=$IX:$IY:eof_action=pass[v]
" -map "[v]" $(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$CLIP" >/dev/null 2>&1 && echo "-map 0:a?") \
  -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -t "$CDUR" "$OUT" \
  || die "compose failed"

printf '  %s✓%s %s  inset %sx? at %s,%s  in at %ss\n' "$C_G" "$C_0" "$(basename "$OUT")" "$IW" "$IX" "$IY" "$IN_AT"
