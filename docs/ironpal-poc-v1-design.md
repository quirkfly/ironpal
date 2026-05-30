# IronPal POC v1 — Technical Design Plan

**Status:** Draft for team review
**Owner:** Solo founder (development + testing)
**Date:** 2026-05-30
**Implements:** [`ironpal-poc-v1.md`](./ironpal-poc-v1.md) (the POC spec) + decisions in [`ironpal-poc-v1_grilled.md`](./ironpal-poc-v1_grilled.md) (Q1–Q9)
**Design decisions:** refined in a grilling session — see [`ironpal-poc-v1-design_grilled.md`](./ironpal-poc-v1-design_grilled.md) (D1–D5). This document reflects them.

> This is the **how** to the POC spec's **what**. It assumes the spec and the grilled decisions as settled inputs and designs the concrete system: components, data flow, schema, API contract, and where each metric is computed.

---

## 1. Specified Tech Stack

| Layer | Technology | Role in the POC |
|---|---|---|
| **Frontend** | **React Native** | Mobile app on the head-mounted phone: captures camera + IMU, runs on-device rep/exercise detection, renders the live HUD, talks to the backend. |
| **Backend** | **Python + FastAPI** | Server-side processing: stores/serves the founder's fingerprint templates, ingests session logs, and proxies all vision/LLM calls (keeps the OpenAI key off the device). |
| **Database** | **PostgreSQL** | Users, **founder-authored exercise fingerprints** (Q1), session logs, debug captures. |
| **AI model** | **OpenAI `gpt-5-nano`** (multimodal) | Weight OCR (both exercises) and vision-led recognition / rep counting for the triceps pushdown (Q-decisions §6). |

### 1.1 Reconciling the stack with the POC spec

The POC spec (§4) originally recommended a **native Kotlin, fully on-device** app and a *direct* device→LLM call. The specified stack changes two things — both are improvements for a real system and are adopted here, with the trade-offs called out:

1. **React Native instead of native Kotlin.** RN does not natively stream 50–100 Hz IMU data or grab camera frames at low latency from JavaScript. **Design response:** the latency-critical work (IMU sampling, the on-device signal pipeline, camera frame capture) is implemented as **native modules** (Kotlin) bridged to RN; the JS layer owns UI, orchestration, and networking. This preserves Q8's "instant, offline" IMU feedback while keeping the RN developer ergonomics. (See [§4.1](#41-mobile-app-react-native).)

2. **A FastAPI backend instead of a direct device→OpenAI call.** This is strictly better for the POC:
   - **Keeps the OpenAI API key server-side** — resolves risk R8 in the spec (no key embedded in the app).
   - **Central home for the founder-authored templates** (Q1) — PostgreSQL is the system of record; the app caches a copy for offline matching.
   - **One place to evolve prompts, batching, cost controls, and model swaps** without shipping a new app build.

   The cost: the app now needs the backend reachable for *weight + pushdown-vision* values. This is fine because Q8 already makes those values **async, fill-in-later, queue-on-drop** — the on-device IMU metrics never depend on the network.

---

## 2. Architecture Overview

Three tiers + the external LLM. The head-mounted phone runs the RN app; the backend and DB run on a **self-hosted, internet-facing server over HTTPS** (D2 — same host family as `handlr-web`); gpt-5-nano is reached only from the backend.

