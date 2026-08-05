# Grilling: `ironpal-imu-camera-sync-plan.md`

Design-tree interview resolving the open decisions in the IMU⇄camera sync plan.
Questions are asked one at a time, each with a recommendation; answers are recorded here as they
are given.

**Started:** 2026-08-04 · **Subject:** `docs/ironpal-imu-camera-sync-plan.md`
(the request named `ironpal-imu-integration-with-usb-camera-app-plan.md`, which does not exist —
this is the plan matching that description)

---

## Findings from exploration (answered without asking)

Resolved by reading the repo / probing the device rather than interviewing:

| Question | Answer | Source |
|---|---|---|
| Is IMU **power** already decided? | Yes — LiPo 400 mAh + TP4056 charger in the BOM | `ironpal-imu-poc-integration-plan.md` §BOM |
| Is **mounting** already decided? | Yes — 3D-printed bracket clipping beside the ELP on the headband, budget **< 25 g** | same, §assembly + risks |
| Which phone runs capture? | **LG G7 ThinQ (LM-G710), Android 10** — it holds the ShenYao `USBCamera` output | `adb` probe |
| Phone storage headroom | **46 GB total, 36 GB free** | `adb shell df /sdcard` |
| Phone thermal baseline | **39.4 °C at 100 % charge, idle** | `adb shell dumpsys battery` |

### Two findings that raise the stakes

**1. Storage is a one-session buffer, not a comfort margin.** The plan's §7 says "≥64 GB card
recommended" against ~28 GB per 1-hour session. The actual capture phone has **36 GB free** — that
is *one* session with no room to spare, on a device that must also hold the IMU log. Offload
becomes a blocking per-session step, not housekeeping.

**2. The measured VFR may be a symptom, not a property.** The plan attributes 22.86 fps / 33.8 ms
jitter to "USB UVC capture on Android drops frames under load." The device idles at 39.4 °C, and
the sibling A52 guide already documents 4K recording throttling when the phone is hot. So the
jitter may be **the LG G7 thermally throttling**, in which case it will get *worse* over a 90-minute
session rather than staying constant — and would improve on a stronger phone. This is testable and
is queued as a question below.

---

### Open probe (device disconnected mid-interview)

The LG G7 ThinQ has a microSD slot (spec: up to 2 TB). **Whether a card is fitted, and whether the
ShenYao app can be pointed at it, is unverified** — `adb` lost the device before it could be
checked. This matters because it is the cheapest fix for the 36 GB storage ceiling. Re-probe with
`adb shell sm list-volumes all` when the phone is next connected.

---

## The design tree

Branches to resolve, in dependency order. Each is marked as it closes.

| # | Branch | Depends on | Status |
|---|---|---|---|
| A | **IMU data path** — BLE stream vs standalone log | — | 🔴 open (Q1) |
| B | Companion app scope + platform | A | ⏸ blocked on A |
| C | Sync anchor method + how compliance is enforced | A | ⏸ |
| D | Sampling config — ODR, FSR | A | ⏸ |
| E | Clock/drift model, and what invalidates an alignment | C, D | ⏸ |
| F | Session-invalidation rules — when is a capture unusable | E | ⏸ |
| G | **Capture-device viability** — 36 GB free, 39.4 °C idle, possible throttle-induced VFR | — | 🔴 open, independent |
| H | Offload workflow — 28 GB/session off a phone with 36 GB free | G | ⏸ |
| I | Firmware reflash path once bracket-mounted | A | ⏸ |

---

## Q1 — Where does IMU data land: streamed over BLE, or logged standalone on the Nano? ✅

**Answer: BLE streaming.**

Standalone logging is arithmetically dead without extra hardware — 100 Hz × 6 axes × 2 B = 1.2 kB/s
= 4.3 MB/h against the Nano's 2 MB QSPI flash ≈ **28 minutes**, well short of a 90-minute session.
Avoiding that would mean adding an SD module (mass on a < 25 g headband budget, more soldering,
another failure point) to remove a link carrying 1.2 kB/s, which BLE handles trivially. BLE's role
as the control-and-telemetry channel is also now settled for the production design
(`ironpal-wireless-offload-plan.md` §1), so this keeps one architecture rather than two.

**Consequences:** branches B, C, D, I unblock. §3's companion app is required. §6's BLE-disconnect
failure modes are live and must be handled.

---

## Findings from exploring `poc/mobile` (answered without asking)

**There is already a React Native app** — `poc/mobile` (`IronPalPOC`), with an Android project, a
Kotlin native-module bridge, SQLite storage, an offline queue, and label/enrol/HUD screens. It has
**no BLE dependency**.

### ⚠️ Conflict 1 — the collection rig is a different machine from POC v1

