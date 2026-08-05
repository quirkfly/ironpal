# ELP camera + ShenYao USB Camera app — synchronised capture plan

Operational plan for capturing a gym session with the **ELP 4K 200° fisheye** driven by the
**ShenYao USB Camera** app, alongside the **Nano 33 BLE Rev2** IMU streaming into the IronPal app.

**This is the rig you take to the gym next week.** It is the "make the current setup rigorous" plan.
The separate [`ironpal-elp-camera-integration-with-usb-camera-app-plan.md`](ironpal-elp-camera-integration-with-usb-camera-app-plan.md) is the "own the
capture ourselves later" plan — they do not compete, and this one must work first regardless of
whether that one ever happens.

---

## 0. One correction before anything else — this is configuration, not integration

The task asks to "establish communication between the ELP camera and the camera app". Two things
must be said plainly, because getting either wrong wastes a gym trip:

**The ELP is already "integrated" with ShenYao.** ShenYao *is* a UVC host app; plugging the ELP into
the phone over OTG is the entire integration. There is no pairing step, no SDK, no configuration
handshake to build. What follows is therefore a **configuration and operating procedure**, not a
software integration.

**Synchronisation does not come from ShenYao and cannot be made to.** ShenYao is closed-source with
no plugin API, no broadcast intent, and no callback — this was settled in
[`ironpal-imu-camera-sync-plan.md`](ironpal-imu-camera-sync-plan.md) §1 and is not reopened here. It
contributes exactly one artefact: an MP4 with presentation timestamps. **Alignment comes from shared
rigid-body motion** — the head wearing the camera is the same head wearing the IMU — recovered
post-hoc by cross-correlation. Any plan that assumes ShenYao can be made to emit a sync signal is
wrong at the premise.

So the honest statement of the goal: *configure both halves so that a post-hoc cross-correlation can
succeed, and make it impossible to record a session that cannot be aligned.*

---

## 1. The physical chain, and the constraint that actually bites

```
ELP 4K fisheye (UVC, USB 2.0)
   └─ USB-C OTG ──► Galaxy A52 ──► ShenYao ──► /sdcard/DCIM/USBCamera/IPS_<wallclock>.mp4
                         ▲
                         └─ BLE ── Nano 33 BLE Rev2 ──► IronPal app ──► sessions/<id>/imu.jsonl + meta.json
```

**Power is the unglamorous blocker.** The A52 is simultaneously powering the ELP over OTG, holding a
BLE link, and encoding H.264. The OTG port is occupied by the camera, so it **cannot charge from that
port while capturing**. A 65-minute session on battery, with the screen periodically on, is not a
safe assumption — measure it before relying on it. If it does not hold, a powered OTG splitter (OTG
hub with external power input) is the fix, and it must be sourced *before* the gym trip, not after a
session dies at minute 40.

### 1.1 Storage is a hard blocker today, not a warning

Measured: H.264 Baseline at **~62 Mbps ≈ 465 MB/min**. The A52 has ~17 GB free.

| | |
|---|---|
| Capacity at current settings | **~36 minutes** |
| Target session length | **65 minutes** |
| Verdict | **A full session does not fit.** |

This is not a caveat to note and move past — it is a blocking gate. Three ways out, in order of
preference:

1. **Free ~15 GB on the A52.** Cheapest, no quality cost, and already on the task list. Do this
   first.
2. **Shorter sessions.** Two 30-minute captures beat one truncated 65-minute one. A truncated session
   is not 55 minutes of data plus a gap — it is a session whose end is missing without a record of
   *what* is missing.
3. **Lower the capture resolution** — last resort. It trades directly against weight-plate OCR, which
   is already the weakest link in the pipeline (see [`weight-reading.md`](video-analysis-kb/weight-reading.md)).
   Do not spend pixels-on-target to buy minutes until options 1 and 2 are exhausted.

The IronPal app already enforces a **blocking free-space precheck** (`ImuModule.getFreeSpace()`,
refuses below 10 minutes of headroom). That gate covers the IMU log's volume, which is the same
volume — so it will catch this, but only if the app is started *before* filling the card.

---

## 2. ELP camera configuration

The ELP is a fixed-focus 200° fisheye on an IMX415. Its defaults are wrong for this job in two ways.

