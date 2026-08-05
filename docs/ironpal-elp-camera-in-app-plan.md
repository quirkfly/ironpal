# Bringing the ELP camera into the IronPal app

**Question:** now that the Nano IMU streams into `poc/mobile`, should the ELP 4K USB camera come into
the same app instead of being driven by the third-party ShenYao USB Camera app?

**Answer: yes — and it is worth more than the sync machinery it replaces.** But it is a real build,
not a refactor, and it must not be swapped in before it has survived a full session. Sequence it as
*add alongside, prove, then retire ShenYao* — the same shape as the phone-IMU → BLE-IMU swap that
just landed.

This does **not** contradict [`ironpal-imu-camera-sync-plan.md`](ironpal-imu-camera-sync-plan.md) §1.
That section rejected *hooking into* ShenYao — reaching into a closed-source app with no plugin API,
no intent, no callback. That judgement stands and is not revisited here. Replacing it with capture we
own is a different proposition entirely, and the arguments against hooking (no API, breaks on update)
are arguments *for* owning it.

---

## 1. The decisive constraint, measured on the actual phone

```
$ adb shell getprop ro.build.version.release   -> 14   (SDK 34)
$ adb shell pm list features | grep camera
  ... android.hardware.camera.external  ABSENT
$ adb shell pm list features | grep usb
  feature:android.hardware.usb.host      PRESENT
```

**`android.hardware.camera.external` is not present**, so Camera2/CameraX **cannot enumerate the UVC
camera on this phone** — despite Android 14 being new enough for the platform-level external-camera
path. Samsung did not enable it. So the easy route (open the ELP as just another `CameraDevice`) is
closed, and this must be checked per-device rather than assumed from the Android version.

`android.hardware.usb.host` **is** present, so the viable route is the USB Host API with a userspace
UVC stack (libusb + libuvc through JNI) — which is what ShenYao itself is built on. No root needed.

This one feature flag is the whole difference between "an afternoon" and "a real build". Check it
first on any phone considered for the rig.

---

## 2. What integration actually buys

Four problems collapse into one fix. Only the first is about elegance; the rest are live defects.

### 2.1 It deletes the alignment problem instead of solving it

Today two independent recorders write two files with no shared clock, and the sync plan recovers
alignment post-hoc by cross-correlating head motion, seeded by a nod gesture, against a **< 40 ms**
budget.

If our app owns UVC capture, every frame is stamped with `SystemClock.elapsedRealtimeNanos()` on
arrival — **the same clock already written as `host_ns` on every IMU packet** by
`ImuSessionLogger`. Alignment becomes a subtraction. No nod ritual, no cross-correlation, no search
window, no failure mode where a session is unalignable because the athlete forgot to nod.

Worth being precise about what does *not* vanish: the Nano keeps its own `micros()` clock, so the
IMU-side drift measured in B2 (**−52.8 ppm, ≈ −206 ms per 65 min session**) still needs its linear
`device → host` fit. But that error is already *measurable and correctable* precisely because both
clocks are logged. What integration removes is the **video ↔ host** unknown, which is the harder
one — there is currently no independent way to measure it at all.

### 2.2 It makes the variable frame rate a non-issue

ShenYao's output ramps **21.69 → 26.05 → 29.76 fps** across the first minute of a clip (measured on a
full-length capture; a 20 s sample inside the warm-up transient is what produced the earlier bogus
"22.86 fps" reading). PTS-based math recovers this, but every downstream tool has to keep getting it
right, forever.

Per-frame arrival timestamps make frame timing *recorded data* rather than *reconstructed inference*.
A dropped or late frame stops being invisible.

### 2.3 It is the only way the motion gate can ever do anything

This is the strongest argument and the least obvious.

`TASK.md` asked for exactly this: use the IMU to detect rest periods and *only capture video while an
exercise is happening*, so a 1-hour session does not cost a 1-hour 4K file. The IMU already computes
the motion gate (`ImuModule.onMotionGate`). **It currently has nothing to act on** — ShenYao does not
listen, so the gate is a HUD decoration.

