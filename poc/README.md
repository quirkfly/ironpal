# IronPal POC v1

Proof-of-concept implementation of IronPal: a head-mounted phone app that reports **what
exercise**, **how many reps**, and **what weight** for two test exercises (Bulgarian split squat,
triceps cable pushdown), using on-device IMU + a `gpt-5-nano` vision backend.

Built from the spec and design:
- Spec: [`../docs/ironpal-poc-v1.md`](../docs/ironpal-poc-v1.md) (+ `_grilled.md`, decisions Q1–Q9)
- Design: [`../docs/ironpal-poc-v1-design.md`](../docs/ironpal-poc-v1-design.md) (+ `_grilled.md`, decisions D1–D7)

## Layout
```
poc/
├── backend/    FastAPI + PostgreSQL + gpt-5-nano vision   (see backend/README.md)
└── mobile/     React Native + custom Kotlin native modules (see mobile/README.md)
```

## Architecture (recap)
- **mobile** (phone on headband): custom Kotlin native modules sample the IMU and run the
  rep-counter + forgiving shape-matcher **on-device** (instant, offline — D1/Q8); CameraX grabs
  the weight-glance frame (Q5). Only results cross the JS bridge (D6).
- **backend** (self-hosted, internet-facing, HTTPS — D2): system-of-record for the
  founder-authored templates (Q1), and the **only** place that calls `gpt-5-nano` (key stays
  server-side — R8). Weight OCR + pushdown recognition. Frames deleted post-inference; founder-only
  debug capture (D3).
- **split of work**: split-squat reps/name = on-device IMU; pushdown name/reps + all weight =
  backend vision (spec §2.1).

## What is verified vs. pending

| Component | Status |
|---|---|
| Backend: endpoints, auth, templates+sync, vision (mock), sessions | ✅ **Built + tested** — 11 pytest pass (sqlite) **and** full end-to-end smoke test on real Postgres |
| Backend ↔ gpt-5-nano live calls | ⏸️ **Mocked by default.** Live path implemented; pending the M4 model-verification gate (DR6) — drop a key at `credentials/openai.key`, set `VISION_MOCK=false` |
| Mobile: RN/TS app, native Kotlin modules, signal pipeline, screens, sync/offline | ✅ **Authored** (faithful to design) + TypeScript typecheck |
| Mobile: Android device build / on-device run | ⏸️ **Not buildable in this sandbox** (no Android SDK/device). Build with the `coolteen/cultee-app` toolchain — see `mobile/README.md` |

## Run it
- Backend: `cd poc/backend && uv venv --python 3.10 && uv pip install -e ".[dev]" && docker compose up -d && .venv/bin/uvicorn ironpal_poc.main:app --port 8000`
- Tests: `cd poc/backend && .venv/bin/pytest -q`
- Mobile: see `poc/mobile/README.md` (Metro + debug APK).

## Running on a physical device (verified 2026-05-31)
Deployed and launched on a Samsung **SM-G935F** (arm64-v8a, Android 8), JS served by Metro on **:8800**, backend on **:8077**.

```bash
# 0) JDK 17 with javac (Adoptium, auto-provisioned by Gradle)
export JAVA_HOME=~/.gradle/jdks/eclipse_adoptium-17-amd64-linux.2
# 1) one-time: react-native-sqlite-storage uses removed jcenter() → patch it
sed -i 's/jcenter()/mavenCentral()/g' poc/mobile/node_modules/react-native-sqlite-storage/platforms/android/build.gradle
# 2) backend (Postgres + API on :8077, mock vision)
cd poc/backend && docker compose up -d && VISION_MOCK=true .venv/bin/uvicorn ironpal_poc.main:app --port 8077 &
# 3) seed poc/mobile/.env → BACKEND_BASE_URL=http://localhost:8077, IRONPAL_AUTH_TOKEN=<POST /auth/token>, IRONPAL_ROLE=founder
# 4) metro on 8800
cd poc/mobile && npx react-native start --port 8800 &
# 5) build + install + reverse + launch
cd poc/mobile/android && ./gradlew :app:installDebug -PreactNativeArchitectures=arm64-v8a
adb reverse tcp:8800 tcp:8800 && adb reverse tcp:8077 tcp:8077
adb shell monkey -p com.ironpal.poc -c android.intent.category.LAUNCHER 1
```
The app boots to the home screen (Enroll templates / Live workout) with the role from `.env`.

> The `jcenter()` patch lives in `node_modules` and is lost on reinstall — make it durable with `patch-package` (add a `postinstall` hook) before relying on CI.

## Known integration follow-ups (app ↔ backend contract)
The app and backend were built in parallel against design §6, which didn't pin every field encoding. Two mismatches to reconcile (neither blocks the home screen; both block full enroll/sync round-trips):
1. **`POST /auth/token` body** — app sends `{user_id, secret}`, backend expects `{role, display_name}`. Currently moot: the app uses a **pre-seeded token** from `.env`. To enable runtime issuance, align one side.
2. **`GET /templates/sync` raw window** — app expects `templates[].imu_series_resampled` as `number[][]`; backend returns `imu_series_b64` (base64). Recommend aligning the **backend** to round-trip the app's `number[][]` verbatim (store the raw window as JSON passthrough rather than opaque bytes).
3. **Live vision** — `gpt-5-nano` is **verified available** on the provided key; backend currently runs `VISION_MOCK=true`. Flip to `false` (key at `credentials/openai.key`) to go live after deciding on spend.

## Notes / open items
- `gpt-5-nano` itself is unverified (DR6) — the backend runs mocked until a key + the M4 check
  confirm the model is multimodal and the cost holds.
- Live AI integration was intentionally **not** exercised here: the specified
  `credentials/openai.key` does not exist, and the `OPENAI_API_KEY` present in the environment
  belongs to the neighbouring `coolteen` project (not clearly authorised for IronPal spend).
