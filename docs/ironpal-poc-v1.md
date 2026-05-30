# IronPal — Proof of Concept v1

**Status:** Draft for team review
**Owner:** Solo founder (development + testing)
**Date:** 2026-05-30
**Related:** [`Challenges_and_Solutions_BodyMounted.md`](./Challenges_and_Solutions_BodyMounted.md), [`MVP_Roadmap.md`](./MVP_Roadmap.md), [`MVP_Phase0_ExecutionPlan.md`](./MVP_Phase0_ExecutionPlan.md), [`ironpal-poc-v1_grilled.md`](./ironpal-poc-v1_grilled.md) (decision log)

> **Note:** Key design decisions were resolved in a grilling session — see [`ironpal-poc-v1_grilled.md`](./ironpal-poc-v1_grilled.md) (Q1–Q9). This document has been updated to reflect them.

---

## 1. Purpose & Goal

IronPal POC v1 is the first runnable artifact of the IronPal concept: a **self-contained Android app running directly on the headband-mounted device**. There is no separate paired phone in this POC — the headband device *is* the camera, the sensor pack, the compute, and the display.

The single question the POC must answer:

> Can a single head-mounted Android device, using only its onboard camera + IMU sensors + a multimodal LLM, reliably report **what exercise** the user did, **how many reps**, and **how much weight** — with zero equipment instrumentation and zero per-machine calibration?

This validates the three core IronPal metrics on real exercises before any investment in custom hardware, streaming, cloud, or D2C packaging.

### The three metrics (v1)

1. **Exercise name** — which movement is being performed.
2. **Repetitions** — count of completed reps in the set.
3. **Weight** — load lifted, where applicable.

### What "success" means

