# IronPal POC v1 Mobile — Architecture & Decision Map

This maps each spec decision (Q1–Q9) and design decision (D1–D7) to where it is
implemented in `poc/mobile/`. Authoritative specs:
[`ironpal-poc-v1.md`](../../docs/ironpal-poc-v1.md) +
[`..._grilled.md`](../../docs/ironpal-poc-v1_grilled.md),
[`ironpal-poc-v1-design.md`](../../docs/ironpal-poc-v1-design.md) +
[`..._grilled.md`](../../docs/ironpal-poc-v1-design_grilled.md).

All paths are relative to `poc/mobile/`.

## Data flow

```
ImuPipeline.kt (50 Hz sampler + ring buffer + resample)   ← raw samples stay native (D1/D6)
        │ (in-process window snapshots, never the bridge)
        ▼
SignalModule.kt  ── DSP (Dsp.kt) ──►  emits {exercise, reps, confidence}  (results only)
        │                                         │  RN bridge event
CameraModule.kt ── sharpest still / frames ───────┤
                                                  ▼
                          controller/useLiveSet.ts  (assembles HUD; async LLM fill-in)
                            │           │            │
                  fusion/fusion.ts   api/client.ts  store/* (SQLite cache + offline queue)
                            │            │ HTTPS /api/v1
                            ▼            ▼
                   screens/LiveHudScreen + ConfirmCorrectScreen      FastAPI backend (poc/backend)
```

## Spec decisions (Q1–Q9)

| # | Decision | Where implemented |
|---|---|---|
| **Q1** | Founder-authored templates; end users never enroll | Enroll mode gated to `founder` role: `App.tsx` (mode controller), `config/index.ts` `USER_ROLE`; enrollment in `controller/useEnroll.ts` + `screens/EnrollScreen.tsx`. |
| **Q2** | Cross-user testers run live only | `tester` role gets live-only UI (`App.tsx`); device metadata logged per set for slicing (`controller/useLiveSet.ts` → `device_model`/`sensor_info`). |
| **Q3** | Head-mounted phone; head IMU | Single-device design; `ImuPipeline.kt` samples the phone's own IMU. |
| **Q4** | 3-way recognition incl. UNKNOWN + motion gate | Motion gate (energy + autocorrelation periodicity) in `SignalModule.runLiveTick` / `Dsp.autocorrelationPeriodicity`; UNKNOWN seed labels in `controller/labels.ts`; fusion returns `unknown` when not repping or below `T_REJECT` (`fusion/fusion.ts`); `is_rest_window` captured in `ConfirmCorrectScreen`. |
| **Q5** | Explicit weight-glance cue; sharpest still | `CameraModule.captureSharpestStill` (variance-of-Laplacian selection); prompt + window in `useLiveSet.runWeightGlance` / `LiveHudScreen` (`weightGlancePrompt`); `WEIGHT_GLANCE_SEC` in config. |
| **Q6** | Forgiving, shape-based matcher | `Dsp.extractFeatures` (tempo/amplitude/orientation-invariant features), `Dsp.featureDistance` (kNN, cadence as log-ratio), `Dsp.normalizedDtw` (z-normalized, Sakoe-Chiba band); reject threshold `T_REJECT`. Mirrored/tested in `src/signal/dsp.ts`. |
| **Q7** | Split squat = dumbbell OCR; pushdown = pin-stack OCR | `exercise_hint` passed to `/vision/weight` (`useLiveSet.runWeightGlance`). |
| **Q8** | On-device instant/offline; LLM values fill in, queue on drop | IMU results render instantly (`SignalModule.onResult` → HUD); LLM values show pending `…` until they patch in (`MetricRow` `pending`, `HudState`); offline queue + exponential backoff in `store/offlineQueue.ts`. |
| **Q9** | Per-metric verdict; corrections are ground truth | `ConfirmCorrectScreen` captures `corrected_*`; both detected + corrected POSTed to `/sessions` (`useLiveSet.confirmSet`). |