```
        HEAD-MOUNTED PHONE (React Native)
┌─────────────────────────────────────────────────────┐
│  Native modules (Kotlin bridge)                       │
│   • IMU sampler (50–100 Hz, linear accel + gyro)      │
│   • Camera frame grabber (CameraX)                    │
│   • Signal pipeline: band-pass + peak detect (reps),  │
│     shape-based matcher (exercise) vs LOCAL templates │
│                                                        │
│  JS layer (React Native)                              │
│   • Mode controller (enroll | live)                   │
│   • Live HUD (instant IMU values; LLM values "…")     │
│   • Local cache (SQLite): synced templates,           │
│     queued sessions, queued vision requests           │
│   • API client (HTTPS)                                │
└───────────────┬───────────────────────────────────────┘
                │  HTTPS (JSON + frame uploads)
                ▼
        BACKEND (Python / FastAPI)
┌─────────────────────────────────────────────────────┐
│  Routers:  /templates  /sessions  /vision  /auth      │
│  Services:                                            │
│   • Template store (founder fingerprints)             │
│   • Vision service → gpt-5-nano (OCR + recognition)   │
│   • Session ingest + verdict data                     │
│  OpenAI key lives HERE (never on device)              │
└───────┬───────────────────────────────┬───────────────┘
        │ SQL                            │ HTTPS
        ▼                                ▼
   PostgreSQL                     OpenAI gpt-5-nano
 (users, templates,              (multimodal: weight OCR,
  sessions, debug)                pushdown recognition/reps)
```

### 2.1 Where each metric is computed (the load-bearing mapping)

This is the heart of the design — it ties the stack to the grilled decisions.

| Metric | Bulgarian split squat | Triceps cable pushdown | Computed where |
|---|---|---|---|
| **Exercise name** | On-device IMU shape-matcher vs. local templates (Q6) → instant | **Backend** gpt-5-nano vision (head IMU too quiet) → fills in 2–5 s | App (A) / Backend (B) |
| **Reps** | On-device IMU peak detection → instant, offline (Q8) | **Backend** gpt-5-nano vision scene/forearm count → fills in | App (A) / Backend (B) |
| **Weight** | **Backend** gpt-5-nano OCR on the dumbbell-glance frame (Q5, Q7) | **Backend** gpt-5-nano OCR on the pin-stack glance frame (Q5) | Backend (both) |
| **3-way gate** | On-device UNKNOWN reject + motion gate (Q4) | same | App |

**Consequence:** the split squat works **fully offline** for reps + name; only its weight needs the backend. The pushdown leans on the backend for name + reps + weight. This matches the spec's "IMU-led vs. vision-led" thesis exactly.

---

## 3. Data Flow

### 3.1 Enrollment flow (founder only — Q1)

```
Founder (RN app, enroll mode)
  selects label {split squat | pushdown | UNKNOWN-seed}
  records N reps  ──► native pipeline segments + extracts features
                       (raw IMU window + normalized feature vector)
  POST /templates  ──► FastAPI ──► INSERT into PostgreSQL.templates
                                    (label, take_id, orientation, features, raw_blob)
```

End users / cross-user testers (Q2) **never** enroll — they only run live mode against the founder's templates.

### 3.2 Live workout flow

```
User taps "Start set"
  app ensures local template cache is fresh:
     GET /templates/sync?since=<ver>  ──► download any new founder templates
  ┌─ WEIGHT GLANCE (Q5) ─────────────────────────────────────────┐
  │ HUD prompts "glance at the weight ~2s"                        │
  │ native grabs sharpest still frame                             │
  │ POST /vision/weight {frame, exercise_hint}                    │
  │   backend → gpt-5-nano OCR → {weight, confidence}             │
  │   (async; HUD shows "…" until it returns; queue if offline)   │
  └──────────────────────────────────────────────────────────────┘
  ┌─ REP PHASE ──────────────────────────────────────────────────┐
  │ native motion gate: actively repping?                         │
  │   if not → exercise = UNKNOWN, no reps (Q4)                   │
  │ IMU shape-matcher → exercise candidate (instant)              │
  │ IMU peak detect → rep count (instant)              [split squat]│
  │ for pushdown: also POST /vision/recognize {frame_seq}         │
  │   backend → gpt-5-nano → {exercise, reps, confidence} (fills in)│
  │ fusion (Q-decisions §7) reconciles IMU + vision              │
  └──────────────────────────────────────────────────────────────┘
User taps "End set"
  app writes SessionSet locally, shows confirm/correct screen
  user corrects any wrong value (= ground-truth label)
  POST /sessions {detected_*, corrected_*, sources, confidences, cost}
     (queued + retried if offline)
```

