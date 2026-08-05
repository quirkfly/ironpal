#!/usr/bin/env python3
"""B4 — align a ShenYao video against an IronPal IMU session.

The capture rig is two apps that cannot talk to each other, so alignment is
recovered from the one thing they share: the head. The camera and the IMU are
rigidly coupled to it, so a head rotation appears in both streams and
cross-correlating them yields the time offset.

Method (docs/ironpal-two-app-sync-explained.md):

  Layer 1  device clock -> phone clock, by REGRESSION over every packet's two
           timestamps. imu.jsonl carries both, so this needs no video and no
           nods and can be checked before a gym trip rather than after.
           NOT the endpoint difference: BLE jitter spans +/-67 ms and on a real
           capture the endpoint calc gave -164 ppm where regression gave -52.8.

  Layer 2  video PTS -> phone clock. ShenYao records ON the phone, so video PTS
           and host_ns share one oscillator and cannot drift apart. That leaves
           exactly ONE unknown -- the host time at which PTS = 0 -- found by
           cross-correlating video motion energy against gyro magnitude.

Gyro, not accel: frame-to-frame image change is dominated by rotation. A small
head rotation sweeps the whole frame; translation barely changes it. Accel
mostly measures gravity plus body bounce and correlates far more weakly.

Usage:
    sync_imu_video.py --session <dir> --video <clip.mp4>
    sync_imu_video.py --session <dir> --clock-only     # layer 1 alone
    sync_imu_video.py --self-test                      # verify the algorithm
"""
import argparse
import json
import math
import os
import re
import subprocess
import sys

import numpy as np

CANONICAL_HZ = 50.0
SEARCH_WINDOW_S = 10.0     # filename wall clock brackets us to seconds; +/-10 s is generous
VIDEO_SAMPLE_FPS = 30      # motion energy sampling; >= video rate so nothing is aliased away
MAX_ABS_PPM = 100.0        # outside this, suspect dropped packets rather than a crystal
GAP_INVALIDATE_S = 2.0

ACCEPT_MS, FLAG_MS = 40.0, 80.0

# A genuinely aligned session correlates strongly: the synthetic self-test scores
# ~0.97, while an unrelated video against this IMU log scored 0.094 with a
# rivalled peak. Below these, there is no alignment to report -- say so rather
# than emitting a confident number.
MIN_PEAK = 0.20
MIN_RATIO_REJECT = 1.15
MIN_RATIO_ACCEPT = 1.30


# --------------------------------------------------------------------------
# Layer 1 — device clock -> phone clock
# --------------------------------------------------------------------------

def load_imu(path):
    """Read imu.jsonl into packet arrays. Returns dict of numpy arrays."""
    seq, dev_us, host_ns, n, dt_us, samples = [], [], [], [], [], []
    with open(path) as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            r = json.loads(line)
            seq.append(r["seq"])
            dev_us.append(r["device_ts_us"])
            host_ns.append(r["host_ns"])
            n.append(r["n"])
            dt_us.append(r["dt_us"])
            samples.append(r["s"])
    if not seq:
        raise SystemExit(f"{path}: no packets")
    return {
        "seq": np.array(seq, dtype=np.int64),
        "device_ts_us": np.array(dev_us, dtype=np.float64),
        "host_ns": np.array(host_ns, dtype=np.float64),
        "n": np.array(n, dtype=np.int32),
        "dt_us": np.array(dt_us, dtype=np.float64),
        "samples": samples,
    }


def fit_clock(imu):
    """Regress host_ns on device_ts_us over every packet.

    Two anchors give a line through two noisy points; a session gives ~30k
    points, so the slope uncertainty becomes negligible even though each
    individual host_ns carries ~16 ms of BLE arrival jitter.
    """
    d = imu["device_ts_us"] / 1e6          # s, device clock
    h = imu["host_ns"] / 1e9               # s, phone clock
    d0, h0 = d[0], h[0]
    slope, intercept = np.polyfit(d - d0, h - h0, 1)
    resid = (h - h0) - (slope * (d - d0) + intercept)
    return {
        "slope": float(slope),
        "ppm": float((slope - 1.0) * 1e6),
        "residual_sd_ms": float(np.std(resid) * 1e3),
        "residual_max_ms": float(np.max(np.abs(resid)) * 1e3),
        "span_s": float(h[-1] - h[0]),
        "_d0": float(d0),
        "_h0": float(h0),
        "_intercept": float(intercept),
    }


def device_to_host_s(dev_us, fit):
    """Map device microseconds onto the phone clock, in seconds."""
    return fit["_h0"] + fit["_intercept"] + fit["slope"] * (dev_us / 1e6 - fit["_d0"])


