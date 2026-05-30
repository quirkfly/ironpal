# IronPal POC v1 Design — Grilling Session (decisions log)

Companion to [`ironpal-poc-v1-design.md`](./ironpal-poc-v1-design.md). Resolves the design-tree branches the stack (React Native + FastAPI + PostgreSQL + gpt-5-nano) opened up. Each entry: question, decision, rationale/impact. Decisions here are prefixed **D** to distinguish them from the spec-level Q1–Q9 in [`ironpal-poc-v1_grilled.md`](./ironpal-poc-v1_grilled.md).

---

## D1 — Where does IMU rep-counting + matching run, given the new backend?

**Decision:** **On-device (Q8 still holds).** The signal pipeline (sampling, rep peak-detection, the shape-based matcher) stays in **native Kotlin modules** bridged into React Native. Split-squat reps + recognition are instant and work with no network.

**Rationale / impact:**
- Preserves Q8's instant/offline property and the core "it just reacts" feel.
- **MVP-relevant:** the MVP mini-camera will also process motion on-device (its own onboard IMU, Q3), so the on-device pipeline built here is not throwaway — it's the thing the MVP needs proven.
- Accepts the **highest build cost** in the stack (RN↔Kotlin bridge) as worth it.
- **Doc impact:** confirms design §4.1 (native modules) and §4.2 ("why the matcher stays on the device"); the backend remains the template system-of-record + vision proxy, not the IMU processor. Risk D2 (bridge work) stands.

---

## D2 — Backend deployment target.

