#!/usr/bin/env python3
"""Measure the three web clips so nothing downstream is hand-typed.

The film's K7/K8 numbers do not transfer (different renders, plan §1.1), so:
  K7  curl tops (rep events for the live-set screen), from the vertical centroid of the arm region
  K8  per-frame squat depth 0..1 (K8 plan's method: rows 16-22 of a 192x108 grey downscale)
  all subject column band via background-difference occupancy, for inset placement

Writes input/kickstarter/web/{k7_web_reps,k8_web_depth,layout}.json and a copy of the depth
signal into web/src/data/ for the FormTracking component.
"""
import io, json, subprocess, sys, pathlib
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
CLIPS = pathlib.Path.home() / "job_stuff/prj/geggen/products/ironpal/clips/web"
OUT = ROOT / "input/kickstarter/web"; OUT.mkdir(parents=True, exist_ok=True)
FPS = 24

def frames(path, w, h):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path),
                        "-vf", f"scale={w}:{h}", "-f", "image2pipe", "-vcodec", "png", "-"],
                       capture_output=True, check=True)
    d = r.stdout; out = []; i = 0
    while True:
        j = d.find(b"\x89PNG", i + 1)
        out.append(np.asarray(Image.open(io.BytesIO(d[i:] if j < 0 else d[i:j])).convert("L"), dtype=float))
        if j < 0: break
        i = j
    return np.stack(out)

def subject_columns(F, scale):
    bg = np.median(F, axis=0)
    occ = (np.abs(F - bg) > 18).mean(axis=(0, 1))
    cols = np.where(occ > 0.12)[0]
    return int(cols.min() * scale), int(cols.max() * scale)

def local_extrema(x, kind, min_gap, prominence):
    idx = []
    rng = x.max() - x.min()
    for k in range(2, len(x) - 2):
        win = x[k-2:k+3]
        if (kind == "min" and x[k] == win.min()) or (kind == "max" and x[k] == win.max()):
            depth = (x.max() - x[k]) if kind == "min" else (x[k] - x.min())
            if depth > prominence * rng and (not idx or k - idx[-1] > min_gap):
                idx.append(k)
    return idx

layout = {}

# ── K7: curl tops ────────────────────────────────────────────────────────────────────────
F = frames(CLIPS / "K7.mp4", 480, 270); l, r = subject_columns(F, 4); layout["K7"] = {"subject": [l, r]}
bg = np.median(F, axis=0)
band = (np.abs(F[:, 90:200, l//4:r//4] - bg[90:200, l//4:r//4]) > 18).astype(float)
rows = np.arange(90, 200)[:, None]
cy = np.array([(m * rows).sum() / max(m.sum(), 1) for m in band])
cy = np.convolve(cy, np.ones(5) / 5, mode="same")
tops = local_extrema(cy, "min", min_gap=int(0.8 * FPS), prominence=0.25)
k7 = {"fps": FPS, "n": len(F), "tops_s": [round(k / FPS, 2) for k in tops],
      "cy": [round(float(v), 1) for v in cy], "source": "web/K7.mp4"}
json.dump(k7, open(OUT / "k7_web_reps.json", "w"), indent=1)
print("K7 subject", l, r, " curl tops", k7["tops_s"])

# ── K8: depth signal ─────────────────────────────────────────────────────────────────────
F = frames(CLIPS / "K8.mp4", 480, 270); l, r = subject_columns(F, 4); layout["K8"] = {"subject": [l, r]}
G = frames(CLIPS / "K8.mp4", 192, 108)
band = G[:, 16:23, :].mean(axis=(1, 2))               # bright = standing, dark = dropped below the band
band = np.convolve(band, np.ones(3) / 3, mode="same")
d = (band.max() - band) / (band.max() - band.min())    # 1 = deepest
d = np.clip(d, 0, 1)
bottoms = local_extrema(d, "max", min_gap=int(0.9 * FPS), prominence=0.3)
topsk8 = local_extrema(d, "min", min_gap=int(0.9 * FPS), prominence=0.3)
k8 = {"fps": FPS, "n": len(G), "depth": [round(float(v), 3) for v in d],
      "bottoms": [round(k / FPS, 2) for k in bottoms], "tops": [round(k / FPS, 2) for k in topsk8],
      "band_std": round(float(G[:, 16:23, :].mean(axis=(1, 2)).std()), 1), "source": "web/K8.mp4"}
json.dump(k8, open(OUT / "k8_web_depth.json", "w"), indent=1)
json.dump({"fps": FPS, "depth": k8["depth"]}, open(ROOT / "web/src/data/k8_depth.json", "w"))
print("K8 subject", l, r, " bottoms", k8["bottoms"], " tops", k8["tops"], " band std", k8["band_std"])

# ── K5: subject only ─────────────────────────────────────────────────────────────────────
F = frames(CLIPS / "K5.mp4", 480, 270); l, r = subject_columns(F, 4); layout["K5"] = {"subject": [l, r]}
print("K5 subject", l, r)

# inset geometry follows from the measurement, plan §2.2/2.3: right side, clear of the subject
for k, w in (("K7", 560), ("K8", 520)):
    x = 1860 - w
    layout[k]["inset"] = {"w": w, "x": x, "y": 60 if k == "K7" else 90, "clear_px": x - layout[k]["subject"][1]}
json.dump(layout, open(OUT / "layout.json", "w"), indent=1)
print("layout", json.dumps(layout))
