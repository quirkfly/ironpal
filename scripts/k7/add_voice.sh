#!/usr/bin/env bash
# Burn the K7 line into the silent K7 render.
#
# The spoken line already exists: the takes that froze the body still rendered the
# audio correctly, so K7's voice comes from one of them rather than from a new
# generation or a different TTS voice. Keeping the Veo voice is the point — an
# ElevenLabs read would be a different man from K3-K6.
#
#   usage: scripts/k7/add_voice.sh <silent_k7.mp4> [voice.wav] [out.mp4]
#
# Defaults: voice = input/kickstarter/k7/k7_voice_take4.wav
#           out   = input/kickstarter/k7/K7.mp4
set -euo pipefail
export LC_ALL=C   # the shell here is sk_SK; printf %f chokes on a decimal point otherwise

VIDEO=${1:?usage: add_voice.sh <silent_k7.mp4> [voice.wav] [out.mp4]}
VOICE=${2:-input/kickstarter/k7/k7_voice_take4.wav}
OUT=${3:-input/kickstarter/k7/K7.mp4}

[[ -f $VIDEO ]] || { echo "no such video: $VIDEO" >&2; exit 1; }
[[ -f $VOICE ]] || { echo "no such voice track: $VOICE" >&2; exit 1; }

dur() { ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$1"; }
VD=$(dur "$VIDEO"); AD=$(dur "$VOICE")
printf 'video %.2fs   voice %.2fs\n' "$VD" "$AD"

# Both come off 8 s Flow clips, so a straight mux lines up. Warn rather than guess
# if they do not: a drifting line is worse than a stopped script.
python3 - "$VD" "$AD" <<'PY'
import sys
v,a=float(sys.argv[1]),float(sys.argv[2])
if abs(v-a) > 0.15:
    print(f"WARNING: {abs(v-a):.2f}s apart. The line will drift against the picture.\n"
          "         Trim or pad deliberately before muxing; do not let -shortest decide.",
          file=sys.stderr)
PY

# Video is copied, never re-encoded. Audio is re-encoded to AAC because the source
# is WAV; level is left alone — the whole film goes to one studio pass for the
# 12 LU spread across K3-K6 (docs/audio_issue.md), and normalising one clip here
# would just move the problem.
ffmpeg -loglevel error -i "$VIDEO" -i "$VOICE" \
    -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest "$OUT" -y

echo "wrote $OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128 -f null - 2>&1 |
    grep -A1 'Integrated loudness' | tail -1 | sed 's/^/K7 /'
