#!/usr/bin/env bash
# Fetch the two Apache-2.0 model binaries for neural design v2 into the Android assets
# (poc/MODEL_LICENCES.md). They are not committed: ~19 MB of upstream artefacts.
set -euo pipefail
DEST="$(cd "$(dirname "$0")/../.." && pwd)/poc/mobile/android/app/src/main/assets/models"
mkdir -p "$DEST"
[ -s "$DEST/pose_landmarker_lite.task" ] || curl -fsSL -o "$DEST/pose_landmarker_lite.task" \
  https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task
[ -s "$DEST/movinet_a0_stream_fp16.tflite" ] || curl -fsSL -o "$DEST/movinet_a0_stream_fp16.tflite" \
  "https://www.kaggle.com/api/v1/models/google/movinet/tfLite/a0-stream-kinetics-600-classification-tflite-float16/1/download"
# Kaggle may serve a tar.gz bundle instead of the bare file; unwrap it if so.
if file "$DEST/movinet_a0_stream_fp16.tflite" | grep -q gzip; then
  tmp="$(mktemp -d)"; tar -xzf "$DEST/movinet_a0_stream_fp16.tflite" -C "$tmp"
  mv "$(find "$tmp" -name '*.tflite' | head -1)" "$DEST/movinet_a0_stream_fp16.tflite"; rm -rf "$tmp"
fi
ls -la "$DEST"
