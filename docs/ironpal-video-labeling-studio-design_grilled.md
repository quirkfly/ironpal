# Grilled — Video Labeling Studio Design (auto mode)

Decisions resolved on **2026-09-14** against
[`ironpal-video-labeling-studio-design.md`](ironpal-video-labeling-studio-design.md), **without user
interaction**: each question was posed and answered by walking the design tree, in order, one branch
at a time.

Provenance tags — read them before trusting anything below:

- **EVIDENCE** — answered from the codebase, docs, sibling projects, vendor documentation or a
  measurement; the source is cited.
- **ASSUMED** — the answer that would have been recommended in an interactive session; one line of
  rationale and the strongest argument against, so it can be vetoed cheaply.
- **OPEN** — not mine to settle (money, legal, external publishing). None in this review.

Every resolved decision is folded into the design in place. This ledger is the only record of
*which* statements in the design were decided by evidence and which were invented.

**Tally: 40 questions — 14 EVIDENCE · 26 ASSUMED · 0 OPEN.**

**Worth a veto first (riskiest assumptions, in order):**

1. **Q8 — a short-GOP scrub proxy instead of a native frame stepper.** The whole "feel" of the
   wheel rests on it, and its 50 ms step budget is unmeasured. Fallback is designed; the spike is
   S0's first measurement.
2. **Q34 — `VideoCapture + ImageAnalysis` bound without `Preview` on the A52.** If the device
   refuses the pair, the glance still moves to ingest; that changes the ARM cue's timing story.
3. **Q21 — free mark placement in the Studio**, reversing the PRD ledger's Q9 for this tier only.
   The snap and the off-peak flag are the guard; if dogfood shows moved marks hurting integrity,
   the override is the first thing to remove.
4. **Q3 — the Studio ships to all users, not founder-only.** A founder-only Studio in P1 would cut
   two weeks from the plan and defer the queue.
5. **Q38 — XP rules: once per set, +20 intel bonus for resolving a queue item.** Any bonus is an
   invitation to farm; the gates are the defence, and the number is a guess.

---

## Branch A — Scope and placement

### Q1 — One labeling surface or two?

**ASSUMED — two tiers, one store.** The Debrief keeps its ≤ 20 s median target (PRD §7.4, §12,
risk R1: "if median exceeds 30 s, cut rep-mark editing") and stays toggle-only; the Studio takes
everything that needs minutes. Both write through `evaluateGates` and the learner.
*Against:* one richer Debrief with "advanced" disclosure is less code. It would also be the thing
R1 warns about, and the rest period is the wrong place to scrub frames with a loaded bar nearby (G6).

### Q2 — Does the app already record video the Studio could replay?

**EVIDENCE — no.** `CameraModule.kt` binds `ImageAnalysis` only (`captureSharpestStill`,
`captureFrameSequence`); `grep -rn "VideoCapture\|MediaRecorder\|mp4" poc/mobile/{src,android/app/src/main}`
returns nothing. The PRD's FR-C2 (per-set clips) is P1 work that has not started.
**Decision:** clip capture (§11.1) is in scope of this design, and S0 builds it.

### Q3 — Who gets the Studio: every user, or the founder behind the `founder` role?

**ASSUMED — every user**, because the queue (§7.9) is how a lifter's own store gets accurate, and
accuracy is the product's promise (PRD §3 "what the persona will not tolerate"). The founder-only
parts (Import & sync) stay behind the role.
*Against:* founder-only in P1 is smaller and defers gesture polish until the loop is validated. The
plan keeps that option: S3 is founder-only and S4's exit is the go/no-go for beta exposure.

### Q4 — Are clips without IMU (gallery files, KB case clips) allowed in?

**ASSUMED — yes, as video-only sets** that write exemplars, weight priors and a declared count but
**no templates**, and never count toward Campaign-1 certification. The honesty rule (PRD §5.3) and
the transfer table (PRD §1.4: IMU is body, video is gym) decide what they may teach.
*Against:* two kinds of `labeled_sets` complicate the learner. One column (`imu_available`) and a
banner is the whole cost, and the founder's KB clips become labelable in-app.

### Q5 — What is it called in the game?

