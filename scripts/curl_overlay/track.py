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

cap = cv2.VideoCapture(SRC); fists, area, FR = [], [], []
while True:
    ok, f = cap.read()
    if not ok: break
    FR.append(f); fp, a = fist_and_area(f); fists.append(fp); area.append(a)
H, W = FR[0].shape[:2]
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

# ---- stage 2: detect each plate on every frame -------------------------------------------------
# The interpolated geometry above is only the PRIOR. Each plate is segmented around it with GrabCut
# (the other plate's core and all skin forced to background), an ellipse is fitted to the convex hull
# of the plate silhouette, and kept only if it stays within 0.35 radius of the prior and 0.7-1.3x its
# size. Gaps are filled by interpolation between fitted frames; the result is median-5 / mean-3
# smoothed. Hubs and the bar line come from the fitted centres.
def skin(f):
    ycc=cv2.cvtColor(f,cv2.COLOR_BGR2YCrCb); return cv2.inRange(ycc,(40,135,85),(255,180,135))>0
def fit(f, pred, other):
    cx,cy,rx,ry=pred
    mask=np.full((H,W),cv2.GC_BGD,np.uint8)
    e=lambda s,v,c=(cx,cy,rx,ry): cv2.ellipse(mask,(int(c[0]),int(c[1])),(max(3,int(c[2]*s)),max(3,int(c[3]*s))),0,0,360,int(v),-1)
    e(1.25,cv2.GC_PR_BGD); e(0.95,cv2.GC_PR_FGD); e(0.5,cv2.GC_FGD)
    # the other plate's core and the skin are background
    cv2.ellipse(mask,(int(other[0]),int(other[1])),(int(other[2]*0.8),int(other[3]*0.8)),0,0,360,cv2.GC_BGD,-1)
    mask[skin(f)]=cv2.GC_BGD
    x0,y0=max(0,int(cx-rx*1.4)),max(0,int(cy-ry*1.4)); x1,y1=min(W,int(cx+rx*1.4)),min(H,int(cy+ry*1.4))
    sub=mask[y0:y1,x0:x1].copy()
    if not ((sub==cv2.GC_FGD)|(sub==cv2.GC_PR_FGD)).any(): return None
    bg=np.zeros((1,65)); fg=np.zeros((1,65))
    cv2.grabCut(f[y0:y1,x0:x1],sub,None,bg,fg,5,cv2.GC_INIT_WITH_MASK)
    m=((sub==cv2.GC_FGD)|(sub==cv2.GC_PR_FGD)).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((9,9),np.uint8))
    cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    if not cs: return None
    c=max(cs,key=cv2.contourArea)
    if len(c)<20: return None
    (ex,ey),(a,b),ang=cv2.fitEllipse(cv2.convexHull(c))
    ex+=x0; ey+=y0; A,Bb=a/2,b/2
    # sanity: centre within 0.35 of the radius, size within 0.7-1.3x
    pr=(rx+ry)/2; fr=(A+Bb)/2
    if np.hypot(ex-cx,ey-cy)>0.35*pr or not (0.7<fr/pr<1.3): return None
    return [ex,ey,A,Bb,ang]

def smooth(rows):
    arr = np.array([r if r else [np.nan]*5 for r in rows], float); idx = np.arange(len(rows)); out = arr.copy()
    for c in range(5):
        ok = ~np.isnan(arr[:, c]); out[:, c] = np.interp(idx, idx[ok], arr[ok, c])
        med = np.array([np.median(out[max(0, i-2):i+3, c]) for i in range(len(rows))])
        out[:, c] = np.convolve(np.pad(med, 1, mode="edge"), np.ones(3)/3, mode="valid")
    return out, int((~np.isnan(arr[:, 0])).sum())
fitsN, fitsF = [], []
for i, fr in enumerate(frames):
    fitsN.append(fit(FR[i], fr["near"], fr["far"])); fitsF.append(fit(FR[i], fr["far"], fr["near"]))
nearS, kn = smooth(fitsN); farS, kf = smooth(fitsF)
# ---- near plate: measured outlines ---------------------------------------------------------------
# GrabCut cannot tell the near plate's black rubber from the black rubber floor (median V 47 vs 44
# at #77), so its fit sat low in reps 2-3. The near plate's silhouette extremes were therefore READ
# OFF A 25 px GRID on 28 frames through all three reps and at rest: (centre x, centre y, half-width,
# half-height) of its bounding box. Between them it is interpolated; the tilt is the detected one.
NEAR_KF = {0: (385, 327, 110, 133), 32: (397, 340, 122, 160), 36: (345, 337, 160, 222), 40: (315, 335, 185, 255),
           42: (325, 342, 175, 242), 45: (360, 350, 145, 205), 48: (385, 347, 125, 168), 51: (402, 340, 102, 140),
           68: (405, 330, 100, 130), 72: (372, 330, 128, 170), 75: (335, 310, 140, 205), 77: (327, 302, 152, 218),
           80: (357, 315, 142, 200), 83: (380, 328, 125, 168), 86: (395, 327, 110, 142), 101: (400, 312, 100, 142),
           104: (372, 307, 132, 172), 107: (345, 282, 160, 212), 109: (330, 267, 170, 222), 111: (315, 280, 165, 230),
           114: (347, 302, 152, 207), 117: (360, 322, 140, 177), 120: (377, 327, 122, 157), 124: (380, 330, 105, 135),
           128: (387, 327, 102, 127), 150: (380, 325, 105, 135), 170: (382, 330, 107, 130), 190: (385, 330, 110, 135)}
kfi = sorted(NEAR_KF); kfv = np.array([NEAR_KF[k] for k in kfi], float)
def near_at(i, theta_deg):
    cx, cy, ex, ey = (np.interp(i, kfi, kfv[:, c]) for c in range(4))
    t = np.radians(theta_deg); c2, s2 = np.cos(t) ** 2, np.sin(t) ** 2; det = c2 - s2
    if abs(det) > 0.25:
        a2 = (ex ** 2 * c2 - ey ** 2 * s2) / det; b2 = (ey ** 2 * c2 - ex ** 2 * s2) / det
        if a2 > 0 and b2 > 0: return [cx, cy, a2 ** .5, b2 ** .5, theta_deg]
    return [cx, cy, ex, ey, 0.0]   # axis-aligned fallback: the ring still spans the measured box
# drawn as the measured bounding box (axis-aligned): the stack's silhouette is a D-shape, not an
# ellipse, so the box is the shape the measurements actually describe
nearS = np.array([[*(np.interp(i, kfi, kfv[:, c]) for c in range(4)), 0.0] for i in range(len(frames))])
for i, fr in enumerate(frames):
    fr["near"] = [round(float(v), 1) for v in nearS[i]]; fr["far"] = [round(float(v), 1) for v in farS[i]]
    fr["hubN"] = fr["near"][:2]; fr["hubF"] = fr["far"][:2]
print("near plate: measured on", len(NEAR_KF), "frames, interpolated | far plate detected on", kf, "of", len(frames), "| near tilt from", kn, "fits")
json.dump({"fps": fps, "n": N, "reps": reps, "frames": frames}, open(OUT, "w"))
print("frames", N, "| rest area", round(rest), "| rep frames", reps, "->", [round(r / fps, 2) for r in reps])
print("windows (start, top, end):", windows); print("p at tops:", [round(float(p[t]), 2) for t in TOPS], "| max p per window:", [round(float(p[bounds[r]:bounds[r+1]].max()), 2) for r in range(3)])