def expand_gyro(imu, fit, gyro_scale_dps):
    """Per-sample (host_time_s, |omega| dps).

    Samples are placed with the DEVICE clock inside each packet -- it is a
    crystal and therefore smooth -- then the fitted line moves the whole series
    onto the phone clock. Stamping each sample with its packet's host_ns instead
    would inject 16 ms of BLE jitter into every reading.
    """
    times, mags = [], []
    for k in range(len(imu["seq"])):
        n = int(imu["n"][k])
        dt = float(imu["dt_us"][k])
        base = float(imu["device_ts_us"][k])
        s = imu["samples"][k]
        for i in range(n):
            gx, gy, gz = s[i * 6 + 3], s[i * 6 + 4], s[i * 6 + 5]
            mags.append(math.sqrt(gx * gx + gy * gy + gz * gz) * gyro_scale_dps)
            times.append(base + i * dt)
    t = device_to_host_s(np.array(times, dtype=np.float64), fit)
    return t, np.array(mags, dtype=np.float64)


def find_gaps(imu, fit):
    """Spans where the BLE link lost notifications.

    The firmware ring-buffers rather than dropping, so a seq gap means the LINK
    lost data. Those spans must be invalidated, never interpolated across --
    interpolation fabricates motion that never happened.
    """
    seq = imu["seq"]
    host = device_to_host_s(imu["device_ts_us"], fit)
    gaps = []
    for i in range(1, len(seq)):
        if seq[i] != (seq[i - 1] + 1) % 65536:
            gaps.append({"from_s": float(host[i - 1]), "to_s": float(host[i]),
                         "duration_s": float(host[i] - host[i - 1])})
    return gaps


# --------------------------------------------------------------------------
# Layer 2 — video motion energy
# --------------------------------------------------------------------------

def video_motion_energy(path, fps=VIDEO_SAMPLE_FPS):
    """(pts_seconds, score) from ffmpeg scdet.

    Same signal definition as scripts/kb/motion_profile.sh so there is exactly
    one notion of "video motion" in the codebase. scdet reports lavfi.scd.time
    from PTS, so the variable/ramping frame rate is handled correctly and the
    times are true rather than index*1/fps.
    """
    cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-i", path,
           "-vf", f"scale=160:-1,fps={fps},scdet=s=1:t=0", "-f", "null", "-"]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    pat = re.compile(r"lavfi\.scd\.score:\s*([0-9.]+).*?lavfi\.scd\.time:\s*([0-9.]+)", re.S)
    times, scores = [], []
    for line in proc.stderr.splitlines():
        m = pat.search(line)
        if m:
            scores.append(float(m.group(1)))
            times.append(float(m.group(2)))
    if not times:
        raise SystemExit(f"{path}: no scdet output — is this a readable video?")
    return np.array(times), np.array(scores)


def resample(t, v, grid):
    return np.interp(grid, t, v, left=np.nan, right=np.nan)


def normalise(x):
    x = x - np.nanmean(x)
    sd = np.nanstd(x)
    return x / sd if sd > 0 else x


def cross_correlate(vid_t, vid_v, imu_t, imu_v, window_s=SEARCH_WINDOW_S):
    """Find the offset that places video PTS on the phone clock.

    Returns (offset_s, peak, peak_ratio, lags, corr). offset_s is the host time
    corresponding to video PTS = 0.
    """
    dt = 1.0 / CANONICAL_HZ
    # Work on the IMU's span; video slides across it.
    grid = np.arange(imu_t[0], imu_t[-1], dt)
    if len(grid) < 10:
        raise SystemExit("IMU span too short to correlate")
    imu_r = normalise(resample(imu_t, imu_v, grid))

    max_lag = int(window_s / dt)
    lags, corr = [], []
    for lag in range(-max_lag, max_lag + 1):
        # candidate: video PTS 0 sits at grid[0] + lag*dt
        cand_t = vid_t + grid[0] + lag * dt
        vr = resample(cand_t, vid_v, grid)
        ok = ~np.isnan(vr) & ~np.isnan(imu_r)
        if ok.sum() < max(20, 0.2 * len(grid)):
            continue
        c = float(np.dot(normalise(vr[ok]), normalise(imu_r[ok])) / ok.sum())
        lags.append(lag)
        corr.append(c)
    if not corr:
        raise SystemExit("no overlap between video and IMU spans")

    lags = np.array(lags)
    corr = np.array(corr)
    k = int(np.argmax(corr))
    peak = float(corr[k])

    # Sub-sample refinement by parabolic interpolation about the peak.
    frac = 0.0
    if 0 < k < len(corr) - 1:
        y0, y1, y2 = corr[k - 1], corr[k], corr[k + 1]
        den = y0 - 2 * y1 + y2
        if den != 0:
            frac = 0.5 * (y0 - y2) / den
    offset = grid[0] + (lags[k] + frac) * dt

    # Sharpness: peak vs the best competitor at least 0.5 s away. A broad or
    # rivalled peak means the session is GUESSED, not aligned.
    far = np.abs(lags - lags[k]) > int(0.5 / dt)
    second = float(np.max(corr[far])) if far.any() else 0.0
    ratio = peak / second if second > 0 else float("inf")
    return offset, peak, ratio, lags * dt, corr