**ASSUMED — *After Action*.** The shooter genre's after-action review / replay room; it fits the
ARM → FIRE → DEBRIEF rhythm (design §17.1) as the thing you do *after* the rounds, and passes C6
(no third-party names). Engineering name: the Studio.
*Against:* "Replay" is plainer. It also implies replaying for points, which the game must not do.

---

## Branch B — Media stack

### Q6 — Which video player?

**EVIDENCE — `react-native-video` 6.** `../reddy/package.json` and `../rrr/package.json` run
`react-native-video ^6.19.1` with `react-native-gesture-handler ^2.30` and `react-native-reanimated
4.2.3` on **`react-native 0.84.1`** with `newArchEnabled=true` — the same RN version and
architecture as `poc/mobile` (`android/gradle.properties`). No portfolio-first spike needed.

### Q7 — Can that player seek to an exact frame?

**EVIDENCE — yes.** ExoPlayer's default `SeekParameters` are `EXACT` (frame-accurate: decode from
the previous sync frame, render the last frame ≤ target); react-native-video passes `seek(seconds)`
to `seekTo`. Seeking to `floor(pts_ms) + 1` lands on frame *i* and never on *i + 1* at ≥ 33 ms
frame spacing (§8.1). The cost of exactness is a GOP decode per seek — which is Q8.

### Q8 — Scrub the master, build a native frame stepper, or generate a proxy?

**ASSUMED — a scrub proxy** (640×360, H.264, GOP 0.25 s, rotation baked in) generated on the phone
after each set, played by the same player; the master is used for pins and OCR. Backward steps then
decode ≤ 8 frames of 360p — the NLE "proxy media" pattern (§4). The step budget (≤ 50 ms p95 on the
A52) is **measured in S0**; the fallback is a native `FrameStepper` (MediaCodec → SurfaceView, ±8
decoded frames cached) behind the same JS API (risk V2).
*Against:* a native stepper gives exact control and no transcode. It is also a second video surface
with its own lifecycle, and every rig's clip needs the proxy anyway (Q9).

### Q9 — Who makes the proxy?

**ASSUMED — Media3 `Transformer`** with `VideoEncoderSettings` for bitrate and keyframe interval,
plus `media3-effect` for the rotation, in a WorkManager job. Hardware codecs; ≤ 0.5 × clip duration.
*Against:* if the keyframe-interval setting turns out not to be honoured by the device encoder, the
fallback is a direct `MediaCodec` encode loop with `KEY_I_FRAME_INTERVAL`; the job's interface does
not change. Checked in S0 by reading the proxy's sync-sample spacing back with `MediaExtractor`.

### Q10 — How is a "frame" identified?

**EVIDENCE — by its PTS from a per-clip table, never `index / fps`.** The sync plan §1.2 measured
the ShenYao capture as VFR (21.7 → 29.8 fps across one clip, header 25.41 average) and made the PTS
rule load-bearing; `MediaExtractor` yields sample times at ingest. The frame HUD shows the *local*
rate for the same reason.

### Q11 — Where does rotation happen?

**EVIDENCE — per rig, baked into the proxy.** The rotation values are measured facts
(`frame-extraction.md` per-rig table: A52 headband 90° `transpose=2`, ELP 180°; case 007's
upside-down misread is the cautionary tale). Baking into the proxy removes runtime transforms and
letterbox maths; the master stays raw and pins are rotated at extraction.

### Q12 — Filmstrip source?

**ASSUMED — `MediaMetadataRetriever` on the proxy**, `OPTION_CLOSEST_SYNC` at one frame per second
(sync frames every 0.25 s make "closest sync" ≤ 125 ms off, invisible on a strip), 96 px, one JPEG
sprite per clip; ≥ 8× zoom uses the player's own decoded neighbours.
*Against:* extracting from the master is sharper. It is also 4× slower for a strip nobody zooms into.

---

## Branch C — Timeline and navigation

### Q13 — What is the timeline's clock?

**EVIDENCE — host time (`elapsedRealtimeNanos`), the IMU log's clock.** Sync plan §1.2: "the video
clock is the unreliable one … use the IMU as the time base and map video onto it";
`ImuSessionLogger.kt` writes `host_ns` per packet; §4.4 collapses video alignment to one scalar
(`pts0_host_ns`) for on-phone recorders. The `sync_json` record (§8.1, §12) carries exactly that.