`ironpal-poc-v1.md` is explicit: *"a self-contained Android app running directly on the
headband-mounted device. There is no separate paired phone in this POC — the headband device **is**
the camera, the sensor pack, the compute, and the display."* It explicitly defers
mini-camera↔phone streaming as "an MVP concern."

The collection rig is **three devices**: ELP camera + Nano IMU on the headband, phone in a pocket
driving the camera over USB. The existing app was not designed for it. This is a real fork in the
tree and is what Q2 asks about.

### ✅ The good news — `ImuModule` is a clean swap point

`poc/mobile/src/native/ImuModule.ts` exposes only four methods —
`getDeviceInfo() / start() / stop() / onMotionGate()` — and **raw samples never cross the JS
bridge**; the stream is consumed inside Kotlin `SignalModule`. So substituting the phone's IMU for
the BLE Nano is an *implementation change behind an unchanged interface*: `dsp`, `fusion`, `labels`
and every screen stay untouched.

Better still, the module already emits a **motion-gate event** (`repping`, `energy`, `periodicity`)
— which is precisely the IMU gating the collection plan §2.1 calls for. It already exists.

### ⚠️ Conflict 2 — decision D5 must NOT be applied to the external IMU

`ironpal-poc-v1-design_grilled.md` D5 chose an **accelerometer-only baseline, gyro optional**,
because *testers use their own phones* and budget devices may lack a gyroscope.

**That rationale does not transfer.** The Nano 33 BLE Rev2 carries a BMI270 with a gyroscope,
always. And the sync plan's alignment specifically requires **gyroscope magnitude** (§4.1) — video
frame-to-frame change is dominated by rotation. Applying D5 to the headband IMU would silently
break video↔IMU synchronisation. Recorded so it is not "inherited" by mistake.

### ⚠️ Conflict 3 — sampling rate disagreement (deferred to branch D)

