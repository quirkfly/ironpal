#!/usr/bin/env python3
"""Build deterministic IMU fixtures for the Maestro e2e harness.

## What is real here, and what is not — read this before trusting a number

The IronPal model is driven by the **IMU**, not by video. The knowledge-base clips
(`input/kb/clips/*.mp4`, cases 001-007) are egocentric *video* with human-confirmed ground
truth; no video can drive the rep clock, so a clip cannot be replayed into the app.

What the KB does give us is **confirmed rep counts and cadences**, and those are what these
fixtures are built to reproduce. So:

  * `real-stationary.jsonl`  — a VERBATIM COPY of a genuine headband recording
    (`input/kb/sessions/2026-08-05T13-18-09-917Z`, the B2 bring-up: 408 packets, 3264 samples,
    0 seq gaps, |accel| 0.98-0.99 g throughout). The board was sitting still, so it contains no
    exercise motion at all — which makes it the honest fixture for the paths that must NOT fire:
    gate never opens, zero reps, quality gate fails, set kept but not counted.

  * every other fixture is **SYNTHESISED** at a cadence and rep count taken from the KB case
    ledger, so the assertions in the flows are the same numbers a human confirmed on the clips.
    They are not recordings and are never described as such.

| Fixture | Reps | Source of the number |
|---|---|---|
| `real-stationary`        | 0  | real recording, no motion (bring-up session) |
| `split-squat-8reps`      | 8  | synthesised, Campaign-1 head-moving profile |
| `case001-curl-6reps`     | 6  | synthesised at case 001's confirmed 6 reps/arm |
| `case002-curl-4reps`     | 4  | synthesised at case 002's confirmed 4 reps |
| `case003-pushdown-5reps` | 5  | synthesised at case 003's confirmed 5 reps (`hard` class) |
| `noise-no-reps`          | 0  | synthesised aperiodic jitter — the reject/UNKNOWN path |

Wire format matches `ImuSessionLogger` exactly (one JSON object per PACKET, raw int16 LSB,
8 samples/packet, measured `dt_us`), so `ReplayImuSource` parses fixtures and real recordings
through the same code path.

Usage:
  python3 scripts/e2e/make_imu_fixtures.py            # writes poc/mobile/e2e/fixtures/
"""
import json, math, os, pathlib, random, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "poc/mobile/e2e/fixtures"
REAL_SESSION = ROOT / "input/kb/sessions/2026-08-05T13-18-09-917Z"

ODR_HZ = 60.0
DT_US = int(round(1e6 / ODR_HZ))
SAMPLES_PER_PACKET = 8
ACCEL_LSB_PER_G = 1000.0          # 0.001 g/LSB, per the firmware config characteristic
GYRO_LSB_PER_DPS = 16.0           # 0.0625 dps/LSB

META = {
    "schema": "ironpal.imu/1",
    "partial": False,
    "source": "FIXTURE",
    "device": {
        "name": "IronPal-IMU (synthetic fixture)",
        "firmware": "fixture",
        "nominal_odr_hz": int(ODR_HZ),
        "accel_scale_g_per_lsb": 1.0 / ACCEL_LSB_PER_G,
        "gyro_scale_dps_per_lsb": 1.0 / GYRO_LSB_PER_DPS,
        "accel_fsr_g": 8,
        "gyro_fsr_dps": 1000,
        "sample_order": "ax,ay,az,gx,gy,gz",
        "sample_units": "raw int16 LSB -- multiply by the scales above",
    },
}


def clamp16(v):
    return max(-32768, min(32767, int(round(v))))