def rolling_offsets(vid_t, vid_v, imu_t, imu_v, offset, window_s=None):
    """Per-window offsets, to show the residual is stable across the session."""
    out = []
    start = max(imu_t[0], vid_t[0] + offset)
    end = min(imu_t[-1], vid_t[-1] + offset)
    # Adapt to the session: a fixed 5-minute window yields ZERO windows on a
    # short capture, and zero windows must not be mistaken for zero spread.
    if window_s is None:
        window_s = max(10.0, min(300.0, (end - start) / 4.0))
    w = window_s
    t = start
    while t + w <= end:
        vm = (vid_t + offset >= t) & (vid_t + offset < t + w)
        im = (imu_t >= t) & (imu_t < t + w)
        if vm.sum() > 30 and im.sum() > 30 and np.std(imu_v[im]) > 1e-6:
            try:
                o, pk, ratio, _, _ = cross_correlate(
                    vid_t[vm] + offset - t, vid_v[vm], imu_t[im] - t, imu_v[im], window_s=1.0)
                out.append({"start_s": float(t), "offset_delta_ms": float(o * 1e3),
                            "peak": float(pk)})
            except SystemExit:
                pass
        t += w
    return out


# --------------------------------------------------------------------------
def verdict_for(residual_ms, ppm, gaps, saturated):
    hard = []
    for g in gaps:
        if g["duration_s"] > GAP_INVALIDATE_S:
            hard.append(f"BLE gap {g['duration_s']:.1f}s at {g['from_s']:.1f}s")
    if saturated:
        hard.append(f"{saturated} saturated IMU values (FSR clipping)")
    if hard:
        return "reject", hard
    if residual_ms is None:
        return "unknown", []
    if residual_ms < ACCEPT_MS and abs(ppm) <= MAX_ABS_PPM:
        return "accept", []
    if residual_ms < FLAG_MS:
        return "flag", [f"residual {residual_ms:.1f}ms or ppm {ppm:.1f} outside tight band"]
    return "reject", [f"residual {residual_ms:.1f}ms > {FLAG_MS}ms"]


