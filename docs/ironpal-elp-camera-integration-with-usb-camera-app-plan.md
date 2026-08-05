# Integrating the ELP USB camera into the IronPal POC app

Detailed implementation plan for bringing the **ELP 4K 200° fisheye (UVC)** into `poc/mobile` — the
same app that already streams the **Nano 33 BLE Rev2** IMU — so one app owns both streams and stamps
them with one clock.

**Related docs.** [`ironpal-shenyao-capture-procedure.md`](ironpal-shenyao-capture-procedure.md) is
the operating procedure for the *current* rig (ELP driven by the third-party ShenYao app) and stays
valid until this work is proven. [`ironpal-imu-camera-sync-plan.md`](ironpal-imu-camera-sync-plan.md)
§1 rejected *hooking into* ShenYao — that judgement stands and is not reopened. Owning capture is a
different proposition, and "closed source, no API, breaks on update" argues for it.

---

## 1. Why this is worth building

Four problems collapse into one fix. Only the first is about elegance; the rest are live defects in
the current rig.

**It deletes the alignment problem rather than solving it.** Today two independent recorders produce
two files with no shared clock, and alignment is recovered post-hoc by cross-correlating head motion,
seeded by a nod, against a < 40 ms budget. If our app owns capture, every frame carries
`SystemClock.elapsedRealtimeNanos()` — **the same clock already written as `host_ns` on every IMU
packet**. Alignment becomes a subtraction.

**It makes the variable frame rate a non-issue.** ShenYao's output ramps **21.69 → 26.05 → 29.76 fps**
across a clip. PTS math recovers this, but every downstream tool must keep getting it right forever.
Per-frame arrival timestamps make frame timing *recorded data*, not reconstructed inference.

**It is the only way the motion gate can ever act.** `TASK.md` asked for exactly this: use the IMU to
detect rest and only record while exercising. The gate exists (`ImuModule.onMotionGate`) and
**currently has nothing to act on**, because ShenYao does not listen. The A52 holds ~17 GB ≈ **36 min**
of 4K against a **65 min** session — it does not fit *today*. Gating is the only fix that reduces size
at the source; codecs and bigger cards do not change the ratio.

**One app means one session.** One foreground service, one storage precheck, one directory holding
`imu.jsonl`, `meta.json` and the video — instead of matching `IPS_*.mp4` filenames to session dirs by
wall clock, which silently mismatches when two sessions are captured close together.

### 1.1 What does *not* go away — stated precisely

- **The IMU's own drift stays.** The Nano's `micros()` runs **−52.8 ppm ≈ −206 ms per 65 min**
  (measured in B2). That is two crystals, not app architecture, and still needs its linear
  `device_ts_us → host_ns` fit.
- **Frame arrival ≠ exposure.** There is a pipeline latency between photons and the USB frame landing
  on the host: sensor readout, camera-side MJPEG encode, USB transfer. Integration does **not**
  eliminate it. What it does is convert it from an *unknown per-session offset* into a **roughly
  constant, once-calibratable** one (§7.3). That is the honest description of the win — not "perfect
  sync".

---

## 2. The decisive platform constraint, measured

```
$ adb shell getprop ro.build.version.release   ->  14   (SDK 34)
$ adb shell pm list features | grep camera
    android.hardware.camera.external            ABSENT
$ adb shell pm list features | grep usb
    feature:android.hardware.usb.host           PRESENT
```

**`android.hardware.camera.external` is absent on the A52 even on Android 14**, so Camera2/CameraX
**cannot enumerate the UVC camera at all**. Samsung did not enable the platform external-camera path.
The easy route is closed.

`android.hardware.usb.host` **is** present, so the route is the **USB Host API plus a userspace UVC
stack** — which is what ShenYao itself does. No root required.

> This single feature flag separates "an afternoon" from "a multi-week build". **Check it on any phone
> considered for the rig**, and never infer it from the Android version.

---

## 3. Architecture — mirror the IMU swap that already worked

The BLE backend succeeded because it slotted in behind an existing seam and changed nothing
downstream. Do the same here.

```
UsbManager (permission, attach intent)
      │
      ▼
UvcSource.kt  ── JNI ──►  libusb + libuvc (native)
      │                     ▲ wraps the fd from UsbDeviceConnection
      │
      ├──► frame callback: stamp elapsedRealtimeNanos, hand off buffer
      │
      ├──► VideoEncoder (MediaCodec) ──► MediaMuxer ──► session/video.mp4
      │
      └──► VideoSessionLogger ──────────────────────► session/frames.jsonl
                                                              ▲
ImuPipeline / BleImuSource ──► ImuSessionLogger ──► session/imu.jsonl, meta.json
                                                              │
                              both stamped with the SAME host clock
```

New Kotlin files, named to match the existing convention:

