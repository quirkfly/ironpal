# IronPal MVP — Phase 0 Execution Plan

## Phase 0: Research & Validation (Weeks 1-4)

**Objective:** Prove the core technology works before committing to production code or hardware procurement. Secure a partner gym. Exit this phase with a clear go/no-go decision based on measured accuracy and validated assumptions.

**Entry Criteria:** Project kickoff, team assembled, OpenAI API access provisioned.
**Exit Criteria:** Go/no-go gate passed — gpt-5-nano achieves ≥75% exercise recognition accuracy on test data, partner gym agreement signed, equipment audit complete.

---

## Workstream Overview

Phase 0 runs four parallel workstreams:

| Workstream | Focus | Lead | Weeks |
|---|---|---|---|
| **WS-A: Prompt Engineering & Accuracy Testing** | Validate gpt-5-nano for exercise recognition, weight reading, rep counting | AI/Backend | 1-4 |
| **WS-B: On-Device Feasibility** | Validate MediaPipe Pose on used Android hardware | Mobile | 1-3 |
| **WS-C: Partner Gym & Equipment Audit** | Secure gym, catalog equipment, determine camera positions | Business | 1-4 |
| **WS-D: Privacy & Legal** | Consent forms, data policy, legal review | Business/Legal | 2-4 |

```
Week:     1          2          3          4
         ┌──────────────────────────────────────┐
WS-A:    │ Collect data → Prompt dev → Test → Report │
         └──────────────────────────────────────┘
         ┌───────────────────────────┐
WS-B:    │ Procure → Setup → Benchmark │
         └───────────────────────────┘
         ┌──────────────────────────────────────┐
WS-C:    │ Outreach → Visit → Audit → Agreement  │
         └──────────────────────────────────────┘
                   ┌────────────────────────────┐
WS-D:              │ Draft → Review → Finalize   │
                   └────────────────────────────┘
                                                 ▼
                                           GO / NO-GO
```

---

## Workstream A: Prompt Engineering & Accuracy Testing

This is the critical-path workstream. If gpt-5-nano cannot reliably identify exercises from gym footage, the project is not viable. Everything else depends on this validation.

### Task A1: Build Test Dataset (Week 1)

**Objective:** Assemble a diverse collection of gym video clips and still frames covering the target exercise set.

| Sub-task | Details | Done When |
|---|---|---|
| A1.1 — Define target exercise list (draft) | List 15-20 candidate pin-loaded machine exercises for MVP. Final list depends on equipment audit (WS-C), but start with the most common: lat pulldown, chest press, shoulder press, leg extension, leg curl, leg press, seated row, pec deck, rear delt fly, cable tricep pushdown, cable bicep curl, hip abductor, hip adductor, cable fly, cable crunch. | List documented |
| A1.2 — Self-record gym footage | Visit a gym (any gym) with a phone. Record 3-5 sets of each target exercise from tripod-like angles (side 45°, 1.5-2m distance). Capture both the user exercising and the weight stack in frame. Record in 1080p. | ≥50 video clips, 3+ per exercise |
| A1.3 — Supplement with public footage | Search YouTube/social media for gym workout clips showing pin-loaded machines. Download clips that show clear exercise execution with visible weight stacks. Use these to expand dataset diversity (different people, gyms, lighting). | 20+ supplemental clips from ≥3 different gym environments |
| A1.4 — Extract test frames | From each clip, manually extract key frames: (a) start position, (b) mid-rep peak contraction, (c) mid-rep full extension, (d) weight stack close-up (if visible). Label each frame with ground truth: exercise name, weight (if readable), rep count. | Frame library organized by exercise, ground truth spreadsheet |
| A1.5 — Create difficulty tiers | Categorize each clip/frame set by difficulty: **Easy** (clear angle, good lighting, obvious machine), **Medium** (moderate occlusion, dim lighting, ambiguous angle), **Hard** (partial view, poor lighting, similar-looking exercises). | Each clip tagged with difficulty tier |

**Resources:**
- Personal gym access (day pass: ~$10-15) or a friend's gym membership
- Phone capable of 1080p recording (personal phone is fine)
- Portable tripod or phone stand (~$15)

**Assigned to:** AI/Backend lead

**Risks & Mitigations:**
| Risk | Mitigation |
|---|---|
| Can't access a gym for recording | Use public YouTube footage as primary dataset; recruit a friend who has a gym membership |
| Insufficient exercise diversity | Focus on the 10 most common machines first; expand list after equipment audit |

#### A1 Exercise Descriptions — Compound Leg Movements

The following exercises are priority targets for the test dataset. Each description covers the movement pattern, equipment involved, key body positions, visual landmarks for the LLM, and recording guidelines.

---

##### 1. Squat (Barbell Back Squat)

**Equipment:** Power rack / squat rack, Olympic barbell, weight plates.

**Exercise classification:** Free-weight compound exercise. Primary muscles: quadriceps, glutes, hamstrings. Secondary: core, erector spinae, adductors.

**Movement description:**
1. **Setup:** The lifter approaches the barbell resting on J-hooks inside a squat rack at approximately upper-chest / shoulder height. They duck under the bar and position it across the upper trapezius (high bar) or rear deltoids (low bar). Hands grip the bar wider than shoulder-width. They unrack by extending the knees, then take 1-2 steps backward to clear the rack.
2. **Descent (eccentric):** The lifter bends at the hips and knees simultaneously, lowering the torso until the hip crease drops to at least the level of the knee (parallel) or below. The back maintains a roughly 45-70° angle from horizontal. Heels stay flat on the ground. Knees track outward over the toes.
3. **Bottom position:** Moment of deepest squat. Hip crease at or below the top of the knee. Torso inclined forward. This is the key frame for rep detection — maximum knee and hip flexion.
4. **Ascent (concentric):** The lifter drives upward through the feet, extending hips and knees simultaneously until standing fully upright. The bar path should be roughly vertical when viewed from the side.
5. **Lockout:** Full hip and knee extension at the top. This is the second key frame — the "standing" position that bookends each rep.

**Visual landmarks for the LLM:**
- Barbell positioned horizontally across the upper back/shoulders.
- Squat rack structure (vertical metal uprights, J-hooks, safety bars) visible in background.
- Weight plates loaded on both ends of the barbell (visible as circular discs — number and size indicate weight).
- During descent: torso leans forward, knees bend deeply, bar moves downward.
- During ascent: reverse of descent, lifter returns to standing.

**Weight detection approach:**
- Plates are loaded on the barbell ends. Standard plate sizes: 20 kg (red, large diameter), 15 kg (yellow), 10 kg (green), 5 kg (white), 2.5 kg (small, dark/black), 1.25 kg (very small). Colors follow IWF standard but not all gyms comply.
- Most gym plates have the weight number printed/embossed on the face. The LLM should attempt to read plate labels or count plates by size.
- The barbell itself weighs 20 kg (standard Olympic) — this must be added to the plate total.
- **Difficulty:** Medium-High. Plates can overlap when multiple are loaded (only the outermost plate face is visible). May require supplementary user input for weight confirmation.

**Rep counting cues:**
- One rep = one full descent-to-standing cycle.
- Key signals: vertical position of the bar (lowest point = bottom of rep, highest = lockout), angle of the torso (most inclined at bottom, most upright at top), knee angle (most bent at bottom, straight at top).

**Recording guidelines:**
- **Best camera angle:** Side view at 45°, 2-3m away, capturing the full rack and the lifter from head to feet.
- **Critical to capture:** The weight plates on the bar (film a quick close-up of the loaded bar before the set begins), the full range of motion from standing to bottom position.
- **Common issues:** Rack uprights may occlude parts of the lifter. Mirror reflections may create confusing duplicates. Other gym-goers may walk through the frame.
- Record at least: 3 sets of 5 reps each, from 2 different angles (side 45° and rear 45°).

---

##### 2. Deadlift (Conventional Barbell Deadlift)

**Equipment:** Olympic barbell, weight plates, flat floor (often a deadlift platform or rubber matting).

**Exercise classification:** Free-weight compound exercise. Primary muscles: posterior chain — hamstrings, glutes, erector spinae. Secondary: quadriceps, trapezius, forearms (grip), core.

**Movement description:**
1. **Setup:** The barbell is on the floor, loaded with plates. The lifter stands with feet hip-width apart, shins close to (or lightly touching) the bar. The bar should be over the mid-foot. The lifter bends at the hips and knees to grip the bar just outside the knees (double overhand, mixed grip, or hook grip). Back is flat (neutral spine), chest is up, shoulders are slightly in front of or directly over the bar. Arms are straight.
2. **Lift-off / first pull (concentric — floor to knees):** The lifter drives through the floor with the legs while maintaining back angle. The bar breaks contact with the floor and rises vertically. The knees extend first, and the bar passes up the shins. The back angle stays relatively constant during this phase.
3. **Second pull (knees to lockout):** Once the bar clears the knees, the hips drive forward aggressively (hip extension). The torso becomes progressively more upright. The bar slides up the thighs.
4. **Lockout:** Full hip and knee extension. The lifter stands tall — shoulders back, hips fully extended, knees straight. This is the top of the rep.
5. **Descent (eccentric):** The lifter reverses the movement — hips push backward first (hinging), then the knees bend as the bar passes below the knees. The bar returns to the floor under control (or is dropped in some training contexts).

