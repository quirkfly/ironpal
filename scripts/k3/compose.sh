#!/usr/bin/env bash
#
# K3 composite — the generated clip with the tracker-app inset laid over it.
#
# The inset is what carries the meaning of this shot. The clip deliberately hides the phone
# screen (it faces the founder, away from the lens — see docs/IRONPAL_PROMO_VIDEO_SCRIPT_V1.md
# §5.4 for why asking Veo to render a UI is a trap), so without this composite K3 is a man
# looking at a phone for no stated reason.
#
# Geometry is driven by where he actually stands: he occupies the left and centre, and the
# right third is dim gym. The inset sits in that right third, clear of his body and of the
# barbell behind him.
#
# Usage: scripts/k3/compose.sh [clip.mp4] [pip.mp4] [out.mp4]
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLIPS="$ROOT/../geggen/products/ironpal/clips"
CLIP="${1:-$CLIPS/Man_typing_into_phone_1080p_20260928234101.mp4}"
PIP="${2:-$ROOT/input/kickstarter/k3/k3_pip_6s4.mp4}"
OUT="${3:-$CLIPS/K3_composed.mp4}"

PIP_W=520          # inset width; the right third is 640px, this leaves a margin either side
MARGIN_R=60
MARGIN_TOP=250     # eye level rather than crowding the lower third
IN_AT=1.2          # the inset arrives after he has started typing, not on frame one
FADE_IN=0.35
FADE_OUT=0.40   # the clip darkens over its final two frames; a held bright inset flashes on them
TEAL="0x00E5CC"    # the IronPal accent, per docs/color-schemes.md
BORDER=3

C_G=$'\033[32m'; C_R=$'\033[31m'; C_0=$'\033[0m'
ok(){ printf '  %s✓%s %s\n' "$C_G" "$C_0" "$*"; }
die(){ printf '%sk3: %s%s\n' "$C_R" "$*" "$C_0" >&2; exit 2; }

[ -f "$CLIP" ] || die "clip not found: $CLIP"
[ -f "$PIP" ]  || die "pip not found: $PIP"
command -v ffmpeg >/dev/null || die "ffmpeg not found"

IFS=, read -r CW CH < <(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$CLIP")
CDUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP")"
IFS=, read -r PW PH < <(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$PIP")
PIP_H=$(python3 -c "print(int(round($PIP_W*$PH/$PW/2))*2)")
X=$((CW - PIP_W - MARGIN_R - BORDER*2))
Y=$MARGIN_TOP

# The inset is shorter than the clip, so its final frame is held with tpad — otherwise the app
# vanishes mid-sentence and the shot loses its subject before the line lands. It is then trimmed
# to exactly the time it is on screen so the fade-out has well-defined arithmetic, and faded out
# at the end because the source clip drops from Y=60 to Y=39 over its final two frames.
ON="$(python3 -c "print(round($CDUR - $IN_AT, 3))")"
FOUT_AT="$(python3 -c "print(round($CDUR - $IN_AT - $FADE_OUT, 3))")"
ffmpeg -loglevel error -y -i "$CLIP" -i "$PIP" -filter_complex "
  [1:v]scale=$PIP_W:$PIP_H,fps=24,
       pad=iw+$((BORDER*2)):ih+$((BORDER*2)):$BORDER:$BORDER:$TEAL,
       tpad=stop=-1:stop_mode=clone,trim=duration=$ON,setpts=PTS-STARTPTS,
       format=yuva420p,
       fade=t=in:st=0:d=$FADE_IN:alpha=1,
       fade=t=out:st=$FOUT_AT:d=$FADE_OUT:alpha=1,
       setpts=PTS-STARTPTS+$IN_AT/TB[pip];
  [0:v][pip]overlay=$X:$Y:eof_action=pass:shortest=0[v]
" -map "[v]" -map 0:a -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 192k -t "$CDUR" "$OUT" || die "compose failed"

ok "$(basename "$OUT")  ${CW}x${CH}  inset ${PIP_W}x${PIP_H} at ${X},${Y}  in at ${IN_AT}s"
