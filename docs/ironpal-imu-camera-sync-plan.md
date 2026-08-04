# IronPal — IMU ⇄ Camera Synchronised Capture Plan

**Status:** Draft v1 · 2026-08-04
**Hardware:** Arduino Nano 33 BLE Rev2 (nRF52840 + BMI270 + BMM150) — purchased, not yet built.
ELP 4K USB fisheye driven by the **ShenYao USB Camera** Android app (third-party, closed source).
**Consumes:** `docs/ironpal-imu-poc-integration-plan.md` (hardware/BOM) ·
**Feeds:** `docs/ironpal-supervised-learning-phase-plan.md` (§1.2 capture, §2.1 IMU-gated capture)

---

## 0. The decision: do not integrate with the app at all

The task asks how to integrate the IMU with the ShenYao app. **The answer is that you should not,
and do not need to.**

- ShenYao's app is **closed-source third party**. It exposes no plugin API, no broadcast intent, no
  timestamp callback — there is nothing to integrate *with*.
- Reverse-engineering it is off the table for the same reason the Fitbod scrape was
  (`ironpal-supervised-learning-phase-plan.md` §1.1): decompiling a third-party app to hook its
  internals implicates its terms, and in the EU lawful decompilation is interoperability-only and
  narrow. It would also break on any app update, mid-collection.
- **You don't need it.** The camera and the IMU are bolted to the *same headband*. Every head
  movement is therefore recorded by both instruments simultaneously. That shared physical motion is
  a free, continuous, self-generated sync signal — richer than any timestamp the app could hand you.

**Architecture: two independent recorders, aligned after the fact.**

```
ShenYao app  ──► /sdcard/DCIM/USBCamera/IPS_*.mp4      (video, untouched)
                                                        ├─► post-hoc alignment
Nano 33 BLE ──BLE──► companion app ──► imu.jsonl       (motion + labels)
                                                        └─► session.json (offset + drift)
```

Nothing is modified, nothing is hooked, nothing breaks when ShenYao ships an update.

---

## 1. What the app actually gives us (measured, not assumed)

Before designing the sync, the existing capture was measured. Two findings change the design.

### 1.1 The app's timestamps are not usable for synchronisation

On `IPS_2026-08-02.15.33.00.0640.mp4`:

| Source | Value | Meaning |
|---|---|---|
| Filename | `15.33.00` (local) | recording **start** |
| Container `creation_time` | `2026-08-02T13:34:56Z` → 15:34:56 local | file **close** |
| Duration | 106.34 s | — |

15:33:00 + 106 s = 15:34:46, and the container says 15:34:56. **The two timestamps disagree by
116 s** because they measure different events — start vs. close (plus ~10 s of mux/finalise). Both
are **1-second resolution** (`creation_time` ends `.000000`).

> **Consequence:** file timestamps can bracket a session to ±2 s. They can never align a rep. Use
> them only to seed the search window for §4's cross-correlation, never as the alignment itself.

### 1.2 The capture is variable frame rate — this is the bigger finding

Measured over a 20 s window (457 frames):

| Metric | Value |
|---|---|
| Header-declared rate | 25.41 fps |
| **Actually measured in-window** | **22.86 fps** |
| Frame delta | min 28.3 ms, max 62.1 ms, mean 43.8 ms |
| **Jitter** | **33.8 ms** — more than one nominal frame |

USB UVC capture on Android drops and delays frames under load. **Frame *N* is not at *N*/fps.**

> **Consequences, all load-bearing:**
> 1. Every frame reference — rep boundaries, staging glances, extracted stills — must come from the
>    **actual PTS**, never from a raw frame index times the header's nominal rate (which is a
>    whole-clip average and, as measured above, off by ~10 % locally).
>    *Checked: the existing KB scripts are safe.* `motion_profile.sh` reads `lavfi.scd.time`, and
>    ffmpeg's `fps` filter is PTS-aware, so `extract_frames.sh`'s uniform output grid maps back to
>    real time correctly. The exposure is in **new** code — label exports, the Label Studio
>    round-trip, and any hand-rolled `index / fps` arithmetic — where it must be avoided.
> 2. **The video clock is the unreliable one.** This inverts the intuition: the IMU (a steady
>    100 Hz off a crystal) is the *better* clock. Use the IMU as the time base and map video onto
>    it, not the reverse.
> 3. It strengthens the case for the IMU carrying the rep clock — already the plan for the 13
>    `rep_signal: imu` exercises.

---

## 2. Firmware — Nano 33 BLE Rev2 (bring-up from zero)

**Library: `Arduino_BMI270_BMM150`.** The Rev2 carries a Bosch BMI270 + BMM150. The original Nano
33 BLE used an LSM9DS1 and the `Arduino_LSM9DS1` library — **that library will not work on your
board**, and this is the single most common Rev2 bring-up failure.

### 2.1 Sampling and packet format

Target **100 Hz**, 6 axes (accel + gyro). Raw budget: 100 × 6 × 2 B = 1.2 kB/s — trivial for BLE,
*provided you batch*. One notification per sample at 100 Hz will not fit BLE's connection interval.