| File | Mirrors | Responsibility |
|---|---|---|
| `UvcSource.kt` | `BleImuSource.kt` | device discovery, permission, stream lifecycle, frame callbacks |
| `VideoEncoder.kt` | — | MediaCodec encode + MediaMuxer, segment control |
| `VideoSessionLogger.kt` | `ImuSessionLogger.kt` | `frames.jsonl`, extends `meta.json` |
| `CameraForegroundService` | reuse `ImuForegroundService` | one service covering both streams |

**Rig flag**, matching `IRONPAL_IMU_SOURCE`: `IRONPAL_CAMERA_SOURCE = NONE | UVC`. Default `NONE`
so POC v1 and the current ShenYao workflow are untouched by an unset flag — the same
"unset must never silently change behaviour" rule the IMU flag follows.

**Leave `CameraModule.kt` (CameraX, weight glance) alone.** It drives the *phone's* camera and is
independent. Note it currently throws `IllegalStateException: Not in application's main thread` — a
pre-existing bug, not caused by and not fixed by this work.

---

## 4. C0 — Bring-up: see the device, learn what it really does

**Goal: enumerate the ELP and print its actual capabilities.** No frames, no encode.

1. **Declare USB host intent filter** with `res/xml/device_filter.xml` so plugging the ELP in offers
   to launch IronPal. Filter on the ELP's VID/PID — read them from the device, do not copy them from a
   product page.
2. **Request permission** via `UsbManager.requestPermission()`. This is a runtime dialog, not a
   manifest permission; it must be handled before any native call.
3. **Open and hand the fd down.** `UsbDeviceConnection.getFileDescriptor()` → JNI. Android blocks
   direct `/dev/bus/usb` access, so libusb **must not** enumerate on its own. Use
   **`libusb_wrap_sys_device()`** (libusb ≥ 1.0.24) to adopt the already-open fd. This is the single
   API that makes rootless UVC work; a libusb build without it is a dead end.
4. **Enumerate formats** with libuvc and log every `format / resolution / fps` triple the camera
   actually reports.

**Exit criterion:** the device's real capability list, written into this doc. Not the spec sheet.

**Evaluate a maintained wrapper first.** The `UVCCamera` lineage and its active forks (e.g.
`UVCAndroid`, `AndroidUSBCamera`) already package libusb+libuvc+JNI for Android. Spending a day
evaluating one is cheaper than the weeks the JNI plumbing otherwise costs. Adopt one unless it blocks
the timestamp path in §7 — that path is non-negotiable and is the reason this project exists.

### 4.1 Format reality — MJPEG is mandatory at 4K

Uncompressed 4K is arithmetically impossible on USB 2.0:

```
3840 × 2160 × 2 B/px (YUY2) × 30 fps ≈ 497 MB/s
USB 2.0 practical                    ≈  40 MB/s
```

So the camera **must** deliver MJPEG at 4K, and the real question is what resolution/fps combination
the link sustains. Expect to characterise this rather than trust the label — the same lesson as the
firmware's 100 Hz → 60 Hz retarget, where the bus, not the sensor, set the ceiling.

---

## 5. C1 — Frames with timestamps, no encode

**Goal: prove frames arrive and that their timing is good enough to be the sync mechanism.**

Stream MJPEG, and for each frame record `{index, host_ns, bytes}` to `frames.jsonl`. Write the raw
MJPEG to disk only for a short test capture — it is far too large to keep.

**Exit criteria:**
- Sustained frame delivery at the negotiated rate, with **no gaps**
- **Inter-frame interval jitter characterised** — this is the number that decides whether §7 works.
  It must be small relative to the < 40 ms budget; if arrival jitter is tens of milliseconds, the
  timestamps are not the improvement this plan claims and that must be discovered here, not in C5.

---

## 6. C2 — Sustained encode: the gate most likely to fail

**Goal: 4K MJPEG → H.264/HEVC, continuously, without throttling.**

This is the highest-risk step and it **fails late** — twenty minutes in, not at startup.

**Preferred path (GPU, no CPU pixel copies):**

```
MJPEG ─► MediaCodec MJPEG decoder ─► Surface ─► GL blit ─► encoder input Surface ─► MediaCodec AVC/HEVC ─► MediaMuxer
```

**Fallback (CPU-bound):** libjpeg-turbo → NV12 → MediaCodec ByteBuffer input. Materially more CPU and
the most likely thermal-throttle source.

**Unmeasured, and required before committing to a path:** whether the A52 exposes a hardware MJPEG
decoder. The phone was disconnected when this plan was written, so this was *not* verified. Check with:

```sh
adb shell 'cat /vendor/etc/media_codecs*.xml | grep -i mjpeg'
```

If there is no hardware MJPEG decoder, the fallback path is forced and the thermal risk rises sharply
— that finding alone could justify capturing below 4K.

**Exit criterion: 20 minutes continuous** at the chosen resolution with zero dropped frames and no
thermal throttling. Log frame drops explicitly; a silently dropped frame is exactly the invisible
timing error this whole effort exists to eliminate.

