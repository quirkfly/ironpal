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
| `07-studio-navigation` | split-squat + `studio-clip` | **The Studio's viewer and transport**: the round opens in After Action from the Debrief, the frame HUD reports an index from the PTS table, ±1 frame / ±1 rep / the jog wheel / play-rate-loop / scrub all move it, the four modes show their button twins, the gesture sheet and the lanes menu open. |
| `08-studio-marks-bounds` | split-squat + `studio-clip` | What the 20 s Debrief cannot do: **add a rep mark** the detector missed (snapped to the peak), toggle and delete marks, the reps sheet's marks-vs-count question and "not sure", **trim the set bounds**, then save through the same gates with the outcome reported. |
| `09-studio-exercise-relabel` | split-squat + `studio-clip` | **The exercise sheet**: candidates with provenance, Compare, the package's field-guide line, search and browse, the consistency check — then a **relabel** of a saved set (`SAVE CHANGES`) that reaches the store and shows up in the inspector under the new exercise. |
| `10-studio-pins-weight` | split-squat + `studio-clip` | **Pins and the weight sheet**: role cycling, the crop toggle, pinning a frame, and the rule that "read this frame" stays disabled until a pin exists — the OCR still is the only thing that leaves the phone. Also the menu's lane toggles, clip pinning and export. |
| `11-studio-reel` | split-squat + `studio-clip` | **The Reel**: the session strip, the set with its label source and revision, split/merge controls, the untagged-motion verdict, the clip list with its sync class, export, and re-opening a saved set on the relabel path. |
| `12-studio-queue-import` | **case001-curl-6reps** + `studio-clip` | **The queue and import**: a set labelled with KB case 001's confirmed 6 reps / 5 kg, the After Action queue with its count and dismissal reasons, then the founder **import** of the real KB clip — PTS table, proxy transcode and filmstrip run on the device's own codecs. |

## The video fixtures — real knowledge-base footage

`studio-clip.mp4` and `studio-clip-hard.mp4` are **derived from the clips the knowledge base was
built from** (`scripts/e2e/make_video_fixture.py`), not generated:

| Fixture | Source | KB case | Confirmed ground truth | Paired IMU fixture |
|---|---|---|---|---|
| `studio-clip` | `20260614_125114.mp4` 30–45 s | 001 | dumbbell biceps curl · **6 reps/arm** · **5 kg** | `case001-curl-6reps` |
| `studio-clip-hard` | `20260615_122213.mp4` 20–32 s | 003 | triceps cable pushdown · **5 reps** · 10 kg plates · `hard` class | `case003-pushdown-5reps` |

Each is trimmed to the case's PERFORM window (from `motion_profile.sh`), scaled to 360 px on the
short side and re-encoded H.264 at a **0.25 s GOP** — the same keyframe interval the app's scrub
proxy uses, so frame stepping in a flow behaves like frame stepping in the product. A frame index
is burned into the corner at derivation; the flows assert the app's own `studio-frame` HUD and
never the pixels, but a human watching a run needs to see which frame is on screen. The sidecar
`*.meta.json` records the provenance, the trim and the ground truth.

**Orientation, measured here:** these A52 clips carry a container **Display Matrix of −90°** which
current ffmpeg auto-applies on decode, so the frames come out upright already and
`frame-extraction.md`'s `transpose=2` would rotate them a **second** time (verified: raw = mat text
forward ✅, `transpose=2` = sideways ✗). The generator therefore declares rotation per fixture and
the derived frame is checked, rather than inheriting a rule that predates autorotate. The KB doc
now carries the same caveat.

The source clips are gitignored (2 GB of footage); the derived fixtures are committed, so a fresh
checkout runs the suite. Without the sources, `make_video_fixture.py` writes a clearly-labelled
synthetic clip instead — a fixture never claims to be real footage it is not.

## Gotchas found on the LG G7 run (2026-09-15)

These cost a red run each and are now encoded in the flows.

**A tap issued right after a scroll is lost.** `scrollUntilVisible` returns while the list is
still gliding, and React Native's touch responder cancels a press when the view under the finger
moves. Every scroll in this suite is now followed by `waitForAnimationToEnd`.

