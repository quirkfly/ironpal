# IronPal self-training — Maestro e2e harness

Exercises the labeling UI and the game layer end to end on a real device, with **deterministic
IMU input** so the flows can assert exact rep counts.

```sh
scripts/e2e/run.sh                 # build, install, run every flow
scripts/e2e/run.sh 03              # one flow
scripts/e2e/run.sh --no-install    # use whatever is already installed
```

Logs land in `out/e2e/<flow>.log`.

## Why there is a replay source

The model is driven by the **IMU**, so a test that relies on live sensors can assert nothing —
the rep count would depend on how the phone was waved. `ReplayImuSource` (Kotlin) plays a
recorded `imu.jsonl` into the same pipeline the headband feeds, converting LSB → SI with the same
scale factors and the same slow-EMA gravity subtraction as `BleImuSource`. Replay is **real time**
on purpose: speeding it up would move the rep cadence out of the 0.2–1.5 Hz band and the gate
would never open, so short fixtures are the lever for short tests.

It is reachable only through a marker file the harness pushes:

```
/sdcard/Android/data/com.twentydeka.ironpal/files/e2e/replay.json
{"file": "e2e/replay.jsonl", "loop": true, "label": "split-squat-8reps"}
```

No marker (every normal install) means the app uses the real sensor and none of this code runs.
The runner deletes the marker when it finishes.

## Fixtures — what is real and what is not

The knowledge-base clips are egocentric **video**; no video can drive the rep clock, so a clip
cannot be replayed into the app. What the KB provides is **confirmed rep counts**, and the
synthesised fixtures are built to reproduce them, so the flows assert numbers a human confirmed.

| Fixture | Reps | Origin |
|---|---|---|
| `real-stationary` | 0 | **Real recording** — verbatim copy of the 2026-08-05 B2 bring-up session (408 packets, 3264 samples, 0 seq gaps). Board stationary, so no exercise motion. |
| `split-squat-8reps` | 8 | synthesised, Campaign-1 head-moving profile |
| `case001-curl-6reps` | 6 | synthesised at KB case 001's confirmed 6 reps/arm |
| `case002-curl-4reps` | 4 | synthesised at KB case 002's confirmed 4 reps |
| `case003-pushdown-5reps` | 5 | synthesised at KB case 003's confirmed 5 reps (`hard` class) |
| `noise-no-reps` | 0 | synthesised aperiodic jitter — energy without periodicity |

Rebuild them with `python3 scripts/e2e/make_imu_fixtures.py`. Every fixture carries a
`.meta.json` saying which of the two it is.

**The expected counts are verified on the host before any flow runs.** `FixtureReplayTest`
(JVM, `./gradlew :app:testDebugUnitTest`) pushes each fixture through the same engine the device
runs and asserts the same numbers — so a wrong expectation is caught in seconds instead of after
a build/install/tap cycle.

## Flows

| Flow | Fixture | What it proves |
|---|---|---|
| `01-campaign-map` | split-squat | The generated assets render; three campaigns; each states honestly what it can certify. This is the flow that would have failed when the 44 assets shipped in nothing. |
| `02-session-and-hud` | split-squat | Session start, boot-camp calibration, IMU source reported, mission card, set HUD, gate opens on a rep trace. |
| `03-labeling-round` | split-squat | **The labeling UI**: trace, rep marks, per-mark toggling, the ±1 gate, exercise picker, "why?" evidence, weight incl. "couldn't see it", save, and the level moving off `locked`. |
| `04-quality-gates` | **real-stationary** | The paths that must not fire: gate stays shut, zero reps, set kept but **not counted**, level does not advance. |
| `05-hard-class` | case003-pushdown | The taxonomy is honest: a `hard` exercise declines to count its own reps and asks the user. |
| `06-inspector-benchmark` | split-squat | Inspector and the on-device benchmark against the design's §5 budgets. |

## A bug this harness already caught

`04-quality-gates` exists because of a real defect it found. The rep detector's amplitude
threshold was purely relative (`0.35 × RMS`), so on a **motionless** band the RMS collapsed into
sensor noise and the detector found peaks in it: the genuine stationary recording produced
**93 phantom reps**. In the app the motion gate happened to mask it, but the primitive was unsafe
on its own. Fixed with an absolute floor (`ModelParams.peakMinAbs`, 0.15 m/s² — far above the
noise at 0.01–0.05, far below the lightest real rep at ~1.8), and both the JVM test and this flow
now guard it.

## Adding a flow

1. Give any new control a `testID`; flows target ids, not text, wherever the text may change.
2. Add the flow to `e2e/` and to `ORDER`/`FIXTURE` in `scripts/e2e/run.sh`.
3. If it needs a new motion profile, add it to `make_imu_fixtures.py` **and** assert its expected
   count in `FixtureReplayTest` before writing the flow.