The POC is a **feasibility gate**, not a product. Rather than a single binary pass/fail, it produces a **per-metric verdict matrix** (Q9): each (metric × exercise) cell — plus a cross-user column — gets one of four verdicts: `works` / `works-with-vision` / `needs-work` / `fails` (see [§11 Success Criteria](#11-success-criteria--kpis)). The MVP is then **scoped to whatever passes**; any cell that fails becomes a named R&D item, not a blanket blocker. A clear, evidenced "this approach does NOT work for metric X" result is therefore a valid and valuable POC outcome — it scopes the MVP rather than stopping it.

---

## 2. Scope

### 2.1 In scope

- A native Android app installed on the head-mounted device.
- On-device capture of camera frames + accelerometer + gyroscope.
- An **enrollment ("fingerprint") mode** to record labelled sensor templates per exercise.
- A **live mode** that recognizes the exercise, counts reps, and reads weight, then displays all three on screen in near-real-time.
- Two test exercises only:
  1. **Bulgarian split squat** (dumbbells, free-weight, large whole-body motion)
  2. **Triceps cable pushdown** (cable machine, isolation, small whole-body motion)
- Multimodal LLM calls for weight OCR and (for exercise B) vision-assisted recognition.

### 2.2 Out of scope (deferred)

- Any exercise beyond the two above.
- Separate camera + paired-phone architecture (this is the MVP target, not the POC).
- Real-time streaming / WiFi Direct.
- Cloud sync, accounts, user history, analytics.
- Form analysis / coaching feedback.
- Battery/thermal optimization, polished UI, app-store packaging.
- Privacy/face-blurring pipeline (note it, don't build it yet).
- **Fully passive (no-cue) weight-frame capture** — the POC uses an explicit "glance at the weight" cue (Q5); automatic setup-phase capture is a later goal.
- **Per-user enrollment** — templates are founder-authored and shared (Q1); end users never enroll.
- Mini-camera ↔ phone streaming (BT/Wi-Fi) — an MVP concern; the POC runs everything on the one head-mounted phone (Q3).

### 2.3 Key assumption being tested

> A head-mounted IMU produces an exercise-specific, repeatable motion **fingerprint** that is distinctive enough to recognize the exercise and count reps — *for exercises with meaningful whole-body/head motion.* The POC will test where this holds (Bulgarian split squat) and where it breaks (triceps pushdown, where the head is nearly static) and confirm that camera+vision fusion covers the gap.

> **Second assumption (Q1 + Q2):** a **single founder-authored template library** — recorded once by the founder, stored centrally, not enrolled per-user — generalizes to *other people's* live motion. This is the central IMU risk: other users differ in limb length, tempo, and mount placement. The POC tests it with a small cross-user cohort (founder + 1–2 others, §12) and defends it with a forgiving, shape-based matcher (Q6, §4).

> **Spec note:** The original task brief describes the triceps-pushdown rep-counting bullet using the phrase "…each repetition of the bulgarian split squat." This is read as a copy-paste carry-over; in this document rep counting for exercise B refers to the **triceps cable pushdown** motion. Flagging because exercise B is precisely the case where head-IMU rep counting is expected to be weakest (see [§6.2](#62-exercise-b--triceps-cable-pushdown)).

---

## 3. Hardware & Physical Setup

| Item | Spec / Note |
|---|---|
| **Compute + camera + sensors** | One Android device mounted on a headband (the device's own camera, accelerometer, gyroscope). Use the best available device on hand — per [`a52-camera-setup-guide.md`](./a52-camera-setup-guide.md) the **Samsung Galaxy A52 (SM-A525F)** is the preferred test device over the Redmi 9C; confirm it exposes accelerometer + gyroscope (A52 does). |
| **Mount** | Headband with a pocket/clamp holding the device in **portrait or landscape**, camera facing forward along the line of sight, ~5–10° above eye line. Must be rigid enough that the device does not wobble independently of the head (wobble = sensor noise). |
| **Orientation discipline** | The device is mounted in a **fixed, repeatable orientation** for both enrollment and live runs. The IMU fingerprint is orientation-dependent; if the device sits differently between sessions, the fingerprint match degrades. Mark the mount position. |
| **Exercise B equipment** | A cable machine with a pin-loaded weight stack and a straight/rope triceps attachment. |
| **Exercise A equipment** | A bench (for the rear foot) + a pair of dumbbells with legible weight markings. |
| **Lighting** | Normal gym lighting; ensure the weight stack number / dumbbell label is readable to the human eye at arm's length (if a human can't read it in the frame, the LLM can't either). |

**Mounting caveat carried from the architecture doc:** head-mounted cameras bob during dynamic movement. For the Bulgarian split squat this bob *is* the rep signal (useful). For weight OCR it is noise — the user must hold the head still for ~1–2 s while looking at the weight indicator during setup.

---

## 4. App Architecture

A single Android app (Kotlin) with these modules. Everything runs on-device except the LLM call, which goes out over WiFi/cellular.

```
┌───────────────────────────────────────────────────────────────┐
│                     IronPal POC v1 (Android)                   │
│                                                                │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│  │ Camera Capture│   │ IMU Capture   │   │  Mode Controller  │  │
│  │ (CameraX)     │   │ (SensorMgr,   │   │  enroll | live    │  │
│  │ frame grabber │   │  50–100 Hz)   │   │                   │  │
│  └──────┬───────┘   └──────┬───────┘   └─────────┬─────────┘  │
│         │                  │                      │            │
│         │            ┌─────▼──────────────────────▼──────┐    │
│         │            │   Signal Pipeline                  │    │
│         │            │  • windowing / band-pass filter    │    │
│         │            │  • feature extraction              │    │
│         │            │  • rep peak detection              │    │
│         │            └──────┬──────────────────┬──────────┘    │
│         │                   │                  │               │
│  ┌──────▼───────┐    ┌──────▼───────┐   ┌──────▼──────────┐   │
│  │ Frame buffer  │    │ Fingerprint   │   │ Rep Counter     │   │
│  │ (setup frames)│    │ Matcher       │   │ (cycle count)   │   │
│  │               │    │ (DTW / kNN    │   │                 │   │
│  │               │    │  vs. templates)│  │                 │   │
│  └──────┬───────┘    └──────┬───────┘   └──────┬──────────┘   │
│         │                   │                  │               │
│         │            ┌──────▼──────────────────▼──────────┐   │
│         │            │   Fusion / Decision layer           │   │
│         │            │  exercise = f(fingerprint, vision)  │   │
│         └───────────▶│  weight   = f(vision OCR)           │   │
│  (frames for OCR     │  reps     = f(IMU, vision confirm)  │   │
│   + recognition)     └──────────────────┬──────────────────┘   │
│                                          │                      │
│  ┌──────────────┐                ┌───────▼──────────┐          │
│  │ Local store   │◀───────────────│  On-screen HUD    │          │
│  │ (Room DB:     │                │  exercise / reps / │          │
│  │  templates,   │                │  weight + confidence│         │
│  │  session logs)│                └────────┬───────────┘          │
│  └──────────────┘                          │                     │
│                                    ┌────────▼──────────┐          │
│                                    │  Multimodal LLM    │          │
│                                    │  client (HTTPS)    │          │
│                                    │  gpt-5-nano        │          │
│                                    └────────────────────┘          │
└───────────────────────────────────────────────────────────────┘
```

### 4.1 Recommended tech stack

| Concern | Choice | Rationale |
|---|---|---|
| Language / platform | **Kotlin, native Android** | Direct, low-latency access to `SensorManager` (IMU) and `CameraX` (frames). On-device processing needs native; a web/Flutter layer adds friction for raw sensor streams. |
| Camera | **CameraX** | Simple frame analysis use-case (`ImageAnalysis`) for grabbing frames at a controlled rate. |
| Sensors | **`SensorManager`** with `TYPE_LINEAR_ACCELERATION` (gravity removed) + `TYPE_GYROSCOPE` | Linear acceleration isolates user motion from gravity; gyroscope captures rotation. Sample at `SENSOR_DELAY_GAME` (~50 Hz) or fastest available. |
| Signal processing | On-device Kotlin (band-pass + peak detect for reps); **forgiving, shape-based matcher** for recognition — normalized feature-vector + nearest-neighbor (and/or tempo/amplitude-normalized DTW), **not** raw DTW (Q6) | Features must be tempo/amplitude-invariant so founder-built templates generalize cross-user (Q2). Keep it transparent and debuggable; avoid premature ML. |
| Local storage | **Room (SQLite)** | Stores fingerprint templates and session logs. |
| LLM | **OpenAI `gpt-5-nano`** multimodal (per project standard, see architecture doc §8), called via an **async, non-blocking client** (Q8) | Cheap (~1¢/session), already the chosen model. **Verify multimodal support + the inherited cost numbers at M4** before relying on them. API key from `.env` (do not hard-code; load via build config / local properties, never commit). Client must queue/retry and resolve post-set if WiFi drops — on-device metrics never block on it. |
| Charts/debug | A scrolling sensor-trace view (debug overlay) | Essential for tuning thresholds — you must *see* the acceleration signal. |

---

## 5. Operating Modes

### 5.1 Enrollment ("Fingerprint") mode — founder-only

Purpose: build the labelled reference templates that live mode matches against. **Enrollment is performed once by the founder** and the templates are stored centrally; **end users never enroll** (Q1). Live workouts — including the cross-user testers (Q2) — are matched against this shared founder-built library.

Flow:
1. Founder selects a label from a fixed list: `Bulgarian split squat`, `Triceps cable pushdown`, and the **`UNKNOWN`** seed activities — idle/rest, walking to the machine, racking/unracking, and at least one off-target exercise e.g. a bicep curl (Q4). The UNKNOWN class lets the matcher say "not a tracked exercise" instead of being forced to pick one of two.
2. Founder taps **Record**, mounts up, performs **N clean reps** (recommend 8–12 per take, 3–5 takes per exercise across sessions/days).
3. App records synchronized accelerometer + gyroscope streams (and optionally tags a few frames).
4. On stop, the app segments the recording into per-rep cycles, extracts features, and stores it as a **template** for that exercise label, tagged with device-orientation metadata.
5. Multiple takes → multiple templates per exercise (improves match robustness).

What gets stored per template:
- Raw windowed IMU series (for DTW matching) **and** a feature vector (for fast kNN): dominant-axis, peak-to-peak amplitude, cadence (reps/sec), per-axis energy distribution, gyro rotation magnitude, motion duration.
- Exercise label, take id, device orientation, sample rate.

### 5.2 Live mode

Flow:
1. User taps **Start set**. Camera + IMU begin capturing.
2. **Weight-glance cue (Q5):** before reps begin, the app prompts the user to *glance at the weight indicator (dumbbell head / stack number) for ~2 s*. The app grabs the **sharpest still frame** from that window (triggered on stillness, optionally a tap) and sends it for OCR. This deliberately decouples *capture* from *OCR* so a wrong weight is unambiguously a misread, not a missed frame. (Fully passive capture is deferred — §2.2.) The same setup frames feed exercise B's vision-based recognition.
3. **Rep phase:** IMU signal becomes periodic. App runs the fingerprint matcher (exercise id) and the rep counter (cycle count) continuously.
4. **Fusion:** combine IMU result with vision result per the decision rules in [§7](#7-fusion--decision-logic).
5. **Display (Q8):** the HUD shows **on-device values instantly and offline** (split-squat reps + name from IMU). **LLM-derived values** (weight for both exercises; pushdown name/reps) render a pending state ("…") and **fill in 2–5 s later, non-blocking**; if WiFi drops they queue and resolve after the set. Each value carries a confidence indicator.
6. On **End set**, the app writes a session log row and shows a confirm/correct screen (user can fix any wrong value — these corrections become labelled evaluation data).

---

## 6. Per-Exercise Metric Strategy

### 6.1 Exercise A — Bulgarian split squat

Large vertical whole-body oscillation → **head IMU is the strong signal**. This is the "happy path" for fingerprinting.

| Metric | Primary method | Backup / confirm | Expected POC outcome |
|---|---|---|---|
| **Exercise name** | IMU fingerprint match (vertical accel oscillation + upright orientation + cadence) | Vision: bench-with-elevated-rear-foot is a near-unique setup cue (architecture doc §1b). | High — distinctive motion signature. |
| **Reps** | IMU peak detection on the dominant vertical axis (band-pass → count cycles). Architecture doc estimates ~92–97% for IMU rep counting. | Vision scene-oscillation count as cross-check. | High. |
| **Weight** | Vision OCR on dumbbell label during pickup/setup frames → LLM. | Manual confirm fallback; reuse last-session weight as default. | Good (~80–90% per doc) if label faces camera; needs user to glance at dumbbells. |

Recognition cues for the fingerprint matcher: strong, large-amplitude vertical acceleration cycle; slight forward-back lean component; upright device orientation; cadence ~0.3–0.6 Hz.

### 6.2 Exercise B — Triceps cable pushdown

Isolation movement: the **head and torso barely move** — the action is at the elbows/forearms. This is the deliberate stress test: **head-IMU alone is expected to be insufficient**, exactly as the founder anticipated in the brief.

| Metric | Primary method | Backup / confirm | Expected POC outcome |
|---|---|---|---|
| **Exercise name** | **Vision-led**: head-mounted camera faces the cable stack + the user's forearms/attachment in the lower frame. Send setup + rep frames to LLM. IMU stores a (weak) companion fingerprint. | IMU fingerprint as a *secondary* tie-breaker only. | Recognition feasible via vision (cable + rope/bar attachment + forearm pushdown trajectory are visible); IMU alone likely **fails** — this is a key POC finding. |
| **Reps** | **Vision scene/forearm oscillation** counted by LLM over a frame sequence, since head IMU is near-flat. Optionally a faint forearm-driven micro-oscillation in the gyro. | Manual count if vision unreliable. | Medium — vision rep counting ~75–85% per doc; the POC will measure whether head-IMU contributes anything here at all. |
| **Weight** | Vision OCR on the **pin-loaded stack** during setup (user faces the stack, ~0.5–1 m, numbers large) → LLM. Architecture doc: ~85–95% for pin-loaded stacks egocentric. | Manual confirm fallback. | Strong — best-case OCR scenario. |

> **Important wording correction (per [§2.3](#23-key-assumption-being-tested)):** rep counting for exercise B is based on the **triceps cable pushdown** motion, not the squat. Because the head is nearly static, the rep signal for B comes primarily from **vision**, not IMU. This contrast between A (IMU-driven) and B (vision-driven) is the single most important thing the POC demonstrates.

### 6.3 Weight detection — shared notes

- **Explicit weight-glance cue (Q5):** the app prompts the user to glance at the weight indicator for ~2 s during setup and grabs the **sharpest still frame** from that window (trigger on stillness, optionally a tap). This isolates OCR accuracy from capture luck. Fully passive/auto capture is a deferred goal (§2.2).
- Prompt the LLM explicitly that this is an egocentric head-mounted view and ask it to read the number adjacent to the pin (stack) or on the dumbbell head (free weight). See architecture doc §2 for prompt patterns.
- Confidence threshold: below it → show "tap to confirm weight" with the model's best guess pre-filled.

---

## 7. Fusion & Decision Logic

A small, explicit rule set (no ML needed for a 2-class POC):

Recognition is **3-way**: `{Bulgarian split squat, Triceps cable pushdown, UNKNOWN}` (Q4). A motion-energy/periodicity gate runs first; if the user isn't actively repping, the verdict is `UNKNOWN` and no reps are scored.

```
EXERCISE:
  if not actively_repping (low IMU energy / not periodic):  exercise = UNKNOWN; no reps
  elif best_match.confidence < T_reject:           exercise = UNKNOWN            # forgiving matcher's safety net
  elif IMU_match.confidence ≥ T_imu_high:           exercise = IMU_match          # A typically
  elif vision.confidence ≥ T_vis_high:             exercise = vision_match       # B typically
  elif IMU and vision agree:                        exercise = agreed (high conf)
  else:                                             ask user to confirm

REPS:
  if exercise has strong IMU rep signal (A):       reps = IMU_peak_count
                                                   (flag if |IMU - vision| > 1)
  else (B):                                        reps = vision_count
                                                   (flag low confidence → manual)

WEIGHT:
  weight = vision_OCR
  if OCR.confidence < T_ocr: prompt manual confirm (prefill OCR guess / last weight)
```

Thresholds `T_*` are tuned empirically during testing ([§10](#10-development-plan--milestones)). All four "ask/flag" paths route to the post-set confirm screen so every uncertain call is captured as labelled data.

---

## 8. Data Model (local)

```
Template
  id, exercise_label, take_id, created_at,
  device_orientation, sample_rate_hz,
  imu_series (blob), feature_vector (json)

SessionSet
  id, started_at, ended_at,
  detected_exercise, exercise_confidence, exercise_source(imu|vision|fused|manual),
  detected_reps,     reps_confidence,     reps_source,
  detected_weight,   weight_confidence,   weight_source,
  user_corrected_exercise, user_corrected_reps, user_corrected_weight,   # ground truth
  llm_calls, llm_cost_estimate, notes

DebugCapture (optional)
  session_set_id, imu_raw (blob), frames (paths), llm_request, llm_response
```

The `user_corrected_*` fields are the evaluation backbone: detected-vs-corrected is the accuracy measurement.

---

## 9. On-Screen HUD

Minimal live overlay (this is what makes the POC feel real and is demo-able):

```
┌─────────────────────────────┐
│  ● REC   Set 3              │
│                             │
│  BULGARIAN SPLIT SQUAT  ✓87%│
│                             │
│        REPS   8             │
│                             │
│  WEIGHT  12 kg     (tap ✎)  │
│                             │
│  [ End set ]   [ debug ▦ ]  │
└─────────────────────────────┘
```

- On-device values (split-squat reps + name) appear **instantly**; LLM values (weight, pushdown name/reps) show a **pending "…"** until they resolve 2–5 s later (Q8).
- A brief **setup prompt** ("glance at the weight ~2 s") appears during the weight-glance window (Q5).
- Exercise name can read `—` / "no exercise" when the matcher returns `UNKNOWN` (Q4), e.g. during rest between sets — the HUD must not show phantom reps then.
- Confidence shown per metric (color: green ≥ high, amber = uncertain → tap to confirm).
- A `debug ▦` toggle reveals the live IMU trace + last LLM request/response (essential for tuning).

---

## 10. Development Plan & Milestones

Solo founder; estimates in working days. Sequenced so each milestone is independently demonstrable.

| # | Milestone | Deliverable | Est. |
|---|---|---|---|
| **M0** | Project skeleton: Kotlin app, permissions (camera, sensors), CameraX preview, `SensorManager` stream logging to screen. | App that shows live camera + scrolling IMU trace. | 2 d |
| **M1** | IMU capture + storage + **founder** enrollment mode. Record/segment/store templates incl. the `UNKNOWN` seed activities. | Founder-authored templates for split squat, pushdown & UNKNOWN in Room (Q1, Q4). | 3 d |
| **M2** | Rep counter (band-pass + peak detect) tuned on exercise A. | Live rep count for Bulgarian split squat on-screen. | 3 d |
| **M3** | **Forgiving, shape-based matcher** (normalized feature-vector + kNN / normalized DTW) with a reject threshold. | Live 3-way detection (split squat / pushdown / UNKNOWN), tolerant of tempo/amplitude (Q4, Q6). | 3 d |
| **M4** | LLM client + setup-phase frame capture + weight OCR. | Detected weight shown for both exercises. | 3 d |
| **M5** | Vision recognition + vision rep count for exercise B; fusion layer + thresholds. | Both exercises fully reported; fusion rules live. | 4 d |
| **M6** | HUD polish, post-set confirm/correct screen, session logging, debug overlay. | End-to-end demo + captured eval data. | 3 d |
| **M7** | Test campaign (founder full run **+ 1–2 cross-user testers**) + accuracy write-up. | Filled results doc with the per-metric verdict matrix incl. cross-user column (see [§11](#11-success-criteria--kpis), [§12](#12-testing-methodology)). | 4 d |

**Total: ~25 working days (~5 weeks)** solo. Milestones M2/M3 and M4/M5 each gate a per-metric verdict (Q9) on their respective signal.

### Resources / cost

- Devices: 1 Android test device (A52) + headband mount (existing).
- **Testers:** founder (primary, full run) + **1–2 recruited gym-goers** for the cross-user check (Q2); they perform only, no enrollment.
- Exercises: gym access with a cable machine + dumbbells (legible markings) + bench.
- LLM: OpenAI API key (in `.env`); negligible spend — even heavy testing is cents (architecture doc §8). Budget a token ceiling of ~$5 for the whole POC test campaign.
- Software: free — Android Studio, open-source DTW.

---

## 11. Success Criteria / KPIs

Measured on the founder over a held-out set of recorded sets per exercise (target ≥ 30 sets/exercise across ≥ 3 sessions and ≥ 2 days, to test cross-session fingerprint stability), **plus a smaller cross-user cohort** (1–2 others, ~5 sets/exercise each — Q2).

### Target thresholds (feed the verdicts, not a binary gate)

| Metric | Exercise A (Bulgarian split squat) | Exercise B (Triceps pushdown) | Notes |
|---|---|---|---|
| **Exercise recognition accuracy** | ≥ 85% correct | ≥ 80% correct (vision-led) | 3-way incl. UNKNOWN; "correct" = top prediction matches the user-confirmed label (Q4). |
| **False reps at rest** | ~0 phantom reps in idle/transition windows | same | UNKNOWN class + motion gate must suppress rest-time scoring (Q4). |
| **Rep count** | within ±1 rep on ≥ 90% of sets | within ±1 rep on ≥ 75% of sets | A via IMU, B via vision. |
| **Weight read (OCR, on cued frame)** | exact on ≥ 80% of sets (dumbbell label) | exact on ≥ 85% of sets (pin stack) | Measured on the guaranteed-readable glance frame (Q5) — isolates OCR accuracy from capture. |
| **Cross-session robustness** | recognition drop < 10% across days | n/a (vision-led) | Orientation/fingerprint fragility (R1). |
| **Cross-user robustness (Q2)** | recognition ≥ ~70% on 1–2 others (soft bar) | ≥ ~70% on others | The headline IMU risk; soft bar to *interpret*, not gate. |
| **Latency** | reps/name instant; LLM values ≤ ~5 s | same | Usability sanity check (Q8), not a gate. |
| **LLM cost** | ≤ ~$0.02 / session | ≤ ~$0.02 / session | Confirms architecture doc §8 economics (verify model at M4). |

### Verdict matrix (the actual POC output — Q9)

Each cell gets one of: `works` / `works-with-vision` / `needs-work` / `fails`. The MVP is scoped to the `works` / `works-with-vision` cells; `needs-work` / `fails` cells become named R&D items (not a blanket stop).

| | Split squat (founder) | Pushdown (founder) | Cross-user (others) |
|---|---|---|---|
| **Exercise name** | _verdict_ | _verdict_ | _verdict_ |
| **Reps** | _verdict_ | _verdict_ | _verdict_ |
| **Weight** | _verdict_ | _verdict_ | _verdict_ |

Expected shape from current assumptions: split-squat reps/name (IMU) → likely `works`; pushdown name/reps → likely `works-with-vision`; weight (both) → `works`–`needs-work` depending on OCR; cross-user → the cell most likely to land `needs-work`. None of these is a blocker on its own — they scope the MVP.

---

## 12. Testing Methodology

### 12.1 Procedure per exercise

1. **Founder enrolls** the templates: 3–5 takes per exercise + the UNKNOWN seed activities, across at least 2 different days (re-mount the device each time to capture real orientation variance). End users / testers do **not** enroll (Q1).
2. **Founder evaluation runs:** perform ≥ 30 sets, varying reps (e.g. 6–12), weight, fatigue level, and time of day. Announce the true rep count aloud / log it so ground truth is unambiguous. Use the weight-glance cue (Q5) each set.
3. **Cross-user runs (Q2):** 1–2 recruited gym-goers each perform ~5 sets/exercise against the founder's templates (no enrollment). Log their results separately for the cross-user column.
4. After each set, **do not peek** at the prediction before logging your own ground truth, then confirm/correct in the app (the correction is the label).
5. Export `SessionSet` rows; compute the KPIs and fill the verdict matrix in §11.

### 12.2 What to deliberately stress

- **Cross-user generalization (headline risk, Q2):** do the founder's templates recognize 1–2 other people? A drop here means IMU matching needs per-user adaptation or vision must lead recognition.
- **Fingerprint fragility:** enroll on day 1, test on day 3 with a fresh mount — does recognition survive (R1)?
- **Rest/transition false positives (Q4):** sit idle, walk to the machine, rack weights — does the app correctly say `UNKNOWN` and refrain from counting reps?
- **Black-on-black / glare** on dumbbell labels and stack numbers (lighting realism). (Note: capture timing is *controlled* by the glance cue per Q5, so this isolates true OCR legibility.)
- **Exercise B IMU:** explicitly log whether the head IMU contributes *anything* to B, to validate the "vision must lead for isolation movements" thesis.
- **Confusion test:** does a Bulgarian split squat ever get misread as a lunge-like motion, or pushdown as another cable movement (now also catchable as `UNKNOWN`)?

### 12.3 Output

A results document `docs/ironpal-poc-v1-results-<date>.md` containing: the KPI table (actual vs. target, including the cross-user column), confusion notes, the **filled verdict matrix** (§11, Q9), the resulting **MVP scope list** (the `works` / `works-with-vision` cells), the **R&D backlog** (the `needs-work` / `fails` cells), failure examples (screens + IMU traces), and recommendations for MVP.

---

## 13. Risks & Mitigations

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | **IMU fingerprint not stable cross-session OR cross-user** (orientation/mount/body/tempo variance changes the signature). Cross-user is the headline risk because templates are founder-authored and shared (Q1/Q2). | High — undermines the whole fingerprint thesis. | **Forgiving, shape-based matcher** that normalizes tempo/amplitude (Q6) is the primary defense; enroll multiple takes/days; mark a repeatable mount position; UNKNOWN class catches non-matches; fall back to vision recognition. Explicitly measured cross-session and cross-user in §12.2. |
| R2 | **Head IMU too quiet for triceps pushdown reps.** | Medium (expected). | Vision-led rep count for B; document the boundary of IMU usefulness. This is a *finding*, not a blocker. |
| R3 | **Weight label never readable** (motion blur, label faces away, dark gym). | Medium. | Setup-phase high-fps capture; instruct user to glance at weight ~1–2 s; manual confirm fallback with last-weight default. |
| R4 | **Head-bob motion blur** ruins vision frames during reps. | Medium. | Use setup-phase (still) frames for OCR; subsample sharpest frames; for B the pushdown is relatively stable. |
| R5 | **Only two exercises** → matcher trivially "picks the closer of two." | Medium (over-optimistic accuracy). | **Resolved (Q4):** UNKNOWN reject class seeded with idle/walking/racking + one off-target lift, plus a motion-energy/periodicity gate, so recognition is 3-way and not a forced binary. |
| R6 | **LLM latency / connectivity** in the gym. | Low. | **Resolved (Q8):** async non-blocking client — on-device reps/exercise work offline and update instantly; weight/vision values fill in 2–5 s, queue + retry on drop, resolve post-set. |
| R7 | **Device thermals / battery** during long sessions. | Low (POC sessions are short). | Out of scope; note observed behavior only. |
| R8 | **API key handling.** | Low but real. | Load key from `.env` / local properties at build time; never commit; keep out of logs/`DebugCapture` exports shared externally. |

---

## 14. Open Questions for the Team

Most of the original open questions were resolved in the grilling session ([`ironpal-poc-v1_grilled.md`](./ironpal-poc-v1_grilled.md)):

1. **(Still open)** Device choice locked to **A52**, or test a second device to gauge IMU/camera variance early?
2. ~~Exercise A weight source?~~ → **Resolved (Q7):** dumbbells (label OCR); pushdown uses the pin stack — covers both reading scenarios.
3. ~~"Unknown/other" reject class?~~ → **Resolved (Q4):** yes, 3-way recognition with an UNKNOWN class.
4. ~~Enrollment burden / out-of-the-box?~~ → **Resolved (Q1):** templates are **founder-authored and shared**; end users never enroll. Cross-user generalization is tested (Q2) and defended by a forgiving matcher (Q6).
5. ~~v1 form factor?~~ → **Resolved (Q3):** POC = phone on headband; MVP = mini-camera in headband with its own onboard IMU. Head-IMU placement is identical, so POC IMU work transfers.

**New build-time verification (from Q8):** confirm `gpt-5-nano` is genuinely multimodal and the inherited per-session cost numbers hold, at milestone M4 — before depending on them.

---

## 15. Relationship to the MVP

**Form factor (Q3):** the POC runs everything on a **phone mounted on the headband**. The MVP replaces that with a **dedicated mini-camera built into the headband**, paired to the phone app over Bluetooth/Wi-Fi, and crucially the mini-camera carries its **own onboard IMU**. Because the IMU stays **head-mounted in both**, the POC's head-IMU rep-counting thresholds and motion fingerprints **transfer directly** to the MVP — they are not throwaway. The only net-new MVP plumbing is the camera↔phone link (out of POC scope).

Findings feed directly into:

- **Exercise recognition** approach in [`Challenges_and_Solutions_BodyMounted.md`](./Challenges_and_Solutions_BodyMounted.md) §1/§1b — confirming or revising the multi-signal fusion estimates with real measured accuracy.
- **MVP scope** decisions, via the **per-metric verdict matrix (Q9):** the MVP ships the `works` / `works-with-vision` cells; `needs-work` / `fails` cells (likely cross-user IMU and/or pushdown-IMU) become explicit R&D items rather than blockers.

If the POC validates IMU-led recognition for high-motion lifts and vision-led for isolation lifts — and the founder-authored templates generalize acceptably to the 1–2 cross-user testers (Q2) — the MVP can confidently adopt the **shared-template fingerprint + vision fusion** model on the mini-camera + phone architecture.