The A52 has ~17 GB free ≈ **36 minutes** of 4K. A 65-minute session does not fit *today*. Gating
capture to working sets is roughly a 3–5× reduction on typical rest ratios, which is the difference
between "session does not fit" and "session fits with room". No compression setting or bigger card
achieves that, because the win comes from not recording the rest periods at all.

### 2.4 One app means one session

One foreground service, one storage precheck, one session directory holding `imu.jsonl`,
`meta.json`, and the video. No correlating `IPS_*.mp4` filenames against session dirs by wall clock —
which is a silent-mismatch risk every time two sessions are captured close together.

---

## 3. What it costs — the honest part

The risk is concentrated in one place: **sustained 4K capture through a userspace USB stack**.

- **libusb + libuvc via JNI/NDK.** Standard, well-trodden (the `UVCCamera` lineage and its
  maintained forks), but it is C interop, device-permission dialogs, and per-device quirks.
- **Bandwidth.** The ELP is USB 2.0: ~480 Mbps theoretical, realistically ~300 Mbps. 4K MJPEG at 30
  fps sits uncomfortably close to that. Expect to characterise real achievable resolution/fps rather
  than assume the sticker numbers — the same lesson as the firmware's 100 Hz → 60 Hz retarget, where
  the bus, not the sensor, set the ceiling.
- **Encode.** MJPEG frames must be decoded and re-encoded to H.264/HEVC via `MediaCodec` to avoid
  absurd file sizes, sustained for up to 65 minutes without thermal throttling. This is the part most
  likely to fail, and it fails *late* — twenty minutes in, not at startup.
- **Regression risk.** ShenYao works today. A homegrown recorder will have a tail of bugs, and every
  one of them costs a gym session.

**The mitigating fact:** the [poc-to-production transfer
doc](ironpal-poc-to-production-transfer.md) already establishes that all three POC components are
throwaway. The *final* product is a custom camera plus IMU driven by our own app. So this is not POC
scaffolding — it is the first real piece of the production capture path, and the UVC work is the only
part that gets discarded when the custom camera arrives. The timestamping, gating, session layout,
and storage handling all carry forward.

---

## 4. Recommended sequencing

Mirror the IMU swap: build alongside, prove on hardware, then retire the old path.

| Step | Deliverable | Exit criterion |
|---|---|---|
| **C0** | Enumerate the ELP over USB Host; log descriptors, supported formats, resolutions, frame rates | The device's *actual* format list — not the marketing spec |
| **C1** | Capture N frames to disk with `host_ns` per frame; no encode | Frames land; timestamp jitter characterised |
| **C2** | Sustained encode to H.264 via `MediaCodec` | **20 min continuous** at the chosen resolution with no dropped frames and no thermal throttle |
| **C3** | Session integration: video + `imu.jsonl` + `meta.json` in one dir, one foreground service | Both streams share one clock; a single `frames.jsonl` sidecar maps frame index → `host_ns` |
| **C4** | Motion-gated capture driven by the existing IMU gate | Recording starts/stops with working sets; measured size reduction vs ungated |
| **C5** | Parallel validation | One session captured **both ways**; cross-correlation confirms the in-app timestamps agree with ShenYao + the old method |

**C5 is the gate that retires ShenYao, and it must not be skipped.** It is also the only run where
`sync_imu_video.py` earns its keep as an independent check rather than the primary mechanism.

**Do not start C0 before the current pipeline has produced real labelled sessions.** The point of the
rig is training data, not a camera app. If a handful of gym sessions come back well-aligned by
cross-correlation, this whole plan drops in priority; if alignment or storage bites in the field —
which §2.3 says it will, at 36 minutes of headroom — it becomes the top item.

---

## 5. What changes in existing plans if this lands

- **`sync_imu_video.py` (B4) demotes from primary to validator.** Still needed — for C5, and as the
  fallback whenever a session is captured with ShenYao. Build it, but stop treating cross-correlation
  as the long-term alignment story.
- **The nod gate becomes optional.** Keep it while ShenYao is in use; it is dead weight afterwards.
- **The wireless-offload plan improves.** Motion-gated capture cuts the payload at the source, which
  helps far more than any transfer-rate optimisation — 20–50 MB of gated clips is a different problem
  from 1 GB of continuous 4K.
- **The IMU drift fit stays required either way.** It is a property of two crystals, not of app
  architecture.