| Setting | Value | Why |
|---|---|---|
| Resolution | **3840×2160** (until storage forces otherwise) | 21.1 % of every frame is black outside the image circle, so effective resolution is already far below the label. Do not cut it further by choice. |
| Frame rate | **highest stable the link sustains** (~25–30) | Rep boundaries are temporal; frames are the sampling grid. |
| Focus | **fixed — confirm autofocus is OFF/absent** | The lens is fixed-focus. If ShenYao exposes an AF toggle, disable it: hunting mid-set ruins the staging frames that weight OCR depends on. |
| Exposure | **auto, but locked once framing is set if ShenYao allows** | Gym lighting is even; auto-exposure hunting across a mirrored wall causes luminance swings that corrupt the motion-energy profile the routing tools use. |
| White balance | **fixed if available** | Same reason; also keeps plate colour cues (IWF red/blue/yellow) usable. |

**Mount rotation is 180°** on this rig (case 007). Record it in the session notes — the ingest side
must read rotation from per-session metadata and **never hardcode `transpose=2`**, because that value
is a property of *this* mount, not of the camera.

---

## 3. ShenYao app configuration

Settings vary by app version; the intent matters more than the exact menu path.

- **Output**: `/sdcard/DCIM/USBCamera/`, filename `IPS_<date>.<time>.<ms>.mp4`. **This filename is
  the only link between the video and the IMU session** — see §5.
- **Audio: OFF.** Nothing downstream uses it, it adds bytes to a storage-constrained capture, and it
  creates an avoidable privacy surface in a shared gym. This is also already a checked item in the
  `review-takes` skill.
- **Codec/bitrate**: leave at H.264 unless storage forces a change. HEVC would roughly halve the
  size, but only if the phone encodes it reliably at 4K for 65 minutes — verify before trusting.
- **Screen timeout / lock**: the phone must not sleep mid-capture. ShenYao holds its own wake lock
  while recording, but confirm rather than assume — a sleeping phone also drops the BLE link.
- **Do not enable any overlay/watermark/timestamp burn-in.** Burned-in pixels corrupt the frames the
  vision KB reads and cannot be removed later.

---

## 4. The pre-session ritual — ordering is not arbitrary

Run these in this order. Each step exists because skipping it produces a session that looks fine and
is unusable.

1. **Free-space check.** Open the IronPal app first; its precheck refuses below 10 minutes of
   headroom. Confirm the number covers the *planned* session, not the minimum.
2. **Plug in the ELP**, grant ShenYao USB permission, confirm live preview. A 200° fisheye at
   headband height should show the floor at the bottom of the frame and your own hands when raised.
3. **Power the Nano**, start the IronPal set, confirm in logcat or the HUD that BLE connected and
   `mtu ≥ 109` (it negotiates 247 on this phone).
4. **Start ShenYao recording.**
5. **Wait ~60 seconds before the sync nod.** ← *see §5.1, this is the non-obvious one*
6. **Perform the sync nod** — 3 crisp head nods, ~1 s apart, with a clear stillness before and after.
7. Train.
8. **Stop ShenYao first, then end the IronPal set.** Stopping the IMU first leaves video with no
   IMU tail to correlate against.

### 4.1 Why the IMU starts before the camera but the nod comes late

Starting the IMU first guarantees the IMU log strictly contains the video's time span, so the
cross-correlation search window is bounded on both sides. If video started first, the nod could fall
outside the IMU record entirely.

---

## 5. Synchronisation — where the timestamps actually come from

Three clocks are in play. Confusing them is the main way this goes wrong.

| Clock | Source | Property |
|---|---|---|
| **Video PTS** | ShenYao/MediaCodec | Relative to recording start. **Not wall clock.** |
| **`host_ns`** | `SystemClock.elapsedRealtimeNanos` on every IMU packet | Monotonic, survives sleep, immune to NTP steps |
| **`device_ts_us`** | Nano `micros()`, unwrapped past the 71.6 min rollover | Drifts **−52.8 ppm ≈ −206 ms per 65 min** (measured, B2) |

**Coarse link — the filename.** `IPS_<wallclock>.mp4` and `meta.json`'s `started_wall_ms` are both
wall clock, so the filename identifies *which* IMU session a video belongs to. It is good to seconds,
never better. **Use it to pair files, never to align them.**

**Fine alignment — shared motion.** Cross-correlate video motion energy against gyro magnitude. The
head carrying the camera is the head carrying the IMU, so the two signals share structure. The nod
seeds the search window; the correlation does the alignment. Budget: **< 40 ms**.

**The IMU drift correction is mandatory and is not optional bookkeeping.** −206 ms over a session is
5× the alignment budget. `sync_imu_video.py` (B4) must fit a **linear** `device_ts_us → host_ns`
model across the whole session, not apply a constant offset. The naive endpoint difference is
unusable: BLE notification jitter alone spans ±67 ms (residual sd 15.9 ms), which swamps the endpoint
signal. Fit the line; do not subtract two numbers.