---

## 7. C3 — Session integration and the timestamp contract

**Goal: video and IMU in one session directory, on one clock.**

```
sessions/<id>/
  ├── imu.jsonl      (existing)
  ├── meta.json      (extended with a "video" block)
  ├── video.mp4      (or video_000.mp4, video_001.mp4 … when gated)
  └── frames.jsonl   (new)
```

### 7.1 `frames.jsonl` — one line per frame

```json
{"i":0,"host_ns":1295435421308495,"pts_us":0,"bytes":184320,"key":true,"seg":0}
```

**Write the sidecar even though the MP4 has PTS.** Muxers rewrite, normalise and occasionally
resample presentation timestamps; the sidecar is captured before any of that and is ground truth.
This is the same reasoning that made `imu.jsonl` log raw wire values rather than scaled ones.

### 7.2 The contract that makes this worthwhile

- Stamp `SystemClock.elapsedRealtimeNanos()` **at frame arrival**, as early as possible in the
  callback — not after decode, not after encode.
- Derive the encoder PTS from that same stamp so container time and sidecar time share an origin.
- `host_ns` here is **the same clock** as `host_ns` in `imu.jsonl`. That identity *is* the deliverable.

### 7.3 Calibrate the constant offset once

Frame arrival lags exposure by sensor readout + camera MJPEG encode + USB transfer. Roughly constant,
so calibrate once rather than per session: film a sharp, IMU-visible event — a hand clap or a single
hard tap on the headband — and compare the video frame against the IMU spike. The difference is the
fixed offset; record it in this doc and apply it at ingest.

Re-measure if the resolution or frame rate changes, since readout time scales with them.

---

## 8. C4 — Motion-gated capture

**Goal: stop recording rest periods.** This is where the 36-minute storage ceiling gets fixed.

Drive segmentation from the existing IMU motion gate, with three details that decide whether the
result is usable:

**Pre-roll ring buffer — without it you lose the first rep.** The gate can only fire *after* motion
has begun, and codec segment start adds latency. Keep a rolling buffer of the last ~5 s of encoded
frames and flush it when the gate opens. A set whose first rep is missing is worse than one that
carries a few seconds of rest.

**Segments must start on an IDR frame.** Request one when the gate opens
(`MediaCodec.PARAMETER_KEY_REQUEST_SYNC_FRAME`), or the segment cannot be decoded independently.

**Hysteresis: open fast, close slow.** Close only after several seconds of continuous stillness,
otherwise the pause between reps chops one set into many segments.

**Never let a gap be silent.** Every segment records its `host_ns` span in `meta.json`. A gap must be
an explicit recorded interval, never an unremarked discontinuity — the same discipline as `seq_gaps`
on the IMU side.

**Exit criterion:** measured size reduction versus an ungated capture of the same session, and no set
with a clipped first rep.

---

## 9. C5 — Parallel validation, the gate that retires ShenYao

Capture one session **both ways**: ShenYao recording as it does today, and the in-app path running
simultaneously if the USB topology allows — otherwise back-to-back on the same movements.

Then confirm the in-app timestamps agree with the cross-correlation result from
`sync_imu_video.py` (B4). **This is the only run where cross-correlation earns its keep as an
independent check** rather than the primary mechanism.

**Do not retire ShenYao before this passes.** It works today; a homegrown recorder will have a tail of
bugs, and each one costs a gym session.

---

## 10. Risks, and when to stop

| Risk | Likelihood | Kill criterion |
|---|---|---|
| No hardware MJPEG decoder → CPU decode throttles | Medium | If C2 cannot hold 20 min, drop resolution once; if it still fails, **stop and keep ShenYao** |
| USB 2.0 cannot sustain 4K30 MJPEG | Medium | Accept the highest stable mode found in C0 |
| Frame-arrival jitter too large to beat cross-correlation | Low | If C1 jitter approaches the 40 ms budget, the premise fails — **abandon and keep ShenYao** |
| libusb build lacks `libusb_wrap_sys_device` | Low | Use a maintained wrapper (§4) |
| Battery/thermal over 65 min with OTG occupied | Medium | Powered OTG hub; measure before relying on it |

**Explicit stop rule.** This project competes with collecting training data, which is the actual goal.
If C0–C2 have not passed within a bounded effort, keep ShenYao and revisit only when storage or
alignment demonstrably blocks real sessions.

---

## 11. What changes elsewhere if this lands

- **`sync_imu_video.py` (B4) demotes from primary to validator.** Still build it — C5 needs it, and it
  remains the fallback for every ShenYao-captured session.
- **The nod gate becomes optional**, and the "wait ~60 s before nodding" rule in the ShenYao procedure
  becomes moot.
- **The wireless-offload plan improves at the source** — gated clips of 20–50 MB are a different
  problem from 1 GB of continuous 4K, and that beats any transfer-rate optimisation.
- **The IMU drift fit stays required.** Two crystals, not app architecture.
