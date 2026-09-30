#!/usr/bin/env bash
# Make K7 reference pose A by mirroring pose B.
#
# Both the image generator and the video model curl with the RIGHT arm whatever
# they are asked for, so pose A (left arm up) may not be obtainable by prompting.
# A horizontal flip of pose B IS pose A, exactly, and costs nothing.
#
# This only works because the reference stills were written to be mirror-safe
# (see scripts/k7/make_ref_prompts.py): the subject is centred, so a flip does not
# move him across the frame, and the headband carries no right-side ring mark, so
# a flip cannot put the product's branding on the wrong side. The background does
# mirror — which is why the clip prompt takes the ARM POSITIONS from the stills
# and the framing and the room from its own text.
#
#   usage: scripts/k7/flip_ref.sh <pose_B_image> [out]
#
# Default out: input/kickstarter/k7/ref_A_flipped.<same extension>
set -euo pipefail
export LC_ALL=C

SRC=${1:?usage: flip_ref.sh <pose_B_image> [out]}
[[ -f $SRC ]] || { echo "no such image: $SRC" >&2; exit 1; }
EXT=${SRC##*.}
OUT=${2:-input/kickstarter/k7/ref_A_flipped.$EXT}
mkdir -p "$(dirname "$OUT")"

# -q:v 2 matters: ffmpeg's default JPEG quality took a 435 kB reference down to
# 31 kB, and a soft reference is a worse reference.
ffmpeg -loglevel error -i "$SRC" -vf hflip -frames:v 1 -q:v 2 "$OUT" -y
echo "wrote $OUT  ($(stat -c%s "$SRC") B -> $(stat -c%s "$OUT") B)"

# A mirrored image of a centred subject should stay centred. Say where he actually
# landed, because if pose B came back off-centre the flip moves him twice as far.
python3 - "$SRC" "$OUT" <<'PY'
import sys
try:
    from PIL import Image
    import numpy as np
except ImportError:
    sys.exit(0)
for path in sys.argv[1:]:
    a = np.asarray(Image.open(path).convert("L"), dtype=float)
    col = a.mean(axis=0)
    k = 80
    smooth = np.convolve(col, np.ones(k) / k, mode="same")
    print(f"  {path}: brightest column band at {np.argmax(smooth) / a.shape[1]:.0%} of width")
PY