### 5.1 The warm-up ramp — do not nod at t=0

The ELP/ShenYao frame rate is **variable and it ramps**:

| Segment | fps | jitter |
|---|---|---|
| First third | 21.69 | 8.0 ms |
| Middle third | 26.05 | 5.4 ms |
| Last third | **29.76** | **3.8 ms** |

Early frames have both the wrong rate *and* the worst timing jitter. A sync nod placed at t=0 is
correlated against the least reliable part of the whole recording — the one place where an 8 ms
jitter directly eats a 40 ms budget.

**So: start recording, let it settle ~60 s, then nod.** This costs ~470 MB of storage and buys the
alignment its best possible anchor. It also means the nod is genuinely *inside* the stable region
rather than on its edge.

> An earlier reading of "22.86 fps, 33.8 ms jitter" for this rig came from a 20 s sample taken inside
> this warm-up transient and is wrong as a whole-clip figure. The declared 25.41 fps is the honest
> mean. Corrected in [`ironpal-poc-to-production-transfer.md`](ironpal-poc-to-production-transfer.md)
> §2.1.

---

## 6. Failure modes, and how each is detected

The theme: every failure below is **silent at capture time**. Detection has to be designed in, because
none of them announce themselves in the gym.

| Failure | Looks like | Detection | Mitigation |
|---|---|---|---|
| Storage exhausted mid-session | Video simply ends | Compare video duration vs IMU session span | Free-space gate (§1.1); shorter sessions |
| Phone battery dies | Both streams end | `meta.json` stays `partial: true` | Powered OTG hub; charge to 100 % |
| BLE drops mid-set | IMU gap, video continues | **`seq_gaps > 0` in `meta.json`** | Invalidate the affected span — never interpolate across it |
| Nod missed or off-camera | Correlation finds no anchor | B4 reports low peak correlation | Nod again mid-session as a second anchor |
| OTG unseated | Video ends, IMU continues | Duration mismatch | Tape the connector; check preview after mounting |
| Autofocus hunting | Staging frames soft | Frame-sharpness check in `review-takes` | Confirm AF off (§2) |
| Wrong rotation assumed at ingest | Everything upside down | Mat text unreadable / watch on wrong wrist | Rotation from session metadata, never hardcoded |

**`seq_gaps` deserves emphasis.** The firmware ring-buffers rather than dropping silently, so a gap
means the *link* lost notifications. That span's alignment is unreliable, and the correct response is
to mark it invalid. Interpolating across it fabricates motion that never happened and would train the
model on it.

---

## 7. Validation — what makes a session usable

Run this checklist on the **first** session before capturing several more against an unvalidated
procedure.

- [ ] Video duration ≈ IMU session span (within a few seconds)
- [ ] `meta.json`: `partial: false`, `seq_gaps: 0`, `mtu ≥ 109`
- [ ] Filename wall clock matches `started_wall_ms` to within seconds
- [ ] The nod is visible in the video **and** obvious in gyro magnitude
- [ ] Cross-correlation peak is sharp and unambiguous, offset within **< 40 ms** after the linear drift fit
- [ ] Rotation recorded in session notes (180° on this rig)
- [ ] A staging frame exists where a plate face is legible — the weight-OCR path needs it
- [ ] Battery ≥ 20 % at the end, and no thermal throttling observed

If the correlation peak is broad or ambiguous, **the session is not aligned — it is guessed**. Log it
as such rather than feeding it to training. A mislabelled boundary is worse than a missing session,
because it is invisible downstream.

---

## 8. What this plan does not solve

Being explicit about the ceiling, since these are the reasons the in-app plan exists:

- **The motion gate cannot act.** ShenYao does not listen, so the IMU's rest-detection cannot stop
  recording. The whole session is captured, which is why storage binds at 36 minutes.
- **Frame timing stays reconstructed, not recorded.** PTS plus a ramping frame rate is recoverable but
  fragile, and every downstream tool must keep getting it right.
- **Alignment stays an estimate.** Cross-correlation with a nod anchor is good; a shared capture clock
  would be exact.

Those three are precisely what [`ironpal-elp-camera-integration-with-usb-camera-app-plan.md`](ironpal-elp-camera-integration-with-usb-camera-app-plan.md)
removes. **Nothing here should be deferred waiting for it** — this procedure is what produces training
data now, and the in-app path only earns its cost once real sessions prove where the pain is.