Negotiate MTU (nRF52840 supports up to 247 B) and pack **8 samples per notification** → 12.5
notifications/s:

```
offset  size  field
0       2     seq          uint16, wraps — detects dropped notifications
2       4     device_ts_us uint32, micros() of the FIRST sample in the packet
6       1     n            sample count in this packet (8)
7       1     odr_code     sampling rate, so the parser never assumes
8..     96    samples      8 × { ax ay az gx gy gz } as int16 little-endian
                           (raw LSB; scale factors sent once via the config characteristic)
```

Total 104 B — comfortably inside a 247 B MTU with headroom for a larger batch later.

Samples within a packet are evenly spaced at 1/ODR, so only the first needs a timestamp. **Send raw
int16 with scale factors advertised separately** — converting to float on-device doubles the payload
and loses nothing.

### 2.2 BLE service

| Characteristic | Props | Purpose |
|---|---|---|
| IMU data | notify | the packet above |
| Control | write | start/stop, set ODR/FSR, **fire sync LED** |
| Config | read | scale factors, firmware version, ODR |

Keep the connection interval short (7.5–15 ms) — request it from the central. Long intervals batch
notifications and add latency jitter, which directly widens the §4 alignment uncertainty.

### 2.3 What the firmware must NOT do

- **Do not timestamp with `millis()`** — 1 ms resolution is a tenth of your target alignment budget.
  Use `micros()`.
- **Do not drop samples silently on BLE backpressure.** Ring-buffer them and let `seq` expose the
  gap; a silent gap becomes an invisible time shift downstream.

---

## 3. Companion Android app (the only software you write now)

Deliberately small. It does **not** touch video.

**Responsibilities:**

