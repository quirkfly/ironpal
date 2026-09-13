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

## Bugs this harness caught

Three, none of which manual tapping had found:

1. **Every session start crashed the app** on Android 14+ unless a Bluetooth runtime permission
   happened to be granted. `ImuForegroundService` declared foreground type `connectedDevice`, and
   from API 34 the platform *validates* that claim — it requires the permission to be GRANTED, not
   merely declared. With the phone IMU (the default for anyone without the headband) nothing ever
   requests Bluetooth, so `startForeground` threw `SecurityException` and killed the process; the
   app relaunched and died again. The service now picks its type from what it is actually doing:
   `connectedDevice` only when a BLE session is genuinely permitted, else `dataSync`.
2. **93 phantom reps from a motionless band** — see below.
3. **`endSet` crashed on a set with no samples**, slicing a 1-element array over an empty window,
   which rejected the bridge call and stranded the user on the live HUD with no route to the
   debrief. Exactly what happens if you tap END SET without a headband connected.

### The phantom reps

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

## Gotchas, each of which cost a red run here

**Never `clearState: true`.** It runs `pm clear`, which also wipes `/sdcard/Android/data/<pkg>/`
— where the fixture and its marker live. The flow would then silently run on the real sensor and
could go green while proving nothing. The runner clears state itself, before pushing.

**`assertVisible` only sees the viewport.** The mission card sits below fifteen level tiles and
the save button below three cards; both need `scrollUntilVisible` first. A missing element and an
off-screen one report identically.

**Scroll is the single biggest source of false failures here — seven of them.** `assertVisible`
and `extendedWaitUntil` only see the viewport, and this UI is card-stacked well past one screen.
The mission card sits below fifteen level tiles; the weight card is the third card down; the
outcome line renders *below* the save button you just scrolled to. Assume anything past the first
screenful needs `scrollUntilVisible`.

**A PARTIALLY clipped element also fails.** A plain-string `assertVisible` requires 100 %
visibility, so an element whose bounds end flush with the content edge fails even though its text
is exactly right — the benchmark result did this while its `testID` was found perfectly well by
`extendedWaitUntil`, which is looser. If an id matches but the text on it does not, check the
bounds before you doubt the string.

**Maestro anchors a text pattern to the WHOLE node text.** `assertVisible: "Clean set"` does NOT
match a node reading `Clean set · +100 XP · 1 templates` — it is a regex over the entire string,
not a substring search. This was the single most misleading failure here, because the assertions
that passed were all accidentally exact full-node matches (`locked`, `ACTIVE`,
`WAITING FOR MOTION`), which made the failures look like rendering bugs. Wrap partial matches:
`".*Clean set.*"`. Prefer a `testID` where you can.

**Build display strings in a helper, not inline in JSX.** `imuStatusLine()` and `benchLine()` do
this. Worth doing for anything a flow asserts on — though note this was NOT the cause of any
failure here: the cases first blamed on it turned out to be a deleted fixture marker and a stale
APK. Prefer a `testID` over matching rendered prose in the first place.

**Never assert a transient state.** `WAITING FOR MOTION` shows only until the gate opens, and on a
rep fixture that can be a couple of ticks — so asserting it passes or fails depending on timing.
It passed twice and then failed, which is worse than failing every time. Assert the state that
means something (the gate DID open) rather than the state you expect to pass through.

**Wait for the state you need, not for the UI to stop moving.** `waitForAnimationToEnd` returns as
soon as the view settles, which during a set can be after one or two reps — below the motion
gate's minimum of three, so the set saves as "not counted" and the flow fails for a reason that is
entirely its own doing. Wait on the value (`hud-reps` matching `[0-9]{2}`) instead.

**Assert conditionally-rendered controls as `optional: true`.** The "why?" popover only exists
when the matcher had runner-up candidates — on a first-ever set the index is empty and there are
none, which is correct behaviour, not a bug.

**`--no-install` runs whatever is already on the phone.** After any TypeScript or Kotlin change it
will test a stale build and the failures will look like app bugs. The runner now compares the
installed APK's checksum against the local artefact and warns, but prefer a plain run.

**Do not `pkill -f maestro` (or `-f run.sh`).** The pattern matches the shell wrapper running the
`pkill` itself, and the wait-loop polling for it — two such loops will deadlock waiting on each
other. Kill by PID.
