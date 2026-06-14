# Sensor fusion for disambiguation (product path)

The product headband carries a mini-camera **plus a full IMU** (accelerometer, gyroscope,
magnetometer). The IMU sits on the **head**, so it measures **head pose/motion, not the arm or the
implement**. That fact dictates the division of labor below. (The offline KB clips analysed so far
are vision-only; this doc is how the *product* resolves what vision alone can't.)

## Division of labor

| Sub-decision | Who decides | Why |
|---|---|---|
| Squat-class vs standing vs press (head moves) | **IMU** | Distinct head translation/pitch fingerprints |
| Rep count & turnaround timestamps | **IMU** | Clean periodicity; robust to video blur |
| World-vertical / true implement height | **IMU** | Gravity vector removes head-tilt confound |
| Curl vs raise, and any **head-still** pair | **Vision** | Differentiator is at the arm — invisible to a head IMU |
| Equipment ID & weight read | **Vision** | Detail/text — camera only |

**Rule:** IMU collapses the candidate set to a small binary and timestamps the decisive frame;
vision makes the fine call on that frame; enrollment templates ground it in the user's own data.

## The head-tilt confound (resolved)

Curl/press/raise got confused in case 001 because **head tilt shifted the dumbbell's apparent
height** — "shoulder height" read as "near the head." The IMU measures head pitch directly, so
reproject apparent height → true world-vertical height and the confound disappears.

## Head-still pairs need vision: curl vs raise discriminators

When the head stays still in both exercises (curl vs front/lateral raise), the IMU **cannot** decide.
Vision reads, on the IMU-selected top-of-rep frame:

| Cue | Biceps curl | Front/lateral raise |
|---|---|---|
| Moving segment | Elbow **flexes**, upper arm pinned | Arm **straight**, pivots at shoulder |
| DB distance from torso at top | **Close** (shoulder/chest) | **Far** (~arm's length) |
| Forearm/wrist | Supinating, palm toward face | Pronated, palm down/forward |
| Endpoint in frame | Near chin, center, high | Front or side, shoulder height |

Extraction: BlazePose/MediaPipe Hands for elbow angle + hand orientation; implement trajectory
radius (short arc near body = curl, long arc to arm's length = raise); multimodal LLM binary on the
endpoint frame; **enrollment nearest-neighbor** against the user's own saved curl/raise exemplars
(per POC enrollment design — save sensor + video together).

Applied to case 001: dumbbell ended **near the body, high near the face** → favours **curl** over
front raise. (Still pending ground-truth reveal.)

## IMU for rep counting — accuracy gains and ambiguity resolution

Every rep-count ambiguity that vision hit on case 001 maps to an IMU resolution. The IMU samples at
100–200 Hz (vs 30 fps video, often subsampled to 2 fps), so it never aliases a turnaround and gives
a clean periodic signal to peak-detect.

| Video ambiguity (case 001) | How the IMU resolves it |
|---|---|
| **Aliasing** — fast turnaround falls between sampled frames | 100–200 Hz sampling captures every turnaround; peak-detect the dominant axis |
| **Simultaneous vs alternating** (2×/÷2) | Appears as **one vs two interleaved frequency components** in the trace |
| **Per-hand cross-check** (lifter's method: count each arm, cross-check) | Runs on the **yaw channel** — alternating glances at the active arm = alternating head-yaw; yaw-left vs yaw-right counts cross-check |
| **Head-bob false peaks** inflating the count | Rep cadence is the periodic component; aperiodic head jitter is filtered, not counted |
| **Set boundaries** — pickup/set-down look like partial reps | The rhythmic periodic segment is the set; aperiodic pickup/set-down is excluded by segmentation |
| **Partial reps** | Amplitude threshold on the waveform distinguishes full-ROM from partial |

**Critical caveat — the IMU is on the HEAD, so its rep signal is exercise-dependent:**
- **Head-moving exercises** (squat, Bulgarian split squat, anything with vertical head translation):
  strong, clean rep signal → IMU is the primary, high-accuracy rep counter.
- **Head-still arm exercises** (biceps curl — case 001 — lateral/front raise, triceps pushdown): the
  head barely moves, so the head IMU's *direct* rep signal is **weak**. Resolution then leans on:
  (a) the **glance/yaw** signal *if* the user looks at the working arm (not guaranteed);
  (b) otherwise **vision stays primary for reps** and the IMU mainly supplies the world-vertical +
  set segmentation; (c) a **wrist/forearm IMU** would solve it directly, but the product is
  headband-only — a known limitation to design around.

So "IMU improves rep counting" is true and large for head-movers, and **partial** for head-still arm
work. Case 001 (alternating curl, head-still) is precisely the hard case: video got 6±1 but couldn't
certify; the head IMU alone wouldn't fully certify it either unless the lifter glances per rep. This
is the strongest argument in the corpus for either (i) a wrist IMU in a later hardware rev, or
(ii) IMU(class/segmentation) + vision(count) fusion for arm-only lifts.

## Hard limit — field of view

All vision arbitration fails if the arm/implement is never in frame. **Hardware requirement:** the
mini-camera needs a **wide, slightly-downward FOV** that keeps the lifting arm in view through the
rep. Lock this in the POC→MVP camera selection.

## Fusion pipeline

1. IMU @100–200 Hz → fused head-orientation quaternion.
2. IMU fingerprint → coarse class (eliminates most candidates; head-still ⇒ narrow to a binary).
3. IMU periodicity → rep count + turnaround timestamps.
4. Reproject implement height via head orientation.
5. Vision on IMU-chosen endpoint frames → fine discriminator + equipment + weight.
6. Fuse confidences → exercise + reps (IMU) + weight (vision).