**Visual landmarks for the LLM:**
- Barbell on the floor at the start (distinctive — no other exercise starts with a loaded bar on the floor at the lifter's feet).
- No rack or machine structure — just the lifter, a barbell, and the floor. Maybe a deadlift platform (wooden center, rubber sides).
- The lifter's torso is nearly horizontal at the start position (much more bent-over than a squat).
- The bar travels from floor to hip-height (short vertical range compared to squat).
- Plate diameter is visible from the side — standard 20 kg / 45 lb plates have 450 mm diameter.

**Weight detection approach:**
- Same plate-reading approach as squat — read the outermost plate label, count visible plates by size.
- Advantage over squat: when the bar is on the floor between reps, the plates are at a consistent, eye-level height relative to a camera at 1-1.5m, making plate labels potentially more readable.
- Barbell = 20 kg to add to the plate total.
- **Difficulty:** Medium. Similar to squat. Bumper plates (uniform diameter regardless of weight) make counting by plate thickness harder — label reading becomes essential.

**Rep counting cues:**
- One rep = bar leaves floor → lifter stands up → bar returns to floor.
- Key signals: bar vertical position (floor vs. hip height), torso angle (near-horizontal at bottom vs. vertical at lockout), whether plates are touching the ground (bottom of rep).
- **Important distinction:** Some lifters "touch and go" (brief floor touch between reps), while others do "dead stop" reps (full pause on floor). Both count as reps. The LLM must not confuse a pause between reps with the end of the set.

**Recording guidelines:**
- **Best camera angle:** Side view at 45°, 2-3m away. The side view best captures the bar path and torso angle changes. A front/rear view loses depth information.
- **Critical to capture:** The loaded bar on the floor (for weight identification), the full lift from floor to lockout, and the return to the floor.
- **Common issues:** In busy gyms, deadlifts often happen in open floor areas where other people may walk between the camera and the lifter. The lifter's body may occlude the plates from some angles.
- Record at least: 3 sets of 5 reps, from side 45° and front 45° angles.

---

##### 3. Hack Squat on Machine (Hackenschmidt Machine)

**Equipment:** Hack squat machine — an angled sled-and-rail system where the user stands on a fixed footplate and pushes a weighted sled up an inclined track (typically 45°). Weight is loaded via plate pegs on the sled.

**Exercise classification:** Machine compound exercise (plate-loaded, **not** pin-loaded). Primary muscles: quadriceps. Secondary: glutes, hamstrings.

**Movement description:**
1. **Setup:** The lifter steps onto the machine's foot platform facing outward (back resting against the padded sled). Feet are placed shoulder-width apart on the platform, positioned mid-height or slightly higher. The shoulders press against the shoulder pads. The lifter unracks the sled by straightening the legs, then releases the safety handles/locks on either side.
2. **Descent (eccentric):** The lifter bends the knees and hips, allowing the sled to slide downward along the angled rails. The back remains pressed against the sled pad. The descent continues until the thighs are at or below parallel to the foot platform (approximately 90° knee angle or deeper).
3. **Bottom position:** Maximum knee flexion. The lifter's hips are at their lowest point on the machine. The sled is at its lowest position on the rails. This is the key frame for rep detection.
4. **Ascent (concentric):** The lifter drives through the feet, extending the knees and hips to push the sled back up the rails. The sled rises along the track.
5. **Lockout:** Legs nearly fully extended (most lifters stop just short of full knee lock to maintain tension). The sled is at its highest point.

**Visual landmarks for the LLM:**
- Distinctive machine structure: large angled metal frame with two steel guide rails. Usually at 45° incline.
- Shoulder pads at the top of the sled.
- The lifter faces outward (away from the machine), with their back resting against the sled.
- Weight plates are loaded onto plate pegs on either side of the sled (not a weight stack with a pin — these are standard plates that must be slid on and off manually).
- The sled moves up and down along the angled rails.
- The foot platform is fixed and large (wide metal or rubber surface).

**Weight detection approach:**
- Plate-loaded machine: weight plates are loaded onto horizontal pegs on the sides of the sled, similar to a leg press.
- Plates are visible from the side — the LLM needs to read plate labels or estimate from plate count and thickness.
- Like barbell exercises, the outermost plate label is easiest to read. Multiple plates stack behind each other.
- The machine sled itself has a base weight (typically 20-40 kg depending on manufacturer) — this is usually printed on the machine frame but may be hard to read from camera distance.
- **Difficulty:** Medium-High. Plates are at an angle and may be partially occluded by the machine frame. The camera angle needs to capture the plate pegs clearly.

**Rep counting cues:**
- One rep = sled at top → descends to bottom → returns to top.
- Key signals: vertical position of the sled on the rails (observe the sled/shoulder pad moving up and down), degree of knee bend, sound of the sled reaching bottom (not available from most video).
- The sled movement is constrained to the rail, so tracking the sled position is highly reliable for rep counting.

**Recording guidelines:**
- **Best camera angle:** Side view at 30-45°, 2m away. This captures both the lifter's knee angle and the plate pegs on the near side of the machine.
- **Critical to capture:** The plates loaded on the sled (close-up before the set if possible), the full range of motion of the sled.
- **Common issues:** The machine is large and the motion is along an angled axis — a straight side view may foreshorten the movement. The plate pegs on the far side of the machine are not visible (only near-side plates can be read). Machine frame may occlude parts of the lifter.
- Record at least: 3 sets of 8-12 reps, from side view and a front-angled view.

---

##### 4. Calf Raises on Machine (Seated or Standing Calf Raise Machine)

**Equipment:** There are two common variants:
- **Standing calf raise machine:** The lifter stands on a raised platform with shoulder pads pressing down. Weight is selected via a pin-loaded stack or loaded plates. The lifter raises onto the balls of the feet against resistance.
- **Seated calf raise machine:** The lifter sits on a bench with a pad resting on the lower thighs (just above the knees). The balls of the feet are on a foot bar. Weight is loaded via plate pegs or a pin-loaded stack. The lifter raises the heels by plantar-flexing the ankles.

**Exercise classification:** Machine isolation exercise. Primary muscle: gastrocnemius (standing) or soleus (seated). Secondary: tibialis posterior.

**Movement description (standing variant):**
1. **Setup:** The lifter steps under the shoulder pads and positions the balls of the feet on the edge of the foot platform, heels hanging off. They stand upright, extending the legs fully to lift the weight off the rest position.
2. **Stretch (eccentric):** The lifter lowers the heels as far below the platform as possible, achieving a deep calf stretch. This is the bottom of the rep.
3. **Rise (concentric):** The lifter pushes up onto the toes (plantar flexion), raising the heels as high as possible. The body rises a few centimeters. This is the top of the rep.
4. **Contraction:** Brief hold at the top with calves fully contracted.
5. **Return:** Controlled lowering back to the stretch position.

**Movement description (seated variant):**
1. **Setup:** The lifter sits on the bench, places the balls of the feet on the foot bar, and positions the knee pad on top of the lower thighs. They release the safety lever.
2. **Stretch:** The lifter lowers the heels below the foot bar level, stretching the calves.
3. **Rise:** The lifter pushes up onto the toes, raising the knee pad upward. Very short range of motion (a few centimeters of vertical movement).
4. **Return:** Controlled lowering back to the stretch position.

**Visual landmarks for the LLM:**
- **Standing variant:** Lifter is upright, shoulder pads on both sides of the head/neck, feet on a small elevated platform. The range of motion is very small — only the heel rises and falls. The rest of the body stays almost stationary.
- **Seated variant:** Lifter is sitting on a bench. A pad is across the lower thighs. Only the feet/ankles move, raising and lowering. Extremely small range of motion — this is one of the hardest exercises to detect from a wide-angle camera.
- Either variant may have a pin-loaded weight stack (pin + numbered plates on the machine) or plate-loaded pegs.
- The machine itself is relatively small compared to hack squat or leg press.

**Weight detection approach:**
- **Pin-loaded variant:** Standard weight stack OCR — read the number adjacent to the pin position. Same as other pin-loaded machines.
- **Plate-loaded variant:** Read plate labels on the loading peg, same as hack squat.
- The machine's base/sled weight varies by manufacturer (typically 10-25 kg).
- **Difficulty (pin-loaded):** Medium. Weight stack is usually on the side of the machine and may be partially visible.
- **Difficulty (plate-loaded):** Medium-High. Same challenges as other plate-loaded equipment.

**Rep counting cues:**
- One rep = heels drop below platform → heels rise to maximum height → return.
- Key signals: heel/ankle vertical position (small movement — typically 5-10 cm). The knee pad (seated) or shoulder pad (standing) moves correspondingly.
- **Challenge:** This exercise has the smallest range of motion of the four described here. From a 2m camera distance, the rep movement may be only 10-20 pixels of vertical change. Higher resolution or a closer camera angle helps significantly. MediaPipe ankle keypoints are critical for detecting this movement.
- **Tip for the LLM:** Calf raise reps are fast (1-2 seconds per rep) and numerous (15-25+ reps per set is common). Expect higher rep counts than the other exercises.

**Recording guidelines:**
- **Best camera angle:** Side view at 1.5-2m, slightly lower than usual (camera at approximately knee height if possible) to amplify the visible heel movement. For seated variant, a side or front-side view at seat height.
- **Critical to capture:** The foot platform / foot bar area where the heels rise and fall. For weight identification: a close-up of the weight stack or plate pegs before the set.
- **Common issues:** The small range of motion makes this exercise difficult to see from wide angles. The standing variant may be confused with the lifter simply standing still (if the camera angle doesn't capture heel elevation). The seated variant looks like the lifter is just sitting with minimal movement.
- Record at least: 3 sets of 15+ reps, from side view focusing on the lower legs/feet. Include close-up shots of the foot platform movement.

---

#### Summary: Recording Checklist for These Four Exercises

| Exercise | Equipment Type | Weight Detection Method | Min Rep Range | Camera Priority Angle | Key Challenge |
|---|---|---|---|---|---|
| Squat | Free weight (barbell + rack) | Plate label OCR + plate counting | 3-8 reps | Side 45°, 2-3m | Overlapping plates, rack occlusion |
| Deadlift | Free weight (barbell + floor) | Plate label OCR + plate counting | 3-8 reps | Side 45°, 2-3m | Lifter body occluding plates |
| Hack Squat (Hackenschmidt) | Machine (plate-loaded) | Plate label OCR on sled pegs | 8-15 reps | Side 30-45°, 2m | Angled plates, machine frame occlusion |
| Calf Raises | Machine (pin-loaded or plate-loaded) | Pin position OCR or plate label | 15-25 reps | Side, 1.5m, lower camera | Tiny range of motion, fast reps |

**Note:** Squat and deadlift are **free-weight exercises**, not pin-loaded machines. Hack squat is typically **plate-loaded** (not pin-loaded). Only some calf raise machines use a pin-loaded stack. These exercises expand the MVP scope beyond the initial pin-loaded-only list in A1.1. Update the target exercise list accordingly and evaluate whether the LLM's accuracy on free-weight / plate-loaded exercises meets the same thresholds as pin-loaded machines.

---

### Task A2: Develop Candidate Prompts (Weeks 1-2)

**Objective:** Design and iterate on LLM prompts for three core capabilities: exercise recognition, weight reading, and rep counting.

| Sub-task | Details | Done When |
|---|---|---|
| A2.1 — Exercise recognition prompts | Design 3-5 prompt variants for exercise identification. Test on a small batch of 10 frames first. Variants should explore: (a) zero-shot with description only, (b) with exercise catalog in system prompt, (c) with chain-of-thought reasoning, (d) with camera zone context hint, (e) with user history context. | 3+ prompt variants written and tested on initial batch |
| A2.2 — Weight reading prompts | Design prompts for weight stack OCR. Variants: (a) direct "read the number" prompt, (b) chain-of-thought "describe the weight stack, identify the pin, read the adjacent number", (c) multi-frame "here are 3 views of the weight stack — what weight is selected?". | 3+ prompt variants tested on weight stack frames |
| A2.3 — Rep counting prompts | Design prompts that receive a sequence of 5-10 frames from a set and count repetitions. Variants: (a) raw frame sequence, (b) frames annotated with timestamps, (c) frames with MediaPipe keypoint overlay. | 3+ prompt variants tested on frame sequences |
| A2.4 — Combined prompt (all-in-one) | Design a single prompt that handles exercise ID + weight + reps from one API call. This is the production target (single call per set). Test whether accuracy degrades vs. separate calls. | Combined prompt tested, accuracy delta documented |
| A2.5 — Output format specification | Define the target JSON schema for LLM responses. Test that gpt-5-nano reliably produces valid JSON with the specified fields. Handle edge cases: what if the model refuses, returns free text, or hallucinates fields? | JSON schema defined, parsing logic handles malformed responses |

**Target JSON output schema:**
```json
{
  "exercise": "lat pulldown",
  "equipment_type": "pin-loaded machine",
  "weight_kg": 40,
  "weight_confidence": "high",
  "reps": 12,
  "reps_confidence": "high",
  "overall_confidence": "high",
  "alternatives": [
    {"exercise": "close-grip lat pulldown", "probability": 0.15}
  ],
  "reasoning": "User seated at lat pulldown machine, pulling wide bar down to chest..."
}
```

**Resources:**
- OpenAI API key with gpt-5-nano access
- ~$10-15 in API credits for iteration

**Assigned to:** AI/Backend lead

**Risks & Mitigations:**
| Risk | Mitigation |
|---|---|
| gpt-5-nano can't handle multi-image input well | Test with gpt-5-mini as a fallback (higher cost but potentially better accuracy); document the accuracy-cost trade-off |
| JSON output is unreliable | Add a parsing layer that retries with stricter instructions or falls back to regex extraction from free text |

---

### Task A3: Systematic Accuracy Testing (Weeks 2-3)

**Objective:** Run every prompt variant against the full test dataset. Produce a structured accuracy report.

| Sub-task | Details | Done When |
|---|---|---|
| A3.1 — Build test harness | Write a Python script that: (a) loads labeled test frames, (b) calls gpt-5-nano API with each prompt variant, (c) parses the JSON response, (d) compares to ground truth, (e) logs results to CSV. Should support batching and retries. | Script runs end-to-end, results in CSV |
| A3.2 — Run exercise recognition tests | Test all prompt variants × all exercise clips. Record: predicted exercise, ground truth, confidence, correct/incorrect, response time, token count. | All combinations tested, results logged |
| A3.3 — Run weight reading tests | Test all weight prompts × all weight stack frames. Record: predicted weight, ground truth, confidence, correct/incorrect. Categorize by: clear labels, worn labels, partially occluded, different lighting. | Results logged with condition categories |
| A3.4 — Run rep counting tests | Test all rep counting prompts × all frame sequences. Record: predicted count, ground truth, delta. | Results logged |
| A3.5 — Analyze results | Produce accuracy report: overall accuracy, accuracy per exercise, accuracy per difficulty tier, accuracy per prompt variant. Identify: best-performing prompt for each task, common failure modes, exercises that are hardest to distinguish. | Accuracy report document complete |
| A3.6 — Token and cost measurement | From the test runs, calculate: average input tokens per call (by frame count and detail level), average output tokens, actual cost per API call. Extrapolate to per-session and per-gym-per-month costs. Compare to theoretical estimates ($0.006/session). | Cost validation report, actual vs. estimated |

**Test matrix size estimate:**
- ~50 exercise clips × 3-5 prompt variants = 150-250 API calls for exercise recognition
- ~30 weight stack frames × 3 prompt variants = 90 API calls for weight reading
- ~30 frame sequences × 3 prompt variants = 90 API calls for rep counting
- **Total: ~330-430 API calls** → at ~5,400 input tokens + 250 output tokens each → ~$0.15-0.20 total cost

**Assigned to:** AI/Backend lead

**Risks & Mitigations:**
| Risk | Mitigation |
|---|---|
| Accuracy is below 75% on exercise recognition | Try: (a) more frames per call, (b) higher-detail images, (c) gpt-5-mini, (d) narrower exercise set (10 instead of 15). Document each iteration. |
| API rate limiting or outages | Implement exponential backoff in test harness; spread testing over 2-3 days |
| Results vary inconsistently between runs | Run each test case 3 times and take majority vote; document variance |

---

### Task A4: Iteration and Prompt Refinement (Weeks 3-4)

**Objective:** Based on the accuracy report, iterate on prompts to address identified failure modes.

| Sub-task | Details | Done When |
|---|---|---|
| A4.1 — Failure mode analysis | Review every incorrect prediction. Categorize failures: wrong exercise, wrong weight, wrong rep count. For each, identify root cause: bad angle, poor lighting, ambiguous exercise, LLM hallucination, OCR failure. | Failure mode catalog with counts and examples |
| A4.2 — Targeted prompt fixes | For each top failure mode (~5-10 most impactful), design a prompt modification. Examples: add explicit disambiguation instructions for confused exercise pairs, add "if you can't read the number, say unknown" to reduce hallucinated weights, add frame-ordering context for rep counting. | Revised prompts documented |
| A4.3 — Retest with refined prompts | Re-run the test harness with updated prompts on the same dataset. Compare accuracy before vs. after. | Accuracy delta documented per failure mode |
| A4.4 — finalize prompt templates | Select the best-performing prompt variant for each task (exercise, weight, reps) and the combined all-in-one prompt. Lock these as the "v1 prompt templates" to carry into Phase 1. | Prompt templates documented and version-controlled |
| A4.5 — Write Phase 0 accuracy report | Final deliverable: document with overall accuracy numbers, per-exercise breakdown, cost validation, prompt templates, known limitations, and recommendations for Phase 1. | Report reviewed by team |

**Assigned to:** AI/Backend lead

---

## Workstream B: On-Device Feasibility

### Task B1: Procure Test Devices (Week 1)

**Objective:** Purchase 2-3 candidate used Android phones to test on-device performance.

| Sub-task | Details | Done When |
|---|---|---|
| B1.1 — Select candidate models | Research available used Android phones in the $20-40 range. Prioritize: (a) 1080p rear camera, (b) runs Android 11+, (c) ≥3GB RAM, (d) available in bulk from refurbishers. Candidate models: Samsung Galaxy A12, Xiaomi Redmi Note 10, Moto G30, Samsung Galaxy A21s. | 3 candidate models identified |
| B1.2 — Purchase test units | Buy 1 unit of each candidate model from eBay, BackMarket, or a local reseller. | 2-3 phones received |
| B1.3 — Basic validation | Verify each device: boots to Android, camera works at 1080p, WiFi connects, BLE functional, can install APKs via ADB. | All devices validated |

**Budget:** ~$90 (3 phones × $30 avg)

**Assigned to:** Mobile lead

---

### Task B2: MediaPipe Pose Benchmarking (Weeks 2-3)

**Objective:** Determine if MediaPipe Pose runs adequately on cheap used Android hardware.

| Sub-task | Details | Done When |
|---|---|---|
| B2.1 — Set up MediaPipe test app | Build a minimal Android app that captures camera feed and runs MediaPipe Pose on each frame. Display the skeleton overlay on screen. Log FPS, CPU usage, RAM usage, and battery drain per minute. | App runs and displays keypoints on all test devices |
| B2.2 — Benchmark FPS | Record FPS at different camera resolutions: 480p, 720p, 1080p. Target: ≥10 FPS at 720p minimum (enough for rep counting — don't need real-time smoothness, just reliable keypoint extraction). | FPS measurements logged per device per resolution |
| B2.3 — Keypoint quality assessment | Record MediaPipe output for 10+ exercise clips. Visually inspect: are keypoints tracking correctly? Do joints drift during fast movements? Does occlusion by equipment cause tracking loss? | Qualitative assessment documented with screenshots |
| B2.4 — Thermal and battery test | Run the app continuously for 2 hours on each device (plugged in, charging limited to 80%). Monitor: device temperature, any thermal throttling (FPS drops), app crashes, battery level. | Thermal report per device, no crashes in 2-hour test |
| B2.5 — BLE scan test | While running MediaPipe, simultaneously run BLE scanning in the background. Verify that the device can detect a BLE beacon (another phone running a BLE advertising app) at 3m+ range while processing camera frames. | BLE detection confirmed at 3m concurrent with camera processing |
| B2.6 — Device selection recommendation | Based on benchmarks, recommend the best device model for bulk procurement. Document: selected model, rationale, expected FPS, thermal behavior, price point. | Recommendation document |

**Resources:**
- Android Studio + ADB setup
- MediaPipe Pose SDK (free, open source)
- BLE test app (nRF Connect or similar)

**Assigned to:** Mobile lead

**Risks & Mitigations:**
| Risk | Mitigation |
|---|---|
| MediaPipe runs <10 FPS on all test devices | Try lower-resolution input (480p), use the "lite" MediaPipe model variant, or accept lower FPS (5 FPS may suffice for rep counting since reps are slow — ~2-3 seconds per rep) |
| Devices overheat during continuous use | Reduce processing frequency (process every 3rd frame instead of every frame), ensure device is not in direct sunlight, consider removing phone case for better heat dissipation |
| BLE conflicts with camera processing | BLE scanning is low-overhead; if issues arise, alternate BLE scans (every 5 seconds) with camera processing rather than running simultaneously |

---

## Workstream C: Partner Gym & Equipment Audit

### Task C1: Gym Outreach (Weeks 1-2)

**Objective:** Identify and approach 2-3 candidate local gyms for the pilot partnership.

| Sub-task | Details | Done When |
|---|---|---|
| C1.1 — Identify candidate gyms | List 5-10 local gyms that meet criteria: (a) has ≥15 pin-loaded machines, (b) independent or small chain (easier to negotiate with owner directly), (c) not a budget mega-gym like Planet Fitness (staff won't have authority), (d) reasonable WiFi and power outlet access, (e) within easy travel distance for frequent visits. | Shortlist of 5+ gyms |
| C1.2 — Prepare pitch materials | One-page overview of IronPal for the gym owner: what it is, what the gym gets (free for the pilot, member engagement tool, future analytics), what's needed from the gym (camera placement permission, WiFi access, member consent process), timeline. | One-pager document ready |
| C1.3 — Initial outreach | Contact gym owners/managers. Introduce the project, gauge interest. Aim for in-person meetings. Be transparent: this is an early-stage pilot, cameras will be on tripods, this is research toward a commercial product. | 2-3 meetings scheduled |
| C1.4 — Site visits (preliminary) | Visit interested gyms. Walk the floor: count machines, check equipment condition, note power outlet locations, test WiFi signal on personal phone, check lighting conditions at different times of day. Take general photos (no members in frame). | Site visit notes and photos for 2-3 gyms |
| C1.5 — Select partner gym | Based on site visits: select the gym with the best combination of cooperative owner, suitable equipment count, decent WiFi, good lighting, and practical tripod placement options. | Partner gym selected |

**Assigned to:** Business lead

**Risks & Mitigations:**
| Risk | Mitigation |
|---|---|
| No gym agrees to the pilot | Offer stronger incentives: free perpetual access for the pilot period, offer to pay a small monthly fee ($50-100), position it as "exclusive early adopter" status. Expand search radius. |
| Gym owner is interested but nervous about cameras | Emphasize: no facial recognition, no video storage, pose-data only, members must opt in, cameras can be covered/removed anytime. Offer to demo the technology first. |

---

### Task C2: Partnership Agreement (Weeks 2-3)

**Objective:** Formalize the relationship with the partner gym.

| Sub-task | Details | Done When |
|---|---|---|
| C2.1 — Draft partnership terms | Key terms: (a) duration — 3-month pilot, (b) cost to gym — free, (c) IronPal provides all hardware, (d) gym provides WiFi access + power + permission to mount tripods, (e) gym assists with member consent process, (f) IronPal can use anonymized data for product development, (g) either party can exit with 2 weeks notice. | Term sheet drafted |
| C2.2 — Review with gym owner | Walk through terms. Address concerns. Negotiate if needed (the gym has leverage — be flexible). | Terms agreed in principle |
| C2.3 — Sign agreement | Simple partnership letter or MOU. Does not need to be complex legal — this is a pilot, not a commercial contract. | Signed document |

**Assigned to:** Business lead

---

### Task C3: Equipment Audit (Weeks 3-4)

**Objective:** Catalog every piece of relevant equipment at the partner gym and determine optimal tripod camera positions.

| Sub-task | Details | Done When |
|---|---|---|
| C3.1 — Complete machine inventory | Visit the gym (schedule during off-peak hours with owner permission). For every pin-loaded machine, document: (a) machine brand and model (if identifiable), (b) exercise(s) the machine supports, (c) weight stack range (min/max), (d) weight increment per plate, (e) condition of number labels (clear / worn / faded / missing), (f) machine dimensions and orientation on the floor. | Spreadsheet with all machines cataloged |
| C3.2 — Photograph equipment | For each machine, take photos from multiple angles: (a) full machine front, (b) full machine side, (c) weight stack close-up, (d) number labels close-up, (e) user exercising (self or volunteer). These photos become additional test data for WS-A. | Photo library organized by machine |
| C3.3 — Floor plan sketch | Draw a rough floor plan of the gym showing machine positions, power outlet locations, WiFi router position, and areas where tripods could be placed without blocking walkways or creating hazards. | Floor plan document |
| C3.4 — Tripod position scouting | For each machine, identify the optimal tripod position: 1.5-2m away, 30-60° side angle, capturing both user body and weight stack. Mark positions on the floor plan. Note any problem machines (e.g., machine against a wall with no room for a tripod, machine with no visible weight stack from any angle). | Annotated floor plan with camera positions |
| C3.5 — Test shots from tripod positions | Set up a tripod with a test phone at each scouted position. Take test photos/videos simulating what the camera would see during a workout. Verify: weight stack numbers are readable, full user body is visible, no excessive mirror reflections, lighting is adequate. | Test shots reviewed and approved per position |
| C3.6 — Finalize exercise list | Based on the actual equipment available, finalize the 15 exercises for MVP. Prioritize exercises where: (a) the machine is clearly identifiable, (b) weight stack labels are readable, (c) a good tripod position exists. Deprioritize or defer machines with poor camera angles or illegible labels. | Final exercise list locked |
| C3.7 — Power and WiFi mapping | Test WiFi signal strength (use a WiFi analyzer app) at every planned tripod position. Identify the nearest power outlet for each position. Document positions that need extension cords or a WiFi extender. | WiFi/power map complete, problem spots identified |

**Resources:**
- Portable tripod + test phone
- WiFi analyzer app (free — e.g., WiFi Analyzer on Android)
- Measuring tape
- Clipboard / tablet for notes

**Assigned to:** Business lead + AI/Backend lead (join for photography + test shots)

**Risks & Mitigations:**
| Risk | Mitigation |
|---|---|
| Some machines have unreadable weight labels | Document these machines as "manual weight input" candidates. Include in MVP but with weight detection disabled. Inform the accuracy target calculation. |
| No good tripod position for some machines | Consider alternative angles (ceiling-height tripod, over-the-shoulder). If truly impossible, exclude that machine from MVP scope. |
| Gym is too busy to do a thorough audit | Schedule for early morning or late evening; ask the owner for a private time slot (many gyms have off-hours where few members are present). |

---

## Workstream D: Privacy & Legal

### Task D1: Privacy Framework (Weeks 2-3)

**Objective:** Draft all legal/consent documents needed before any gym member is recorded.

| Sub-task | Details | Done When |
|---|---|---|
| D1.1 — Research applicable laws | Identify relevant regulations based on location: state privacy laws, video surveillance consent laws (one-party vs. two-party consent), biometric data laws (BIPA in IL, etc.), GDPR (if applicable). Document requirements. | Legal requirements summary document |
| D1.2 — Draft member consent form | Clear, plain-language consent form. Covers: what data is collected (video processed to pose data), what is stored (structured workout data, no video), how data is used (personal workout tracking), opt-out rights, data deletion request process. | Consent form draft |
| D1.3 — Draft data handling policy | Internal document: what data flows where, retention periods, access controls, encryption requirements. Covers: on-device processing (video never leaves device), structured data transmission to cloud (TLS), database storage (encrypted at rest), no raw video storage. | Data policy document |
| D1.4 — Draft gym signage | Signs to be posted in the gym notifying members about the camera system. Required by most jurisdictions for video monitoring in semi-public spaces. Clear, visible, non-alarming. | Signage text and design |
| D1.5 — Legal review (if budget allows) | Have a privacy attorney review the consent form and data policy. If budget doesn't allow, do a thorough self-review against the legal requirements document from D1.1. | Review complete, documents finalized |

**Assigned to:** Business lead (D1.1-D1.4), Legal consultant (D1.5 — optional)

**Risks & Mitigations:**
| Risk | Mitigation |
|---|---|
| Local biometric data law applies (e.g., BIPA) | Since the system does NOT use facial recognition and does NOT store biometric templates, it likely falls outside BIPA scope. But confirm — if pose data is classified as biometric, additional consent requirements apply. |
| Gym owner requires insurance/indemnification | Standard small business liability should cover this. For MVP pilot, a simple indemnification clause in the partnership agreement may suffice. |

---

## Week-by-Week Schedule

### Week 1: Kickoff & Data Collection

| Day | WS-A (AI/Backend) | WS-B (Mobile) | WS-C (Business) |
|---|---|---|---|
| Mon | Define target exercise list. Set up OpenAI API access. | Research used phone models. Order 2-3 test devices. | List candidate gyms. Draft pitch one-pager. |
| Tue | Record gym footage — visit gym, film 10+ exercises from tripod angles. | Set up Android Studio. Create bare MediaPipe test project. | Email/call gym contacts. |
| Wed | Continue recording. Supplement with YouTube clips. | Continue MediaPipe project setup. | Schedule gym meetings. |
| Thu | Extract frames from all clips. Begin ground truth labeling. | (Waiting for devices to arrive.) | First gym meeting (if scheduled). |
| Fri | Organize frame library. Write first draft of exercise recognition prompt. | Devices arrive — basic validation (boot, camera, WiFi). | Second gym outreach. |

### Week 2: Prompt Development & Device Testing

| Day | WS-A (AI/Backend) | WS-B (Mobile) | WS-C (Business) | WS-D (Legal) |
|---|---|---|---|---|
| Mon | Design 3-5 prompt variants for exercise recognition. Test on 10-frame batch. | Install MediaPipe on test devices. Run initial FPS benchmark. | Gym site visits (1-2 gyms). | Research local privacy laws. |
| Tue | Design weight reading prompts. Test on weight stack frames. | Benchmark all devices at 480p, 720p, 1080p. Log FPS, CPU, RAM. | Site visit notes. Compare gyms. | Continue research. |
| Wed | Design rep counting prompts. Test on frame sequences. | Keypoint quality assessment — inspect tracking on exercise clips. | Select partner gym. Begin term negotiation. | Draft consent form. |
| Thu | Design combined all-in-one prompt. Compare accuracy vs. separate calls. | 2-hour thermal/battery stress test on each device. | Draft partnership terms. | Draft data policy. |
| Fri | Build automated test harness (Python script). | BLE concurrent test. Write device recommendation. | Review terms with gym owner. | Draft signage. |

### Week 3: Systematic Testing & Equipment Audit

| Day | WS-A (AI/Backend) | WS-B (Mobile) | WS-C (Business) | WS-D (Legal) |
|---|---|---|---|---|
| Mon | Run full test suite — all prompts × all clips. | Finalize device selection document. | Sign partnership agreement. | Legal review (self or attorney). |
| Tue | Continue test runs. Begin analyzing results. | (WS-B largely complete — mobile lead joins gym audit.) | Schedule equipment audit visit. | Finalize consent form. |
| Wed | Analyze results — accuracy per exercise, per prompt, per difficulty. | Join equipment audit. | Equipment audit Day 1 — machine inventory + photos. | Finalize data policy. |
| Thu | Identify top failure modes. Begin prompt refinements. | Help with test shots at tripod positions. | Equipment audit Day 2 — tripod scouting + test shots. | — |
| Fri | Cost and token analysis from test runs. | — | WiFi/power mapping. Floor plan. | — |

### Week 4: Refinement & Go/No-Go

| Day | WS-A (AI/Backend) | WS-C (Business) |
|---|---|---|
| Mon | Iterate on prompts addressing top 5 failure modes. | Finalize exercise list based on equipment audit. |
| Tue | Retest with refined prompts. Measure accuracy improvement. | Finalize tripod positions. Document any problem machines. |
| Wed | Select final prompt templates. Lock "v1 prompts." | Prepare Phase 0 summary for gym owner. |
| Thu | Write final accuracy report + cost validation. | Review all Phase 0 deliverables. |
| Fri | **Go/No-Go gate meeting.** Present results. Decide: proceed to Phase 1 or iterate. | **Go/No-Go gate meeting.** |

---

## Go/No-Go Gate Criteria (End of Week 4)

| Criterion | Threshold | Status |
|---|---|---|
| Exercise recognition accuracy (top-1, pin-loaded machines) | ≥75% | Must pass |
| Exercise recognition accuracy (top-3 includes correct) | ≥90% | Should pass |
| Weight reading accuracy (clear labels) | ≥60% | Should pass |
| Rep counting accuracy (±1 rep) | ≥70% | Should pass |
| Cost per session (actual measured) | Within 3x of $0.006 estimate | Must pass |
| MediaPipe Pose FPS on selected device | ≥5 FPS at 720p | Must pass |
| Partner gym agreement signed | Yes | Must pass |
| Equipment audit complete | Yes | Must pass |
| Privacy documents drafted | Yes | Must pass |

**Go decision:** All "must pass" criteria met. Proceed to Phase 1 with full commitment.

**Conditional go:** Some "should pass" criteria not met. Proceed to Phase 1 with adjusted scope (e.g., fewer exercises, no automatic weight detection — manual only, tighter camera placement requirements).

**No-go:** Multiple "must pass" criteria fail. Options:
1. Extend Phase 0 by 2 weeks for further iteration
2. Test alternative models (gpt-5-mini at higher cost)
3. Pivot scope (e.g., manual exercise selection + automated rep counting only)
4. Shelve the project

---

## Deliverables Checklist

| # | Deliverable | Source Task | Format |
|---|---|---|---|
| D1 | Test dataset (labeled frames + clips) | A1 | Directory of images/videos + CSV labels |
| D2 | Prompt templates (v1) | A2, A4 | Markdown document in docs/ |
| D3 | Accuracy report | A3, A4 | Markdown document with tables + charts |
| D4 | Cost validation report | A3.6 | Section within accuracy report |
| D5 | Device benchmark report | B2 | Markdown document |
| D6 | Device selection recommendation | B2.6 | Section within benchmark report |
| D7 | Partner gym agreement (signed) | C2 | PDF/signed letter |
| D8 | Equipment inventory | C3.1 | Spreadsheet |
| D9 | Gym floor plan with camera positions | C3.3, C3.4 | Annotated image/diagram |
| D10 | Final exercise list (for MVP) | C3.6 | Spreadsheet or markdown list |
| D11 | WiFi/power map | C3.7 | Annotated floor plan |
| D12 | Member consent form | D1.2 | Document (ready for print/digital) |
| D13 | Data handling policy | D1.3 | Document |
| D14 | Gym signage | D1.4 | Printable design |
| D15 | Phase 0 summary / go-no-go report | All | Presentation or document for team review |

---

## Budget Summary

| Item | Qty | Unit Cost | Total |
|---|---|---|---|
| Used Android test phones | 3 | ~$30 | $90 |
| Portable tripod | 1 | ~$20 | $20 |
| Phone tripod mount | 1 | ~$10 | $10 |
| gpt-5-nano API credits | — | — | $20 |
| Gym day pass (for recording) | 2 | ~$10 | $20 |
| Travel (gym visits) | — | — | $50 |
| Privacy attorney consultation (optional) | 1 hr | ~$150 | $0-150 |
| **Total (without attorney)** | | | **$210** |
| **Total (with attorney)** | | | **$360** |

---

## Phase 0 Challenges & Mitigation Strategies

| # | Challenge | Likelihood | Impact | Strategy |
|---|---|---|---|---|
| 1 | **gpt-5-nano exercise accuracy below 75%** | Medium | Critical | Try higher-detail images (more tokens per frame). Try gpt-5-mini (3.75x cost but potentially better). Narrow exercise scope to 10 most distinctive machines. Add more contextual prompt information. If nothing works, this is a no-go signal. |
| 2 | **Weight stack OCR unreliable on worn labels** | High | Medium | Weight detection is the hardest problem — accept that manual weight input will be the primary method for MVP. Automatic detection is a bonus, not a requirement to proceed. |
| 3 | **No gym agrees to pilot** | Low-Medium | Critical | Expand search to 10+ gyms. Offer monetary incentive. Approach CrossFit boxes or boutique studios (often more open to innovation). As a last resort, rent a small commercial space with a few machines for controlled testing. |
| 4 | **Used Android phones too slow for MediaPipe** | Low | Medium | Use lower camera resolution (480p). Process every N-th frame instead of every frame. If truly unusable, consider Raspberry Pi as alternative (adds setup complexity but more compute headroom). |
| 5 | **Privacy laws block video recording in gym** | Low | High | Design emphasizes no video storage — only pose keypoints leave the device. If local laws still prohibit even temporary video capture, explore: processing directly in the camera viewfinder without saving to disk, or using a fully on-device pipeline that never creates a "recording." |
| 6 | **Test data not representative of real gym conditions** | Medium | Medium | The equipment audit (WS-C) produces real gym photos. Re-run accuracy tests on equipment audit photos to validate. Phase 4 (beta) is the true real-world test. |
| 7 | **Tripod placement impractical in the gym** | Medium | Medium | Equipment audit (C3.4, C3.5) catches this early. If tripods don't work for many machines, consider wall/ceiling clamp mounts or small shelving brackets as alternatives. |
| 8 | **Scope creep during Phase 0** | Medium | Low | Phase 0 is strictly validation and research. Resist the urge to start writing production code. The go/no-go gate enforces discipline. |

---

## Dependencies on Phase 1

Phase 0 outputs that Phase 1 directly depends on:

| Phase 0 Output | Phase 1 Consumer |
|---|---|
| v1 prompt templates | LLM analysis pipeline (1.2), Exercise recognition module (1.3), Weight detection module (1.5) |
| Device selection recommendation | Android camera app (2.1), Procurement (2.4) |
| Equipment inventory + exercise list | Exercise recognition module (1.3), System prompt / exercise catalog |
| Floor plan + camera positions | On-site installation (2.5), Camera app FOV configuration |
| Accuracy report | Confidence thresholds (1.3), UX decisions (confirm/correct flow triggers) |
| Cost validation | Infrastructure budgeting, SaaS pricing validation |
| Privacy documents | Member onboarding flow (3.1), Gym signage installation (2.5) |

---

## Appendix A: Task A1 Detailed Breakdown — Test Dataset Recording Guide

This appendix provides a shot-by-shot recording plan for building the Phase 0 test dataset. The goal is to produce a diverse, labeled corpus of gym footage that stress-tests gpt-5-nano's ability to identify exercises, read weights, and count reps under realistic conditions.

> **Important clarification:** We are NOT training a model. This dataset is for *testing* the off-the-shelf multimodal LLM. The diversity requirements exist so we can measure accuracy across conditions, not to improve a training set.

---

### A1.1 — Recording Sessions Plan

The dataset requires **3 recording sessions**, each at a different gym or at different times of day at the same gym, to capture environmental variation.

| Session | Location | Time of Day | Purpose |
|---|---|---|---|
| **Session 1** | Any gym with pin-loaded machines | Morning (natural light through windows) | Primary dataset — core exercises, multiple angles |
| **Session 2** | Same or different gym | Evening (artificial lighting only) | Lighting variation — fluorescent/LED overhead |
| **Session 3** | Different gym (if possible) | Any time | Equipment variation — different machine brands, layouts, label styles |

If only one gym is accessible, do Sessions 1 and 2 at different times (morning vs. evening) at the same location.

**Personnel per session:** 1 camera operator + 1 performer (can be the same person using a tripod + timer, or recruit a friend/training partner).

**Duration per session:** 2-3 hours (including setup, transitions, rest).

---

### A1.2 — Exercise Catalog: What to Record

#### Tier 1: Pin-Loaded Machines (MVP Priority — Record All)

These are the core MVP exercises. Every machine found in the gym should be recorded.

| # | Exercise | Machine Type | Key Visual Features for LLM | What to Capture |
|---|---|---|---|---|
| 1 | **Lat Pulldown** | Cable machine with overhead bar | Seated, pulling bar down to chest/behind neck, arms overhead at start | Full motion cycle, wide grip and close grip variants |
| 2 | **Seated Row** (Cable) | Low-row cable machine or plate-loaded row | Seated, pulling handle toward torso horizontally, arms extended at start | Side angle critical — shows horizontal pull direction |
| 3 | **Chest Press** | Pin-loaded chest press machine | Seated, pushing handles forward from chest | Side angle shows pushing motion clearly |
| 4 | **Shoulder Press** | Pin-loaded shoulder press machine | Seated, pressing handles overhead from shoulder level | Looks similar to chest press — capture the steeper arm angle |
| 5 | **Leg Extension** | Leg extension machine | Seated, extending lower legs forward, pad on shins | Front/side angle — legs clearly visible extending |
| 6 | **Leg Curl** (Seated) | Seated leg curl machine | Seated, curling lower legs backward under seat | Similar machine to leg extension — motion direction differs |
| 7 | **Leg Curl** (Lying) | Prone leg curl machine | Lying face-down, curling heels toward glutes | Body position (prone) is the distinguishing feature |
| 8 | **Leg Press** | Pin-loaded or plate-loaded leg press | Seated at incline, pressing platform away with feet | Large machine with visible weight stack or plates |
| 9 | **Pec Deck / Chest Fly** | Pec deck machine | Seated, arms out to sides, bringing pads together in front | Arm motion in horizontal plane is distinctive |
| 10 | **Rear Delt Fly** | Reverse pec deck (same machine, reversed) | Seated facing pad, arms moving outward from center | Opposite motion of pec deck — LLM must distinguish |
| 11 | **Cable Tricep Pushdown** | Cable station with rope/bar | Standing, pushing rope/bar downward from chest level | Standing at cable station, downward push |
| 12 | **Cable Bicep Curl** | Cable station with bar/handle | Standing, curling bar/handle upward from waist | Standing at cable station, upward curl |
| 13 | **Cable Fly** (High/Low) | Cable crossover station | Standing between cables, bringing handles together | Two cable attachments, sweeping motion |
| 14 | **Hip Abductor** | Abductor machine | Seated, legs pushing outward against pads | Seated with legs — outward push |
| 15 | **Hip Adductor** | Adductor machine | Seated, legs squeezing inward against pads | Same machine style as abductor — motion reverses |

#### Tier 2: Free-Weight Exercises (For Future Testing — Record If Time Allows)

Not in MVP scope but valuable for testing LLM capabilities and future phases.

| # | Exercise | Equipment | Key Visual Features | What to Capture |
|---|---|---|---|---|
| 16 | **Barbell Bench Press** | Flat bench + barbell | Supine on bench, pressing bar above chest | Plate labels on barbell ends, full range of motion |
| 17 | **Barbell Squat** | Squat rack + barbell | Standing with bar on back, squatting down and up | Bar position on upper back, knee bend depth |
| 18 | **Barbell Deadlift** | Barbell on floor | Standing, pulling bar from floor to hip level | Hip hinge pattern, bar path from floor |
| 19 | **Barbell Overhead Press** | Standing or seated + barbell | Pressing bar from shoulders to overhead | Bar at shoulder height, lockout overhead |
| 20 | **Dumbbell Bicep Curl** | Dumbbells | Standing, curling dumbbells up | Dumbbell label visibility, arm motion |
| 21 | **Dumbbell Shoulder Press** | Dumbbells + bench | Seated, pressing dumbbells overhead | Dumbbell labels, overhead press motion |
| 22 | **Dumbbell Lateral Raise** | Dumbbells | Standing, raising arms to sides | Light weight, subtle motion |
| 23 | **Dumbbell Row** | Dumbbell + bench | One knee on bench, rowing dumbbell to hip | Bent-over position, rowing motion |

---

### A1.3 — Recording Protocol Per Exercise

For **each exercise**, record the following variations to ensure dataset diversity:

#### Variation Matrix

| Dimension | Variations | Clips per Variation |
|---|---|---|
| **Camera angle** | 3 angles (see A1.4) | 1 clip per angle |
| **Weight** | 2 different weights (light and moderate) | 1 clip per weight |
| **Rep count** | Varies naturally (5-15 reps per set) | Record actual count as ground truth |
| **Performer** | 1-2 people (if a partner is available) | Best effort |
| **Speed/tempo** | Normal speed for all (no need to vary) | 1 |

**Minimum clips per exercise:** 3 (one per camera angle at one weight)
**Target clips per exercise:** 6 (two weights × three angles)
**Total target:** 15 exercises × 6 clips = **90 clips** (Tier 1) + optional Tier 2

#### Per-Clip Recording Checklist

For every clip, record the following sequence:

```
1. BEFORE THE SET (5-10 seconds)
   - Camera rolls while equipment is at rest
   - Weight stack/plates visible and stationary
   - Performer approaches and sits down / gets into position
   
2. WEIGHT SETUP (5-10 seconds — if changing weight)
   - Show the performer adjusting the pin in the weight stack
   - OR show the weight stack with the pin already in place
   - Hold camera steady on the weight stack numbers for 3-5 seconds
   
3. THE SET (20-60 seconds depending on exercise)
   - Full set from first rep to last rep
   - Don't cut or pause — continuous recording
   - Include the brief pause between reps
   
4. AFTER THE SET (5-10 seconds)
   - Performer finishes and releases the equipment
   - Equipment returns to rest position
   - Performer stands up / steps away
```

**Total clip duration:** ~45-90 seconds each.

#### Per-Clip Ground Truth Label

Immediately after recording each clip, note the following (in a spreadsheet, notes app, or voice memo):

| Field | Example Value |
|---|---|
| Clip filename | `session1_lat_pulldown_side45_40kg_clip01.mp4` |
| Exercise name | Lat Pulldown |
| Machine brand/model | Life Fitness Pro2 (if identifiable) |
| Weight (kg or lb) | 40 kg |
| Reps performed | 12 |
| Camera angle | Side 45° |
| Camera distance | ~2 meters |
| Camera height | ~1.3 meters (seated eye level) |
| Lighting condition | Morning, natural + overhead fluorescent |
| Weight label visibility | Clear / Partially occluded / Worn |
| Performer body type | Average build, 180cm |
| Notes | Slight mirror reflection in background |

---

### A1.4 — Camera Positions (Per Exercise)

Record each exercise from **3 standard angles** that simulate realistic tripod placement in a gym:

#### Angle 1: Side 45° (Primary — Production Target)

This is the planned production camera angle for most pin-loaded machines.

```
            [Machine]
                |
                |  45°
                | /
               [User seated]
              /
             /
        📷 Camera
        (1.5-2m away, 1.2-1.3m height)
```

- **Distance:** 1.5-2 meters from the machine
- **Height:** 1.2-1.3 meters (approximately seated user eye level)
- **Angle:** 45° off the machine's front axis, from the side
- **Frame should include:** Full user body from head to knees + weight stack visible on the machine
- **Tripod position:** On the floor, to the side of the machine

**Why this angle:** Captures both the user's body motion (for exercise and rep detection) and the weight stack (for weight reading) in a single frame. This is the angle we'll use in production.

#### Angle 2: Front-Facing

```
        [Machine + User]
              |
              |
              |
          📷 Camera
          (2-2.5m away, 1.5m height)
```

- **Distance:** 2-2.5 meters
- **Height:** 1.5 meters
- **Angle:** Directly in front of the user (facing the user's chest/face)
- **Frame should include:** Full upper body, machine frame visible on sides
- **Weight stack:** May or may not be visible (often behind the user)

**Why this angle:** Tests the model's ability to classify exercises when the weight stack is NOT visible. Also tests pose-based recognition from the front view.

#### Angle 3: Opposite Side / Rear 45°

```
        📷 Camera
         \
          \  45°
           \
            [User seated]
                |
            [Machine]
```

- **Distance:** 1.5-2 meters
- **Height:** 1.2-1.5 meters
- **Angle:** 45° from the opposite side (or slightly behind the user)
- **Frame should include:** User's back, machine, potentially the weight stack from the other side

**Why this angle:** Tests recognition robustness when the camera is on the "wrong" side. In real gyms, the optimal camera position may not always be available.

#### Machine-Specific Camera Notes

| Machine | Best Primary Angle | Weight Stack Location | Special Notes |
|---|---|---|---|
| Lat Pulldown | Side 45° | Behind user, facing out to one side | Stack usually visible from side; bar overhead is key feature |
| Seated Row | Side 45° | In front of user (at their feet) | Stack may be low to the ground; ensure camera captures low |
| Chest Press | Side 45° | Behind or beside user | Pushing motion best seen from side |
| Shoulder Press | Side 45° | Behind user | Similar to chest press — arm angle is the differentiator |
| Leg Extension | Front or side 45° | Behind user | Legs extending forward are the key signal |
| Leg Curl (seated) | Front or side 45° | Behind user | Legs curling under seat — opposite of extension |
| Leg Press | Side (looking at the sled angle) | On the sled frame | Large machine — may need wider angle or greater distance |
| Pec Deck | Front 45° | Behind user | Arms sweeping horizontally in front of body |
| Cable Pushdown | Side 45° | Above user (high pulley) | Standing exercise — capture full body + cable |
| Hip Ab/Adductor | Front | Behind user | Leg motion is the key — front view shows it clearly |

---

### A1.5 — Lighting Conditions to Capture

Real gyms have inconsistent, often challenging lighting. The test dataset must include these variations:

#### Condition 1: Well-Lit (Natural + Artificial)

- **When:** Morning or afternoon at a gym with windows
- **Characteristics:** Overhead fluorescent/LED lights ON + natural daylight from windows
- **Visual effect:** Bright, even illumination; weight stack numbers easily readable; minimal shadows
- **This is the "easy" condition** — if the system fails here, the approach doesn't work

#### Condition 2: Artificial Only (Evening/Windowless)

- **When:** Evening after sunset, or in a gym section with no windows
- **Characteristics:** Overhead fluorescent or LED tubes only, no natural light
- **Visual effect:** Slightly dimmer, possible color cast (warm/yellowish from older fluorescent, cool/blue from LED), some harsh shadows under equipment
- **Common in real gyms** — many training floors are interior rooms

#### Condition 3: Mixed / Uneven Lighting

- **When:** Near windows at certain times of day
- **Characteristics:** Strong directional light from one side (window) combined with overhead lights
- **Visual effect:** High contrast — one side of the machine bright, other side in shadow; potential glare on weight stack metal surfaces; camera auto-exposure may struggle
- **This is the hardest condition** — creates readability problems for weight labels

#### Condition 4: Dim / Corner Areas

- **When:** Machines placed in gym corners, far from light sources
- **Characteristics:** Reduced overall light, farther from overhead fixtures
- **Visual effect:** Grainy footage (phone camera boosts ISO), reduced contrast on weight labels, harder to read embossed numbers
- **Important to test** — some machines will inevitably be in dim areas

#### How to Record Lighting Variations Without Multiple Gym Visits

If you only have one recording session:
- Record some exercises near windows (Condition 1 and 3)
- Record some exercises in the gym interior, away from windows (Condition 2)
- Record some in the darkest corner of the gym (Condition 4)
- For each lighting condition, record at least 3-4 different exercises so results aren't confounded by exercise difficulty

---

### A1.6 — Weight Stack Detail Shots

Weight reading is a separate challenge from exercise recognition. Record dedicated weight stack footage:

#### Per Machine (All 15 Tier 1 Machines)

| Shot | Description | Duration / Count |
|---|---|---|
| **Stack overview** | Steady shot of the entire weight stack, showing all numbered plates from top to bottom | 5-10 seconds of steady video |
| **Pin close-up** | Close-up of the pin inserted at a specific weight, showing the number next to the pin | 3-5 seconds × 3 different weight settings |
| **Pin change sequence** | Video of the performer pulling the pin and moving it to a different weight | 10-15 seconds |
| **In-use stack** | The weight stack during a rep — plates above the pin are lifted, plates below are stationary | Included in the full exercise clips |
| **Angled stack view** | Stack from the same 45° side angle the camera will use in production (not straight-on) | 5 seconds per angle |

#### Weight Stack Conditions to Capture

| Condition | Description | Where to Find It |
|---|---|---|
| **Clear printed numbers** | Large, high-contrast numbers (black on silver, or white on black) | Newer machines, premium brands (Life Fitness, Precor) |
| **Embossed/stamped numbers** | Numbers raised or stamped into the metal, no paint/color contrast | Older machines, budget brands |
| **Worn/faded numbers** | Numbers that were once printed but have partially rubbed off | Heavily used machines in older gyms |
| **Small numbers** | Numbers that are present but small (< 1cm tall) | Some cable machines, compact machines |
| **lb vs. kg labels** | Some stacks show pounds, others kilograms, some both | Varies by region and machine manufacturer |
| **Non-sequential numbering** | Some machines skip numbers (5, 10, 15, 20… vs. 10, 20, 30, 40…) | Common on heavier machines (leg press, chest press) |

**Target:** At least 30 weight stack images across various machines and conditions. These become the test set for weight reading accuracy measurement.

---

### A1.7 — Confusable Exercise Pairs

Certain exercise pairs look very similar and are the most likely failure points for the LLM. **Explicitly record these pairs back-to-back** (same camera position, same session) so they can be tested as confusion cases:

| Pair | Why They're Confusable | What to Record |
|---|---|---|
| **Lat pulldown** vs. **Seated row** | Both pulling motions on cable machines | Back-to-back at the same angle; the pull direction (vertical vs. horizontal) must be captured |
| **Chest press** vs. **Shoulder press** | Both pressing motions on similar-looking machines | Record on adjacent machines if available; the arm angle difference is subtle |
| **Pec deck (fly)** vs. **Rear delt fly** | Often the SAME machine, user faces opposite direction | Record both on the same machine, same angle — user orientation reverses |
| **Leg extension** vs. **Seated leg curl** | Both seated with legs, similar machines | Record on adjacent machines; motion direction is the key difference |
| **Cable bicep curl** vs. **Cable tricep pushdown** | Both standing at cable station, arm exercises | Record at the same cable station; curl up vs. push down |
| **Hip abductor** vs. **Hip adductor** | Same machine style, opposite leg motion | Record both on the same machine; outward vs. inward push |
| **Lat pulldown (wide)** vs. **Lat pulldown (close grip)** | Same machine, same motion, different grip width | Record both — LLM must pick up grip difference or identify as same exercise |

For each pair: record both exercises from the **same camera angle** so the only variable is the exercise itself. This creates ideal A/B test data.

---

### A1.8 — Supplemental Data from Public Sources

Self-recorded footage provides controlled, labeled data. Supplement with public footage for diversity:

#### Where to Find Public Gym Footage

| Source | Search Terms | What You Get |
|---|---|---|
| YouTube | "[exercise name] machine tutorial", "how to use lat pulldown", "gym machine demonstration" | Clean demonstration clips, usually well-lit, single person, clear camera angle |
| YouTube | "[exercise name] POV", "gym workout vlog" | More realistic gym environment — multiple people, background noise, natural camera ops |
| Instagram/TikTok | #gymlife #workout #[exercise name] | Short clips, mobile-quality, diverse angles and conditions |
| Equipment manufacturers | "Life Fitness lat pulldown demo", "Precor chest press" | Perfect form demos, specific machine models identified |

#### Selection Criteria for Public Clips

- ✅ Machine and weight stack visible in frame
- ✅ Full rep cycle shown (not just a partial clip)
- ✅ Equipment is identifiable as a standard gym machine
- ✅ Adequate resolution (≥720p)
- ❌ Reject clips with heavy editing, filters, or text overlays covering the equipment
- ❌ Reject clips shot too close (just the person's face/upper body, no machine context)
- ❌ Reject clips with watermarks covering the weight stack

**Target:** 3-5 public clips per Tier 1 exercise = ~45-75 supplemental clips.

#### Labeling Public Clips

For YouTube/public footage, ground truth must be inferred:
- **Exercise:** Usually stated in the title or obvious from context
- **Weight:** May be stated verbally, shown in text overlay, or estimated from visible plates/stack
- **Reps:** Count manually by watching the clip
- **Mark as "inferred ground truth"** in the label spreadsheet (vs. "known ground truth" for self-recorded clips)

---

### A1.9 — Dataset Organization

#### Directory Structure

```
test_dataset/
├── README.md                          # Dataset overview and labeling conventions
├── labels.csv                         # Master label file (all ground truth)
├── session1_morning/
│   ├── lat_pulldown/
│   │   ├── side45_40kg_12reps.mp4
│   │   ├── side45_60kg_8reps.mp4
│   │   ├── front_40kg_10reps.mp4
│   │   └── rear45_40kg_10reps.mp4
│   ├── chest_press/
│   │   ├── side45_30kg_12reps.mp4
│   │   └── ...
│   └── ...
├── session2_evening/
│   └── ...
├── session3_different_gym/
│   └── ...
├── weight_stacks/
│   ├── lat_pulldown_stack_overview.jpg
│   ├── lat_pulldown_pin_40kg.jpg
│   ├── lat_pulldown_pin_60kg.jpg
│   ├── chest_press_stack_worn_labels.jpg
│   └── ...
├── public_clips/
│   ├── youtube_lat_pulldown_01.mp4
│   ├── youtube_chest_press_01.mp4
│   └── ...
└── extracted_frames/
    ├── lat_pulldown_side45_40kg_frame_start.jpg
    ├── lat_pulldown_side45_40kg_frame_mid_rep.jpg
    ├── lat_pulldown_side45_40kg_frame_peak.jpg
    ├── lat_pulldown_side45_40kg_frame_end.jpg
    └── ...
```

#### labels.csv Schema

```csv
clip_id,source,exercise,equipment_type,machine_brand,weight_value,weight_unit,reps,camera_angle,camera_distance_m,camera_height_m,lighting,weight_label_condition,performer,difficulty_tier,notes
session1_lat_pulldown_side45_40kg_01,self_recorded,lat_pulldown,pin_loaded,Life Fitness,40,kg,12,side_45,2.0,1.3,natural_plus_artificial,clear,person_A,easy,
session1_lat_pulldown_front_40kg_01,self_recorded,lat_pulldown,pin_loaded,Life Fitness,40,kg,10,front,2.5,1.5,natural_plus_artificial,clear,person_A,medium,weight stack not visible from front
session2_chest_press_side45_25kg_01,self_recorded,chest_press,pin_loaded,Precor,25,kg,15,side_45,1.8,1.2,artificial_only,worn,person_A,hard,labels faded on this machine
youtube_lat_pulldown_01,public,lat_pulldown,pin_loaded,unknown,unknown,unknown,8,side,unknown,unknown,unknown,unknown,unknown,medium,weight mentioned verbally as 120lb
```

#### Difficulty Tiers

Assign each clip to a difficulty tier based on recording conditions:

| Tier | Criteria | Expected LLM Accuracy |
|---|---|---|
| **Easy** | Good lighting, clear weight labels, standard camera angle (side 45°), pin-loaded machine, no occlusion | ≥85% |
| **Medium** | Moderate lighting, some occlusion OR non-standard angle OR weight labels partially visible | 65-85% |
| **Hard** | Dim lighting, worn labels, poor angle, OR confusable exercise pair, OR free weight (non-MVP) | 50-65% |

---

### A1.10 — Frame Extraction Protocol

After recording, extract still frames from each clip to form the actual inputs for LLM testing:

#### Extraction Points Per Clip

| Frame # | Moment | Purpose |
|---|---|---|
| 1 | **Rest / start** — before first rep, user in starting position | Exercise setup identification |
| 2 | **Rep 1 peak contraction** — e.g., bar at chest for lat pulldown | Motion phase 1 for exercise recognition |
| 3 | **Rep 1 full extension** — e.g., arms fully extended for lat pulldown | Motion phase 2 for exercise recognition |
| 4 | **Mid-set rep** — a rep in the middle of the set | Representative motion frame |
| 5 | **Last rep** — final rep before user stops | Fatigue-affected form (may differ from early reps) |
| 6 | **Weight stack close-up** — best frame showing the weight stack and pin | Weight reading |
| 7 | **Weight stack in motion** — plates lifted during a rep | Weight reading (dynamic) |
| 8 | **End** — user finishing and stepping away | Post-set scene |

**Extraction method:** Manual (scrub through video in VLC or similar, screenshot at each moment) or semi-automated (use ffmpeg to extract frames at fixed intervals, then manually select the best ones).

Quick ffmpeg command to extract one frame per second:
```bash
ffmpeg -i clip.mp4 -vf fps=1 frame_%04d.jpg
```

Then manually select the 5-8 best frames from each clip.

---

### A1.11 — Equipment Needed

| Item | Qty | Cost | Notes |
|---|---|---|---|
| Phone for recording (personal) | 1 | $0 | Must record at 1080p, 30fps minimum |
| Portable tripod with phone mount | 1 | ~$20 | Adjustable height 0.5-1.5m |
| Gym access (day pass × 2-3 sessions) | 2-3 | ~$10-15 each | Book for off-peak hours if possible |
| Portable LED panel (optional) | 1 | ~$15 | Only if gym lighting is extremely dim; not required |
| USB battery pack (for long sessions) | 1 | $0 | Use existing if available — phone recording drains battery fast |
| **Total** | | **~$50-65** | |

---

### A1.12 — Recording Day Checklist

Print this and bring to each recording session:

```
BEFORE LEAVING
□ Phone charged to 100%
□ Phone storage has ≥20GB free
□ Tripod packed
□ Phone mount attached to tripod
□ Notebook or phone for ground truth notes
□ This recording guide (printed or on tablet)
□ Gym day pass / membership card
□ Water bottle (you're performing exercises)

ARRIVING AT GYM
□ Walk the floor — identify all target machines
□ Note lighting conditions in different areas
□ Identify power outlets (for phone charging if session runs long)
□ Ask staff permission if needed for tripod setup
□ Start with the best-lit machine area first

PER EXERCISE RECORDING
□ Set up tripod at Angle 1 (side 45°, 1.5-2m, ~1.3m height)
□ Verify frame: user body + weight stack both visible
□ Record weight stack overview (5 seconds, steady)
□ Set weight to first test weight
□ Record close-up of pin and number (3-5 seconds)
□ Perform set — record entire set continuously
□ Note ground truth: exercise, weight, reps
□ Change weight — record pin change sequence
□ Perform set at second weight — record continuously
□ Note ground truth
□ Move tripod to Angle 2 (front) — repeat one set
□ Move tripod to Angle 3 (rear/opposite) — repeat one set
□ Move to next exercise

AFTER SESSION
□ Verify all clips play back correctly
□ Back up clips to laptop/cloud immediately
□ Enter all ground truth labels into spreadsheet
□ Note any issues (machine was broken, lighting changed mid-session, etc.)
```

---

### A1.13 — Minimum Viable Dataset

If time or access is limited, here is the absolute minimum dataset needed to run Phase 0 testing:

| Component | Minimum | Target | Stretch |
|---|---|---|---|
| Tier 1 exercises recorded | 10 | 15 | 15 + 8 Tier 2 |
| Clips per exercise | 3 (one per angle) | 6 (3 angles × 2 weights) | 9+ (variations) |
| Total self-recorded clips | 30 | 90 | 135+ |
| Public supplemental clips | 15 | 45-75 | 100+ |
| Weight stack detail shots | 15 (one per machine) | 45+ (multiple weights/conditions) | 60+ |
| Lighting conditions covered | 2 (bright + artificial) | 3-4 (all conditions) | 4 |
| Extracted frames for testing | 150 | 450+ | 700+ |
| Recording sessions needed | 1 (2-3 hours) | 2-3 sessions | 3-4 sessions |

**Absolute minimum to run Phase 0:** 30 self-recorded clips + 15 public clips + 15 weight stack shots = **enough to test prompts and get preliminary accuracy numbers.** This can be done in a single 3-hour gym session.
