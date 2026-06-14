#!/usr/bin/env bash
# Extract evenly-sampled frames from a workout clip for KB video analysis.
# Usage: scripts/kb/extract_frames.sh <clip> [fps] [outdir]
#   fps     frames-per-second to sample (default 2). Use higher for fast/ballistic lifts.
#   outdir  where frames are written (default input/kb/frames/<clip-stem>/)
#
# Also prints the clip's duration/fps/resolution (the header line for the report).
set -euo pipefail

clip="${1:?usage: extract_frames.sh <clip> [fps] [outdir]}"
fps="${2:-2}"
stem="$(basename "${clip%.*}")"
outdir="${3:-input/kb/frames/$stem}"

mkdir -p "$outdir"
rm -f "$outdir"/frame_*.jpg

# Header (duration / resolution / source fps) for the report.
# NOTE: the ffprobe on PATH here is a symlink to the static ffmpeg build and rejects
# ffprobe-only flags, so parse `ffmpeg -i` stderr instead.
ffmpeg -i "$clip" 2>&1 | grep -E "Duration|Stream.*Video" || true

# Sample frames at the requested rate, high-quality JPEG, zero-padded index.
ffmpeg -nostdin -loglevel error -i "$clip" \
  -vf "fps=$fps" -q:v 2 "$outdir/frame_%04d.jpg"

n="$(find "$outdir" -name 'frame_*.jpg' | wc -l | tr -d ' ')"
echo "extracted $n frames at ${fps}fps -> $outdir"