---

## 4. Component Design

### 4.1 Mobile app (React Native)

**Native modules (Kotlin, bridged to JS) — custom, not a library (D6).** `react-native-sensors` is deliberately avoided: it streams samples *to JS*, which would put the 50 Hz stream and matcher on the JS thread and break instant/offline (D1). Raw samples never cross the bridge — only results do.

| Module | Responsibility | Why native |
|---|---|---|
| `ImuModule` | Subscribe to `SensorManager` `TYPE_LINEAR_ACCELERATION` (baseline) + `TYPE_GYROSCOPE` (**optional** — detect availability, emit a `has_gyro` capability flag, D5); buffer windows; **resample to a canonical rate** (D4) before handing off; emit events. | JS bridge can't sustain 50 Hz reliably; sampling must be native. Testers' phones vary in rate and may lack a gyro (D4/D5). |
| `CameraModule` | CameraX `ImageAnalysis`; grab sharpest still during the glance window; buffer a short frame sequence for pushdown vision. | Low-latency frame access + on-device sharpness selection. |
| `SignalModule` | Band-pass filter + peak detection (reps); **normalized shape matcher** (kNN / normalized DTW) vs. locally cached templates (Q6); motion-energy/periodicity gate (Q4). | Tight loop over sensor windows; keep off the JS thread for instant feedback. |

**JS layer (React Native):**
- **Mode controller** — enroll vs. live.
- **HUD** (§9 of spec) — renders on-device values instantly; LLM-derived values show a pending `…` then patch in (Q8); shows `—`/"no exercise" on UNKNOWN.
- **Local store (SQLite via `op-sqlite`/`watermelondb`)** — cached founder templates (for offline matching), queued `SessionSet` rows, queued vision requests for retry.
- **API client** — HTTPS to FastAPI; token auth; exponential-backoff retry; offline queue drain.

**Offline behavior (Q8):** IMU reps + split-squat recognition run with zero network. Vision/weight requests queue locally and resolve when connectivity returns or post-set. Template sync happens opportunistically at "Start set" / on launch.

### 4.2 Backend (FastAPI)

