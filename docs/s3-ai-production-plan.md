# S3 AI Production Plan - "Gym Bag Reveal"

**Shot:** S3 - Athlete's hand pulls IronPal headband from a gym bag  
**Companion to:** `docs/s3-shoot-plan.md`  
**Goal:** Produce the same narrative beat as the in-house S3 shoot, but with **no live filming**  
**Approach:** AI-generated stills + AI-generated micro-motion + standard editorial assembly  
**Primary tool choice:** **Luma Dream Machine / Ray with start + end keyframes**  
**Status:** Draft for production use

---

## 1. Executive Decision

If S3 must be produced with pure AI, the best tool for the job is **Luma Dream Machine / Ray using short image-to-video generations driven by start and end keyframes**.

This is the right choice for S3 for one reason: the shot is not a generic "cinematic reveal." It is a **compound product interaction** with five constraints happening at once:

1. The hand must move upward believably.
2. The headband must stay thin, soft, and fabric-like.
3. The bag must remain stable and readable.
4. The product must progressively emerge from partial occlusion.
5. The side panel must become readable at the apex.

Previous AI attempts failed because a single prompt asked one model to invent all of that motion at once. The model morphed the headband into a puck, cuff, speaker, or floating ring. The fix is **not** better wording alone. The fix is to reduce the amount of motion any single generation has to solve.

So this plan does **not** attempt one continuous 3-5 second AI clip. It builds S3 from **three short AI micro-clips**, each driven by tightly controlled keyframes.

---

## 2. What "Pure AI" Means in This Plan

This plan keeps the imagery and motion AI-generated. There is:

- No live shoot
- No smartphone reference capture
- No actor footage
- No stock footage driving motion

Standard post tools are still used for assembly and cleanup. That is acceptable and necessary. A fully generative end-to-end shot with branded text embedded in motion is not reliable enough for Kickstarter-facing output.

**Important production rule:**
Do **not** ask the motion model to generate the `IronPal` wordmark inside the moving clip. Generate the headband as a plain matte-black product during motion, then add the final logo/wordmark from the approved brand asset in post if needed. If you force text into the animated frames, the shot will almost certainly degrade.

---

## 3. Final Shot Design

The live-action S3 plan is a single reveal shot. The pure-AI version should preserve the same viewer experience, but internally it should be constructed as four controlled beats:

| Beat | Duration | What the viewer sees | Generation method |
|---|---:|---|---|
| A. Reach | 0.8s | Hand approaches open gym bag | AI still -> short motion |
| B. Grip and partial reveal | 1.0s | Fingers grip headband, top edge emerges from bag | AI still -> short motion |
| C. Lift to apex | 1.0-1.2s | Headband clears bag and rises into frame | AI still -> short motion |
| D. Product hold | 1.0-1.5s | Headband held cleanly with side panel visible, LED glow begins | AI still -> subtle motion / near-still |

**Target finished runtime:** 3.8-4.5s

This preserves the intent of `docs/s3-shoot-plan.md`: a premium product reveal that bridges the "old way" and the "IronPal way."

---

## 4. Visual Rules That Must Never Change

Every generated frame and clip must obey these constraints:

- Headband is matte black, thin, flexible, athletic fabric.
- Camera module is tiny and flush-mounted on the front center section.
- Bag is matte black nylon, soft-sided, partially open.
- Lighting is warm golden gym light with shallow depth of field.
- Background is softly blurred gym environment, not a domestic room.
- Hand is clean, athletic, no watch, no rings, no bracelet.
- The visible headband surface at the apex is a **flat side panel**, not a loop, ring, or thick cuff.
- Teal branding is restrained. Do not let the whole product turn teal.
- Composition remains 16:9 from the start.

**Negative constraints for every prompt:**

- no extra fingers
- no second hand
- no wristwatch
- no floating object
- no rigid plastic headset
- no speaker shape
- no thick collar shape
- no giant headband
- no full-teal fabric
- no distorted bag opening
- no text in motion frames