### Q14 — Which lanes?

**ASSUMED — filmstrip · trace · gate · reps · glance · sync (+ sets in the Reel)**, each
toggleable. They are the model's own events (design §2.2: `GateEvent`, `RepEvent`, `GlanceEvent`)
plus the sync anchors, so every lane is something the learner consumes.
*Against:* fewer lanes is calmer. Gate and rejected-rep candidates are what make a wrong proposal
*explainable* (design §5), which is the point of a studio.

### Q15 — Fine navigation: buttons, scrubber, or a wheel?

**ASSUMED — two speeds: drag-to-scrub on the trace (coarse) and a jog wheel (fine)**, the pattern
Final Cut Pro for iPad and OnForm converge on (§4). Calibration: 12° per frame, acceleration to 4
frames per detent above 360°/s, 10 ms haptic per detent — tuned on the A52 in S1.
*Against:* ±frame buttons alone are simpler and are kept as the button twins; a wheel is what makes
"three frames back" one gesture instead of three taps.

### Q16 — Snap points and magnet radius?

**ASSUMED — rep tops, gate edges, glance stills, bounds, nod anchors; 12 px at current zoom.**
Snapping is what lets a coarse drag land on a rep so the wheel only does the last frames.
*Against:* magnets fight precise placement at low zoom — hence the radius shrinks in screen space
as zoom grows, and Marks mode drags snap to the *peak*, not to the marker (Q22).

### Q17 — Hardware volume keys as frame step?

**ASSUMED — available, off by default.** They steal media volume from a user listening to music
and add nothing the wheel does not; a setting costs little.
*Against:* camera apps do it and some users expect it. That is what the setting is for.

### Q18 — Portrait only, or also landscape?

**ASSUMED — portrait only in v1.** One-handed, thumb-zone transport (§4 principle 8); the A52
headband footage is portrait after un-rotation anyway. Landscape doubles the layout work for a
surface used on a sofa, not a desk.
*Against:* ELP footage is landscape and would show larger. The viewer is 34 % of the screen either way.

### Q19 — Gesture map (CVAT's hotkeys, on glass)?

