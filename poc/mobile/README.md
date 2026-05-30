# IronPal POC v1 — Mobile App

React Native + TypeScript app for the IronPal POC v1, running on a
headband-mounted Android phone. It captures the onboard IMU + camera, runs
on-device rep/exercise detection in **custom Kotlin native modules**, renders a
live HUD, and talks to the FastAPI backend for vision/LLM-derived values.

Implements [`docs/ironpal-poc-v1-design.md`](../../docs/ironpal-poc-v1-design.md)
(§4.1 mobile app, §4.3 schema, §5 signal processing, §6 API contract) and the
grilled decisions D1–D7 / Q1–Q9. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for
the decision-to-code mapping.

> **Scope guard:** this directory (`poc/mobile/`) is the mobile app only. The
> backend lives in `poc/backend/` and is owned by a separate process — do not
> edit it from here. The two communicate over the HTTP API contract in §6.

---

## Two target exercises

- **Bulgarian split squat** — IMU-led (instant, offline reps + name).
- **Triceps cable pushdown** — vision-led (backend recognizes name + reps).

---

## Prerequisites

Same toolchain as the `cultee-app` reference project:

- **Node ≥ 22.11** (the repo installs fine on Node 20 with an engine warning).
- **JDK 17**, **Android SDK** (compileSdk 36, build-tools 36.0.0, NDK
  27.1.12297006), **Android Studio** or command-line tools.
- A physical Android device with an accelerometer (gyroscope optional — D5).
  The preferred test device is the **Samsung Galaxy A52 (SM-A525F)**; testers
  use their own phones (D4).
- React Native **0.84.1**, React **19.2.3**, Kotlin **2.1.20** (pinned in
  `package.json` / `android/build.gradle`).

---

## Install

```bash
cd poc/mobile
npm install
```

This pulls React Native 0.84.1, `react-native-sqlite-storage` (local cache),
`@react-native-async-storage/async-storage` (auth token), and
`react-native-safe-area-context`. No `react-native-sensors` — the IMU pipeline
is custom Kotlin (D6).

## Configure the backend URL

Copy the template and fill it in:

```bash
cp .env.example .env
```

```ini
# Self-hosted, internet-facing backend over HTTPS (D2). Endpoints live under
# <BACKEND_BASE_URL>/api/v1.
BACKEND_BASE_URL=https://ironpal.example.com

# Per-user bearer token (founder or tester). Optional: can also be obtained at
# runtime via POST /auth/token.
IRONPAL_AUTH_TOKEN=

# "founder" unlocks enroll mode; "tester" is live-only (Q1/Q2).
IRONPAL_ROLE=founder
```

For early bring-up against a **laptop backend**, run it on `:8080`, point
`BACKEND_BASE_URL=http://localhost:8080`, and forward the port to the device:

```bash
adb reverse tcp:8080 tcp:8080
```

(Debug builds set `usesCleartextTraffic=true` so localhost works; production is
HTTPS.)

## Run Metro + a debug build

Metro runs on port **8092** (kept distinct from cultee-app's 8091):

```bash
npm start            # Metro bundler on :8092
npm run android      # build + install the debug app on a connected device
```

## Build a sideloadable APK (D4)

Testers run on their own phones, so they need a sideloadable APK.

**Debug APK (quickest, debug-signed):**

```bash
npm run build:debug-apk
# → android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK (recommended for distribution):** generate a keystore and set the
signing props in `android/keystore.properties` (gitignored) or
`gradle.properties`:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/ironpal-release.keystore \
  -alias ironpal -keyalg RSA -keysize 2048 -validity 10000
```

```ini
# android/keystore.properties
IRONPAL_RELEASE_STORE_FILE=../ironpal-release.keystore
IRONPAL_RELEASE_STORE_PASSWORD=...
IRONPAL_RELEASE_KEY_ALIAS=ironpal
IRONPAL_RELEASE_KEY_PASSWORD=...
```

```bash
npm run build:apk
# → android/app/build/outputs/apk/release/app-release.apk
```

Install on a device: `adb install -r <path-to-apk>`, or copy the APK and enable
"install from unknown sources". Grant the **Camera** permission on first launch
(IMU needs no runtime permission).

---

## Native-module architecture (custom Kotlin — D6)

Raw 50 Hz IMU samples **never cross the RN bridge** (D1/D6). Only results do.

| Module | File | Responsibility |
|---|---|---|
| `ImuModule` | `android/.../ImuModule.kt` | IMU lifecycle + device/sensor metadata (D4) + gyro-availability flag (D5); coarse motion-gate events. |
| `SignalModule` | `android/.../SignalModule.kt` | The DSP loop (off the JS thread): band-pass, autocorrelation periodicity gate, peak-detection reps, feature extraction, kNN + normalized-DTW matcher vs. cached templates. Emits `{exercise, reps, confidence}`. Also extracts enrollment templates. |
| `CameraModule` | `android/.../CameraModule.kt` | CameraX: sharpest-still capture for the weight glance (Q5) + frame sequence for pushdown vision. |
| `ImuPipeline` | `android/.../ImuPipeline.kt` | Shared singleton sampler + ring buffer + resample-to-canonical-rate (D4). One sampling subscription shared by ImuModule + SignalModule. |
| `Dsp` | `android/.../Dsp.kt` | Pure DSP functions — a 1:1 Kotlin port of `src/signal/dsp.ts`. |

Registered via `IronPalPackage` in `MainApplication.kt`.

The **DSP is implemented twice on purpose**: the Kotlin `Dsp.kt` is what runs on
the device; the TypeScript `src/signal/dsp.ts` is the authoritative,
unit-tested reference (`__tests__/dsp.test.ts`). Keep them in sync when tuning.

### JS/TS layer (`src/`)

- `config/` — backend URL, thresholds, signal constants (mirror the Kotlin).
- `native/` — typed wrappers over the three Kotlin modules.
- `signal/dsp.ts` — reference DSP + unit tests.
- `fusion/fusion.ts` — the §7 3-way fusion/decision rules (incl. UNKNOWN).
- `store/` — SQLite cache (templates, session queue, vision queue), template
  sync, offline queue with exponential-backoff retry (Q8).
- `api/` — HTTPS client + wire types for the §6 contract + bearer auth.
- `controller/` — `useLiveSet` (live HUD orchestration) and `useEnroll`
  (founder enrollment); `App.tsx` is the enroll-vs-live mode controller.
- `screens/` — `EnrollScreen`, `LiveHudScreen`, `ConfirmCorrectScreen`.

---

## Verify (in this repo)

```bash
npm run typecheck   # tsc --noEmit — clean
npm test            # jest — DSP unit tests (10 passing)
npm run lint        # eslint — no errors (a few intentional style warnings)
```

The native Android build cannot be exercised in CI without an Android SDK +
device; it is validated by building a debug APK on a developer machine.