---

## 5. Tool Stack

### Primary generation tool

**Luma Dream Machine / Ray**

Use it because:

- It supports start and end image conditioning.
- It is better suited to short, controlled interpolation than to long invented action.
- It can generate subtle motion between two hand-authored frames instead of hallucinating the whole interaction.
- It fits the repo's existing AI video tooling and prior experimentation.

### Supporting tools

| Tool | Role |
|---|---|
| GPT Image 1.5 or Leonardo AI | Generate the master keyframes |
| Photoshop or Photopea | Cleanup stills, align bag opening, repair fingers/fabric |
| DaVinci Resolve or Premiere | Edit the three/four clips into one S3 shot |
| After Effects or Resolve Fusion | Add logo, LED glow, minor stabilization, optional parallax |

If only one AI tool is to be named for S3 generation itself, it is **Luma**. The still-image tool is secondary.

---

## 6. Production Strategy

### Core principle

Do not generate motion first.

Generate **approved still keyframes first**, then animate only the gap between adjacent approved frames.

This turns S3 from an open-ended prompt into a constrained interpolation problem.

### Why this works

The model is much more likely to preserve product geometry if:

- frame 0 already contains the correct hand pose and bag state
- frame 1 already contains the correct next pose
- clip duration is short
- motion is limited to one local change

The model is much less likely to succeed if asked for:

"A hand smoothly reaches into a bag and pulls out a branded smart headband with perfect logo visibility."

That is exactly the failure mode documented in `docs/s3-clip-analysis.md`.

---

## 7. Frame Build Plan

Create **five** still frames before generating any motion.

### Frame F1 - Pre-reach

- Open black gym bag on bench
- Warm gym lighting
- Hand entering lower frame, fingers open, hovering above bag opening
- Headband mostly hidden inside bag
- Only a subtle hint of the matte-black fabric visible inside
- 50mm-equivalent composition, medium close-up, shallow depth of field

### Frame F2 - Grip established

- Thumb and forefinger pinching one end of the headband inside the bag
- Top edge of band barely visible above bag rim
- Bag fabric slightly compressed where the hand presses in
- No visible logo text yet

### Frame F3 - Half reveal

- About 35-45% of headband visible above the bag
- Headband hangs as a thin vertical strip, not a loop
- Hand grip stable and believable
- Side panel beginning to face camera

### Frame F4 - Apex hold

- Headband fully clear of bag
- Hand holds one end cleanly
- Side panel flat to camera for logo placement
- Camera lens and tiny LED location clearly defined
- This is the hero frame

### Frame F5 - Apex hold plus subtle activation

- Same composition as F4
- Slightly stronger rim light
- Small teal LED glow visible
- Optional tiny teal accent stripe visible, but restrained
- Still no generated wordmark required in the motion plate

---

## 8. Still Generation Workflow

### 8.1 Generate F4 first

Start with the hero frame, not the reach.

If the apex frame does not work, the whole plan collapses. So lock the hardest still first.

**Hero still prompt skeleton:**

```text
Photorealistic cinematic close-up of an athletic male hand holding a sleek matte-black fitness headband just above an open matte-black nylon gym bag on a bench in a premium modern gym. The headband is thin, flexible, made of moisture-wicking athletic fabric, hanging as a flat vertical strip from the hand, not a loop. A tiny flush-mounted camera module is embedded in the front center area of the band, with a subtle pinhole LED beside it. Warm golden gym lighting, shallow depth of field, soft background bokeh, premium product cinematography, realistic hand anatomy, realistic fabric tension, 16:9 frame.
Negative: no text, no extra fingers, no watch, no second hand, no floating object, no rigid plastic device, no speaker shape, no teal full-band, no distorted bag.
```

### 8.2 Derive F3 from F4

Do not reinvent the shot from scratch. Use the same visual recipe and reduce the reveal state:

- lower the band into the bag
- hide 55-65% of the headband
- keep hand grip and angle nearly identical