The existing app samples at **50 Hz** (`ImuModule.ts`: *"raw 50 Hz samples NEVER cross the
bridge"*). The sync plan specifies **100 Hz**. To be resolved in branch D.

---

## Q2 — Extend `poc/mobile`, fork it, or write a separate logger? ✅

**Answer: extend `poc/mobile`** — add a **BLE `ImuModule` backend behind the existing interface**,
selected by a rig flag, leaving the phone-IMU backend intact so POC v1 stays runnable.

Rationale: a separate logger would rebuild session metadata, SQLite storage, the offline queue and
the tap-to-log ground-truth UI — all of which exist and are exactly what the collection plan needs —
and would create two competing sources of truth about what was captured. Forking means maintaining
two Android projects where every label-schema change lands twice. Extending is cheap *because* of
the `ImuModule` boundary: raw samples never cross the JS bridge, so `dsp`, `fusion`, `labels` and
every screen are untouched by the swap.

**Consequences:**
- Work item is a **Kotlin BLE backend** satisfying `getDeviceInfo/start/stop/onMotionGate`, not a
  new app. Revises the sync plan's §3 ("the only software you write now") and its B2 estimate.
- The existing **motion-gate event already implements the collection plan's §2.1 IMU gating** —
  reuse it rather than building a gate.
- POC v1's phone-IMU path must keep working; add alongside, do not mutate in place.
- Branches C, D, I unblock.

---

## Q3 (branch D) — Sampling config: what ODR and FSR? ✅

**Answer: 100 Hz logged**, resampled to the existing 50 Hz canonical rate for the DSP pipeline.
FSR adopted as recommended (**±8 g / ±1000 dps**) — not separately contested.

**Consequences:**
- The Nano firmware and BLE packet design target 100 Hz (§2.1 of the sync plan stands).
- The Kotlin BLE backend must **resample 100 → 50 Hz** before handing to `SignalModule`, reusing
  the D4 resample-to-canonical path. Existing DSP is untouched.
- `imu.jsonl` archives the full 100 Hz stream; the 50 Hz canonical form lives in `canonical/`.
- Per-session metadata must record ODR **and FSR**, and ingest must flag saturated windows.

---

### The conflict, and why it dissolves

| Source | Rate |
|---|---|
| `poc/mobile` `CANONICAL_SAMPLE_RATE_HZ` | **50 Hz** |
| Sync plan §2.1 | **100 Hz** |

These are not actually in competition, because they serve different consumers:

- **Rep detection needs almost nothing.** The rep band is `REP_BAND_LOW_HZ = 0.2` to
  `REP_BAND_HIGH_HZ = 1.5`. Nyquist for 1.5 Hz is 3 Hz; 50 Hz is already ~33× oversampled.
- **Sync alignment wants resolution.** One sample = 20 ms at 50 Hz, 10 ms at 100 Hz, against a
  target residual < 40 ms (one video frame). 50 Hz with parabolic sub-sample interpolation would
  likely still make the target — but with far less margin.
- **Future form analysis** ("you didn't lock out the last three reps") is the one consumer that may
  genuinely want the higher rate, and it is speculative today.

**Recommendation: sample and log at 100 Hz on the Nano; resample to the existing 50 Hz canonical
rate for the DSP pipeline.**

This is the same capture-high / canonicalise-down principle as
`ironpal-poc-to-production-transfer.md` §4, and decision **D4 already established
resample-to-canonical**, so the machinery exists. You can always downsample later; you can never
recover a rate you did not capture.

The cost of the higher rate is negligible: **1.2 kB/s over BLE** (versus BLE's ~175 kB/s ceiling)
and **4.3 MB/hour** of storage. There is effectively no reason to economise here.

**FSR recommendation: ±8 g accelerometer, ±1000 dps gyroscope.**

- ±8 g covers sharp sync nods and head impacts with headroom; ±16 g would halve resolution
  (0.24 → 0.5 mg/LSB) for range that head-mounted motion never uses.
- Head rotation during lifting runs ~100–300 dps, with sharp nods higher; ±1000 dps leaves margin
  without wasting bits.
- **Clipping is the real risk**, not resolution: `ironpal-poc-to-production-transfer.md` §4.2 flags
  clipped POC data versus unclipped production as a difference *in kind*. Record FSR per session and
  flag saturated windows rather than training on a flattened peak.

---

## Q4 (branch C) — Sync anchors: are the head nods actually necessary? ✅

**Answer: both** — nods as guaranteed high-SNR anchors, continuous windowed cross-correlation as the
primary drift estimator.

Continuous correlation alone needs zero user compliance and gives drift for free (an offset per
window, fit the trend, rather than a two-anchor linear model). But it degrades exactly where it
matters: for head-still exercises both signals go quiet, and **22 of 37 Tier-1 entries are
`rep_signal: vision`** — head still, vision carrying the rep. Nods work regardless of session
content.

**Compliance is enforced in software, not by memory:** because Q2 chose to extend `poc/mobile`, the
app watches the live BLE stream and **refuses to start the session until it detects the nod
pattern**. Forgetting nods on session 9 of 12 would otherwise silently cost that session.

### Diagnostic run during this branch — the thermal hypothesis was wrong

The plan blamed VFR on "USB UVC under load," and this interview's opening notes speculated thermal
throttling. **Measuring the full clip disproved both.** Across all 2702 frames:

| Segment | Effective fps | Jitter (sd) |
|---|---|---|
| First third | 21.69 | 8.0 ms |
| Middle third | 26.05 | 5.4 ms |
| Last third | **29.76** | **3.8 ms** |

Capture **improves** 27 % and jitter more than halves. Thermal degrades with time; this does the
opposite. It is a **warm-up transient** (auto-exposure settling, USB negotiation, buffer fill), and
the header's 25.41 fps is the correct whole-clip average — the earlier "22.86 fps" was a 20-second
sample that happened to land inside the transient.

**Consequences, both applied to the sync plan:**
1. **Do not place the opening sync anchor at t=0** — it would land in the least stable region
   (first-third jitter 8.0 ms, worst frame 145 ms). **Wait ~60 s after starting the recorder.**
2. §1.2 corrected, with the superseded measurement recorded rather than quietly replaced.

⚠️ **106 s cannot rule out thermal effects over 90 minutes.** Re-run the segment analysis on the
first full-length session (B3) before trusting long-session timing.

---

## Q5 (branches G + H) — Storage and offload: the phone holds about one session ✅

**Answer: (b) offload to the laptop after every session.** No microSD card.

### ⚠️ This imposes a session-length cap the plan did not have

Accepting offload-only means living inside the phone's 36 GB, and at the measured 62.2 Mbps that is
**less than the planned session length**:

| Session length | Footage | Fits in 36 GB? |
|---|---|---|
| 60 min | 28.0 GB | ✅ |
| 70 min | 32.7 GB | ✅ |
| 77 min | 35.9 GB | ⚠️ exactly at the ceiling |
| **90 min (as planned)** | **42.0 GB** | ❌ **over by 6 GB** |

**Hard ceiling: 77 minutes of recording. Safe cap with 15 % margin: ~66 minutes.**

A 90-minute session would fill the phone and stop recording mid-workout — losing the tail of the
session and, because the sync plan puts the closing anchor at the end, quite possibly the drift
anchor too.

**Consequences (applied to the collection plan):**
- **Cap capture sessions at ~65 minutes.**
- ~15 labeled sets per session rather than 20, so Tier-1 coverage becomes **~13 sessions**
  instead of 8–12. Schedule impact is modest; discovering it mid-collection would not be.
- The companion app (Q2) must do a **free-space precheck before allowing a session to start** and
  show a **live remaining-recording-time estimate**. It already gates on nod detection (Q4); this is
  the same guard rail.
- **Offload is mandatory before the next session**, not housekeeping — there is no second session's
  worth of space.

**Revisit trigger:** if the 65-minute cap proves annoying in practice, the cheap fixes in order are
a microSD card (option a, ~€20), then a bitrate reduction (option c) — but only after the gold-clip
A/B that `ironpal-poc-to-production-transfer.md` requires, since plate legibility is what weight OCR
depends on.

---

## Q6 (branches E + F) — What makes a session unusable? ✅

**Answer: accepted as recommended.** Three severity gates, evaluated **at ingest** — a silently
misaligned session degrades every label in it without raising an error, so the check cannot wait
until training.

| Post-alignment sync residual | Verdict | Usable for |
|---|---|---|
| **< 40 ms** (one video frame) | ✅ accept | everything |
| **40–80 ms**, or clock rate ratio outside ±100 ppm | ⚠️ flag, keep | exercise ID only — **not** rep boundaries or form work |
| **> 80 ms** (two frames) | ❌ reject, re-shoot | nothing — rep boundaries untrustworthy |

**Two hard invalidators, independent of residual:**
- A **BLE gap > 2 s** not followed by re-anchoring nods.
- **Any saturated IMU window** (FSR clipping) — `ironpal-poc-to-production-transfer.md` §4.2 classes
  clipped-vs-unclipped as a difference *in kind*, not degree.

**Record the residual and rate ratio in `session.json`** so downstream consumers can filter rather
than guess.

**Design tension noted:** at ~13 sessions, rejecting one costs ~8 % of the dataset. That argues for
a generous flag-and-keep band and **strict pre-session gates** — nod detection and free-space
precheck (Q4, Q5). Cheap prevention beats expensive rejection.

---

## Q7 (branch I) — How do you reflash the Nano once it is bracket-mounted? ✅

**Answer: expose the USB-C port through the bracket.**

During bring-up (B0–B5) firmware is reflashed tens of times while tuning ODR, packet batching and
nod-detection thresholds against real captures — that loop must be trivial and reliable. BLE DFU is
possible on the nRF52840 but needs a bootloader swap (Arduino ships USB CDC) plus a DFU path in the
app; a half-failed OTA on a headband about to be worn to a gym is a bad failure mode. OTA is a
shipping-product answer, not a rig-you-own answer.

**Act on this before printing** — the bracket is still a to-print BOM item, so the slot is free now
and a re-print later. Add a cover flap if sweat ingress is a concern.

---

## All branches closed

| # | Branch | Decision |
|---|---|---|
| A | IMU data path | **BLE streaming** (standalone flash holds only ~28 min) |
| B | Companion app | **Extend `poc/mobile`** with a Kotlin BLE `ImuModule` backend behind a rig flag |
| C | Sync anchors | **Both** — nods as guaranteed anchors + continuous windowed correlation; nods **after ~60 s** |
| D | Sampling config | **100 Hz logged**, resampled to the existing 50 Hz canonical; **±8 g / ±1000 dps** |
| E | Clock/drift | Windowed correlation for drift; two-anchor linear model as fallback |
| F | Session invalidation | <40 ms accept · 40–80 ms flag · >80 ms reject; BLE gap >2 s and FSR clipping are hard invalidators |
| G | Capture-device viability | VFR is a **warm-up transient, not thermal**; 36 GB free caps sessions |
| H | Offload | **Laptop after every session**, no SD card → **~65 min cap, ~13 sessions** |
| I | Firmware reflash | **USB-C slot in the bracket** |

## What the review changed in the plans

1. **§3 rewritten** — the companion app is a BLE backend inside `poc/mobile`, not new software.
   B2 drops from 3–4 days to 2–3.
2. **D5 warning added** — accel-only must not be inherited by the external IMU; sync needs gyro.
3. **§1.2 corrected** — the "22.86 fps / 33.8 ms jitter" figure was a 20-second sample inside a
   warm-up transient. Full-clip measurement shows capture *improves* to 29.76 fps with 3.8 ms
   jitter, and the header's 25.41 fps is right.
4. **Anchor timing** — wait ~60 s before the opening nods.
5. **Session cap** — collection plan revised to ~65 min and **~13 sessions**; stale "≥64 GB card"
   references removed.
6. **Pre-session gates** — nod detection and free-space precheck, both blocking.

## Follow-ups still open

- ⚠️ **Re-run the frame-timing segment analysis on the first full-length session** (B3). 106 s
  cannot rule out thermal effects at 65 minutes.
- ⚠️ **Measure camera FOV, distortion and mount pitch** with an ArUco target — still the ⚠️ items in
  `ironpal-poc-to-production-transfer.md` §2.1, and the numbers the production optics spec hangs on.
- Verify the ShenYao app's behaviour when storage runs out (does it stop cleanly or corrupt the
  file?) — determines whether the free-space precheck needs a hard margin or just a warning.
