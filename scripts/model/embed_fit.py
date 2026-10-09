"""Neural design v2 — fit the unsupervised EMBED statistics on the KB clips.

Mirrors the app: MoViNet-A0-Stream logits (EmbedModule.kt) and the pose geometry
(PoseGeometry.kt — `geom`/`stats` below MUST stay identical to it). Each clip is cut into 4 s
windows at 5 fps; the windows' video logits give the PCA-whitening (600 → 64) and the pose stats
give the z-score. No labels are used for the fit; LAB is only for the leave-one-clip-out report.

  python3 -m venv .venv && .venv/bin/pip install ai-edge-litert mediapipe numpy opencv-python-headless
  scripts/model/fetch_embed_models.sh
  .venv/bin/python scripts/model/embed_fit.py      # → poc/mobile/src/model/embed_params.json
"""
import sys, json, numpy as np, cv2
from ai_edge_litert.interpreter import Interpreter
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CLIPS = os.path.join(ROOT, "input/kb/clips/")
MODELS = os.path.join(ROOT, "poc/mobile/android/app/src/main/assets/models/")
OUT = os.path.join(ROOT, "poc/mobile/src/model/embed_params.json")
LAB = {"20260614_125114.mp4": "alt-db-curl", "IPS_2026-08-02.15.33.00.0640.mp4": "alt-db-curl",
       "20260614_202314.mp4": "barbell-curl", "20260615_122213.mp4": "triceps-pushdown",
       "20260713_115428.mp4": "case004-db"}
FPS, WIN = 5, 20   # 20 frames = 4 s

it = Interpreter(model_path=MODELS + "movinet_a0_stream_fp16.tflite"); run = it.get_signature_runner()
ins = run.get_input_details()
def init_states():
    return {k: np.zeros(v["shape"], dtype=v["dtype"]) for k, v in ins.items() if k != "image"}
pose = vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODELS + "pose_landmarker_lite.task"),
    running_mode=vision.RunningMode.IMAGE))

def ang(a, b, c):
    v1, v2 = a - b, c - b
    return np.degrees(np.arccos(np.clip(v1 @ v2 / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6), -1, 1)))

def geom(lm):
    """8 channels per frame; NaN when the landmarks are not visible."""
    if lm is None: return np.full(8, np.nan)
    P = np.array([[l.x, l.y] for l in lm]); V = np.array([l.visibility for l in lm])
    ls, rs, le, re, lw, rw, nose = P[11], P[12], P[13], P[14], P[15], P[16], P[0]
    sw = np.linalg.norm(ls - rs) + 1e-6; mid = (ls + rs) / 2
    wvis = (V[15] + V[16]) / 2
    out = [ang(ls, le, lw) if min(V[11], V[13], V[15]) > .3 else np.nan,
           ang(rs, re, rw) if min(V[12], V[14], V[16]) > .3 else np.nan,
           np.linalg.norm(((lw + rw) / 2) - mid) / sw,
           (nose[1] - (lw[1] + rw[1]) / 2) / sw,
           ang(le, ls, P[23]) if V[23] > .3 else np.nan,
           (lw[1] - rw[1]) / sw,
           float(((lw[1] > 1) + (rw[1] > 1)) / 2),
           wvis]
    return np.array(out, float)

def stats(ch):
    out = []
    for c in ch.T:
        c = c[~np.isnan(c)]
        if len(c) < 3: out += [0] * 6; continue
        f = np.abs(np.fft.rfft(c - c.mean())); per = len(c) / (np.argmax(f[1:]) + 1) / FPS
        out += [c.mean(), c.std(), c.min(), c.max(), np.ptp(c), per]
    return np.array(out)

def embed_clip(path):
    cap = cv2.VideoCapture(path); src = cap.get(cv2.CAP_PROP_FPS) or 30; step = src / FPS
    frames, t, i = [], 0.0, 0
    while True:
        ok, fr = cap.read()
        if not ok: break
        if i >= t: frames.append(fr); t += step
        i += 1
    st = init_states(); vids, geo = [], []
    for fr in frames:
        rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
        h, w = rgb.shape[:2]; s = min(h, w); crop = rgb[(h - s)//2:(h - s)//2 + s, (w - s)//2:(w - s)//2 + s]
        x = cv2.resize(crop, (172, 172)).astype(np.float32)[None, None] / 255.0
        out = run(image=x, **st); logits = out.pop("logits")[0]; st = out
        vids.append(logits)
        r = pose.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb)))
        geo.append(geom(r.pose_landmarks[0] if r.pose_landmarks else None))
    vids, geo = np.array(vids), np.array(geo)
    wins = []
    for s0 in range(0, len(frames) - WIN + 1, FPS * 2):   # 4 s windows, 2 s hop
        # stream state is causal: the window's video feature = mean logits over its frames
        wins.append((vids[s0:s0 + WIN].mean(0), stats(geo[s0:s0 + WIN]), np.mean(~np.isnan(geo[s0:s0+WIN, 0]))))
    return wins, len(frames)

data = {}
for f, lab in LAB.items():
    w, n = embed_clip(CLIPS + f); data[f] = w
    print(f"{f}: {n} frames, {len(w)} windows, pose-visible {np.mean([x[2] for x in w]):.0%}", flush=True)
V = np.array([v for f in data for v, p, a in data[f]], float)
P = np.array([p for f in data for v, p, a in data[f]], float)
lab = np.array([LAB[f] for f in data for _ in data[f]]); clip = np.array([f for f in data for _ in data[f]])
K = 64
mu = V.mean(0); _, S, Vt = np.linalg.svd(V - mu, full_matrices=False)
proj = Vt[:K].T / (S[:K] / np.sqrt(len(V)) + 1e-6)
pmu = P.mean(0); psd = P.std(0); psd[psd < 1e-6] = 1.0
out = {"model_version": f"v2-embed-0.1+kb{len(V)}", "fitted_from": {"windows": int(len(V)), "clips": sorted(data)},
       "video": {"in_dims": 600, "out_dims": K, "mean": np.round(mu, 6).tolist(), "proj": np.round(proj, 6).tolist(),
                 "explained": float((S[:K] ** 2).sum() / (S ** 2).sum())},
       "pose": {"dims": 48, "mean": np.round(pmu, 6).tolist(), "std": np.round(psd, 6).tolist()}}
json.dump(out, open(OUT, "w"), separators=(",", ":"))
print("wrote", OUT)

# leave-one-clip-out report (labels used ONLY here)
l2 = lambda x: x / (np.linalg.norm(x, axis=1, keepdims=True) + 1e-9)
Vw = l2((V - mu) @ proj); Pz = l2((P - pmu) / psd)
for name, wv, wp in [("video", 1, 0), ("pose", 0, 1), ("video+pose", 1, 1)]:
    hits = {}
    for i in range(len(V)):
        o = clip != clip[i]
        if not (lab[o] == lab[i]).any():
            continue  # no other clip of this exercise to find
        d = wv * (1 - Vw[o] @ Vw[i]) + wp * (1 - Pz[o] @ Pz[i])
        hits.setdefault(lab[i], []).append(lab[o][np.argmin(d)] == lab[i])
    print(f"{name:11s}", {k: f"{np.mean(v):.0%} of {len(v)}" for k, v in hits.items()})
