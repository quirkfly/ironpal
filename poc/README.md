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

## Self-training model — P0 status (2026-09-13)

Implements [`../docs/ironpal-self-training-model-design.md`](../docs/ironpal-self-training-model-design.md)
§14 **P0**. What exists and how it was verified:

| Layer | What | Verified by |
|---|---|---|
| Kotlin engine (`ModelParams.kt`, `SignalEngine.kt`, `F16.kt`) | injected params (POC constants as package `2026.09.0`), `Canonicalizer`, `GateMachine` with hysteresis, streaming `RepClock` (per-set count, confirmed peaks, dedup across ticks), `TemplateIndex` (cached magnitudes, kNN top-8 prefilter, DTW on top-k, prior/kind penalties, leave-one-out `scoreAll`), `SetAnalyzer`, float16 windows | `./gradlew :app:testDebugUnitTest` — **8/8** (`app/src/test`, new JUnit source set) |
| Bridge (`SignalModule.kt`, `KeystoreModule.kt`) | design §9 API: `configure`, `loadTemplates`, `startSession`/`stopSession`, `runCalibration`/`computeCalibration`, `startSet`/`endSet` → `SetResult`, `harvestNegatives`, `scoreAll`, `benchmark`; events `GateEvent`/`RepEvent`/`MatchEvent`/`LinkEvent`; legacy POC methods kept. Keystore: AES-GCM key wrapping, ECDSA P-256 verify | compiles with the app; **not yet exercised on a phone** (no device attached in this session) |
| JS learning layer (`src/model/`) | `params` (compose package ⊕ fitted), `store` (schema §7.2 in the POC SQLite), `learner` (append set+rep templates, harvest negatives, closed-form fits, integrity via `scoreAll`, level transitions, pruning, audit, hot reload), `integrity`, `levels`, `decide` (explanations at decision time), `priors`, `packageManager` (bundled package, signature check), `canonical`, `f16` | `npx jest` — **23** tests; `npx tsc --noEmit` clean |
| Controllers + screen | `useSession` / `useSet` / `useDebrief`, `CampaignScreen` (session → calibrate → arm → set → debrief → outcome, inspector v0) | type-checked; on-device dogfood pending |
| Package | `scripts/model/build_package.py` → `mobile/assets/model_package.json` + `backend/model_packages/2026.09.0.json`, **signed** (ECDSA P-256; key in `credentials/`, gitignored); campaign map from the ontology (37 Tier-1) | built |
| Backend | `GET /api/v1/model/package` (ETag / 304), `sessions.model_metrics` | `pytest` — **13** |

**Deliberate P0 deviations from the design (to revisit in P1):**
- Sets are sliced from the IMU **ring buffer** (enlarged to ~2 min) rather than the session recorder's `imu.jsonl`; both IMU sources work, and the recorder still logs for replay.
- The calibration ritual runs the **nods only**; both IMU paths are gravity-removed, so the worn-gravity vector is assumed as −g along device +Z until the pipeline exposes a raw gravity estimate.
- The store is the POC's plain SQLite; the **SQLCipher swap is the D6 spike** (ledger Q7) and has not run. `KeystoreModule` is ready for it.
- Negatives, rep templates and the `T_reject` fit are in; the **incremental** integrity re-score is a full campaign re-score (≤ 300 templates, fine at P0 scale).
- OCR reconcile, the failure catalogue, the replay CLI and package fetch/rollback are P1–P2 per the design.

## Dev-stack registration (antinloop `rnctl`)

Registered in the multi-RN-app registry (`~/.config/rn-devstack/registry.json`, serial-bearing so
it is deliberately outside git — the tracked `registry.example.json` is only a 2-app sample):

| Field | Value |
|---|---|
| `repo` | `/home/quirkfly/job_stuff/prj/ironpal/poc/mobile` |
| `appId` | `com.twentydeka.ironpal` |
| `metroPort` | **8099** (was 8800 — see below) |
| `backendPort` | 8077 |
| pinned device | `R58T13ECWNL` (Galaxy A52 SM-A525F, Android 14, arm64-v8a) |

```sh
../antinloop/bin/rnctl ports            # allocation table + collision check
../antinloop/bin/rnctl doctor ironpal   # validate derived files against the registry
../antinloop/bin/rnctl sync ironpal     # regenerate metro.config.js / package.json / strings.xml
```

> **Why the port moved off 8800.** Registering the app surfaced a real defect: **a system service
> (uid 1000) on the A52 already listens on 8800**, so `adb reverse tcp:8800` fails with
> `cannot bind listener: Address already in use` and a debug build could never reach Metro on that
> device. 8099 is free on both the laptop and the device and sits in the managed 8090–8099 band.
> `rnctl` does **not** manage `android/gradle.properties`; its `reactNativeDevServerPort` is kept in
> step by hand (the same footgun reddy's README documents).

## Run it
- Backend: `cd poc/backend && uv venv --python 3.10 && uv pip install -e ".[dev]" && docker compose up -d && .venv/bin/uvicorn ironpal_poc.main:app --port 8000`
- Tests: `cd poc/backend && .venv/bin/pytest -q`
- Mobile: see `poc/mobile/README.md` (Metro + debug APK).

## Running on a physical device (verified 2026-05-31)
Deployed and launched on a Samsung **SM-G935F** (arm64-v8a, Android 8), JS served by Metro, backend on **:8077**.
Metro's port is now **8099** and owned by the registry — run `../../antinloop/bin/rnctl sync ironpal`
rather than editing it by hand.

```bash
# 0) JDK 17 with javac (Adoptium, auto-provisioned by Gradle)
export JAVA_HOME=~/.gradle/jdks/eclipse_adoptium-17-amd64-linux.2
# 1) one-time: react-native-sqlite-storage uses removed jcenter() → patch it
sed -i 's/jcenter()/mavenCentral()/g' poc/mobile/node_modules/react-native-sqlite-storage/platforms/android/build.gradle
# 2) backend (Postgres + API on :8077, mock vision)
cd poc/backend && docker compose up -d && VISION_MOCK=true .venv/bin/uvicorn ironpal_poc.main:app --port 8077 &
# 3) seed poc/mobile/.env → BACKEND_BASE_URL=http://localhost:8077, IRONPAL_AUTH_TOKEN=<POST /auth/token>, IRONPAL_ROLE=founder
# 4) metro on 8099 (port owned by the antinloop registry)
cd poc/mobile && npx react-native start --port 8099 &
# 5) build + install + reverse + launch
cd poc/mobile/android && ./gradlew :app:installDebug -PreactNativeArchitectures=arm64-v8a
adb reverse tcp:8099 tcp:8099 && adb reverse tcp:8077 tcp:8077
adb shell monkey -p com.twentydeka.ironpal -c android.intent.category.LAUNCHER 1
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
