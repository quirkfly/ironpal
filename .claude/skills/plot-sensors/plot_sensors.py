#!/usr/bin/env python3
"""Plot IMU sensor data captured for a single IronPal exercise session.

Reads the accelerometer (+ optional gyroscope) stream for one session and renders a
polished, on-brand multi-panel figure (IronPal "Stealth Teal" dark theme):

  1. Accelerometer per-axis traces (ax, ay, az)
  2. Acceleration magnitude (motion energy) with detected rep peaks + cadence
  3. Gyroscope per-axis traces (only if gyro present — decision D5)

Accepted inputs (auto-detected):
  • JSON object: {"exercise":..,"session_id":..,"sample_rate_hz":50,"has_gyro":true,
                  "samples":[{"t":0.02,"ax":..,"ay":..,"az":..,"gx":..,"gy":..,"gz":..}, ...]}
  • JSON list of rows: [[t,ax,ay,az(,gx,gy,gz)], ...]  or  [[ax,ay,az], ...] (+ --sample-rate)
  • JSON number[][] (the backend template `imu_series` shape) (+ --sample-rate)
  • CSV with a header containing t/ax/ay/az(/gx/gy/gz) columns (order-independent)
  • --demo [exercise]  → synthesise a plausible session so the skill is runnable now

Pure stdlib + numpy + matplotlib (no scipy). Usage:
  python3 plot_sensors.py SESSION.json --out /tmp/session.png
  python3 plot_sensors.py --demo bulgarian_split_squat --out /tmp/demo.png
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

# ---- IronPal "Stealth Teal" palette (docs/color-schemes.md) ----------------
BG = "#1A1A2E"        # Charcoal Black — figure background
PANEL = "#2D2D3A"     # Gunmetal Gray — axes background
TEAL = "#00E5CC"      # Electric Teal — accent / x-axis / peaks
LIME = "#BFFF00"      # Neon Lime — y-axis / energy
EMBER = "#FF6B35"     # Ember Orange — z-axis
ICE = "#F0F4F8"       # Ice White — headings
SLATE = "#8E8E9A"     # Slate Gray — body text / grid
AXIS_COLORS = (TEAL, LIME, EMBER)


# --------------------------------------------------------------------------- #
# Loading
# --------------------------------------------------------------------------- #
class Session:
    def __init__(self, t, accel, gyro, meta):
        self.t = t                  # (N,) seconds
        self.accel = accel          # (N,3)
        self.gyro = gyro            # (N,3) or None
        self.meta = meta            # dict


def _as_rows(arr):
    a = np.asarray(arr, dtype=float)
    if a.ndim == 1:
        a = a.reshape(-1, 1)
    return a


def _split_columns(rows: np.ndarray, has_t: bool):
    """rows: (N, C). Returns (t_or_None, accel(N,3), gyro(N,3)|None)."""
    c = rows.shape[1]
    idx = 0
    t = None
    # Heuristic: if a leading column looks monotonic increasing & not ~3/6 axis layout
    if has_t:
        t = rows[:, 0]
        idx = 1
    remaining = c - idx
    accel = rows[:, idx:idx + 3] if remaining >= 3 else np.pad(
        rows[:, idx:], ((0, 0), (0, 3 - remaining))
    )
    gyro = None
    if remaining >= 6:
        gyro = rows[:, idx + 3:idx + 6]
    return t, accel, gyro


def load(path: Path | None, demo: str | None, sample_rate: float | None) -> Session:
    if demo is not None:
        return synth(demo, sample_rate or 50.0)

    raw = path.read_text()
    meta: dict = {}
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            meta = {k: v for k, v in data.items() if k != "samples"}
            samples = data.get("samples")
            sr = data.get("sample_rate_hz") or sample_rate
            if samples and isinstance(samples[0], dict):
                t = np.array([s.get("t", i / (sr or 50.0)) for i, s in enumerate(samples)], float)
                accel = np.array([[s.get("ax", 0), s.get("ay", 0), s.get("az", 0)] for s in samples], float)
                hg = any(("gx" in s) for s in samples)
                gyro = (
                    np.array([[s.get("gx", 0), s.get("gy", 0), s.get("gz", 0)] for s in samples], float)
                    if hg else None
                )
                return Session(t, accel, gyro, {**meta, "sample_rate_hz": sr})
            # dict with a rows array under common keys
            for key in ("imu_series", "imu_series_resampled", "rows", "data"):
                if key in data:
                    rows = _as_rows(data[key])
                    break
            else:
                rows = _as_rows(samples or [])
        else:
            rows = _as_rows(data)
    except json.JSONDecodeError:
        rows, meta = _load_csv(raw)

    sr = meta.get("sample_rate_hz") or sample_rate or 50.0
    # detect a leading time column: strictly increasing, max > N/sr*0.5
    has_t = rows.shape[1] in (4, 7) or (
        rows.shape[1] > 3 and np.all(np.diff(rows[:, 0]) >= 0) and rows[:, 0].max() > 1.0
    )
    t, accel, gyro = _split_columns(rows, has_t)
    if t is None:
        t = np.arange(rows.shape[0]) / sr
    return Session(t, accel, gyro, {**meta, "sample_rate_hz": sr})


def _load_csv(raw: str):
    reader = csv.reader(raw.splitlines())
    header = next(reader)
    cols = [h.strip().lower() for h in header]
    rows = np.array([[float(x) for x in r] for r in reader if r], float)
    name_to_i = {n: i for i, n in enumerate(cols)}

    def pick(*names):
        for n in names:
            if n in name_to_i:
                return rows[:, name_to_i[n]]
        return None

    t = pick("t", "time", "timestamp", "ts")
    ax, ay, az = pick("ax", "x", "accel_x"), pick("ay", "y", "accel_y"), pick("az", "z", "accel_z")
    accel = np.column_stack([c if c is not None else np.zeros(len(rows)) for c in (ax, ay, az)])
    gx, gy, gz = pick("gx", "gyro_x"), pick("gy", "gyro_y"), pick("gz", "gyro_z")
    gyro = None
    if gx is not None:
        gyro = np.column_stack([c if c is not None else np.zeros(len(rows)) for c in (gx, gy, gz)])
    out = accel if t is None else np.column_stack([t, accel])
    if gyro is not None:
        out = np.column_stack([out, gyro])
    return out, {}


# --------------------------------------------------------------------------- #
# Synthetic demo data
# --------------------------------------------------------------------------- #
def synth(exercise: str, sr: float) -> Session:
    """Plausible egocentric head-IMU stream for a demo session.

    bulgarian_split_squat → strong vertical (z) oscillation (IMU-led, ~0.45 Hz).
    triceps_pushdown       → near-flat head IMU (vision-led) — small noise only.
    """
    rng = np.random.default_rng(7)
    reps = 9
    cadence = 0.45  # Hz
    dur = reps / cadence + 2.0
    n = int(dur * sr)
    t = np.arange(n) / sr
    accel = rng.normal(0, 0.06, (n, 3))
    gyro = rng.normal(0, 1.5, (n, 3))
    # rep window (skip ~1s setup at each end)
    w = (t > 1.0) & (t < dur - 1.0)
    phase = 2 * math.pi * cadence * (t - 1.0)
    if exercise.startswith("triceps"):
        # head barely moves (isolation movement) → accel stays near-flat noise: the
        # whole point of "vision-led" (decision §6). Only the forearm-driven gyro twitches.
        gyro[w, 0] += 6 * np.sin(phase[w])
        cadence_true = None
    else:
        # split squat: big vertical (z) oscillation + slight forward-back (x) lean
        accel[w, 2] += 1.6 * np.sin(phase[w]) + 0.25 * np.sin(2 * phase[w])
        accel[w, 0] += 0.35 * np.sin(phase[w] + 0.6)
        gyro[w, 1] += 22 * np.sin(phase[w])
        cadence_true = cadence
    meta = {
        "exercise": exercise,
        "session_id": "demo-" + exercise,
        "sample_rate_hz": sr,
        "has_gyro": True,
        "synthetic": True,
        "true_reps": reps if cadence_true else None,
    }
    return Session(t, accel, gyro, meta)


# --------------------------------------------------------------------------- #
# Signal analysis (rep peaks + cadence) — pure numpy, mirrors design §5 intent
# --------------------------------------------------------------------------- #
def _moving_avg(x, w):
    if w < 2:
        return x
    k = np.ones(w) / w
    return np.convolve(x, k, mode="same")


def analyse(sess: Session):
    """Count reps on the DOMINANT SIGNED AXIS (not vector magnitude).

    Magnitude of a gravity-removed (zero-mean) oscillation folds the negative half
    (|sin|), doubling the apparent cadence. The dominant high-passed axis gives one
    peak per rep — the design §5 intent.
    """
    a = sess.accel
    sr = float(sess.meta.get("sample_rate_hz", 50.0))
    # high-pass each axis (subtract ~1s moving average → removes gravity/DC) then smooth ~100ms
    hp = np.column_stack([a[:, i] - _moving_avg(a[:, i], max(2, int(sr))) for i in range(3)])
    sm3 = np.column_stack([_moving_avg(hp[:, i], max(2, int(sr * 0.1))) for i in range(3)])
    dom = int(np.argmax(sm3.var(axis=0)))            # dominant motion axis
    sig = sm3[:, dom]
    axis_name = ("ax", "ay", "az")[dom]

    x = sig - sig.mean()
    if np.allclose(x, 0) or x.std() < 1e-6:
        return sig, axis_name, np.array([], int), None
    # autocorrelation cadence within period 0.4–3.0 s
    ac = np.correlate(x, x, mode="full")[len(x) - 1:]
    lo, hi = int(sr * 0.4), int(sr * 3.0)
    cadence = None
    if lo < hi < len(ac):
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.30 * ac[0]:                    # require a real periodic structure
            cadence = sr / lag

    # require meaningful motion before claiming reps (else it's "vision-led", flat IMU)
    if sig.std() < 0.15:                              # m/s² — essentially flat head IMU
        return sig, axis_name, np.array([], int), cadence

    thr = 0.4 * np.std(sig) + 0.10 * np.max(np.abs(sig))
    min_sep = int(sr / 2.5)                           # ≤ 2.5 reps/s
    if cadence:
        min_sep = max(min_sep, int(0.6 * sr / cadence))
    peaks, last = [], -min_sep
    for i in range(1, len(sig) - 1):
        if sig[i] > thr and sig[i] >= sig[i - 1] and sig[i] > sig[i + 1] and i - last >= min_sep:
            peaks.append(i)
            last = i
    return sig, axis_name, np.array(peaks, int), cadence


# --------------------------------------------------------------------------- #
# Plot
# --------------------------------------------------------------------------- #
def _style_ax(ax):
    ax.set_facecolor(PANEL)
    ax.grid(True, color=SLATE, alpha=0.18, linewidth=0.7)
    for s in ax.spines.values():
        s.set_color(SLATE)
        s.set_alpha(0.4)
    ax.tick_params(colors=SLATE, labelsize=8)


def plot(sess: Session, out: Path):
    sig, axis_name, peaks, cadence = analyse(sess)
    sr = float(sess.meta.get("sample_rate_hz", 50.0))
    t = sess.t
    has_gyro = sess.gyro is not None
    nrows = 3 if has_gyro else 2

    fig, axes = plt.subplots(nrows, 1, figsize=(11, 2.7 * nrows + 1.2), sharex=True)
    fig.patch.set_facecolor(BG)
    axes = np.atleast_1d(axes)

    # --- title block ---
    ex = str(sess.meta.get("exercise", "exercise")).replace("_", " ").title()
    sid = sess.meta.get("session_id", "—")
    dur = t[-1] - t[0] if len(t) else 0
    reps = len(peaks)
    cad_txt = f"{cadence:.2f} Hz ({cadence*60:.0f}/min)" if cadence else "no clear cycle"
    syn = "  ·  SYNTHETIC DEMO" if sess.meta.get("synthetic") else ""
    fig.suptitle(f"IronPal · {ex}", color=ICE, fontsize=17, fontweight="bold", x=0.5, y=0.985)
    sub = (f"session {sid}   ·   {dur:.1f}s   ·   {len(t)} samples @ {sr:.0f} Hz   ·   "
           f"gyro: {'yes' if has_gyro else 'no'}   ·   reps≈{reps}   ·   cadence {cad_txt}{syn}")
    fig.text(0.5, 0.945, sub, color=SLATE, fontsize=9, ha="center")

    # --- panel 1: accel per-axis ---
    ax0 = axes[0]
    _style_ax(ax0)
    for i, (lbl, col) in enumerate(zip(("ax", "ay", "az"), AXIS_COLORS)):
        ax0.plot(t, sess.accel[:, i], color=col, lw=1.2, alpha=0.95, label=lbl)
    ax0.set_ylabel("accel\n(m/s²)", color=ICE, fontsize=9)
    lg = ax0.legend(loc="upper right", ncol=3, fontsize=8, framealpha=0.0)
    for txt in lg.get_texts():
        txt.set_color(ICE)
    ax0.set_title("Accelerometer — per axis", color=ICE, fontsize=10, loc="left", pad=6)

    # --- panel 2: dominant-axis motion + rep peaks ---
    ax1 = axes[1]
    _style_ax(ax1)
    ax1.plot(t, sig, color=TEAL, lw=1.6, label=f"dominant axis ({axis_name}, gravity-removed)")
    if len(peaks):
        ax1.scatter(t[peaks], sig[peaks], color=LIME, s=46, zorder=5,
                    edgecolor=BG, linewidth=0.8, label=f"reps ({reps})")
        for k, p in enumerate(peaks, 1):
            ax1.annotate(str(k), (t[p], sig[p]), color=ICE, fontsize=7,
                         ha="center", va="bottom", xytext=(0, 4), textcoords="offset points")
    else:
        ax1.text(0.5, 0.5, "head IMU ~flat → vision-led recognition",
                 transform=ax1.transAxes, color=ICE, fontsize=11, ha="center", va="center",
                 style="italic", zorder=6,
                 bbox=dict(boxstyle="round,pad=0.5", facecolor=BG, edgecolor=TEAL, alpha=0.92))
    ax1.axhline(0, color=SLATE, lw=0.6, alpha=0.5)
    ax1.set_ylabel("accel\n(m/s²)", color=ICE, fontsize=9)
    lg = ax1.legend(loc="upper right", fontsize=8, framealpha=0.0)
    for txt in lg.get_texts():
        txt.set_color(ICE)
    ax1.set_title("Rep detection — dominant signed axis", color=ICE, fontsize=10, loc="left", pad=6)

    # --- panel 3: gyro ---
    if has_gyro:
        ax2 = axes[2]
        _style_ax(ax2)
        for i, (lbl, col) in enumerate(zip(("gx", "gy", "gz"), AXIS_COLORS)):
            ax2.plot(t, sess.gyro[:, i], color=col, lw=1.1, alpha=0.9, label=lbl)
        ax2.set_ylabel("gyro\n(rad/s)", color=ICE, fontsize=9)
        lg = ax2.legend(loc="upper right", ncol=3, fontsize=8, framealpha=0.0)
        for txt in lg.get_texts():
            txt.set_color(ICE)
        ax2.set_title("Gyroscope — per axis", color=ICE, fontsize=10, loc="left", pad=6)

    axes[-1].set_xlabel("time (s)", color=ICE, fontsize=9)
    fig.tight_layout(rect=(0, 0, 1, 0.93))
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=150, facecolor=BG)
    plt.close(fig)
    return {"out": str(out), "reps": reps, "cadence_hz": cadence, "duration_s": dur,
            "samples": len(t), "has_gyro": has_gyro}


def main(argv=None):
    ap = argparse.ArgumentParser(description="Plot IMU sensor data for one IronPal exercise session.")
    ap.add_argument("input", nargs="?", help="JSON or CSV sensor file for the session")
    ap.add_argument("--demo", nargs="?", const="bulgarian_split_squat",
                    help="synthesise a demo session (exercise name optional)")
    ap.add_argument("--sample-rate", type=float, default=None, help="Hz, if not in the data")
    ap.add_argument("--out", default="/tmp/ironpal_session.png", help="output PNG path")
    args = ap.parse_args(argv)

    if not args.input and args.demo is None:
        ap.error("provide a sensor file, or use --demo")
    sess = load(Path(args.input) if args.input else None, args.demo, args.sample_rate)
    info = plot(sess, Path(args.out))
    print(json.dumps(info, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