**ASSUMED — the §7.5 table**, with every gesture given a button twin and a long-press cheat sheet
(CVAT's `F1`). Double-tap = ±1 rep rather than ±10 s because reps are the unit of work here.
*Against:* YouTube trained double-tap as ±10 s. The cheat sheet and the button twins cover the
first week.

---

## Branch D — Labels

### Q20 — Bounds editable in the Studio?

**ASSUMED — yes, with handles that snap to gate edges and to first/last mark ± ½ cycle**, and the
`motion` gate evaluated live in the save bar. The Debrief still cannot trim.
*Against:* wrong bounds could be fixed by re-recording. A gate that opened on the walk-in is a
common, cheap-to-fix case and re-recording costs a set under load.

### Q21 — Free rep-mark placement in the Studio (PRD ledger Q9 said toggle-only)?

**ASSUMED — yes, in the Studio only; the Debrief stays toggle-only, so Q9 stands where it was
made.** Grounds: the PRD itself pre-registers "add mark at playhead" as the first addition once the
detector misses > 5 % of peaks; the Studio is the tier with the time budget for it; and today an
under-count teaches the store fewer rep windows than reps (§1). Every placement snaps (Q22) and
carries a `snapped` flag so the learner can down-weight overrides.
*Against:* the > 5 % trigger has not been measured yet. If dogfood shows placed marks hurting
integrity, removing the off-peak override is one line.

### Q22 — The placement convention and the snap?

**EVIDENCE — snap to the local maximum of the band-passed rep channel; convention = top of the
rep.** PRD §7.4 froze the convention; design D2 already re-aligns causal peaks with a zero-phase
pass at set end, which is the same search the snap runs (`peakNear`, §10.2).

### Q23 — Snap window ±150 ms — can it reach a neighbouring peak?

**EVIDENCE — no.** The package's rep band tops out at 1.5 Hz (`rep_band_hz: [0.2, 1.5]`, design §8),
so a cycle is ≥ 667 ms and a half-cycle ≥ 333 ms > 150 ms; and 150 ms is the lower bound of the
RepClock's own confirmation window (`s_conf_ms: [150, 400]`), i.e. the scale at which a peak is
already ambiguous. Wider than that would snap to head-bob blips; narrower would miss the true top on
a slow grind.

### Q24 — How is the exercise chosen, given that 14 of 15 Campaign-1 exercises share one motion bucket?

**ASSUMED — candidates with evidence → Compare → field-guide line → search/browse → consistency
check (§7.7, §9.3).** The confusability is evidence (PRD §5.2b); the discriminator content already
exists in the KB (`sensor-fusion.md` curl-vs-raise, case 002's grip rule, case 003's "trace the
cable") and ships as `package.field_guide`, so copy is a package change (design §5 rule).
*Against:* a grid of 15 buttons is faster for a user who already knows. The grid is still there,
below the candidates.

### Q25 — A consistency check before save?

**ASSUMED — yes, via `previewIntegrity`** (campaign LOO with the candidate template added, no
write): "matches your other goblet squats at 0.91 · nearest other: front squat 0.62", plus the
demotion the label would cause. Cost is one kNN + top-8 DTW pass (design §12: tens of ms).
*Against:* it is one more number on a save bar. It is also the only moment the user can see a
wrong label *before* it enters the store.

### Q26 — Propagate a label to following sets?

**ASSUMED — exercise only, offered (never applied silently), when the next sets' kNN distance to
this set is below `T_imu_high` and the glance crops agree.** CVAT's propagate reshaped for blocks of
sets. Reps and weight stay per set.
*Against:* the glance-agreement test needs exemplar crops that may not exist yet; then the offer
falls back to the IMU distance alone and says so.

### Q27 — Marks-vs-count disagreement?

**ASSUMED — resolved with one question at save, never saved inconsistent.** The Debrief permits a
typed count that disagrees with the marks (`repsConfirmed` vs `repTopsSec`); the Studio is where
that is fixed, because a count without marks yields no rep windows to fit.

---

## Branch E — Model integration

### Q28 — Can the engine analyse an arbitrary time range today?

**EVIDENCE — no.** `SignalModule.endSet` slices `ImuPipeline.snapshot(seconds)` — the ring buffer —
and `poc/README.md` lists "sets are sliced from the IMU ring buffer rather than the session
recorder's `imu.jsonl`" as a P0 deviation. Regions, split, merge, relabel of a past set and imported
sessions all need `slice(sessionId, t0, t1)` over the log.
**Decision:** closing that deviation is S0's first task; `endSet` moves onto the same slice so both
tiers analyse the same bytes.

### Q29 — Relabel semantics?

**ASSUMED — delete the set's templates and exemplars, then `commit` again, in one transaction;
`revision++`, `label_source='studio'`; levels may go down.** `learner.ts` has no relabel today
(grep). Honesty: a store that just lost a set can legitimately lose Provisional, and the demotion
preview (Q25) says so before save. `rep_marks` becomes a superset schema (`{t, snapped}` objects or
legacy seconds; readers accept both) so no migration is needed.
*Against:* "edit in place" (keep templates, change the label) is cheaper. It would also keep rep
windows sliced at marks the user just moved.

### Q30 — Dismissed regions and negative harvesting?

**EVIDENCE — a dismissed region is excluded from negative harvesting and from future scans.** PRD
R11 / design §4.1: periodic windows are never harvested as `unknown`; a region is by definition
periodic, and a dismissal reason ("was rest") is a label the learner must not contradict.

### Q31 — User pins vs IMU-picked exemplar frames?

**ASSUMED — a user pin outranks the automatic frame of the same role; one user pin per role per
set; pins are crops.** Human-chosen implement crops are what the vision arbiter and the gym pack
want (PRD §6.5: "cropped implement/stack frames, never wide frames").
*Against:* users may pin pretty frames rather than useful ones. The Pins sheet's one line ("crop to
the implement") and the pack review queue (PRD R14) are the guard.

### Q32 — Do video-only sets write templates?

**EVIDENCE — no.** The model is the IMU template store (PRD §6.1; model design §3.5); a clip with
no IMU has no window to store. What it can write — exemplars, weight priors, a declared count — is
exactly the "what transfers" table (PRD §1.4).

### Q33 — Export format?

**EVIDENCE — `predictions.json`-compatible rows for `score_reps.py` / `score_weights.py`.** The
scorers already encode the rules (`imu` → exact integer; others → range ≤ 2 wide; four-state
weight), so in-app labels can be graded against the KB ground truth without a converter.

---

## Branch F — Capture and sync

### Q34 — Can the app record video *and* keep the glance sharpness analysis running?

**ASSUMED — bind `VideoCapture + ImageAnalysis` without `Preview`; verify on the A52 on S0 day
one.** Vendor documentation guarantees `Preview + VideoCapture + ImageAnalysis` only on LEVEL_3
devices; the two-stream pair is PRIV + YUV, the same class as the already-supported
`Preview + ImageAnalysis`, and CameraX documents recording without a preview. Fallback if refused:
`VideoCapture` alone, glance still chosen at ingest from the clip's glance window with the same
variance-of-Laplacian score (§11.1, risk V5).
*Against:* the fallback moves the "target acquired" cue after the set, changing the ARM feel; the
IMU-stillness half of the cue still fires live.

### Q35 — How is an app-recorded clip synced to host time?

**ASSUMED — `ImageAnalysis` sensor timestamps (on `CLOCK_BOOTTIME` when
`SENSOR_INFO_TIMESTAMP_SOURCE = REALTIME`) pin `pts0_host_ns` at the first frame after
`VideoRecordEvent.Start`; class `exact`. If the source is `UNKNOWN`, use the `Start` event's host
time and class `accept`. Either way the session's three nods are cross-checked at ingest
(gyro spike vs proxy frame-difference spike) and a residual > 40 ms downgrades the class.** The
nod check reuses the sync plan's own validation and costs nothing the user has not already done.
*Against:* the encoder's first PTS may not be the first analysed frame. The nod check exists to
catch exactly that; the physical drop test (sync plan §5) runs once in S0.

### Q36 — ShenYao alignment on the phone or on the laptop?

**EVIDENCE — laptop in v1 (`scripts/kb/sync_imu_video.py` → `session.json`), on-device in v1.1.**
The script exists, is self-tested and validated on hardware (sync plan §4.4: −52.8 ppm measured);
the rig is founder-only and being replaced by the production module; and a continuous ShenYao
master is 28 GB/h (sync plan §7) — it cannot live on the phone under a 2 GB cap, so the import
brings per-set proxies and set-window cuts, which the laptop step produces anyway (risk V12).

### Q37 — Retention of proxies?

**ASSUMED — proxies follow the master's `clip_state`**; a pinned clip keeps both; the storage
meter shows master / proxy / exemplar. FR-D1's 7-day rule is unchanged.
*Against:* keeping proxies longer would let users review old sets. It would also keep bystander
footage longer, which R5 argues against.

---

## Branch G — Game

### Q38 — XP for Studio work?

**ASSUMED — a set earns XP once, through the gates, whichever tier saved it; relabels earn
nothing further; resolving a queue item whose set then passes earns base XP + 20 "intel";
dismissals earn nothing; no penalties.** PRD R2 ("users tag junk for XP") is the constraint; the
gates plus once-per-set make farming impossible; the intel bonus pays for the work the model
actually asked for.
*Against:* any bonus invites optimisation. If the queue burn-down metric shows drive-by dismissals
or churn, the bonus goes to zero — it is package config.

### Q39 — New generated art for the Studio?

**EVIDENCE — none; the wheel, marks, handles and pin are code-drawn SVG.** Design §17.6 records
that the first Leonardo attempt turned a hit marker into a 3D crystal and that precision glyphs are
not a diffusion job; the Studio's glyphs are all precision glyphs. Backdrops reuse `bg_debrief`.

---

## Branch H — Verification

### Q40 — How can Maestro test frame navigation deterministically?

**ASSUMED — a bundled 20 s 360p fixture clip with a burned-in frame counter and a synthetic IMU
fixture carrying a known `sync_json`; flows assert the Studio's own frame HUD (`studio-frame`),
never OCR of the video.** Same harness discipline as `e2e/README.md` (ids not text; wait on values;
no `clearState`).
*Against:* a real KB clip would be more honest footage. It would also carry the founder's living
room into the test bundle and cannot yield an assertable frame index.
