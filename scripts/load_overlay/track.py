"""Track the three plates in the synthetic fisheye barbell-loading clip -> load_tracks.json.

The plates are solid yellow (20 kg) and blue (25 kg) on a black floor, so each is found by colour on
every frame. The yellow plate already on the bar (S) and the blue plate (B) do not move: their boxes
are the per-frame measurement when it is clean, else the median of the clean frames (hands later
cover them). The loaded yellow plate (M) is the yellow mask LEFT of S; once it meets S the two
yellow blobs merge, and M is the merged blob's part left of S's edge. SEATED = M's right edge within
4 px of S's left edge.
"""
import json, os, cv2, numpy as np
ROOT = os.path.expanduser("~/job_stuff/prj/ironpal")
SRC = f"{ROOT}/input/kickstarter/fisheye/load_src.mp4"; OUT = f"{ROOT}/input/kickstarter/fisheye/load_tracks.json"
Y0, Y1 = 420, 860            # the band of the circle where the bar and plates lie (frame px)

def mask(f, lo, hi):
    m = cv2.inRange(cv2.cvtColor(f, cv2.COLOR_BGR2HSV), lo, hi)
    m[:Y0] = 0; m[Y1:] = 0
    return cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))

def comps(m, min_area):
    n, _, st, _ = cv2.connectedComponentsWithStats(m)
    return [st[k][:4].astype(float) for k in range(1, n) if st[k][4] >= min_area]   # x, y, w, h

cap = cv2.VideoCapture(SRC); F = []
while True:
    ok, f = cap.read()
    if not ok: break
    F.append(f)
N = len(F)
YEL = ((18, 110, 110), (38, 255, 255)); BLU = ((95, 90, 60), (125, 255, 255))
# --- static plates: median of the clean early frames (both yellows separate, blue unoccluded)
S_obs, B_obs = [], []
for f in F[:40]:
    y = sorted(comps(mask(f, *YEL), 3000), key=lambda b: b[0])
    b = [c for c in comps(mask(f, *BLU), 3000) if c[0] > 300]
    if len(y) == 2: S_obs.append(y[1])
    if b: B_obs.append(max(b, key=lambda c: c[3]))
S = np.median(S_obs, axis=0); B = np.median(B_obs, axis=0)
frames, seated_at = [], None
for i, f in enumerate(F):
    ym = mask(f, *YEL)
    left = ym.copy(); left[:, int(S[0]) - 2:] = 0          # yellow pixels left of the static plate
    cs = comps(left, 400)
    if cs:
        x, y, w, h = max(cs, key=lambda c: c[2] * c[3])
        M = [x, y, w, h]
    else:                                                  # fully merged and covered: flush with S
        M = [S[0] - S[2], S[1], S[2], S[3]]
    gap = S[0] - (M[0] + M[2])
    if seated_at is None and gap <= 4: seated_at = i
    frames.append({"i": i, "M": [round(v, 1) for v in M], "gap": round(float(gap), 1)})
# smooth M (median 5) so hands over the plate do not make the box jitter
arr = np.array([fr["M"] for fr in frames])
for c in range(4):
    arr[:, c] = [np.median(arr[max(0, i - 2):i + 3, c]) for i in range(N)]
for fr, row in zip(frames, arr):
    fr["M"] = [round(float(v), 1) for v in row]
    fr["seated"] = seated_at is not None and fr["i"] >= seated_at
json.dump({"fps": 24, "n": N, "S": [round(float(v), 1) for v in S], "B": [round(float(v), 1) for v in B],
           "seated_at": seated_at, "frames": frames}, open(OUT, "w"))
print("frames", N, "| S", S.round(1).tolist(), "| B", B.round(1).tolist(), "| seated at", seated_at,
      f"({seated_at / 24:.2f} s)" if seated_at is not None else "")
print("M x-left by 8:", [frames[k]["M"][0] for k in range(0, N, 8)], "| gap:", [frames[k]["gap"] for k in range(0, N, 8)])