## Design decisions (D1–D7)

| # | Decision | Where implemented |
|---|---|---|
| **D1** | IMU rep-count + matching on-device | `ImuPipeline.kt` + `SignalModule.kt` + `Dsp.kt` (native); JS only orchestrates. |
| **D2** | Self-hosted, internet-facing backend over HTTPS | `config/index.ts` default `https://…`; HTTPS client `api/client.ts`; debug-only cleartext allowance in `android/app/build.gradle` + manifest placeholder. |
| **D3** | Delete frames after inference; founder-only debug capture | Client-side: frames are produced by `CameraModule`, sent as base64, never persisted on device. Server-side retention/`debug_captures` is the backend's responsibility (out of this dir). |
| **D4** | Testers' own phones; resample to canonical rate; log device metadata | `ImuPipeline.snapshot` resamples to `CANONICAL_SAMPLE_RATE_HZ`; `ImuModule.getDeviceInfo` returns `deviceModel`/`sensorInfo`/`sampleRateHz`; sent in every `/sessions` payload (`useLiveSet.confirmSet`). Sideloadable APK documented in README. |
| **D5** | Accel-only baseline, gyro optional | `ImuPipeline` detects gyro (`hasGyro`); `Dsp.extractFeatures` adds gyro features only when present; gyro term in `featureDistance` only when both have it; `has_gyro` in session payload. |
| **D6** | Custom Kotlin module, no `react-native-sensors`; raw samples never cross bridge | `IronPalPackage.kt` registers custom modules; `ImuPipeline` keeps the stream in-process; only result events (`SignalResult`, `ImuMotionGate`) reach JS. No sensor library in `package.json`. |
| **D7** | Sync both representations (feature vector + resampled raw window) | Wire type `TemplateSyncWire.imu_series_resampled`; stored in SQLite (`store/templateStore.ts`); both loaded into the native matcher (`store/templateSync.ts` → `SignalModule.setTemplates`); matcher fuses kNN + DTW (`Dsp.matchAgainstTemplates`). |

## API contract (design §6) — client side

All under `/api/v1` with per-user bearer auth (`api/client.ts`, `api/auth.ts`):

| Endpoint | Client function | Notes |
|---|---|---|
| `POST /auth/token` | `authToken` | Caches token + role. |
| `GET /templates/sync?since=<v>` | `templatesSync` | Returns both representations (D7). |
| `POST /templates` | `createTemplate` | Founder enrollment. |
| `POST /vision/weight` | `visionWeight` / `sendOrQueueVisionWeight` | `{exercise_hint, frame}`. |
| `POST /vision/recognize` | `visionRecognize` / `sendOrQueueVisionRecognize` | `{frames, orientation}`. |
| `POST /sessions` | `createSession` / `sendOrQueueSession` | Includes `device_model`, `sensor_info`, `sample_rate_hz`, `has_gyro`, `is_rest_window` (D4/D5/Q4). |
| `GET /sessions/export` | `exportSessions` | For the verdict-matrix analysis. |

Wire shapes are in `src/api/types.ts`.

## Fusion rules (spec §7)

`fusion/fusion.ts` implements the ladder verbatim:

- **Exercise:** motion gate → `T_REJECT` safety net → `T_IMU_HIGH` (A) →
  `T_VIS_HIGH` (B) → agreement → else confirm.
- **Reps:** IMU peak count for the split squat (flag if vision disagrees by
  > 1); vision count for the pushdown.
- **Weight:** vision OCR; below `T_OCR` → prompt manual confirm.

## Where each metric is computed (design §2.1)

| Metric | Split squat | Pushdown |
|---|---|---|
| Exercise name | On-device IMU matcher (instant) | Backend vision (fills in) |
| Reps | On-device IMU peaks (instant, offline) | Backend vision (fills in) |
| Weight | Backend OCR (dumbbell glance) | Backend OCR (pin-stack glance) |
| 3-way gate | On-device | On-device |