**Routers / endpoints** (contract in [§6](#6-api-contract)):
- `POST /auth/token` — minimal auth (single founder user + a couple of test users; JWT or static token for POC).
- `POST /templates` — store a founder-enrolled template.
- `GET /templates/sync` — return templates changed since a client version (for the app's local cache); returns **both** the feature vector and the resampled raw window per template (D7).
- `POST /vision/weight` — frame → gpt-5-nano OCR → `{weight, unit, confidence}`.
- `POST /vision/recognize` — frame sequence → gpt-5-nano → `{exercise, reps, confidence}` (pushdown).
- `POST /sessions` — ingest a completed set (detected + corrected values, sources, confidences, cost).
- `GET /sessions/export` — dump rows for the verdict-matrix analysis (§11/§12 of spec).

**Services:**
- **Template store** — CRUD over `templates`; versioning so the app can sync deltas.
- **Vision service** — builds the egocentric prompts (architecture doc §1/§2 patterns), calls gpt-5-nano, parses structured JSON, records token usage for the cost KPI. **Deletes the uploaded frame immediately after inference** (D3); persists a `debug_capture` only for the founder's own opt-in sessions. Holds the **OpenAI key** (env var, never returned to clients).
- **Session ingest** — validates and stores sets; computes nothing the device already computed (single source of truth for detected vs. corrected).

**Why the matcher stays on the device, not the backend:** Q8 requires instant, offline IMU feedback. Streaming IMU windows to the backend for matching would add latency and a hard network dependency to the split squat's reps — defeating the design. The backend is the **template system-of-record**; the device does the matching against a synced copy.

### 4.3 Database (PostgreSQL)

Schema (POC-level; types abbreviated):

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY,
  role          TEXT CHECK (role IN ('founder','tester')),  -- Q2 cohort
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Founder-authored fingerprints (Q1). Shared across all users.
CREATE TABLE templates (
  id            UUID PRIMARY KEY,
  exercise_label TEXT NOT NULL,         -- 'bulgarian_split_squat' | 'triceps_pushdown' | 'unknown'
  take_id       INT NOT NULL,
  device_orientation JSONB,             -- mount orientation metadata
  sample_rate_hz INT,
  feature_vector JSONB NOT NULL,        -- normalized, tempo/amplitude-invariant (Q6)
  imu_series    BYTEA,                  -- raw window for normalized-DTW matching
  version       BIGINT NOT NULL,        -- for /templates/sync deltas
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE session_sets (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES users(id),
  started_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ,
  detected_exercise   TEXT,  exercise_confidence REAL,  exercise_source TEXT, -- imu|vision|fused|manual|unknown
  detected_reps       INT,   reps_confidence     REAL,  reps_source     TEXT,
  detected_weight     REAL,  weight_confidence   REAL,  weight_source   TEXT,
  corrected_exercise  TEXT,  corrected_reps      INT,   corrected_weight REAL, -- ground truth (Q9)
  is_rest_window      BOOLEAN DEFAULT false,            -- for false-reps-at-rest KPI (Q4)
  device_model  TEXT,                                   -- D4: testers on own phones
  sensor_info   JSONB,                                  -- D4: sensors present + characteristics
  sample_rate_hz INT,                                   -- D4: native sampling rate before resample
  has_gyro      BOOLEAN,                                -- D5: split KPIs by gyro availability
  llm_calls     INT,   llm_cost_estimate REAL,
  notes         TEXT
);

CREATE TABLE debug_captures (               -- FOUNDER-ONLY, opt-in, for failure analysis (D3)
  id            UUID PRIMARY KEY,
  session_set_id UUID REFERENCES session_sets(id),
  imu_raw       BYTEA,
  frame_refs    JSONB,                      -- founder sessions only; testers' frames never stored
  llm_request   JSONB,  llm_response JSONB
);  -- purge all rows at POC end (D3)
```

The `corrected_*` columns are the evaluation backbone (detected-vs-corrected → the verdict matrix). `is_rest_window` supports the false-reps-at-rest KPI from Q4. The device columns (`device_model`, `sensor_info`, `sample_rate_hz`, `has_gyro`) let cross-user results be sliced by hardware (D4/D5) — essential because testers use their own phones, confounding body and device variance. `debug_captures` is **populated only for the founder's opt-in sessions and purged at POC end** (D3).

### 4.4 AI integration (gpt-5-nano)

- **Called only from the backend vision service.** Two call types:
  - **Weight OCR** — single guaranteed-readable glance frame (Q5) + egocentric prompt: "read the number adjacent to the pin / on the dumbbell head."
  - **Pushdown recognition + reps** — short frame sequence + egocentric prompt asking for exercise + rep count from the visual motion pattern.
- **Structured JSON output** enforced; low confidence → device shows "tap to confirm" (Q5/§7).
- **Async, non-blocking, queued** (Q8). Token usage logged per call for the cost KPI (≤ ~$0.02/session target).
- **M4 verification (from grilling):** confirm `gpt-5-nano` is genuinely multimodal and the cost numbers hold **before** depending on them.

---

## 5. Signal Processing Design (on-device)

Honors Q6 (forgiving, shape-based) and Q4 (UNKNOWN + gate).

1. **Preprocessing:** linear acceleration (gravity removed) as the **baseline signal**; gyroscope added **only when present** (D5, `has_gyro`). **Resample to a canonical rate** (D4) so templates enrolled on the A52 compare against testers' differently-clocked phones; band-pass filter to the rep-cadence band (~0.2–1.5 Hz).
2. **Motion gate (Q4):** compute windowed energy + periodicity (autocorrelation peak). If below threshold → state = `UNKNOWN`, no scoring. Suppresses rest/transition phantom reps.
3. **Rep counting:** peak detection on the dominant axis within the cadence band; one cycle = one rep. (Split squat = strong signal; pushdown = expected weak/absent → vision leads.)
4. **Feature extraction (tempo/amplitude/orientation-invariant):** axis-energy *ratios*, normalized cadence, peak-shape descriptors, motion duration ratios — computed from **accel alone (baseline)**; gyro-rotation features added only when `has_gyro` (D5). Deliberately **not** absolute magnitudes, and **orientation-invariant** (D4) — so founder templates generalize across other bodies, mounts, and sensors (Q2/D4).
5. **Matching (Q6):** normalized feature vector → kNN against cached templates, and/or amplitude/time-normalized DTW on the resampled window. The matcher must now absorb **body + tempo + mount-orientation + sensor variance** (Q6 raised by D4). Output: best label + distance→confidence. Below `T_reject` → `UNKNOWN`.

---

## 6. API Contract (key endpoints)

```http
POST /vision/weight
  body:  { exercise_hint: "triceps_pushdown", frame: <base64 jpeg> }
  200:   { weight: 25.0, unit: "kg", confidence: 0.91 }

POST /vision/recognize          # pushdown name + reps
  body:  { frames: [<base64 jpeg>, ...], orientation: "supine|upright|..." }
  200:   { exercise: "triceps_pushdown", reps: 12, confidence: 0.82 }

GET  /templates/sync?since=<version>          # returns BOTH representations (D7)
  200:   { version: 42, templates: [ { id, exercise_label,
                                       feature_vector,           # for kNN
                                       imu_series_resampled,     # resampled raw window, for normalized-DTW (D4/D5/D7)
                                       ... } ] }

POST /templates                 # founder enrollment
  body:  { exercise_label, take_id, device_orientation, sample_rate_hz, feature_vector, imu_series }
  201:   { id, version }

POST /sessions
  body:  { started_at, ended_at, detected_*, corrected_*, *_source, *_confidence,
           is_rest_window, llm_calls, llm_cost_estimate, notes }
  201:   { id }
```

All endpoints require the auth token; `/vision/*` never expose the OpenAI key.

---

## 7. Security & Config

- **Internet-facing over HTTPS (D2).** The backend is on a self-hosted, internet-reachable server, so TLS is mandatory (reverse proxy — Caddy/nginx + Let's Encrypt). PostgreSQL is bound to localhost on the box; only FastAPI is exposed. Basic hardening: auth on every endpoint, rate-limit `/vision/*`, keep the host patched.
- **OpenAI key** lives only in the backend environment (`.env` server-side); never shipped in the app — resolves spec risk R8.
- **Auth:** minimal for POC — a **per-user bearer token** distinguishing `founder` vs `tester` (lets sessions be attributed and a tester revoked). Not production auth.
- **Frame retention (D3).** Uploaded frames are **deleted immediately after the gpt-5-nano call** for everyone. `debug_captures` (frame + LLM I/O) are stored **only for the founder's opt-in sessions**; **testers' frames are never retained**. All debug data is **purged at POC end**. Testers consent to "frames are processed then deleted, never stored." Honors spec §7's bystander-privacy stance even though the server is internet-facing.

---

## 8. Build Plan (maps to POC spec §10 milestones)

| POC milestone | Design work in this stack |
|---|---|
| **M0** skeleton | RN app scaffold + **custom** `ImuModule`/`CameraModule` native bridges (D6, no library); FastAPI skeleton + PostgreSQL up; `/auth` + health check. |
| **M1** enrollment | `SignalModule` feature extraction; `POST /templates`; `templates` table; founder enroll UI incl. UNKNOWN seed. |
| **M2** rep counter | On-device peak detection tuned on split squat; instant HUD reps. |
| **M3** matcher | On-device normalized matcher + reject threshold; `GET /templates/sync` + local cache; 3-way detection. |
| **M4** LLM/weight | Vision service + gpt-5-nano integration; `POST /vision/weight`; glance-cue capture; **verify model + cost**. |
| **M5** vision + fusion | `POST /vision/recognize` for pushdown; fusion layer + thresholds; async fill-in + offline queue. |
| **M6** logging/HUD | Confirm/correct screen; `POST /sessions` (incl. `device_model`/`sensor_info`/`has_gyro` per D4/D5); debug overlay; pending-state HUD; **signed APK** build for sideloading (D4). |
| **M7** test + write-up | Founder + 1–2 testers **on their own phones** (D4); distribute APK; `GET /sessions/export`; fill the verdict matrix, slicing cross-user results by device/`has_gyro`. |

No change to the ~25-day estimate; the backend work is absorbed within M0/M1/M4/M5 (FastAPI + PostgreSQL is lightweight for this scope).

---

> **Note:** these risk IDs are `DR#` (Design Risk) — distinct from the grilled design **decisions** `D1–D5` in [`ironpal-poc-v1-design_grilled.md`](./ironpal-poc-v1-design_grilled.md).

| # | Risk | Mitigation |
|---|---|---|
| DR1 | **RN can't sustain 50 Hz IMU / low-latency frames from JS.** | Do all sampling + the signal pipeline in **native Kotlin modules**; JS only orchestrates (decision D1). (Designed in from the start — §4.1.) |
| DR2 | **On-device matcher in a native module is extra bridge work** vs. a pure-Kotlin app. | Keep the matcher self-contained in `SignalModule`; the bridge surface is small (start/stop + result events). |
| DR3 | **Template sync staleness** — app matches against an old template set. | `GET /templates/sync` on every "Start set" + on launch; version-gated deltas. |
| DR4 | **Backend dependency for pushdown reps/name** (no offline path for B). | Accepted per Q8: pushdown is vision-led; queue + resolve post-set if offline. Split squat remains fully offline. |
| DR5 | **Latency of vision round-trip** hurts the "live" feel. | Weight is captured during the still setup phase (not time-critical); HUD shows pending `…`; on-device values are instant. |
| DR6 | **Cost/availability of `gpt-5-nano` unverified.** | M4 verification gate before relying on it; backend isolates the model so a swap is a server change, not an app release. |
| DR7 | **Cross-user result confounded by device variance** (testers on own phones — D4). | Log `device_model`/`sensor_info`/`has_gyro` and slice results by them; accel-only baseline (D5) keeps gyro-less phones in; fallback A/B (tester on the A52 vs own phone) isolates the device effect if accuracy collapses. |
| DR8 | **Internet-facing backend exposure** (D2) — frames + tokens over the public net. | HTTPS/TLS mandatory; per-user tokens + rate-limited `/vision/*`; Postgres localhost-only; frames deleted post-inference (D3); host kept patched. |

---

## 10. Open Questions

Most original open questions were resolved in the grilling session ([`ironpal-poc-v1-design_grilled.md`](./ironpal-poc-v1-design_grilled.md)):

1. ~~Deployment target?~~ → **Resolved (D2):** self-hosted, internet-facing server over HTTPS.
2. **Template cache distribution to testers** — testers' apps must sync the founder's templates; confirm the per-user token flow lets a `tester` pull templates read-only. (Auth model set to per-user tokens in §7; sync flow still to implement.)
3. Carried from the spec: **second test device** beyond the A52 (POC spec Open Question #1) — note D4 partly supersedes this, since testers now bring varied devices anyway.
4. ~~RN sensor library vs. custom native module?~~ → **Resolved (D6):** custom Kotlin `ImuModule`/`SignalModule` from the start; no `react-native-sensors` (it would route 50 Hz to JS and break D1). Raw samples never cross the bridge.
5. ~~Template-sync payload?~~ → **Resolved (D7):** ship **both** the feature vector and the resampled raw window per template; trivial size at POC scale, and lets the matcher use/fuse kNN + normalized-DTW without re-syncing.

All design-tree branches are now resolved; the remaining unknowns are build-time verifications (e.g. `gpt-5-nano` multimodal + cost at M4, per DR6) rather than open decisions.
