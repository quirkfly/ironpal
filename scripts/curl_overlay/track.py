"""Measure the one-arm curl in the synthetic fisheye clip -> tracks.json (docs/curl_tracking_overlay_plan.md §3).

Per frame: the fist (skin blob, lowest 35 %), lift progress p (arm skin area, smoothed, normalised per
rep), plate geometry interpolated by p between keyframes read off the frames, and rep events.
"""
import json, os, cv2, numpy as np
ROOT = os.path.expanduser("~/job_stuff/prj/ironpal")
SRC = f"{ROOT}/input/kickstarter/fisheye/curl_src.mp4"
OUT = f"{ROOT}/input/kickstarter/fisheye/curl_tracks.json"

# Keyframes read off a 50 px coordinate grid (full-frame px). near/far = plate stacks: centre, radii
# (rx, ry); hubs = the inner collars on the bar. Rest = #0; tops = #42, #77, #111.
KF = {
 "rest": {"fist": (475, 260), "near": (385, 330, 95, 130), "far": (565, 180, 90, 105), "hubN": (415, 310), "hubF": (560, 185)},
 42:     {"fist": (510, 240), "near": (350, 330, 145, 240), "far": (660, 190, 132, 165), "hubN": (400, 300), "hubF": (620, 190)},
 77:     {"fist": (485, 205), "near": (330, 340, 135, 210), "far": (620, 165, 120, 130), "hubN": (385, 255), "hubF": (580, 170)},
 111:    {"fist": (500, 185), "near": (335, 320, 150, 235), "far": (625, 150, 125, 125), "hubN": (385, 225), "hubF": (590, 140)},
}
TOPS = [42, 77, 111]

def fist_and_area(f):
    ycc = cv2.cvtColor(f, cv2.COLOR_BGR2YCrCb)
    m = cv2.inRange(ycc, (40, 135, 85), (255, 180, 135))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(m)
    best = max((k for k in range(1, n) if cen[k][0] < 640 and st[k][4] > 800), key=lambda k: st[k][4], default=None)
    if best is None: return None, 0
    ys, xs = np.nonzero(lab == best)
    cut = np.percentile(ys, 65)                     # lowest 35 % of the blob = the fist
    sel = ys >= cut
    return (float(xs[sel].mean()), float(ys[sel].mean())), int(st[best][4])

cap = cv2.VideoCapture(SRC); fists, area = [], []
while True:
    ok, f = cap.read()
    if not ok: break
    fp, a = fist_and_area(f); fists.append(fp); area.append(a)
N = len(area); fps = 24.0
A = np.convolve(np.array(area, float), np.ones(5) / 5, mode="same")
# rep windows split at the midpoints between tops; rest level = median of the at-rest stretches
bounds = [0, (TOPS[0] + TOPS[1]) // 2, (TOPS[1] + TOPS[2]) // 2, N]
rest = float(np.median(np.concatenate([A[3:25], A[130:N - 3]])))
# Each rep's START and END come from the measured skin-area signal (where it leaves and returns to
# rest); its TOP is the frame-read keyframe. The area peak is not used as the top: in rep 3 the near
# plate hides part of the forearm and the area peaks ~5 frames after the visual top (#116 vs #111).
# p is a raised-cosine rise start->top and fall top->end, so it is synced to the frames at the top
# and to the measured motion at both ends.
p = np.zeros(N); windows = []
for r in range(3):
    a, b = bounds[r], bounds[r + 1]
    pk = float(A[max(a, TOPS[r] - 6):TOPS[r] + 7].max()); thr = rest + 0.2 * (pk - rest)
    s_ = TOPS[r]
    while s_ > a and A[s_ - 1] > thr: s_ -= 1
    e_ = TOPS[r]
    while e_ < b - 1 and A[e_ + 1] > thr: e_ += 1
    e_ = max(e_, TOPS[r] + 4)
    # rep 3: the occluded forearm never lifts the area before the top, so no measured rise exists;
    # use the rise length reps 1-2 measured (9-10 frames), which matches the frame grid (#100 -> #111)
    if TOPS[r] - s_ < 6: s_ = TOPS[r] - 10
    windows.append((s_, TOPS[r], e_))
    for i in range(s_, e_ + 1):
        if i <= TOPS[r]: p[i] = 0.5 - 0.5 * np.cos(np.pi * (i - s_) / max(TOPS[r] - s_, 1))
        else:            p[i] = 0.5 + 0.5 * np.cos(np.pi * (i - TOPS[r]) / max(e_ - TOPS[r], 1))
# rep events: up-crossing of 0.85, re-armed below 0.35
reps, armed, count = [], True, 0
for i in range(N):
    if armed and p[i] >= 0.85: count += 1; reps.append(i); armed = False
    elif not armed and p[i] < 0.35: armed = True
def rep_of(i):
    return 0 if i < bounds[1] else (1 if i < bounds[2] else 2)
def lerp(a, b, t): return tuple(x + t * (y - x) for x, y in zip(a, b))
frames = []
for i in range(N):
    top = KF[TOPS[rep_of(i)]]; R = KF["rest"]; t = float(p[i])
    fist = fists[i] or R["fist"]
    # offsets relative to the fist, interpolated, then re-anchored to the measured fist
    def geo(key):
        rest_off = (R[key][0] - R["fist"][0], R[key][1] - R["fist"][1]) + tuple(R[key][2:])
        top_off = (top[key][0] - top["fist"][0], top[key][1] - top["fist"][1]) + tuple(top[key][2:])
        o = lerp(rest_off, top_off, t)
        return [round(fist[0] + o[0], 1), round(fist[1] + o[1], 1)] + [round(v, 1) for v in o[2:]]
    frames.append({"i": i, "p": round(t, 3), "count": sum(1 for r in reps if r <= i),
                   "fist": [round(fist[0], 1), round(fist[1], 1)],
                   "near": geo("near"), "far": geo("far"), "hubN": geo("hubN"), "hubF": geo("hubF")})
json.dump({"fps": fps, "n": N, "reps": reps, "frames": frames}, open(OUT, "w"))
print("frames", N, "| rest area", round(rest), "| rep frames", reps, "->", [round(r / fps, 2) for r in reps])
print("windows (start, top, end):", windows); print("p at tops:", [round(float(p[t]), 2) for t in TOPS], "| max p per window:", [round(float(p[bounds[r]:bounds[r+1]].max()), 2) for r in range(3)])