1. **BLE logger** — scan, connect, subscribe, and append to `imu.jsonl`. For every packet record
   **both clocks**:
   - `device_ts_us` — from the Nano (precise spacing, but drifts)
   - `host_rx_ns` — `SystemClock.elapsedRealtimeNanos()` on receipt (BLE-jittered, but tied to the
     phone's monotonic clock, which is what video must ultimately map onto)
   - `seq` — so dropped packets are detectable rather than silently interpolated
2. **Session metadata** — writes the `meta.json` §1.2 of the collection plan requires: rig id and
   **rotation (ELP = 180°)**, gym, lifter, consent reference, firmware version, ODR.
3. **Ground-truth capture** — the tap-to-log exercise/reps/weight the collection plan wants
   "while memory is fresh." Same app, same session folder, no extra device to juggle.

**Deliberately out of scope:** video preview, video recording, controlling ShenYao. Adding any of
those pulls you into UVC-on-Android, which is a multi-week project (see §8).

Use the Nordic Android BLE library rather than raw `BluetoothGatt` — it handles the connection
state machine, MTU negotiation and reconnection that otherwise eat a week.

---

## 4. Synchronisation — cross-correlating shared motion

### 4.1 The signal pair

Because camera and IMU are rigidly coupled, head motion appears in both. Choose the channels that
actually correspond:

| Stream | Signal | Why this one |
|---|---|---|
| Video | frame-to-frame motion energy, sampled at true PTS | **already computed** by `scripts/kb/motion_profile.sh` |
| IMU | **gyroscope magnitude** ‖ω‖ | Frame-to-frame image change is dominated by **rotation** — a small head rotation sweeps the whole frame, while translation barely changes it. Gyro correlates with video motion energy far better than accelerometer does. |

Using accel here is the obvious-looking mistake; it mostly measures gravity plus body bounce, which
is only weakly related to what the camera sees.

### 4.2 Deliberate sync events (cheap insurance)

At the **start and end** of every session, with the headband on: **three sharp head nods**, roughly
one per second. Costs three seconds and gives:

- an unmistakable correlation peak to bootstrap the search,
- two anchors far apart in time — which is what makes drift estimable (§4.4).

An LED flash from the Nano is *not* useful here: the IMU sits on the headband beside the camera,
outside its field of view. Motion is the shared channel, not light.

### 4.3 Alignment procedure

1. Bracket the offset from the filename timestamp (§1.1) → search window ±5 s.
2. Resample both signals to a common 50 Hz grid — video via **true PTS**, IMU via `device_ts_us`.
3. Normalise both (zero mean, unit variance) and cross-correlate over the window.
4. Take the peak → coarse offset. Refine to sub-frame by parabolic interpolation around the peak.
5. Repeat on the trailing nods → second offset.
6. Fit a **linear clock model** between the two anchors (§4.4) and write `sync` into `session.json`.

Implement as `scripts/kb/sync_imu_video.py`, reusing `motion_profile.sh`'s energy computation so
there is one definition of video motion in the codebase.

### 4.4 Drift is real and must be modelled

The Nano's crystal and the phone's clock are independent. At a typical ±20–50 ppm the two diverge by
**72–180 ms over a one-hour session** — several video frames, enough to smear rep boundaries by the
end of a session even though the start looks perfect.

So do not fit a constant offset. Fit:

```
phone_time ≈ a · device_ts + b
```

with `a` (rate ratio) and `b` (offset) from the start and end anchors. Report `a` in ppm; a value
outside ±100 ppm means something is wrong (wrong ODR assumed, or dropped packets miscounted) — treat
it as a failed session rather than a calibration.

---

## 5. Validating that sync actually works

Sync silently wrong is the worst outcome — it degrades every downstream label without ever raising
an error. Prove it, per session:

- **Residual check.** After alignment, the sync-nod peaks should coincide within **< 1 frame
  (~40 ms)**. Log the residual into `session.json`. Fail the session above 80 ms.
- **Physical drop test** (bring-up only). Drop a light plate on the mat in frame: a sharp transient
  in video *and* a floor-borne spike in the IMU. Independent of the nods, so it validates the method
  rather than the anchor.
- **Rep-peak overlay.** For a handful of clips, plot IMU rep peaks over video rep apexes.
  `scripts/plot-sensors` already exists for this. If peaks sit systematically early or late, the
  clock model is wrong, not the rep detector.
- **Drift audit.** Once, on a deliberate 60-minute session: alignment at start, middle and end. If
  the residual grows non-linearly, the linear model is insufficient — likely thermal, and the fix is
  periodic re-anchoring (nods every ~15 min) rather than a fancier model.

---

## 6. Failure modes and mitigations

| Risk | Why it bites | Mitigation |
|---|---|---|
| **VFR assumed constant** | up to 34 ms error per frame, accumulating | Read PTS per frame everywhere. Audit existing tooling for `frame_index / fps`. |
| **BLE disconnect mid-session** | silent time gap; video keeps rolling | `seq` gaps are detectable → auto-reconnect, log the gap, re-anchor with nods after any gap > 2 s. |
| **Clock drift ignored** | end-of-session labels quietly misaligned | Two anchors + linear model (§4.4); reject sessions with |rate − 1| > 100 ppm. |
| **Forgotten sync nods** | session cannot be aligned confidently | Companion app **blocks "start session"** until nods are detected in the live IMU stream. Make it impossible to forget rather than remembering to. |
| **ShenYao app updates / changes filenames** | ingest breaks | Nothing depends on the app beyond the file; parse the timestamp defensively and fall back to file mtime. |
| **Phone sleeps / app backgrounded** | BLE logging stops | Foreground service + wake lock; verify sample count ≈ duration × ODR at ingest. |
| **IMU-gated capture (plan §2.1) needs the gate to drive recording** | ShenYao cannot be started/stopped programmatically | **Accept it for now:** record video continuously, use the IMU gate to *segment in post* rather than to *gate capture*. The storage saving moves from capture-time to ingest-time; the segmentation benefit is unchanged. Real capture-gating needs your own camera app (§8). |

That last row is a real scope correction to the collection plan and is called out in §7.

---

## 7. Correction this forces on the collection plan

`ironpal-supervised-learning-phase-plan.md` §2.1 assumes IMU-gated capture *stops the recorder*
during rest, cutting a 1-hour session by 60–75 % **at the source**. With a third-party camera app
that cannot be driven programmatically, **that is not achievable now**. Revised position:

- **Now (ShenYao):** record continuously; the IMU gate segments *at ingest*. You still get
  per-set clips and still discard rest footage — but you pay the full disk write during capture
  and must transcode more. A 1-hour session is ~28 GB raw before trimming, so **keep a good margin
  of free space on the phone** (≥ 64 GB card recommended).
- **Later (own capture app, §8):** the gate can drive the recorder and the original saving returns.

The training-data outcome is identical; only the storage profile differs. Worth updating §2.1 to
say so rather than discovering it on a full card mid-session.

---

## 8. When to write your own camera app (not now)

Eventually the MVP needs its own capture path — for IMU-gated recording (§7), embedded timestamps,
and a mini-camera over BLE/Wi-Fi rather than USB. The standard route is the
`saki4510t/UVCCamera` Android UVC library.

**Do not do this during the data-collection phase.** UVC-on-Android is fiddly (device permissions,
vendor quirks, frame formats), and a half-working camera app risks the dataset itself. Two
recorders plus post-hoc alignment is not a workaround — for *offline training data* it is the
better engineering choice, because it keeps a proven recorder in the critical path.

---

## 9. Bring-up milestones (from zero hardware)

| # | Milestone | Exit criterion | Effort |
|---|---|---|---|
| B0 | Board bring-up | `Arduino_BMI270_BMM150` printing 6 axes over USB serial at 100 Hz | half a day |
| B1 | BLE streaming | packets (§2.1) received by `nRF Connect`; no `seq` gaps over 10 min | 1–2 days |
| B2 | Companion app v0 | `imu.jsonl` + `meta.json` written; both clocks logged; foreground service survives screen-off | 3–4 days |
| B3 | Mount + first dual capture | headband rig, ShenYao recording, nods at both ends, files land in one session folder | half a day |
| B4 | `sync_imu_video.py` | start/end residual < 40 ms on 3 consecutive sessions | 2–3 days |
| B5 | Drift characterisation | 60-min session; rate ratio measured and written into the sync model | half a day |

**~2 weeks of part-time work.** B0–B1 are the risky ones (wrong library, MTU negotiation); B4 is the
one that must not be skipped, because everything downstream inherits its error.
