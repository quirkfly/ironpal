# IronPal Video Labeling Studio — Design

**Status:** Draft v1.1 · 2026-09-14 — design review complete (auto mode)
**Owner:** founder (solo)
**In-game name:** *After Action* (the shooter genre's after-action review / replay room). Engineering name: **the Studio** (`poc/mobile/src/studio/`).

> **Decisions from the design review are in
> [`ironpal-video-labeling-studio-design_grilled.md`](ironpal-video-labeling-studio-design_grilled.md)
> (Q1–Q40) and are folded in below.** The review ran **without user interaction**: 14 decisions rest
> on evidence in the repo, sibling projects or vendor documentation; 26 are assumptions tagged for
> veto; none are open. The three evidence-driven changes against the first draft: the app records
> **no video today** (`CameraModule` is stills-only), so clip capture is part of this design rather
> than a given; the native set slice still comes from the **ring buffer**, so arbitrary-range analysis
> is a hard prerequisite (§10.1); and frame-exact scrubbing is built on a **short-GOP proxy** rather
> than on the master file, because the media stack in use (react-native-video 6 on ExoPlayer) seeks
> exactly but pays a full GOP decode per backward step.

**Implements:** [`ironpal-self-training-prd.md`](ironpal-self-training-prd.md) §7.4 (the tagging
round, deepened), FR-T1–FR-T6, FR-C2/FR-C3, FR-D1–FR-D3, FR-M6/FR-M7, and
[`ironpal-self-training-model-design.md`](ironpal-self-training-model-design.md) §2.3 (learning from
a confirmed set), §5 (decisions and explanations), §17 (game layer).
**Builds on:** [`ironpal-imu-camera-sync-plan.md`](ironpal-imu-camera-sync-plan.md) (IMU is the time
base; PTS, never frame index; residual classes), [`video-analysis-kb/`](video-analysis-kb/)
(`frame-extraction.md` per-rig rotation table, `autonomous-frame-selection.md` phase routing,
`sensor-fusion.md` discriminators, the case files), `scripts/kb/sync_imu_video.py`,
`scripts/kb/score_reps.py`, `scripts/kb/score_weights.py`.
**Grounded in:** `poc/mobile/src/screens/LabelingScreen.tsx`, `src/game/RepTrace.tsx`,
`src/controller/{useSet,useDebrief}.ts`, `src/model/{learner,decide,store,schema}.ts`,
`android/.../{SignalModule,SignalEngine,CameraModule,ImuSessionLogger}.kt`, `e2e/03-labeling-round.yaml`,
sibling apps `../reddy` and `../rrr` (react-native-video 6 on the same RN 0.84.1 new-architecture build).

> This document is the **how** of the deep labeling surface. The PRD says the user confirms four
> proposals in ≤ 20 s during a rest period; this says what the user does when 20 s is not enough —
> when the detector missed a rep, when the set boundary is wrong, when two exercises look alike,
> when a session was recorded on a rig the app does not own, or when the model itself asks for a
> second look. It says which screen, which gesture, which bridge call, which table, and in what
> order one person builds it.

---

## 0. Summary — two tiers, one store

Labeling in IronPal has **two tiers** that write to the **same store** through the **same gates**:

| Tier | When | Time budget | What it can do | Where it lives today |
|---|---|---|---|---|
| **Debrief** (the tagging round) | in the rest period, right after the set | ≤ 20 s median | confirm the four proposals; toggle detector marks off; type a count; declare weight; "unreadable" | `LabelingScreen.tsx` — trace only, no video, marks toggle-only |
| **Studio / After Action** (this document) | after the session, or on demand from any set, or when the model queues a question | minutes, deliberate | frame-accurate replay of the headband video against the IMU trace; add / move / delete rep marks with snap-to-peak; trim set bounds; split / merge sets; tag untagged motion; relabel past sets; compare candidate exercises with evidence; pin exemplar frames; import rig video | does not exist |

The Studio is **not** a second labeling model, not a general video editor, and never uploads
anything. Every save is `learner.commit` / `learner.relabel` through the PRD §7.5 gates, so a Studio
label is worth exactly what a Debrief label is worth — no more XP, no less scrutiny. What the Studio
adds is **precision** (frames, not bars), **coverage** (untagged sets, imported sessions) and
**evidence** (compare, replay, integrity impact) — the three things the 20-second round cannot
afford.

The design borrows deliberately from the tools people already label video with — Label Studio's
timeline and keyframes, CVAT's frame-step hotkeys and propagate, Final Cut Pro for iPad's jog wheel,
OnForm's two-speed scrubbing, audio editors' waveform-with-snap — and rejects the parts that assume
a desk, a keyboard and bounding boxes (§4). The waveform here is the **IMU trace**, the keyframes
are **rep tops**, and the proxy media is a **short-GOP scrub clip** generated on the phone.

---

## 1. Why a studio — what the Debrief cannot do

The Debrief is designed to be fast, and its limits are deliberate (PRD §7.4, ledger Q9: marks are
toggleable, not placeable). Dogfood and the e2e harness already show where those limits bite:

| Gap | Evidence | Consequence without a Studio |
|---|---|---|
| **No video in the round.** The app captures stills only (`CameraModule.kt`: `ImageAnalysis`, `captureSharpestStill`, `captureFrameSequence`; no `VideoCapture`, no `MediaRecorder`). | `grep VideoCapture\|MediaRecorder poc/mobile` → nothing | The "first-person replay" of PRD §7.4 / design §17.2 is not buildable; the round is trace-only on every rig. |
| **Marks cannot be added or moved.** | `RepTrace.tsx` header comment; `LabelingScreen.toggleMark` | When the detector under-counts, the user types a number and the store learns a set with *fewer rep windows than reps* — rep-shape fits degrade silently. The PRD's own trigger ("> 5 % missed peaks → add mark at playhead") has nowhere to land. |
| **Set bounds are not editable.** | `useDebrief.confirm` takes `tOpenNs/tCloseNs` as given | A gate that opened on the walk-in or closed late teaches the store a window with rest in it. |
| **Past sets cannot be relabelled.** | no `relabel` in `learner.ts`; inspector v0 is read-only | A wrong exercise label stays in the store until the set is deleted; the PRD's "inspect / delete per set" (FR-M6) has no "fix". |
| **Untagged motion is invisible.** | negatives are harvested from non-periodic windows only (R11) — periodic, untagged windows are simply dropped | Real sets the user forgot to arm never become training data. |
| **Rig video has no way in.** | ShenYao files sit in `/sdcard/DCIM/USBCamera/`; sync is a laptop script | The founder's three-visit capture plan (the P2 playthrough) cannot be labelled in the product it is meant to train. |
| **Exemplar frames are chosen blind.** | `exemplar_frames.role ∈ {glance, rep_top, rep_bottom}`, selected by the IMU | The vision side (Campaign 2, 20 exercises) gets whatever frame the IMU picked, including blurred or occluded ones. |
| **Confusable exercises are chosen from a grid of 15 buttons.** | `LabelingScreen` exercise grid | Campaign 1 puts 14 of 15 exercises in one motion bucket (PRD §5.2b); the picker offers no evidence for the choice. |

Accuracy is the product: a certified exercise that miscounts is the one thing the primary persona
"will not tolerate" (PRD §3). The Studio is where label accuracy is *made*, not merely confirmed.

---

## 2. Goals and non-goals

### 2.1 Goals

- **G1 — Frame-true navigation.** Any frame of any set reachable in ≤ 3 gestures; single-frame
  stepping in both directions at ≤ 50 ms per step on a Galaxy A52; every position expressed in the
  IMU time base with the frame's real PTS, never `index / fps` (sync plan §1.2).
- **G2 — Accurate labels by construction.** Rep marks snap to the IMU peak under one frozen
  convention (top of the rep); bounds snap to gate events; the exercise choice is made against
  evidence (candidates, distances, the user's own exemplars, a field-guide line per confusable pair)
  and checked by a leave-one-out match before save.
- **G3 — One store, one gate, one learner.** Studio saves go through `evaluateGates` and
  `learner.commit`/`relabel`; integrity, level state, audit and XP follow exactly the Debrief's rules.
- **G4 — Coverage.** Every periodic window in a session is either a labelled set, a deliberately
  dismissed region, or a visible "?" in the queue. Imported rig sessions get the same treatment.
- **G5 — The model asks.** The Studio's queue is ordered by what the model is least sure of, so a
  ten-minute session at home fixes the labels that matter most.
- **G6 — Same privacy envelope.** Video never leaves the phone; the only egress remains the cropped
  OCR still (PRD C4, FR-D2); the Studio adds a user-triggered "read this frame" that uses the same
  path and the same deletion.
- **G7 — Shooter feel, honest game.** After Action is the replay room, not a grind: XP only through
  gates, once per set; no penalties; the studio never blocks a workout.

### 2.2 Non-goals (v1)

- Bounding boxes, polygons, object tracks, pose keypoints. Nothing in the model consumes them.
- A general video editor (cuts, exports, sharing). Clips are training data with a retention clock.
- On-device cross-correlation sync for the ShenYao rig (v1.1 — §11.3; v1 imports `session.json`).
- Multi-user review, consensus, reviewer roles. One user, one phone, one store.
- Custom exercises (PRD §5.4, v1.1). The picker is the ontology's Tier-1.
- Landscape layout (§7.1 — portrait is the one layout in v1).
- Blurring faces or bystanders. Never claimed (claim guardrails); retention and crops are the control.

---

## 3. Users and jobs

| Persona | Job in the Studio | Success looks like |
|---|---|---|
| **Committed lifter** (primary) | Sunday evening: clear the queue — three sets the model flagged, one untagged "?" block. | ≤ 90 s per queued set; leaves with integrity up, nothing pending. |
| **User zero / founder** | Import a ShenYao session with its `session.json`, walk the reel, label 40 sets across a gym visit, pin implement frames for the atlas. | A full visit labelled in-app; `score_reps.py`-compatible export; no laptop tooling after sync. |
| **Beta tester** | Same as the lifter; additionally fixes rig-specific misfires (band slipped mid-set → trim bounds). | The bug reports carry set ids, not descriptions. |
| **Scout** | Curate station exemplars (pin, crop) before charting a station. | Pack entries built from deliberately chosen frames, never wide ones. |
| **The model** (yes, a user) | Ask: "this looked like a front squat at 0.58 — which was it?", "gate opened here, nothing tagged", "OCR read 22.5, you said 25". | Each question answered or dismissed with a reason the learner can use. |

---

## 4. Reference study — what the industry studios do, and what transfers

| Tool | Pattern worth taking | Pattern deliberately left out | Where it lands here |
|---|---|---|---|
| **Label Studio** (video, since 1.6) | timeline with keyframes and lifespans; drag the frame indicator; hotkey-driven navigation; "toggle interpolation" per frame | bounding boxes, interpolation between boxes | rep tops **are** the keyframes; the set bounds **are** the lifespan; there is nothing to interpolate |
| **CVAT** | `D`/`F` previous/next frame, `C`/`V` ±step, `K` toggle keyframe, `Ctrl+B` propagate to following frames, `F1` shortcut sheet | track mode, merging tracks, shape tools | gestures replace keys (§7.5); **propagate** becomes "same exercise for the rest of this block" (§7.8); the gesture cheat sheet is one long-press away |
| **Final Cut Pro for iPad** | the **jog wheel**: a touch control whose rotation maps to frames with detents, giving frame precision a finger cannot get from a scrubber | magnetic timeline, multi-track editing | the wheel is the primary fine-navigation control (§7.4) |
| **OnForm / SlowMo** (sports analysis) | **two scrubbing tools**: a coarse one for the movement, a fine wheel for detail; slow-motion review; loop a phase | drawing/telestration, voice-over, coach chat | coarse = drag the trace; fine = the wheel; loop-a-rep (§7.4) |
| **Audio editors** (Audacity, Logic) | waveform as the navigation surface; **snap to zero-crossing / transient**; zoom with the wheel; markers with labels | tracks, mixing | the IMU trace is the waveform; **snap-to-peak** (§9.1); pinch-zoom lanes |
| **NLEs** (DaVinci, Premiere) | **proxy media** for responsive scrubbing; the master for the final | colour, effects | short-GOP scrub proxy per clip (§8.2); exemplar crops from the master |
| **Encord / V7 / Labelbox** | review queues ordered by model confidence; "issues" attached to frames; audit trails | consensus, reviewer roles, ontologies-as-a-service | the queue (§7.9) and the existing `decisions` / `model_audit` tables |
| **YouTube / Photos scrubbers** | double-tap seek; filmstrip thumbnails under the scrubber; tap-to-pause | — | double-tap = ±1 rep; filmstrip lane (§7.3) |

Principles the study yields, all of which the screen design follows:

1. **Navigate on the signal, not the clock.** Editors scrub audio by waveform; here the waveform is
   the IMU and the reps are visible in it before the video is even decoded.
2. **Two speeds, two controls.** Coarse by direct manipulation of the lane; fine by the wheel.
3. **Snap, then override.** Every placement snaps to a physical event (peak, gate edge, glance
   still); the override is a deliberate second gesture, never the default.
4. **Keyframes are the label.** Rep tops and bounds are the whole annotation; there is no shape tool
   to learn.
5. **Evidence beside the choice.** The exercise picker shows why, and shows the user's own footage
   of the alternatives.
6. **Proxies for feel, masters for truth.** Scrubbing must never stutter; pins and OCR use full
   resolution.
7. **The queue is the model's voice.** Review is ordered by uncertainty, and every item says what
   the model needs.
8. **Thumb reach.** Everything that repeats (step, wheel, mark, save) sits in the bottom third of a
   portrait phone.

---

## 5. Concepts and vocabulary

| Term | Meaning |
|---|---|
| **Session** | one gym visit; `sessions` row; the IMU log (`imu.jsonl`, host time) is its time base |
| **Clip** | one video file tied to a session, with a **sync** (how its PTS maps to host time), a **rotation** (per rig), a **PTS table**, a **proxy** and a **filmstrip** |
| **Frame** | one entry of the PTS table; the Studio never computes `index × 1/fps` |
| **Timeline** | host-time axis of a session or a set; lanes stacked on it |
| **Lane** | one row of the timeline: filmstrip, trace, gate, reps, glance, sync, sets |
| **Playhead** | the current host time; the viewer shows the frame whose PTS ≤ playhead |
| **Mark** | one confirmed rep top (host time); proposed marks come from the RepClock, rejected candidates are shown greyed with their reason |
| **Bounds** | `[tStart, tEnd]` of a set; default = gate open/close ± roll |
| **Pin** | a frame the user chose as an exemplar (`glance`, `rep_top`, `rep_bottom`) with a crop |
| **Sync class** | `exact` (same clock), `accept` (< 40 ms residual), `flag` (40–80 ms), `reject` (> 80 ms) — from the sync plan §5 |
| **Queue** | the ordered list of things the model wants a human to look at (§7.9) |
| **Region** | a periodic window in the session log with no set over it — a candidate untagged set |

---

## 6. Information architecture and entry points

```
Campaign map ──► AFTER ACTION tile ("3 to review")  ──► Queue ──► Studio(set)
Debrief ──► "Open in After Action" (any of the four cards) ──► Studio(set, focused card)
Inspector (per exercise) ──► set row ──► "Replay" ──► Studio(set)
Session end card ──► "N sets · 1 untagged" ──► Reel (session view) ──► Studio(set)
Settings ▸ Data ──► "Import a rig session" ──► Import & sync ──► Reel
Live HUD correction (FR-L2) ──► queued ──► Studio(set)
```

Three screens, one component tree:

| Screen | Purpose |
|---|---|
| **Reel** (session view) | the whole session on one strip: sets as blocks, regions as "?", sync status, storage state; split / merge / propagate live here |
| **Studio** (set view) | one set: viewer + timeline + transport + label dock + save bar |
| **Import & sync** | founder path for rig video: pick the file(s) + `session.json`, validate, generate proxies |

The Debrief is unchanged in shape; it gains one link per card ("Open in After Action") and the
Studio returns to it with the answers pre-filled if the round was still open.

---

## 7. Screen design

### 7.1 Layout (portrait, the only layout in v1)

```
┌─────────────────────────────────────────────┐
│ ‹ Goblet squat · set 3 of 5      ◉ sync ✓  ⋯ │  top bar: exercise chip · sync badge · menu
├─────────────────────────────────────────────┤
│                                             │
│           VIEWER (16:9 letterboxed)         │  proxy playback, rotation baked in
│   ┌ rep 4 / 8 ┐            [gate ACTIVE]    │  overlays: rep counter, gate pill
│   t 12.43 s · f 373 · 30.0 fps              │  frame HUD (testID studio-frame)
│                    ✚ (crosshair on glance)  │
├─────────────────────────────────────────────┤
│ ▤ filmstrip  ▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁      │  TIMELINE — pinch to zoom, drag to scrub
│ ∿ trace      ────╱╲──╱╲──╱╲──╱╲──╱╲─────    │  IMU rep channel (band-passed)
│ ▮ gate       ░░░░████████████████░░░░       │  ARMING / ACTIVE / CLOSING
│ ● reps       ·  ①   ②   ③   ④  (⑤)  ·      │  confirmed ● proposed ○ rejected (grey)
│ ◎ glance     ◎                              │  sharp still(s)
│ ⟂ sync       ⟂           ⟂                  │  nods / anchors (imported sessions)
│              ▲ playhead                     │
├─────────────────────────────────────────────┤
│  ⏮ set   ◀ rep   ◀ frame  ╭──JOG──╮  frame ▶   rep ▶   set ⏭  │  transport row (thumb zone)
│                          ╰────────╯   ▶ 0.5×  ↻ loop rep      │
├─────────────────────────────────────────────┤
│ [Review] [Marks] [Bounds] [Pins]            │  mode segmented control
│ Exercise ▾ Goblet squat 0.86  │ Reps 8 ✓ │ Weight 24 kg ✓ │  label dock (tap a cell to expand)
├─────────────────────────────────────────────┤
│  SAVE — clean set · integrity 0.86 → 0.89 · +100 XP           │  save bar (gates + impact)
└─────────────────────────────────────────────┘
```

Proportions on a 20:9 phone: viewer 34 %, timeline 24 %, transport 10 %, dock 22 %, save 6 %, top
4 %. The dock expands upward as a sheet over the viewer when a cell is tapped; the timeline and
transport never move, so the user's thumb keeps its place.

### 7.2 Viewer

- Plays the **proxy** (§8.2) through `react-native-video` 6; the master is opened only for pins and
  OCR. Rotation is baked into the proxy per rig (A52 headband 90°, ELP 180° — `frame-extraction.md`
  per-rig table), so the player shows upright footage without runtime transforms.
- **Frame HUD** (`studio-frame`): host time, frame index, effective fps at this point (from the PTS
  table — visibly lower during a VFR warm-up transient, which is the honest display).
- **Overlays** are the existing HUD glyphs, tinted by state (design §17.3): rep counter with the
  hit marker on each confirmed mark under the playhead; gate pill; `hud_crosshair_locked` when the
  playhead is on a glance still; `hud_link_lost` over any interval with `seq_gaps`.
- **Trace-only fallback:** when the set has no clip (phone IMU in a pocket, ShenYao before import,
  clip reduced after 7 days) the viewer shows the last exemplar frame dimmed with "no video for this
  set" and the timeline carries everything; every control still works.
- **Video-only fallback:** a clip with no IMU (a gallery clip, a KB case file) shows the trace lane
  empty, the rep lane driven by the user's marks only, and a banner "no headband data — this set
  teaches exercise and weight, not reps" (PRD §5.3 honesty rule; §10.6).

### 7.3 Timeline

Lanes, top to bottom, each toggleable from the `⋯` menu, each drawn with `react-native-svg` on a
shared zoom/pan model held in Reanimated shared values:

| Lane | Content | Source |
|---|---|---|
| filmstrip | one thumbnail per second at zoom ≤ 1×, denser as zoom grows (max one per frame at ≥ 8×) | filmstrip sprite (§8.3) |
| trace | the dominant rep channel, band-passed, as the RepTrace already draws it — but continuous, not 88 bars | `SetResult.windowF16` → for the Reel, the recorder slice |
| gate | ARMING / ACTIVE / CLOSING / CLOSED shading | `explainRange` (§10.2) |
| reps | confirmed ● / proposed ○ / rejected ⊘ with reason on tap ("below A_min", "too close to previous") | `SetResult.reps` + `explainRange.rejected` |
| glance | sharp stills, with sharpness score on tap | `exemplar_frames` role `glance` + `GlanceEvent` |
| sync | nod anchors and per-window correlation residual (imported sessions only) | `clips.sync_json` |
| sets (Reel only) | set blocks with label chips; regions as "?" | `labeled_sets` + region scan |

**Zoom levels:** 1× = whole set (or whole session in the Reel); pinch up to 32×, where one frame is
≥ 24 px wide and the filmstrip becomes one thumbnail per frame. A two-finger drag pans; a one-finger
drag scrubs (moves the playhead), which is the coarse control (OnForm's first scrubber).

**Snap points** (magnetic within 12 px at the current zoom): rep tops (confirmed and proposed),
gate edges, glance stills, set bounds, nod anchors. The playhead haptic-ticks on snap. Snapping is
what makes "drag to the rep" cheap enough that the wheel is only needed for the last few frames.

### 7.4 Transport and the jog wheel

- **Jog wheel** (`studio-jog`): a 96 pt arc control drawn in SVG; a circular pan gesture maps
  angular travel to frames — **1 detent = 1 frame = 12°** at rest, with acceleration to 4 frames per
  detent above 360°/s, so a flick covers a rep and a slow turn is frame-exact (Final Cut for iPad's
  wheel behaviour, calibrated to a phone thumb). Each detent fires a 10 ms haptic tick.
- **Step buttons:** ◀ frame / frame ▶ (one PTS entry), ◀ rep / rep ▶ (next snap point in the reps
  lane), ⏮ set / set ⏭ (previous/next set in the session; in set view they leave to the neighbour).
  Long-press a frame button = shuttle at 0.25× in that direction until release.
- **Play/pause** with rates 0.25× · 0.5× · 1× · 2×; **loop rep** repeats `[mark_i − ½ cycle,
  mark_i + ½ cycle]` for the rep under the playhead (OnForm's loop-a-phase).
- Hardware volume keys as ◀/▶ frame: **off by default**, a setting, because it steals media volume
  from a user who is listening to music and because the shooter feel does not need it.

### 7.5 Gesture map (the mobile equivalent of CVAT's hotkeys)

| Gesture | Where | Action |
|---|---|---|
| tap | viewer | play / pause |
| double-tap left / right | viewer | ◀ rep / rep ▶ |
| long-press | viewer | show the gesture sheet (CVAT's `F1`) |
| one-finger drag | timeline | scrub (snapping) |
| two-finger drag | timeline | pan |
| pinch | timeline | zoom around the pinch centre |
| tap a mark | reps lane | select it (Marks mode: toggle it) |
| drag a mark | reps lane, Marks mode | move it; snaps to the nearest peak within ±150 ms; haptic on snap, double-tick when the user pulls it off the snap |
| two-finger tap | viewer or timeline, Marks mode | add a mark at the playhead (snapped) |
| swipe a mark down | reps lane, Marks mode | delete it |
| drag a bound handle | gate lane, Bounds mode | trim; snaps to gate edges and marks |
| tap | viewer, Pins mode | pin this frame; drag to crop |
| circular pan | jog wheel | frame stepping with detents |
| long-press | step buttons | shuttle |

Every gesture has a button twin in the mode bar (`+ mark`, `− mark`, `set start`, `set end`, `pin`),
so nothing depends on a gesture the user has not discovered (FR-A1 spirit).

### 7.6 Modes

A segmented control (`studio-mode`) changes what the timeline gestures do — the same "tool" idea as
CVAT/Label Studio, reduced to four:

| Mode | Timeline gestures act on | Lane emphasised | Exit |
|---|---|---|---|
| **Review** (default) | playhead only | all | — |
| **Marks** | rep marks (add / move / delete / toggle) | reps | Done |
| **Bounds** | the two set handles | gate | Done |
| **Pins** | the current frame (pin + crop) | filmstrip | Done |

The mode is per set and resets to Review on open. Marks and Bounds show a live count and the ±1
gate pill (reusing `labeling-rep-gate`) so the user sees the gate outcome before saving.

### 7.7 Label dock — exercise, reps, weight

The dock is the Debrief's three cards, condensed to one strip, each cell expanding to a sheet.

**Exercise sheet (`studio-exercise`)** — built for the confusable case (PRD §5.2b):

1. **Candidates first**: the top-3 from `Match.candidates` with confidence, the matched template's
   provenance ("your set from 12 May, 24 kg × 8", or "founder prior"), and the margin. The
   confusable neighbour is always shown even if it is not in the top-3.
2. **Compare** (`studio-compare`): side by side, this set's time-normalised rep shape (64 samples,
   the learner's `repShape`) over the candidate exercise's fitted median, and this set's pinned or
   glance frame beside the candidate's stored exemplar frame from the user's own store (or the gym
   pack's station exemplar). Swipe between candidates. This is the "evidence beside the choice".
3. **Field guide line** per confusable pair, ≤ 140 characters, authored from the KB's discriminators
   (`sensor-fusion.md` "curl vs raise", case 002's grip rule, case 003's "trace the cable"):
   "Supinated grip = curl; pronated at the chin = upright row." Shipped in the model package as
   `field_guide[pairKey]`, so copy is a package change.
4. **Search and browse**: a search field over `canonical_name` + `synonyms` (ontology), then the
   campaign groups. The current level badge sits on every row, and a `hard`/`vision` row states what
   it can certify (honesty rule §5.3).
5. **Consistency check before save**: the chosen label is matched leave-one-out against the campaign
   index (`previewIntegrity`, §10.2) and the sheet says "matches your other goblet squats at 0.91 ·
   nearest other: front squat 0.62". A choice that would drop the exercise's integrity below its
   level bar shows the demotion it would cause, in plain words, before the user commits.

**Reps sheet** — the count, the marks-vs-count arithmetic ("8 marks · you typed 9 — add a mark or
keep 8?"), the ±1 gate, and "not sure" as a first-class answer.

**Weight sheet** — declared value with the prior pre-filled; unit; OCR reconcile when it exists (shown
only after the user's value, only if it disagrees — FR-T6); "couldn't see it"; and **"read this
frame"**: send the *pinned* frame's crop through the OCR path (one still, deleted after inference,
the "what leaves the phone" line shown inline).

### 7.8 The Reel — session view

One horizontal strip of the whole session at 1×, with the sets lane on top:

```
 ▸ 09:41 ─────────────────────────────────────────────────────── 10:52
 sets  │ ▇▇ goblet 24×8 │ ▇▇ goblet 24×8 │ ? │ ▇▇ goblet 28×6 │  ▇▇ RDL 60×8 │ ▇▇ RDL 60×8 │
 trace │ ∿∿∿   ∿∿∿∿   ∿∿   ∿∿∿∿    ∿∿∿    ∿∿∿∿∿     ∿∿∿∿∿      │
 sync  │ ⟂ (nods)                                          ⟂ (nods) │
 clips │ ──── set clips ────  or  ═══ one continuous rig clip ═══ │
```

- **Regions** ("?") are periodic windows from the recorder scan with no set over them
  (`explainRange` over the session with gate hysteresis, ≥ 3 cycles). Tap → "Tag it" creates a
  `SetResult` via `analyzeRange` and opens the Studio; "Dismiss" records a dismissed region so it
  never nags again and is never harvested as a negative (R11).
- **Split** at the playhead (Bounds mode in the Reel): two `analyzeRange` calls, two sets, the
  original relabelled away. **Merge** two adjacent sets: one `analyzeRange` over the union.
- **Propagate** (CVAT's `Ctrl+B`, reshaped): after labelling a set, "same exercise for the next N
  sets?" is offered when the following sets' kNN distance to this set is below `T_imu_high` and the
  glance stills agree (nearest-neighbour over the exemplar crops). One tap applies the **exercise
  only**; reps and weight stay per set and keep their proposals. Never applied silently.
- **Sync badge** per clip with the residual class; a `flag` clip shows the residual and disables
  nothing but warns on mark placement; a `reject` clip is shown but rep marks cannot be placed from
  video (they can still be typed or taken from the IMU) — the sync plan's usable-for table, applied.

### 7.9 The queue — the model asks

The After Action tile opens a list, ordered, each row one sentence in the model's voice and one
tap away from the Studio positioned on the relevant card:

| Priority | Item | Why it is queued | Studio opens on |
|---|---|---|---|
| 1 | gate failed but fixable (`repAgreement` off by > 1, `motion` marginal) | a clean set is one edit away | Marks |
| 2 | exercise margin < 0.10 or label chosen against the top-1 | the store may have learned the wrong thing | Exercise sheet, Compare |
| 3 | untagged region ≥ 3 cycles | coverage | Reel, region selected |
| 4 | OCR disagrees with the declared weight | a headshot bonus or a wrong prior | Weight sheet, glance frame |
| 5 | live correction (FR-L2) on a certified exercise | demotion risk | Exercise sheet |
| 6 | imported session awaiting labels | founder path | Reel |

Dismissing an item requires a reason chip ("was rest", "wrong rig", "not an exercise") that becomes a
`decisions` row, so dismissals teach too.

### 7.10 Import & sync (founder path, ShenYao and gallery clips)

1. Pick one or more `.mp4` files (document picker) and the session directory's `session.json`
   (written by `scripts/kb/sync_imu_video.py` on the laptop — v1; on-device correlation is v1.1).
2. Validate: `session.json.sync.residual_ms` → class; rate ratio within ±100 ppm; `seq_gaps` and
   saturation invalidators (sync plan §5). A `reject` session imports with the warning and the
   editing restriction above; it is never silently accepted.
3. Ingest job (§8): PTS table, proxy with the rig's rotation baked in, filmstrip, storage check.
4. Land in the Reel with regions computed; the founder labels set by set, or propagates per block.
5. A gallery clip with no IMU (KB case files) imports as **video-only** (§10.6).

### 7.11 Degraded states, each with one honest line

| State | Line | What still works |
|---|---|---|
| no clip | "No video for this set — the headband data is all there is." | everything but pins and frame stepping |
| clip reduced (7-day rule) | "Video reduced to exemplar frames on 21 Sep." | trace, marks, relabel |
| proxy not ready | "Preparing smooth scrubbing…" (plays the master meanwhile) | all; stepping slower |
| sync flag | "Video and headband may be up to 80 ms apart here." | all; warning on video-placed marks |
| sync reject | "Video could not be aligned — marks come from the headband only." | typing/IMU marks, exercise, weight, pins |
| video-only | "No headband data — this teaches exercise and weight, not reps." | exercise, weight, pins, declared reps |
| storage cap near | "1.8 of 2 GB used — oldest clips reduce first." | all |

---

## 8. Frame navigation — the mechanics

### 8.1 Time base and the PTS table

- The Studio's clock is **host time** (`SystemClock.elapsedRealtimeNanos`, the IMU log's `host_ns`),
  relative to session start. IMU samples are already on it; the clip is mapped onto it by its
  `sync` record: `host_ns(pts) = pts0_host_ns + pts_ns × rate`. For app-recorded and
  production-module clips `rate = 1` (same oscillator); for imported ShenYao clips `rate` and the
  offset come from `session.json` (sync plan §4.4).
- At ingest, `MediaExtractor` reads every video sample's presentation time into a **PTS table**
  (`clips/<id>/pts.u32`, microseconds, monotone, one entry per frame). Frame index is a position in
  this table and nothing else. VFR (the ShenYao warm-up transient: 21.7 → 29.8 fps within one clip)
  is therefore handled by construction, and the frame HUD shows the *local* rate.
- **Seek target for frame i** = `floor(pts_ms[i]) + 1 ms`. ExoPlayer's default `SeekParameters` are
  `EXACT` (frame-accurate: decode from the previous sync frame, render the last frame with PTS ≤
  target), and react-native-video 6 passes `seek(seconds)` straight to it, so `+1 ms` guarantees the
  intended frame without landing on the next one (frames are ≥ 33 ms apart at 30 fps).

### 8.2 Proxy clips — why and how

Exact seeking costs a decode from the previous keyframe. A backward frame step at the end of a GOP
decodes the whole GOP; at the master's default 1 s GOP that is up to 30 frames of 720p per step and
would make the wheel feel like mud on the A52. CameraX's `Recorder` does not expose the keyframe
interval, production-module HEVC and ShenYao files come with whatever GOP their encoder chose, so the
fix has to be downstream of capture — exactly the NLE answer: **a scrub proxy**.

| Property | Master (recorded / imported) | Scrub proxy |
|---|---|---|
| resolution | 1280×720 (app-recorded) / as delivered | 640×360, rotation baked in |
| codec | H.264 (app) / HEVC or H.264 (rigs) | H.264 baseline/main |
| GOP | encoder default (≈ 1 s) | **0.25 s (8 frames at 30 fps)** via Media3 `Transformer` + `VideoEncoderSettings` keyframe interval |
| bitrate | ~6 Mbps | ~2.5 Mbps |
| size per 90 s set | ~70 MB | ~28 MB |
| role | pins, OCR, export, the ≥ 8× filmstrip | playback, scrubbing, stepping |

Worst-case backward step = 8 frames of 360p on the hardware decoder — inside the 50 ms budget with
margin (measured in S0, §17). The proxy job runs in the background right after gate-close, so it is
normally ready before the Debrief ends; if the user opens the Studio first, the master plays and the
banner in §7.11 says why stepping is slower.

The ingest job (`ClipIngest`, Kotlin, WorkManager) does, per clip: PTS table → proxy → filmstrip →
`clips` row update. Failure at any step leaves the previous state and an audit row; the Studio never
depends on the proxy or filmstrip existing.

### 8.3 Filmstrip

`MediaMetadataRetriever.getFrameAtTime(OPTION_CLOSEST_SYNC)` on the proxy (sync frames every 0.25 s,
so "closest sync" is within 125 ms of the requested second, which is fine for a 1-per-second strip)
at 96 px height, packed into one JPEG sprite (`thumbs.jpg`, ≤ 200 KB per 90 s) with a JSON index.
At ≥ 8× zoom the strip switches to on-demand frames from the proxy player itself (the frame under
the playhead is already decoded; neighbours are fetched lazily and cached, ≤ 24 bitmaps).

### 8.4 Responsiveness budget

| Interaction | Budget (A52, release) | How |
|---|---|---|
| open Studio (proxy ready) | ≤ 1 s to first frame | proxy preloaded when the queue row is visible |
| single frame step | ≤ 50 ms p95 | proxy GOP 0.25 s; seeks coalesced: a new step cancels the pending seek's render, not its decode |
| scrub at 60 fps UI | no dropped gesture frames | gesture + zoom on the UI thread (Reanimated shared values); `runOnJS` seek only when the frame index changes; ≤ 1 pending seek |
| filmstrip for a 90 s clip | ≤ 3 s, background | ingest job |
| proxy transcode | ≤ 0.5 × clip duration, background | Media3 Transformer, hardware codecs |
| save (commit / relabel) | ≤ 2 s | unchanged budget (model PRD R1) |
| memory | ≤ +80 MB over the Campaign screen | one player instance; sprite + ≤ 24 cached frames |

### 8.5 Per-rig navigation table

| Rig | Clip source | Sync | Rotation | Proxy | Frame stepping |
|---|---|---|---|---|---|
| Phone camera on the headband (A52) | app-recorded per set (§11.1) | exact (same clock) | 90° | yes | full |
| Production module | per-set gated HEVC over Wi-Fi (`ironpal-wireless-offload-plan.md`) | exact (module stamps both) | per module config | yes | full |
| ELP + ShenYao | `/sdcard/DCIM/USBCamera/IPS_*.mp4`, continuous | `session.json` from the laptop (v1) | 180° | yes, segmented per set at ingest | full when `accept`, warned when `flag`, IMU-only marks when `reject` |
| Gallery / KB clip | user-picked file | none | user-picked (default 0°, preview to confirm) | yes | full; video-only labels |
| No camera (IMU only) | — | — | — | — | trace-only Studio |

---

## 9. Accuracy aids

### 9.1 Snap-to-peak and the rep-top convention

- A mark placed or moved snaps to the **local maximum of the band-passed rep channel within
  ±150 ms** of the drop point (the zero-phase pass the analyser already runs, design D2), which is
  the frozen convention: **top of the rep** (PRD §7.4). The haptic double-tick and a small
  "off-peak" tag on the mark tell the user when they have overridden the snap; the override is
  stored with a flag so the learner can weight it.
- A **ghost** of the exercise's fitted `repShape` (when ≥ 5 reps are stored) is drawn faintly under
  the trace around each mark, so the user sees what a top should look like for *their* body.
- **Marks-vs-count arithmetic** is always visible; the count field and the marks cannot silently
  disagree at save (the Debrief lets them; the Studio resolves it with one question).

### 9.2 Bounds

Handles snap to gate events and to the first/last mark ± ½ cycle. A bound inside the marks or a
window shorter than 3 cycles fails the `motion` gate visibly in the save bar before saving.

### 9.3 Exercise

Candidates with evidence, Compare, the field-guide line, the leave-one-out consistency check and the
demotion preview (§7.7). The picker orders the confusable neighbour first, then the top-3, then the
campaign, and the search never hides a Tier-1 entry.

### 9.4 Disagreement detectors (shown, never blocking)

| Detector | Signal | Line |
|---|---|---|
| video/IMU offset | user-placed marks sit systematically > 150 ms from IMU peaks | "Your marks are ~180 ms after the headband's — check sync or the convention (top of the rep)." |
| count mismatch | typed count ≠ marks | the §9.1 question |
| sibling confusion | this label vs top-1 candidate flips for the third time in 10 sessions (`drift.ts` siblingConfusion) | "You've relabelled front squat ↔ goblet squat three times — chart them as separate levels?" |
| propagate mismatch | a propagated set's own match disagrees strongly | "Set 4 looks different from the block — review it." |

---

## 10. Integration with the model

### 10.1 Prerequisite: recorder-based slicing

`SignalModule.endSet` slices the set from the **IMU ring buffer** (`ImuPipeline.snapshot`, P0
deviation recorded in `poc/README.md`). Everything in this document that touches an arbitrary time
range — regions, split, merge, relabel of a past set, imported sessions — needs a slice of the
**session log** by host time. Closing that deviation is **S0's first task** (§18): `SessionRecorder`
gains `slice(sessionId, t0HostNs, t1HostNs)` over `imu.jsonl` (index file per session for O(log n)
seeks), and `endSet` uses it too, so the Debrief and the Studio analyse the same bytes.

### 10.2 Bridge additions (`SignalModule`, results only cross — D6)

| Method | Args | Returns | Used by |
|---|---|---|---|
| `analyzeRange(sessionId, t0Ns, t1Ns, exerciseHint?)` | host-time range | `SetResult` (same shape as `endSet`) | regions, split, merge, relabel of a past set, imported sessions |
| `explainRange(sessionId, t0Ns, t1Ns)` | range | per-tick `{t, energy, periodicity, gateState, provisionalLabel, conf}`, rep candidates incl. rejected `{t, amplitude, reason}`, saturation/gap intervals | gate lane, reps lane, region scan |
| `scanRegions(sessionId)` | — | periodic windows ≥ 3 cycles not covered by any set | the Reel's "?" blocks |
| `previewIntegrity(exerciseId, windowF16, features)` | a candidate template | `{integrityIfAdded, nearestOther:{exerciseId, d}}` — the campaign LOO with this template added, without writing | consistency check, demotion preview |
| `repShape(exerciseId)` | — | the fitted 64-sample median, or null | the ghost |
| `peakNear(sessionId, tNs, windowMs)` | a drop point | the local maximum's host time | snap-to-peak |

`CameraModule` gains `startClip(setId)` / `stopClip()` (§11.1) and `extractFrame(clipId, ptsUs,
crop?)` → encrypted JPEG path (for pins and OCR). A new `ClipModule` owns ingest (PTS table, proxy,
filmstrip) and reports progress events.

### 10.3 Learner additions (`learner.ts`)

| Operation | Semantics | Audit |
|---|---|---|
| `commit` (exists) | append set + rep templates, harvest negatives, fit, integrity, levels | as today |
| `relabel(setId, confirmed)` | in one transaction: delete the set's templates and exemplars, then `commit` with the new answers; `labeled_sets.revision++`, `label_source = 'studio'`; level transitions may go **down** (honest: a store that just lost a set can lose Provisional) and the Studio said so before save | `relabel` row with before/after integrity and the level change |
| `split(setId, tSplitNs)` | two `analyzeRange` results → two new sets proposed for labelling; the original is relabelled away only when both are saved | `split` row |
| `merge(setIdA, setIdB)` | one `analyzeRange` over the union → one new set; originals removed on save | `merge` row |
| `createFromRegion(sessionId, t0, t1)` | `analyzeRange` → new set with `label_source = 'studio'` | `region` row |
| `dismissRegion(sessionId, t0, t1, reason)` | store the dismissal; the window is excluded from negative harvesting **and** from future scans | `dismiss` row |
| `pin(setId, clipId, ptsUs, role, crop)` | extract from the master, encrypt, `exemplar_frames` row with `source='user'`; a user pin outranks the IMU-picked frame of the same role in the exemplar set (max one user pin per role per set) | `pin` row |

Rep marks saved from the Studio carry `snapped: true|false` per mark in `labeled_sets.rep_marks`
(JSON array of `{t, snapped}` — a superset of today's array of seconds; the reader accepts both).

### 10.4 Decisions and explanations

The Studio renders the same explanation objects the Debrief renders (`decide.ts`), plus two new
kinds written at Studio time: `queue` (why the item was queued, what resolved it) and `dismiss`
(the reason chip). Wording stays in `package.explanations` and the new `package.field_guide`.

### 10.5 Data flow — one Studio save

```
Studio.save(setId, answers, marks[{t,snapped}], bounds, pins[])
  1. gates   = evaluateGates(SetResult ⊕ bounds, answers, repSignal, calibrated)   # unchanged rules
  2. preview = SignalModule.previewIntegrity(...)                                  # already shown in the bar
  3. learner.relabel | commit | createFromRegion  (transaction)
  4. pins → CameraModule.extractFrame → exemplar_frames
  5. levels.apply → level card (cleared / compromised) → game events (§13)
  6. queue.resolve(item, outcome)  → decisions row
  7. SignalModule.loadTemplates(delta)  # hot, as today
```

### 10.6 Video-only sets

A clip with no IMU yields no `SetResult`. The Studio creates a `labeled_sets` row with
`imu_available = 0`, accepts exercise, weight, pins and a declared rep count, writes exemplars and
weight priors, and **writes no templates**. Such a set never counts toward Campaign-1 certification
(no IMU can be certified from it) and says so on the save bar. It does count toward Campaign-2
exemplar coverage and weight priming, which is what a video-only clip can honestly teach.

### 10.7 Export for the scorers

"Export labels" on a session writes `predictions.json`-compatible rows (exercise, rep range = exact
count for `imu`, weight with state) so `scripts/kb/score_reps.py` and `score_weights.py` can grade
in-app labels against the KB ground truth without a conversion step. Export is local (share sheet),
encrypted with the store's export path (model design §7.1).

---

## 11. Clip capture and ingest per rig

### 11.1 App-owned camera (the POC headband phone) — `ClipRecorder`

- CameraX `camera-video` (`VideoCapture` + `Recorder`, added to the existing 1.3.4 set): 1280×720,
  30 fps, H.264, ~6 Mbps, file per set under the app's private dir, AES-GCM-encrypted after close
  (design §7.1 file rule).
- **Bound together with `ImageAnalysis`** (no `Preview`), so the glance sharpness selection keeps
  running during recording. `VideoCapture + ImageAnalysis` is a PRIV + YUV stream pair, the same
  class as the already-supported `Preview + ImageAnalysis`; it is verified on the A52 on day one of
  S0 and, if the device refuses the pair, the fallback is `VideoCapture` alone with the glance still
  extracted from the clip at ingest (sharpest frame in the glance window, same variance-of-Laplacian
  score).
- Recording runs **from ARM to gate-close + 10 s**, which contains the glance and the pre-roll by
  construction (ARM precedes the set); `stopClip` is called by `useSet.end` after the post-roll.
- **Sync:** `ImageAnalysis` frame timestamps are the camera's sensor timestamps; when
  `SENSOR_INFO_TIMESTAMP_SOURCE = REALTIME` they are on the same `CLOCK_BOOTTIME` as `host_ns`, and
  the first analysis frame after `VideoRecordEvent.Start` pins `pts0_host_ns` to within one frame.
  When the source is `UNKNOWN` the recorder falls back to the `Start` event's host time and marks
  the clip `accept` rather than `exact`. The three nods at session start are the free cross-check
  (nod spikes in the gyro vs the frame-difference spike in the proxy), computed once per session in
  the ingest job; a residual > 40 ms downgrades the class.
- Storage precheck (FR-C5) and the 2 GB cap (FR-D3) apply; when the cap is near, the oldest
  unpinned masters reduce first, proxies second.

### 11.2 Production module

Per-set gated clips arrive over Wi-Fi with the module's own IMU timestamps; both streams share the
module's clock so the sync is `exact`. Ingest is identical from the PTS table onward. The bridge
validation hook (model design §14 P4) is where the module's rotation and timestamp source are read.

### 11.3 ELP + ShenYao (founder rig, v1 = laptop sync)

Continuous recordings; alignment by cross-correlation is a laptop step (`sync_imu_video.py` →
`session.json`) in v1. The Studio imports the file(s) + `session.json`, segments the continuous
clip **at ingest** into per-set proxies using the set bounds (the sync plan §7's "segment in post"),
and keeps the continuous master until the 7-day reduction. On-device correlation (gyro magnitude vs
proxy frame-difference energy, the same maths as the script) is v1.1: it needs the proxy's decode
loop to emit motion energy, which the ingest job already touches, but it is founder-only demand and
the laptop path exists and is validated.

### 11.4 Retention

Unchanged from the PRD (FR-D1): masters kept until the round is confirmed + 7 days, then reduced to
exemplar frames + IMU windows unless pinned. The Studio adds: **proxies follow the master's clip
state**; a `pinned` clip keeps both; the storage meter shows master / proxy / exemplar split.

---

## 12. Data model additions

```sql
CREATE TABLE clips (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL, labeled_set_id TEXT,         -- null for a continuous rig clip
  rig_id TEXT, source TEXT CHECK (source IN ('app','module','shenyao','gallery')) NOT NULL,
  master_path TEXT, proxy_path TEXT, pts_path TEXT, thumbs_path TEXT,
  rotation_deg INTEGER NOT NULL DEFAULT 0, width INTEGER, height INTEGER, frames INTEGER, duration_us INTEGER,
  sync_json TEXT NOT NULL,           -- {pts0_host_ns, rate, residual_ms, class: exact|accept|flag|reject, source}
  state TEXT CHECK (state IN ('recording','ingesting','ready','reduced','pinned','deleted')) NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX clips_session ON clips(session_id);

ALTER TABLE labeled_sets ADD COLUMN label_source TEXT CHECK (label_source IN ('debrief','studio','live')) DEFAULT 'debrief';
ALTER TABLE labeled_sets ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE labeled_sets ADD COLUMN imu_available INTEGER NOT NULL DEFAULT 1;
ALTER TABLE labeled_sets ADD COLUMN clip_id TEXT;                            -- supersedes clip_path for new rows
-- rep_marks: JSON array of seconds (legacy) OR of {t, snapped} objects; readers accept both.

ALTER TABLE exemplar_frames ADD COLUMN source TEXT CHECK (source IN ('auto','user')) DEFAULT 'auto';
ALTER TABLE exemplar_frames ADD COLUMN crop_json TEXT;                       -- {x,y,w,h} in master pixels
ALTER TABLE exemplar_frames ADD COLUMN pts_us INTEGER;

CREATE TABLE regions (                                                       -- untagged periodic windows and their fate
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL, t0_ns INTEGER NOT NULL, t1_ns INTEGER NOT NULL,
  cycles INTEGER, state TEXT CHECK (state IN ('open','tagged','dismissed')) NOT NULL,
  reason TEXT, labeled_set_id TEXT, updated_at INTEGER NOT NULL
);
CREATE TABLE queue (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, priority INTEGER NOT NULL, labeled_set_id TEXT, region_id TEXT,
  clip_id TEXT, focus TEXT,            -- which card / mode to open on
  text TEXT NOT NULL,                  -- the model's one sentence, rendered from package.explanations
  state TEXT CHECK (state IN ('open','resolved','dismissed')) NOT NULL, created_at INTEGER NOT NULL, resolved_at INTEGER
);
CREATE TABLE studio_events (           -- timing metrics only (§16); never content
  id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, labeled_set_id TEXT, kind TEXT NOT NULL, ms INTEGER, n INTEGER
);
```

`session_sets` on the backend gains three metric fields (`label_source`, `studio_ms`,
`marks_edited`) — counts and timings only, never windows or frames (PRD §11 rule).

---

## 13. Game integration — After Action

| Element | Mapping |
|---|---|
| **Name and place** | *After Action* — a tile on the campaign map with the queue count, and a link on every Debrief card and inspector row. The shooter's replay room: you review the round, you do not replay it for points. |
| **Backdrop and emblem** | reuses `bg_debrief` (darkened 20 % more) and `emblem_scout` for the queue header; no new Leonardo generations — the jog wheel, lanes and handles are code-drawn SVG (`draw-hud.py` additions: `hud_jog_wheel`, `hud_mark`, `hud_bound_handle`, `hud_pin`). |
| **XP** | a set earns XP **once**, through the gates, whichever tier saved it. Relabelling a counted set earns nothing further. Resolving a queue item whose set then passes the gates earns base XP plus a small **intel bonus** (+20), because the queue is where the model's accuracy is actually bought; dismissing earns nothing. No penalties. |
| **Missions from gaps** | the generator (PRD §8.3) gains "review N flagged sets", "tag the untagged block from Tuesday", "pin an implement frame at the leg press" — all derived from the queue and the exemplar coverage, none from a calendar. |
| **Cues** | wheel detent tick (haptic only); snap tick; the existing `hit` on a confirmed mark; `level cleared` / "integrity compromised — one set to restore" cards exactly as the Debrief shows them; no sounds loop. |
| **Feel** | the round-end scoreboard cadence carries over: rows slide in, the integrity plate updates on save, the queue burns down visibly. Nothing in the Studio has a timer. |
| **Scout** | Pins mode is the Scout's tool: "chart this station" pulls the user's pinned station frames first. |

The e2e harness's originality checklist (no third-party game names, art, sounds) applies to every new
string and glyph.

---

## 14. Non-functional requirements

| Area | Requirement |
|---|---|
| Responsiveness | §8.4 budgets, measured on the A52 in S0 and re-measured in every phase's exit |
| Battery | ingest (proxy + filmstrip) ≤ 3 % per session on the A52; runs only while charging or above 30 % unless the user opens the Studio |
| Storage | master ≤ 200 MB per set (PRD NFR) → at 720p/6 Mbps a 90 s set is ~70 MB; proxy ~28 MB; the 2 GB cap counts both; the meter shows the split |
| Reliability | ingest is resumable per step; a crash during a Studio edit loses at most the unsaved edit (answers autosave to a draft row every change; drafts are discarded on relabel) |
| Offline | everything in §7–§11 except "read this frame" (queued like OCR) |
| Privacy | video never leaves the phone; pins are crops; the Studio's only egress is the user-triggered OCR still, deleted after inference, listed on the "what leaves the phone" screen |
| Security | clips, proxies, sprites and pins are encrypted at rest with the file scheme of model design §7.1; the player reads through a local content provider that decrypts on read |

---

## 15. Accessibility and safety

- Every gesture has a button; every colour state has a shape/label (FR-A1): confirmed ● / proposed
  ○ / rejected ⊘, bound handles are bracket-shaped, the sync badge carries its class as text.
- Touch targets ≥ 44 pt; the transport row sits in the thumb zone; large-type mode enlarges the dock
  and frame HUD (FR-A3).
- Haptics for detents and snaps can be turned off; nothing depends on hearing.
- The Studio is never opened by the app during a set or within 5 s of gate-close (FR-A2); it is a
  post-session surface by default and a rest-period surface only when the user opens it.

---

## 16. Success metrics

| Metric | Target | Measured by |
|---|---|---|
| queue burn-down | ≥ 80 % of queued items resolved within 7 days | `queue` |
| time per queued set | ≤ 90 s median | `studio_events` |
| frame step latency | ≤ 50 ms p95 on the A52 | `studio_events.kind='step'` |
| marks edited per Studio-saved set | tracked; falling session over session as the detector fits improve | `studio_events` |
| relabels that demote a level | ≤ 5 % of relabels | `model_audit` |
| rep agreement after Studio edits (`imu`) | ≥ 95 % exact on re-analysis | `labeled_sets` vs `SetResult` |
| untagged regions per session | → 0 by a user's fifth session | `regions` |
| founder: a ShenYao visit labelled in-app | one full visit, `score_reps.py` clean (no confident-wrong) | export + scorer |
| exemplar pins per certified station | ≥ 2 user pins (glance + rep top) | `exemplar_frames.source` |

---

## 17. Verification

- **Jest:** timeline maths (`pts ↔ host time`, snap search, zoom/pan model), marks-vs-count
  resolution, propagate signature rule, queue ordering, `rep_marks` legacy/new reader.
- **JVM (existing source set):** PTS table extraction on a VFR fixture (the ShenYao clip's PTS list,
  committed as a small `.u32`), `analyzeRange` equals `endSet` on the same range, `scanRegions` on
  the e2e IMU fixtures (split-squat → 1 region when untagged; real-stationary → 0), `peakNear`.
- **Maestro** (new flows, same harness and gotchas as `e2e/README.md`):
  - `07-studio-navigation`: a bundled 20 s 360p fixture clip whose frames carry a burned-in frame
    counter, plus a synthetic IMU fixture with a known `sync_json`; the flow steps ±1 frame, ±1 rep,
    turns the wheel, and asserts `studio-frame` (the HUD, not OCR of the video).
  - `08-studio-marks-relabel`: add a mark at the playhead, verify the snap tag, move it off-peak,
    save, assert the outcome and the audit row in the inspector; relabel the exercise and assert the
    level change the sheet predicted.
  - `09-studio-reel`: an untagged region appears, "tag it" produces a set, propagate applies the
    exercise to the next set only.
- **On-device benchmarks:** `ClipModule.benchmark()` → proxy transcode ratio, step p95, filmstrip
  time; recorded next to the engine's `benchmark()` on the inspector.
- **Sync validation:** the nod cross-check on every app-recorded session (§11.1); the physical drop
  test once on the A52 during S0.

---

## 18. Build plan (solo; sits inside PRD P1–P2)

| Phase | Deliverables | Exit | Est. |
|---|---|---|---|
| **S0 — media foundation** | recorder-based `slice` + `analyzeRange` (closes the P0 deviation); `ClipRecorder` (CameraX video + analysis bound together, verified on the A52); `ClipModule` ingest (PTS table, proxy via Media3 Transformer, filmstrip); `clips` table; react-native-video 6 + gesture-handler + reanimated added (the versions `../reddy` runs on RN 0.84.1); a bare Studio: viewer + frame HUD + step buttons | frame step p95 ≤ 50 ms on the A52; nod cross-check residual < 40 ms on three home sessions; drop test passes | ~1.5 wk |
| **S1 — the set view** | timeline lanes on the shared zoom model, jog wheel, snap points, Marks/Bounds modes, `peakNear`, `repShape` ghost, label dock with the exercise sheet (candidates, Compare, field guide, `previewIntegrity`), `relabel`, save bar, `07`/`08` flows | a Debrief-saved set re-opened, one mark added, relabelled, integrity and level reported correctly; `08` green | ~2 wk |
| **S2 — the Reel and the queue** | `scanRegions`, regions, split/merge, propagate, queue table and ordering, After Action tile, Debrief/inspector links, missions from the queue, `09` flow | a home session with one forgotten set ends with zero regions; queue burns down; `09` green | ~1 wk |
| **S3 — pins, import, export** | Pins mode with crop, `extractFrame`, "read this frame" via the OCR path, Import & sync with `session.json`, per-set proxy segmentation of a continuous clip, video-only sets, scorer export | one ShenYao visit imported and labelled in-app; `score_reps.py` clean on the export; pins feed the exemplar set | ~1 wk |
| **S4 — polish and measure** | degraded states, large type, haptics settings, `studio_events` metrics to `session_sets`, battery run with ingest | §16 metrics collected on the founder for two weeks; go/no-go for beta exposure in P3 | ~0.5 wk |

> **Status (2026-09-16):** S0–S3 implemented (recorder, range analysis, clip recording and
> ingest, the model layer, the four screens); S4 partially (degraded states, drafts, metrics
> recorded locally). JVM 22 / Jest 43 / `tsc` clean.
>
> **Now verified on a real device** (LG G7, Android 10) with **real knowledge-base footage**: the
> e2e harness grew six studio flows (`07`–`12`) driven by a fixture derived from KB case 001 —
> the confirmed 6-rep/5 kg dumbbell curl — paired with the IMU fixture built from the same case.
> Running them found seven defects that unit tests could not, the worst a **missing `VIBRATE`
> permission that crashed the app on the first haptic** (every frame step, snap and pin). See
> `poc/mobile/e2e/README.md` "Bugs this harness caught (studio round)".
>
> Three implementation details changed as a result and are now the design's actual shape: the reps
> and weight sheets open **over the viewer** (as §7.1 always said) rather than inline; both save
> bars are **fixed footers** rather than the last card; and the gesture cheat sheet has a button
> twin in the `⋯` menu, because a gesture must never be the only way in (§7.5/FR-A1).
>
> **Still not done:** the on-device performance measurements (frame-step p95, proxy transcode
> ratio, the nod cross-check residual), the OCR call behind "read this frame", drag-to-crop for
> pins, and posting `studio_events` to `session_sets`. See `poc/README.md`.

Sequencing rules: S0's media budget is the riskiest assumption and is measured first; S3's import is
founder-only and can slip behind P2 without blocking beta; nothing in the Studio is a prerequisite
for the Debrief shipping in P1.

Dependencies added (all already running in the portfolio on the same RN version):
`react-native-video ^6.19`, `react-native-gesture-handler ^2.30`, `react-native-reanimated 4.2.x`,
`react-native-svg`; Android: `androidx.camera:camera-video:1.3.4`, `androidx.media3:media3-transformer`
(+ `media3-effect` for rotation), `WorkManager`.

---

## 19. Risks

| # | Risk | Mitigation |
|---|---|---|
| V1 | Scope creep into a video editor | non-goals §2.2; four modes, no shape tools; S1 is capped at two weeks |
| V2 | Frame stepping sluggish on the A52 despite the proxy | measured in S0; fallback is a native `FrameStepper` (MediaCodec → SurfaceView with a ±8-frame decoded cache) behind the same JS API |
| V3 | Sync silently wrong → every mark shifted | class badge always visible; nod cross-check per session; the video/IMU offset detector (§9.4); `reject` clips cannot place marks from video |
| V4 | Users move marks off the top-of-rep convention and integrity drops | snap by default, ghost, off-peak tag, the demotion preview before save; `snapped` flag lets the learner down-weight overrides if dogfood shows harm |
| V5 | `VideoCapture + ImageAnalysis` refused on the A52 | day-one check; fallback: glance still from the clip at ingest (§11.1) |
| V6 | Storage pressure from masters + proxies | cap unchanged; proxies reduce with masters; meter shows the split; 360p proxy keeps the overhead ≈ 40 % |
| V7 | Relabels demote levels and feel punitive | the preview says so before save; the "integrity compromised — one set to restore" framing; no XP loss ever |
| V8 | Pinned frames include bystanders | pins are crops; the Pins sheet says "crop to the implement"; wide frames never leave the phone; the pack pipeline's reduced-form rule (C9) is enforced downstream |
| V9 | react-native-video / Media3 on the RN 0.84 new architecture | `../reddy` and `../rrr` run the same versions on the same RN; Media3 Transformer is plain Kotlin behind the bridge |
| V10 | Ingest drains battery in the gym | ingest defers below 30 % battery unless the Studio is opened; proxies are small |
| V11 | The queue nags | at most one item per set; dismissals with a reason are final; no notifications in v1 |
| V12 | Continuous ShenYao masters (28 GB/h) do not fit the phone's cap | import keeps the master **on the laptop**; the phone receives the per-set proxies and the set-window master cuts only (produced by the import script), well under the cap |

---

## 20. Open questions

None that are the founder-as-engineer's alone to settle remained after the review; the assumptions
most worth a veto are listed at the top of the ledger. The PRD's open items (legal basis for
contributions, gym partnership, monetisation, claims) are untouched by this document.

---

## Appendix A — Gesture and control cheat sheet (the long-press sheet)

```
NAVIGATE        tap video: play/pause · double-tap L/R: ◀ rep / rep ▶ · drag trace: scrub
                pinch: zoom · two-finger drag: pan · wheel: frames (1 detent = 1 frame)
                hold ◀/▶: shuttle 0.25× · loop: repeat this rep
MARKS           two-finger tap: add at playhead · drag: move (snaps to peak) · swipe down: delete
BOUNDS          drag [ ]: trim (snaps to gate / marks)
PINS            tap: pin this frame · drag box: crop · "read this frame": OCR (one still, deleted)
SAVE            gates and integrity impact are shown before you commit
```

## Appendix B — References

- Label Studio 1.6 video object tracking and timeline: <https://labelstud.io/blog/label-studio-1-6-video-object-tracking-and-new-annotation-ui/>; template: <https://labelstud.io/templates/video_object_detector>
- CVAT track mode and shortcuts: <https://docs.cvat.ai/docs/annotation/manual-annotation/modes/track-mode-basics/>; <https://www.cvat.ai/academy/track-mode>
- Final Cut Pro for iPad — the jog wheel: <https://support.apple.com/guide/final-cut-pro-ipad/make-precise-edits-with-the-jog-wheel-dev06c7d60ae/ipados>
- OnForm (two scrubbing tools, frame-by-frame): <https://onform.com/>; SlowMo scrub wheel: <https://apps.apple.com/us/app/slowmo-video-analysis/id843274461>
- ExoPlayer seek parameters (EXACT is the default): <https://takusemba.medium.com/deep-understanding-of-seek-4e10079165ec>
- CameraX video capture architecture and use-case combinations: <https://developer.android.com/media/camera/camerax/video-capture>; <https://developer.android.com/media/camera/camerax/architecture>
- IronPal: `ironpal-imu-camera-sync-plan.md` §1.2 (VFR, PTS rule), §4.4 (clock model), §5 (residual classes); `video-analysis-kb/frame-extraction.md` (per-rig rotation); `sensor-fusion.md` (discriminators).