**A tap can be swallowed while the JS thread is busy.** Right after a save the thread is
committing templates, re-scoring integrity and enqueueing — and a tap delivered in that window
can simply never reach the handler (the same tap by `adb shell input tap` a second later works).
Navigation taps are therefore followed by an `optional: true` retry of the same tap: when the
first one took, the control is already gone and the retry is skipped, so it can never double-fire.
Do NOT apply this to a save button — a second save is a second commit.

**Do not put a primary action inside a long scroll view.** `labeling-save` and `studio-save` used
to be the last card; both are now fixed footers. That removed two scroll steps per flow, removed
the race above, and is better product behaviour — the round is meant to be one tap.

**A modal covers the thing behind it.** With the reps and weight sheets moved over the viewer
(design §7.1), the dock cell underneath cannot be asserted while its sheet is open — close the
sheet with `studio-sheet-done` first, then assert the cell.

**Dismiss modals with their control, not a coordinate.** `tapOn: point: "50%,8%"` dismissed a
sheet and then landed on the exercise chip underneath, which opened a different sheet. Use
`studio-sheet-close` / `studio-sheet-done`.

**Place a new rep mark mid-cycle, with a counted number of frame steps.** A mark within 150 ms of
a peak snaps onto it and one within 50 ms of an existing mark is dropped as a duplicate — both
correct, both fatal to an assertion that expects a new mark. A jog-wheel swipe travels a
non-deterministic distance; 15 taps of `studio-step-frame-prev` (0.5 s at 30 fps) does not.

**Wait for the session to be `ready`, not for the calibrate tap.** The nods step needs samples in
the ring buffer and the replay source takes a moment to start feeding; the flows wait for
`session-imu-status` before choosing a level.

## Bugs this harness caught (studio round)

1. **No `VIBRATE` permission** — `Vibration.vibrate` throws `SecurityException` and **killed the
   process** on the second frame step. Every haptic in the Studio (jog detent, snap, pin) would
   have crashed the app for every user. Fixed in the manifest, and all haptics now go through
   `src/studio/haptics.ts`, which swallows the failure and honours a mute setting.
2. **The transport row overflowed a 411 dp screen** — `rep ▶` and `set ⏭` were off the right edge
   and unreachable. The side groups now flex.
3. **The dock and save bar were pushed off the bottom** once the mode row wrapped. The viewer now
   shrinks (a portrait clip in a 16:9 box is mostly black bars anyway).
4. **The home screen clipped its own title** — centring content taller than the viewport cuts both
   ends; it is top-aligned and scrollable now.
5. **The video surface swallowed the viewer's gestures** (`pointerEvents="none"` now), and the
   gesture cheat sheet had no button twin — it is in the `⋯` menu as "Controls & gestures".
6. **The campaign map showed stale levels after a Studio save** — it only refreshed on a Debrief
   outcome, so a label fixed in After Action left the map showing the old state.
7. **The e2e clip never attached**: `getE2eConfig` returns an absolute path and the attach code
   treated it as relative, then swallowed the error. It now surfaces as the degraded line.

## Known gaps the studio flows do NOT cover

- **Two-finger gestures.** Pinch-to-zoom and the two-finger pan of the timeline, and the
  two-finger tap that adds a mark, cannot be driven by Maestro. Their button twins are covered
  instead (`studio-mark-add`, the zoom label `studio-zoom`).
- **Dragging a mark or a bound handle.** Covered through the button twins and the jog wheel; the
  drag path itself is exercised by hand.
- **A region to tag.** The IMU fixture loops one continuous set, so `scanRegions` finds nothing
  untagged and `reel-region-*` stays optional. A fixture with a deliberate second, un-armed block
  would make it assertable — worth building next.
- **The OCR call behind "read this frame".** The control and its copy are asserted; the request
  is not implemented yet.
- **`? frames` on an imported clip.** Flow 12's import reaches `ready` with a working PTS table,
  but the frame count is sometimes absent on the row (the ingest took its fallback path). The Reel
  now falls back to the duration rather than printing a bare `?`. Worth tracing when the proxy
  path is measured on hardware.

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