def self_test():
    """Prove the correlation path recovers a KNOWN offset from synthetic data.

    This exists because a real end-to-end check needs a video and an IMU log
    recorded simultaneously, which no archived session has. It validates the
    algorithm, not the rig.
    """
    print("self-test: recovering known offsets from synthetic signals")
    rng = np.random.default_rng(7)
    fs = 50.0
    dur = 120.0
    t = np.arange(0, dur, 1 / fs)
    # Shared "head motion": bursts of activity separated by stillness.
    base = np.zeros_like(t)
    # Broad activity bursts (working sets) ...
    for c in (12, 30, 47, 65, 88, 104):
        base += np.exp(-0.5 * ((t - c) / 1.2) ** 2) * (1 + 0.4 * np.sin(2 * np.pi * 1.3 * t))
    # ... plus sharp nod triplets, which are what make the peak unambiguous.
    for c in (5.0, 6.0, 7.0, 112.0, 113.0, 114.0):
        base += 2.5 * np.exp(-0.5 * ((t - c) / 0.09) ** 2)
    ok = True
    for true_off in (-3.7, -0.4, 0.0, 1.9, 5.25):
        imu_t, imu_v = t, base + 0.05 * rng.standard_normal(t.size)
        # Video observes the same motion, sampled differently and noisier.
        # A video sample at PTS `vt` sees host time vt + true_off, so video
        # PTS 0 sits at host time `true_off` — that is what must come back.
        vt = np.arange(0, dur - abs(true_off) - 1, 1 / 30.0)
        vv = np.interp(vt + true_off, t, base) + 0.08 * rng.standard_normal(vt.size)
        off, peak, ratio, _, _ = cross_correlate(vt, vv, imu_t, imu_v)
        err_ms = (off - true_off) * 1e3
        good = abs(err_ms) < ACCEPT_MS
        ok &= good
        print(f"  true {true_off:+6.2f}s -> got {off:+6.2f}s  "
              f"err {err_ms:+7.1f} ms  peak {peak:.3f} ratio {ratio:5.2f}  "
              f"{'PASS' if good else 'FAIL'}")
    print("self-test:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--session", help="session dir with imu.jsonl + meta.json")
    ap.add_argument("--video", help="ShenYao IPS_*.mp4")
    ap.add_argument("--clock-only", action="store_true",
                    help="layer 1 only — needs no video")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--out", help="write session.json here (default: <session>/session.json)")
    args = ap.parse_args()

    if args.self_test:
        return self_test()
    if not args.session:
        ap.error("--session is required (or --self-test)")

    imu_path = os.path.join(args.session, "imu.jsonl")
    meta_path = os.path.join(args.session, "meta.json")
    imu = load_imu(imu_path)
    meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
    gyro_scale = (meta.get("device", {}) or {}).get("gyro_scale_dps_per_lsb") or 0.0625
    saturated = (meta.get("link", {}) or {}).get("saturated_values", 0)

    fit = fit_clock(imu)
    gaps = find_gaps(imu, fit)

    print("=" * 68)
    print(f"  packets            : {len(imu['seq'])}")
    print(f"  session span       : {fit['span_s']:.1f} s")
    print(f"  clock slope        : {fit['slope']:.9f}")
    print(f"  drift              : {fit['ppm']:+.1f} ppm "
          f"({fit['ppm'] * fit['span_s'] / 1e6 * 1e3:+.1f} ms over this session)")
    print(f"  extrapolated 65min : {fit['ppm'] * 3900 / 1e6 * 1e3:+.1f} ms")
    print(f"  fit residual sd    : {fit['residual_sd_ms']:.2f} ms  "
          f"(BLE arrival jitter, not clock error)")
    print(f"  seq gaps           : {len(gaps)}")
    print(f"  saturated values   : {saturated}")
    if abs(fit["ppm"]) > MAX_ABS_PPM:
        print(f"  !! |ppm| > {MAX_ABS_PPM} — suspect dropped packets, not the crystal")

    result = {"clock": {k: v for k, v in fit.items() if not k.startswith("_")},
              "gaps": gaps, "saturated_values": saturated}

    if args.clock_only or not args.video:
        v, reasons = verdict_for(None, fit["ppm"], gaps, saturated)
        result["verdict"] = v
        result["reasons"] = reasons
        print(f"  verdict            : {v} (clock only — no video supplied)")
        print("=" * 68)
    else:
        imu_t, imu_v = expand_gyro(imu, fit, gyro_scale)
        vid_t, vid_v = video_motion_energy(args.video)
        print(f"  video samples      : {len(vid_t)}  span {vid_t[-1] - vid_t[0]:.1f} s")

        offset, peak, ratio, _, _ = cross_correlate(vid_t, vid_v, imu_t, imu_v)
        windows = rolling_offsets(vid_t, vid_v, imu_t, imu_v, offset)
        spread = (float(np.std([w["offset_delta_ms"] for w in windows]))
                  if len(windows) > 1 else None)
        # Unmeasurable is NOT zero. Defaulting to 0.0 would read as a perfect
        # alignment on a session that was never actually checked.
        residual = spread

        print(f"  video PTS 0 at     : host {offset:.3f} s")
        print(f"  correlation peak   : {peak:.3f}  (sharpness ratio {ratio:.2f})")
        print(f"  windows            : {len(windows)}"
              + (f"  offset spread {spread:.1f} ms" if spread is not None else ""))
        if peak < MIN_PEAK or ratio < MIN_RATIO_REJECT:
            print("  !! no usable correlation — session is GUESSED, not aligned")
        elif ratio < MIN_RATIO_ACCEPT:
            print("  !! peak is rivalled — treat alignment as provisional")

        v, reasons = verdict_for(residual, fit["ppm"], gaps, saturated)
        if peak < MIN_PEAK or ratio < MIN_RATIO_REJECT:
            v = "reject"
            reasons = [f"no usable correlation (peak {peak:.3f}, ratio {ratio:.2f}) — "
                       "streams are unrelated or the session has no shared motion"]
        elif ratio < MIN_RATIO_ACCEPT and v == "accept":
            v, reasons = "flag", ["correlation peak not sharp"]
        result["video"] = {"path": os.path.abspath(args.video),
                           "pts0_host_s": float(offset), "peak": float(peak),
                           "peak_ratio": float(ratio), "windows": windows,
                           "offset_spread_ms": spread}
        result["verdict"] = v
        result["reasons"] = reasons
        print(f"  VERDICT            : {v.upper()}"
              + (f"  ({'; '.join(reasons)})" if reasons else ""))
        print("=" * 68)

    out = args.out or os.path.join(args.session, "session.json")
    with open(out, "w") as fh:
        json.dump(result, fh, indent=2)
    print(f"wrote {out}")
    return 0 if result["verdict"] in ("accept", "flag", "unknown") else 1


if __name__ == "__main__":
    sys.exit(main())
