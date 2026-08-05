# How two-app synchronisation works

The capture rig is **two apps that cannot talk to each other**: the ShenYao USB Camera app records
video, and the IronPal app logs the headband IMU. ShenYao is closed-source with no plugin API, no
broadcast intent and no callback, so there is no IPC-based answer. This is the method that aligns
them anyway.

Reference implementation: [`scripts/kb/sync_imu_video.py`](../scripts/kb/sync_imu_video.py).
Full design rationale: [`ironpal-imu-camera-sync-plan.md`](ironpal-imu-camera-sync-plan.md) §4.
Operating procedure: [`ironpal-shenyao-capture-procedure.md`](ironpal-shenyao-capture-procedure.md).

---

## 1. What links the two recordings

Not software — **physics**. The head wearing the camera is the head wearing the IMU, so both
instruments observe the same rotation. A head turn sweeps the whole video frame and simultaneously
shows up as angular velocity on the gyro. Those two signals are measurements of one physical event,
so correlating them recovers the time offset between the files.

---

## 2. Only one clock actually drifts

This is the observation that makes the problem tractable, and it is easy to miss.

| Pair | Relationship |
|---|---|
| Nano `device_ts_us` ↔ phone | **Drifts.** Independent crystals. Measured **−52.8 ppm ≈ −206 ms per 65 min** (B2). |
| Video PTS ↔ phone `host_ns` | **No relative drift.** ShenYao records *on the phone*; its PTS is generated from the phone's own clock — the same oscillator `host_ns` comes from. |

So the Nano's crystal is the only moving part. Handle it, and **exactly one unknown remains: the host
time at which video PTS = 0** — a single scalar.

---

## 3. Layer 1 — the IMU→phone mapping, from `imu.jsonl` alone

`ImuSessionLogger` writes **both clocks on every packet**: `device_ts_us` (already unwrapped past the
71.6 min `micros()` rollover) and `host_ns` (`elapsedRealtimeNanos`). A 65 min session yields ~30 000
paired observations of precisely the mapping being fitted.

So regress `host_ns` on `device_ts_us` across the whole session:

```
host_ns ≈ a · device_ts_us + b        a → rate ratio (report as ppm), b → offset
```

**This needs no video and no nods.** The IMU→phone mapping is a self-contained, independently
verifiable calculation — which also means it can be checked *before* a gym trip rather than after.

**Do not use the endpoint difference.** BLE notification jitter spans ±67 ms (residual sd 15.9 ms).
On a real 44 s capture the endpoint calculation returned **−164 ppm** where the regression returned
**−52.8 ppm**. Fit the line; do not subtract two numbers.

### Why the device clock is still worth keeping

It is tempting to drop `device_ts_us` and stamp every sample with its packet's `host_ns`. Don't. The
device clock is *smooth* — a crystal with sub-millisecond jitter — while `host_ns` carries BLE
arrival jitter of ~16 ms per packet. The right combination uses **the device clock for local timing
within and between packets, and the fitted line to place it globally on the phone clock.** The
regression averages the jitter over tens of thousands of points, so the fitted line is far more
accurate than any individual packet's arrival time.

---

## 4. Layer 2 — video→phone, one constant offset

Cross-correlate two signals:

| Stream | Signal |
|---|---|
| Video | frame-to-frame motion energy at true PTS (ffmpeg `scdet`, as used by `motion_profile.sh`) |
| IMU | **gyroscope magnitude** ‖ω‖ |

**Gyro, not accelerometer.** Frame-to-frame image change is dominated by *rotation* — a small head
rotation sweeps the entire frame, while translation barely changes it. Accelerometer mostly measures
gravity plus body bounce and correlates far more weakly with what the camera sees. Using accel here
is the obvious-looking mistake.

The three head nods give a high-SNR anchor that seeds the search window; the correlation does the
alignment.

**A useful side effect:** because correlation aligns the *observed* signals, the offset it returns
already absorbs every fixed latency in the camera path — sensor readout, MJPEG encode, USB transfer —
without any of them needing to be measured.

---

## 5. Two operational rules

**Do not nod at t = 0.** ShenYao's frame rate ramps **21.69 → 26.05 → 29.76 fps** with jitter falling
**8.0 → 3.8 ms**. A nod at the start anchors alignment to the least reliable part of the whole
recording. Start recording, let it settle **~60 s**, then nod. Nod again at the end — two anchors far
apart are what make a drift check possible.

**The filename pairs; the correlation aligns.** `IPS_<wallclock>.mp4` and `meta.json`'s
`started_wall_ms` are both wall clock, so the filename identifies *which* IMU session a video belongs
to. It is good to seconds, never better. Use it to pair files, **never** to align them.

---

## 6. Where this degrades, and what to do about it

Correlation needs motion in *both* signals. **22 of 37 Tier-1 exercises are `rep_signal: vision`** —
head still, both signals quiet. That is exactly where sync matters most and where it works least.

The mitigation is that alignment does not depend on the working sets: rolling correlation runs across
the **whole session**, and walking between machines, plate loading and setup all carry plenty of
motion. The nods provide guaranteed anchors regardless.

### Hard invalidators, regardless of residual

- a **BLE gap > 2 s** not followed by re-anchoring nods (`seq_gaps` in `meta.json`)
- any **saturated IMU window** — FSR clipping is a difference in kind, not degree
- a **broad or ambiguous correlation peak** — the session is then *guessed*, not aligned

### Accept / flag / reject

| Post-alignment residual | Verdict | Usable for |
|---|---|---|
| **< 40 ms** (one frame) | ✅ accept | everything |
| **40–80 ms**, or rate ratio outside ±100 ppm | ⚠️ flag, keep | exercise ID only — not rep boundaries |
| **> 80 ms** | ❌ reject | nothing |

At ~13 planned sessions, rejecting one costs ~8 % of the dataset — which is the argument for strict
*pre-session* gates rather than strict post-hoc rejection.

---

## 7. One caveat worth knowing

`elapsedRealtimeNanos` is `CLOCK_BOOTTIME` (counts through suspend); some recorders timestamp from
`CLOCK_MONOTONIC` (does not). They advance identically while the device is awake and diverge only
across deep sleep. Both apps hold wake locks during capture, so this should never fire — but if a
session shows a **step discontinuity** rather than smooth drift, suspect this before suspecting the
crystal.