### 8.3 Derive F2 from F3

- hide most of the band
- keep the exact same hand and bag angle
- emphasize grip contact, not reveal

### 8.4 Create F1 last

F1 is easiest. It only needs to match the established camera angle and lighting.

### 8.5 Create F5 as a controlled variant of F4

Do not ask for a new pose. F5 should be a nearly identical beauty-state variant of F4 with slightly stronger lighting and activation energy.

---

## 9. Motion Generation Workflow in Luma

Generate motion in **three separate jobs**.

### Clip C1 - F1 to F2

- Duration: 0.8s
- Motion type: hand descends and establishes grip
- Camera: locked
- Prompt add-on:

```text
Subtle realistic hand movement only. The hand moves into the bag and gently grips the headband. Keep the bag stable. Preserve realistic anatomy and fabric physics. No camera movement.
```

### Clip C2 - F2 to F3

- Duration: 1.0s
- Motion type: top of headband emerges from bag
- Camera: locked or extremely subtle push-in only
- Prompt add-on:

```text
The hand lifts slightly, revealing the top portion of the thin matte-black athletic headband above the bag opening. Preserve the headband as soft fabric, thin and flat, with realistic tension and no shape morphing.
```

### Clip C3 - F3 to F4

- Duration: 1.0-1.2s
- Motion type: full reveal to hero pose
- Camera: slight premium push-in allowed, but minimal
- Prompt add-on:

```text
The hand completes a smooth controlled upward lift, bringing the headband fully out of the bag and holding it cleanly for product reveal. Keep the band thin, flexible, and flat, with the side panel facing camera. No floating, no twisting, no rigid transformation.
```

### Clip C4 - F4 to F5

- Duration: 1.0-1.5s
- Motion type: near-still beauty hold
- Camera: micro push-in or micro parallax only
- Prompt add-on:

```text
Almost static premium product hold. Only subtle natural hand stabilization and a slight cinematic push-in. A tiny LED activation glow begins. Preserve product shape exactly.
```

---

## 10. Prompting Rules for Luma

Keep prompts short and mechanical. Do not write ad copy into the prompt.

Bad prompt style:

```text
Amazing futuristic IronPal wearable that elegantly transforms the fitness experience while emerging from the gym bag in a beautiful cinematic reveal.
```

Good prompt style:

```text
Locked close-up. Hand lifts a thin matte-black athletic headband from an open black gym bag. Preserve soft fabric shape, realistic grip, realistic bag physics, warm premium gym lighting.
```

### Repeated control phrases

Reuse these phrases across all motion jobs:

- preserve thin fabric headband shape
- realistic hand anatomy
- realistic bag compression
- no floating object
- no object morphing
- no text rendering
- camera locked
- subtle premium motion only

---

## 11. Generation Order and Review Gate

Do not brute-force 20 variants of every clip.

Use this sequence:

1. Approve F4
2. Approve F3
3. Generate C3 only
4. If C3 fails, fix F3/F4 and regenerate
5. Approve F2
6. Generate C2
7. Approve F1
8. Generate C1
9. Approve F5
10. Generate C4
11. Assemble full S3

This is important because **C3 is the real test**. If the model cannot hold the geometry from half-reveal to apex, there is no point generating the earlier beats.

---

## 12. Quality Control Checklist

Reject any clip immediately if one of these happens:

- headband becomes thick or rigid
- headband closes into a loop
- product floats above the hand
- hand gains or loses fingers
- bag opening reshapes unnaturally
- camera invents a large zoom or pan
- headband turns bright teal
- camera module grows oversized
- side panel disappears at apex

Approve a clip only if:

- motion is readable at first glance
- the product still reads as a premium athletic headband
- the bag remains believable
- the hand-product interaction is physically plausible
- the final apex frame can support the brand overlay

---

## 13. Editing and Assembly

After generation, edit the shot in this order:

1. Place C1, C2, C3, C4 on a 24 fps timeline.
2. Trim each clip to the cleanest center segment.
3. Use hard cuts or 2-4 frame dissolves only if the state change feels too sharp.
4. Add a subtle sound design cue for the grip and the lift.
5. Add teal LED glow only during C4 or the final frames of C3.
6. Add the approved IronPal logo/wordmark only on the final hold if brand visibility is needed in-shot.

**Important:**
Do not add the logo too early. The more frames it has to survive, the more obvious any mismatch becomes. Let the viewer read the product first, then let the brand appear in the final hold.

---

## 14. Recommended Timing on the Timeline

| Clip | In/Out target | Editorial note |
|---|---|---|
| C1 | 0:00-0:00.8 | Enter the action quickly |
| C2 | 0:00.8-0:01.8 | First readable reveal beat |
| C3 | 0:01.8-0:03.0 | Main product lift |
| C4 | 0:03.0-0:04.3 | Hold, LED, optional logo |

If pacing feels slow, shorten C1 and C2 before shortening C3. The reveal beat lives in C3.

---

## 15. Fallback Plan if Motion Still Fails

If even the micro-clip approach produces bad deformation, do **not** keep regenerating blindly.

Use this fallback, still without live footage:

### Fallback A - 2.5D motion graphics from AI stills

1. Use F1, F3, and F4 as layered stills.
2. Separate hand, headband, bag rim, bag interior, and background.
3. Animate the reveal in After Effects with masks and position curves.
4. Add slight camera push-in and depth blur.

This is no longer fully generative motion, but it is still a no-shoot, AI-created asset workflow and is far more reliable than another failed diffusion pass.

### Fallback B - Reframe S3 as a beauty reveal instead of a pull reveal

If the extraction motion is still unstable, change the beat slightly:

- start on an already partially revealed band in the open bag
- push in slowly
- end on the held product pose

This preserves the narrative function of S3 even if it gives up the exact full pull-out action.

---

## 16. Recommended Production Day Estimate

Assuming one operator:

| Task | Estimated time |
|---|---:|
| Generate and approve F4 hero still | 45-90 min |
| Derive and approve F3, F2, F1, F5 | 60-120 min |
| Generate C3 and iterate until stable | 45-90 min |
| Generate C2 and C1 | 30-60 min |
| Generate C4 hold | 20-40 min |
| Assembly and cleanup | 45-90 min |
| **Total** | **4-8 hours** |

This is materially faster than another round of uncontrolled full-shot experimentation.

---

## 17. Deliverables

Save the working package as:

- `input/kickstarter/storyboarding/S3/ai/F1_pre_reach.png`
- `input/kickstarter/storyboarding/S3/ai/F2_grip.png`
- `input/kickstarter/storyboarding/S3/ai/F3_half_reveal.png`
- `input/kickstarter/storyboarding/S3/ai/F4_apex_hold.png`
- `input/kickstarter/storyboarding/S3/ai/F5_led_hold.png`
- `input/kickstarter/storyboarding/S3/ai/C1_reach.mp4`
- `input/kickstarter/storyboarding/S3/ai/C2_partial_reveal.mp4`
- `input/kickstarter/storyboarding/S3/ai/C3_lift_to_apex.mp4`
- `input/kickstarter/storyboarding/S3/ai/C4_hold.mp4`
- `input/kickstarter/storyboarding/S3/ai/S3_ai_master_v01.mp4`

---

## 18. Final Recommendation

If the mandate is "make S3 with pure AI," the correct production plan is:

1. **Use Luma as the primary motion tool.**
2. **Generate still keyframes first.**
3. **Animate only short transitions between approved frames.**
4. **Keep branding out of the motion generation step.**
5. **Assemble the shot from 3-4 controlled micro-clips.**

That is the highest-probability AI-only route to a usable S3.

Trying to generate the whole reveal in one pass will almost certainly reproduce the same failures already documented in `docs/s3-clip-analysis.md`.