**Decision:** **Self-hosted server, accessible from the internet** (the founder's own box — same host family as `handlr-web`, referenced earlier in the project). Not managed cloud (Fly/Render), not laptop-localhost.

**Rationale / impact:**
- Testers (Q2) reach the backend over the **public internet** — no "must be on my LAN / I must be present" constraint; they can run their ~5 sets/exercise on their own time.
- Founder controls the box and reuses existing self-hosting infrastructure.
- **Requirements this creates:**
  - **Public DNS + TLS/HTTPS** — the app uploads auth tokens + camera frames, so the endpoint must be HTTPS (reverse proxy, e.g. Caddy/nginx + Let's Encrypt).
  - Port-forward / firewall rules; PostgreSQL stays bound to localhost on the box (only FastAPI is exposed).
  - Basic hardening since it's internet-facing (auth on every endpoint — see D-auth; rate-limit `/vision/*`).
- **Doc impact:** resolves design Open Question #1; update §7 (Security) to require HTTPS + an internet-facing hardening note; update §2 diagram caption ("backend on self-hosted server").

---

## D3 — Server-side camera-frame retention.

**Decision:** **Discard by default; retain founder-only.** Frames are deleted immediately after the gpt-5-nano call returns (matches spec §7). The `debug_captures` table (frame + LLM request/response) is populated **only for the founder's own sessions**, opt-in, for failure analysis. **Testers' frames are never retained.** All debug data is purged at POC end.

**Rationale / impact:**
- Keeps the diagnostic value where it's needed (founder tuning OCR/recognition) without storing bystanders'/testers' images on an internet-facing box.
- Honors spec §7's "process then delete, only structured log persists" for everyone except the consenting founder.
- **Doc impact:**
  - §4.2 Vision service: add "delete frame after inference" as the default path.
  - §4.3 schema: `debug_captures` is founder-session-only; add a retention/purge note.
  - §7 Security: state the retention policy explicitly + a POC-end purge step; testers consent to "frames processed then deleted, never stored."
  - Risk register: closes the bystander-image exposure created by D2.

---

## D4 — Tester device for the Q2 cross-user runs.

**Decision:** **Testers use their own phones** (sideload the APK). Most product-realistic and lets testers run on their own time over the internet (D2).

**Rationale / impact + the caveat that must be documented:**
- **Confound (state loudly):** versus the founder's enrollment, this varies **both** the body/motion **and** the IMU/camera hardware + mount orientation. A cross-user recognition drop therefore **cannot be cleanly attributed** to "people differ" vs "sensors differ." The cross-user KPI must carry this caveat.
- **Mitigations to keep it interpretable:**
  1. **Log device model + sensor metadata + sample rate** per `session_set` so results can be sliced by device after the fact.
  2. The forgiving, shape-based matcher (Q6) now must tolerate **sensor + orientation variance too**, not just tempo/amplitude — raises the bar on normalization (orientation-invariant features, resampling to a common rate). Note this in design §5.
  3. If cross-user accuracy collapses, a **follow-up A/B** (a tester on the founder's A52 vs. their own phone) cheaply separates the device effect — keep this as a fallback diagnostic.
- **New requirements:**
  - **APK distribution:** sideloadable signed APK (or Play internal-testing track) for testers; document install steps.
  - Per-device: the app samples IMU at the device's available rate and **resamples to a canonical rate** before matching.
- **Doc impact:**
  - §3 hardware / §12 methodology: testers on own phones; add device-metadata logging + the confound caveat to the cross-user KPI.
  - §4.3 schema: add `device_model`, `sensor_info`, `sample_rate_hz` to `session_sets`.
  - §5 signal design: add resample-to-canonical-rate + orientation-invariant features.
  - §8 build plan: add "signed APK distribution" as an M6/M7 task.

---

## D5 — Matcher sensor baseline (accel-only, gyro optional).

**Decision:** **Accelerometer-only baseline; gyroscope as an optional enhancement** when the device exposes it. Directly de-risks D4 (testers on their own, sometimes gyro-less, phones — cf. the budget Redmi-class devices in the project).

**Rationale / impact:**
- The feature set + rep detection must produce a usable signal from accel alone (universal across any Android). Gyro features are added only when present and flagged per session.
- Keeps the Q2 cohort open to any tester phone — no pre-screening, no excluded devices.
- **Trade-off (document):** gyro-less devices have a less discriminative signal; recognition on those may be weaker — log a `has_gyro` flag and report accel-only vs accel+gyro accuracy separately.
- **Doc impact:**
  - §5 signal design: accel-only is the baseline feature set; gyro features are additive/optional; combine with the D4 resample-to-canonical-rate + orientation-invariant requirements.
  - §4.1 `ImuModule`: detect gyro availability; emit a capability flag.
  - §4.3 schema: add `has_gyro` (and reuse `sensor_info` from D4) to `session_sets`.
  - §11 KPI (spec): cross-user accuracy reported split by `has_gyro`.

---

## Summary of decisions (D1–D7)

| # | Branch | Decision |
|---|---|---|
| D1 | IMU compute location | **On-device** native Kotlin modules; Q8 holds; MVP mini-cam processes on-device too → not throwaway. |
| D2 | Backend deployment | **Self-hosted, internet-facing server over HTTPS** (handlr-web host family). |
| D3 | Frame retention | **Delete after OCR**; `debug_captures` founder-only opt-in; testers' frames never stored; purge at POC end. |
| D4 | Tester device (Q2) | **Testers' own phones** — realistic but confounds body+hardware; mitigated by device-metadata logging + fallback A/B. |
| D5 | Sensor baseline | **Accel-only baseline, gyro optional**; resample to canonical rate; report split by `has_gyro`. |
| D6 | Native module | **Custom Kotlin module from the start** (no `react-native-sensors`); raw samples never cross the bridge. |
| D7 | Template-sync payload | **Ship both** feature vector + resampled raw window per template; trivial size, max matcher flexibility. |

How they compound: D2 (internet-facing) → D3 (frame privacy). D4 (own phones) raised the bar on the Q6 forgiving matcher (must absorb sensor + orientation variance), which forced D5 (accel-only baseline + canonical resampling). The cross-user IMU cell remains the riskiest in the POC; D4+D5 are about keeping its result *interpretable*.

### Doc edits to `ironpal-poc-v1-design.md` — APPLIED (D1–D7)
Folded into: header (D1–D7 ref), §2 (self-hosted/HTTPS caption), §4.1 (`ImuModule` gyro-detect + resample; **custom-not-library** note, D6), §4.2 (delete-frame-after-inference; `/templates/sync` returns both reps, D7), §4.3 (schema: `device_model`/`sensor_info`/`sample_rate_hz`/`has_gyro` + `debug_captures` founder-only/purge), §5 (accel-only baseline, orientation-invariant, resample, matcher variance), §6 (`/templates/sync` returns feature_vector + resampled raw window, D7), §7 (HTTPS + hardening + per-user tokens + retention/consent), §8 (M0 custom modules D6; M6/M7 APK + device logging + testers' own phones), §9 (risks relabelled `DR#`; added DR7 cross-user confound + DR8 internet exposure), §10 (Open Q#1 resolved, #2 auth noted, #3 superseded note, **#4 resolved D6, #5 resolved D7**). **All design-tree branches resolved**; remaining unknowns are build-time verifications (e.g. `gpt-5-nano` at M4, DR6).

> **Label note:** grilled design **decisions** are `D1–D7`; the design doc's §9 **risks** were relabelled `DR1–DR8` to avoid the collision.

---

## D6 — Native module: custom from the start.

**Decision:** **Custom native Kotlin module(s) from the start** (`ImuModule` + `SignalModule`). Raw 50 Hz samples never cross the RN bridge; only results (`{reps, exercise, confidence}`) go to JS. No off-the-shelf `react-native-sensors`.

**Rationale / impact:**
- `react-native-sensors` streams samples *to JavaScript* — the exact pattern D1 rules out, since it would put the 50 Hz stream and the matcher on the JS thread (jitter + UI contention), breaking instant/offline.
- Custom is the pipeline actually shipped — no throwaway spike, matcher stays off the JS thread.
- **Cost:** more upfront Kotlin in M0; accepted (it's the highest-value, MVP-relevant work per D1).
- **Doc impact:** resolves design Open Question #4; §4.1 already specifies native modules — add an explicit "custom, not a library; raw samples never cross the bridge" note; §8 M0 reflects custom `ImuModule`/`SignalModule` from day one.

---

## D7 — Template-sync payload: ship both representations.

**Decision:** **Both** — each synced template carries the normalized **feature vector** *and* the **resampled raw IMU window**. Payload is trivial at POC scale (~20–40 templates, a few MB total).

**Rationale / impact:**
- Lets the on-device matcher experiment with / fuse **kNN (features)** and **normalized-DTW (raw window)** without re-syncing — maximum flexibility for tuning the **cross-user** matcher, the riskiest cell (D4).
- Size is a non-issue at POC template counts, so the usual feature-only motivation doesn't apply.
- **Doc impact:** resolves design Open Question #5; §4.3 schema already stores both (`feature_vector` JSONB + `imu_series` BYTEA) — `GET /templates/sync` returns both; §5 matcher may use either/both; note the raw window is the **resampled** one (D4/D5).

---