def write_jsonl(path, samples, label, reps, note):
    """samples: list of (ax,ay,az,gx,gy,gz) in LSB."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        seq = 0
        ts_us = 1_000_000
        for i in range(0, len(samples) - SAMPLES_PER_PACKET + 1, SAMPLES_PER_PACKET):
            block = []
            for s in samples[i:i + SAMPLES_PER_PACKET]:
                block.extend(clamp16(v) for v in s)
            f.write(json.dumps({
                "seq": seq & 0xFFFF,
                "device_ts_us": ts_us,
                "host_ns": ts_us * 1000,
                "n": SAMPLES_PER_PACKET,
                "dt_us": DT_US,
                "s": block,
            }, separators=(",", ":")) + "\n")
            seq += 1
            ts_us += SAMPLES_PER_PACKET * DT_US
    meta = dict(META)
    meta["fixture"] = {"label": label, "expected_reps": reps, "note": note,
                       "duration_s": round(len(samples) / ODR_HZ, 2)}
    (path.parent / (path.stem + ".meta.json")).write_text(json.dumps(meta, indent=1))
    print(f"  {path.name:<30} {len(samples):5d} samples  {len(samples)/ODR_HZ:5.1f}s  reps={reps}")


def rep_trace(seconds, cadence_hz, amp_g, axis=2, gyro_dps=12.0, jitter=0.02, seed=7):
    """A head-moving rep profile: gravity on `axis` plus a sinusoid at the rep cadence.

    Gravity is included because ReplayImuSource subtracts a slow EMA (~0.13 Hz corner) exactly as
    the live BLE path does; a fixture without it would be filtered differently from real data.
    """
    rnd = random.Random(seed)
    n = int(seconds * ODR_HZ)
    out = []
    for i in range(n):
        t = i / ODR_HZ
        osc = amp_g * math.sin(2 * math.pi * cadence_hz * t)
        a = [rnd.gauss(0, jitter) for _ in range(3)]
        a[axis] += -1.0 + osc                      # -1 g rest + rep oscillation
        g = [rnd.gauss(0, 0.4) for _ in range(3)]
        # Gyro follows the same cadence on the pitch axis (head pitches through a squat).
        g[0] += gyro_dps * math.cos(2 * math.pi * cadence_hz * t)
        out.append((a[0] * ACCEL_LSB_PER_G, a[1] * ACCEL_LSB_PER_G, a[2] * ACCEL_LSB_PER_G,
                    g[0] * GYRO_LSB_PER_DPS, g[1] * GYRO_LSB_PER_DPS, g[2] * GYRO_LSB_PER_DPS))
    return out


def noise_trace(seconds, seed=11):
    """Aperiodic jitter — energy without periodicity, so the gate must stay shut."""
    rnd = random.Random(seed)
    n = int(seconds * ODR_HZ)
    out = []
    for _ in range(n):
        a = [rnd.gauss(0, 0.05) for _ in range(3)]
        a[2] += -1.0
        g = [rnd.gauss(0, 3.0) for _ in range(3)]
        out.append((a[0] * ACCEL_LSB_PER_G, a[1] * ACCEL_LSB_PER_G, a[2] * ACCEL_LSB_PER_G,
                    g[0] * GYRO_LSB_PER_DPS, g[1] * GYRO_LSB_PER_DPS, g[2] * GYRO_LSB_PER_DPS))
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"writing fixtures -> {OUT.relative_to(ROOT)}")

    # 1. The one genuine recording, copied verbatim.
    src = REAL_SESSION / "imu.jsonl"
    if src.exists():
        shutil.copy(src, OUT / "real-stationary.jsonl")
        meta = json.loads((REAL_SESSION / "meta.json").read_text())
        meta["fixture"] = {
            "label": "real-stationary",
            "expected_reps": 0,
            "note": "VERBATIM COPY of the 2026-08-05 B2 bring-up recording. Board stationary "
                    "(|accel| 0.98-0.99 g), so there is no exercise motion: this is the fixture "
                    "for the gate-never-opens / not-counted paths.",
        }
        (OUT / "real-stationary.meta.json").write_text(json.dumps(meta, indent=1))
        print(f"  {'real-stationary.jsonl':<30} (real recording, 3264 samples, 54.3s, reps=0)")
    else:
        print(f"  !! real session missing at {src} — skipping real-stationary", file=sys.stderr)

    # 2. Synthesised, rep counts taken from the KB case ledger.
    #    Cadence: 8 reps over 20 s = 0.4 Hz, comfortably inside the 0.2-1.5 Hz rep band.
    write_jsonl(OUT / "split-squat-8reps.jsonl", rep_trace(20.0, 0.40, 0.35),
                "split-squat-8reps", 8, "Campaign-1 head-moving profile, 0.40 Hz x 20 s")
    write_jsonl(OUT / "case001-curl-6reps.jsonl", rep_trace(15.0, 0.40, 0.22, gyro_dps=8.0, seed=101),
                "case001-curl-6reps", 6, "cadence/count from KB case 001 (alternating DB curl, 6 reps/arm confirmed)")
    write_jsonl(OUT / "case002-curl-4reps.jsonl", rep_trace(10.0, 0.40, 0.25, gyro_dps=9.0, seed=102),
                "case002-curl-4reps", 4, "count from KB case 002 (barbell curl, 4 reps confirmed)")
    write_jsonl(OUT / "case003-pushdown-5reps.jsonl", rep_trace(12.5, 0.40, 0.18, gyro_dps=5.0, seed=103),
                "case003-pushdown-5reps", 5, "count from KB case 003 (triceps cable pushdown, 5 reps confirmed; `hard` class -- the app must DECLINE to certify these reps)")
    write_jsonl(OUT / "noise-no-reps.jsonl", noise_trace(15.0),
                "noise-no-reps", 0, "aperiodic jitter: energy without periodicity, gate must stay shut")

    print("\nfixtures written. Real recordings are marked as such in each .meta.json.")


if __name__ == "__main__":
    main()
