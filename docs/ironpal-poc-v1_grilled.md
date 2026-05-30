# IronPal POC v1 — Grilling Session (decisions log)

Companion to [`ironpal-poc-v1.md`](./ironpal-poc-v1.md). Captures decisions resolved by interviewing the founder, one branch at a time. Each entry: the question, the decision, and the rationale / downstream impact.

---

## Q1 — Enrollment model: who builds the reference templates, and what does the POC prove?

**Decision:** Enrollment is **founder-authored, once**. The founder records the labelled reference templates (the "fingerprints") on his own body and mount, stores them centrally in a DB, and the system matches every user's **live** workout data against those founder-built templates. There is **no per-user enrollment step** — the end-user experience is out-of-the-box.

**Rationale / impact:**
- This keeps the product consistent with the earlier "must work out-of-the-box, no per-user setup" constraint.
- It moves the POC from "per-user template matching" to "**a single shared reference library generalizes to live workouts**."
- **Critical downstream risk it creates:** founder-built IMU templates must match *other people's* motion — different limb lengths, tempo, mount placement. This raises cross-user generalization as the central IMU risk (see Q2).

---

## Q2 — Does POC v1 test cross-user generalization, or just founder-on-founder?

**Decision:** **Founder + 1–2 others.** The founder builds the templates and runs the full evaluation set on himself (~30 sets/exercise), AND recruits 1–2 other gym-goers to run a handful of sets each (~5 sets/exercise) against the founder's templates.

**Rationale / impact:**
- Directly stresses the riskiest assumption created by Q1 (shared founder-built templates generalizing to other bodies) at low cost (~1 extra day).
- A failure on the 1–2 others is a **valuable early signal** that IMU matching needs per-user adaptation (or that vision must lead recognition) *before* the MVP is built on the shared-template premise.
- **Testing-plan impact:** the §12 methodology in the POC must add a small cross-user cohort (1–2 people, ~5 sets/exercise) and report their accuracy separately from the founder's. The §11 KPI table gains a cross-user row: recognition accuracy on others should not collapse (set a soft bar, e.g. ≥70%, to interpret rather than gate).
- Recruits do **not** enroll — they only perform; this preserves the out-of-box premise from Q1.

---

## Q3 — Form factor across POC and MVP; where the IMU lives.

**Decision:**
- **POC form factor:** a **phone mounted on the headband** — camera *and* IMU both on the head. (Head-IMU is therefore correct and locked for the POC; the single-device design in `ironpal-poc-v1.md` stands.)
- **MVP form factor:** a **dedicated mini-camera integrated into the headband**, paired to the phone app over **Bluetooth/Wi-Fi**.
- **MVP IMU location:** the mini-camera will have its **own onboard IMU** (on the head). Motion sensing stays on the head in both POC and MVP.

**Rationale / impact:**
- Because the IMU is head-mounted in *both* POC and MVP, all head-IMU rep-counting thresholds and motion fingerprints tuned in the POC **transfer directly** — none of the IMU work is throwaway. (Resolves the throwaway-IMU risk raised during grilling.)
- Cost: ~$1 BOM + minor firmware for the mini-camera IMU; trivial vs. the value of reusing the POC tuning.
- The mini-camera connectivity (BT/Wi-Fi → phone) is an MVP concern, **out of scope for the POC** (POC runs everything on the one head-mounted phone, no streaming).
- **Doc impact:** update `ironpal-poc-v1.md` §15 (Relationship to MVP) and Open Question #5 — the form factor is now decided (head device → head mini-camera+IMU), not "TBD."

---

## Q4 — Reject class: avoid the 2-way forced-choice trap.

**Decision:** **Yes — add an "unknown / other" class.** The matcher must be allowed to output "neither / not a tracked exercise." Seed UNKNOWN with: idle/rest, walking to the machine, racking/unracking, and at least one off-target exercise (e.g. a bicep curl).

**Rationale / impact:**
- With only two target exercises, a binary matcher trivially picks the closer one and reports phantom reps during rest/transitions — making recognition accuracy meaningless and the live HUD wrong between sets.
- A reject class makes the recognition KPI honest and suppresses rest-time false reps.
- **Doc impact:**
  - §6/§7: recognition is now 3-way `{Bulgarian split squat, Triceps cable pushdown, UNKNOWN}`; fusion logic must support a "no exercise" verdict.
  - §5.1 Enrollment: founder also records the UNKNOWN seed activities (idle, walking, racking, one off-target lift).
  - §11 KPIs: add a **false-positive-during-rest** metric (target: near-zero phantom reps in idle/transition windows) and report recognition accuracy as 3-class.
  - Complements (does not replace) a motion-energy/periodicity gate before scoring.

---

## Q5 — Weight-frame capture: explicit cue vs. passive.

**Decision:** **Explicit "look at the weight" cue.** During setup the app instructs the user to glance at the stack number / dumbbell label for ~2 s; the app grabs the sharpest still frame from that window (trigger on stillness, optionally a tap) and sends it to the LLM for OCR. Fully passive/automatic capture is deferred to a later phase.

**Rationale / impact:**
- Decouples the **capture** problem from the **OCR** problem. With a guaranteed-readable frame, a wrong weight is unambiguously an LLM misread — clean measurement.
- Far higher capture reliability for a POC than hoping a readable frame exists in passive footage.
- Accepts slightly less "magic" UX now; passive capture is a known later goal (note in §6.3 and §2.2 deferred list).
- **Doc impact:**
  - §6.3 Weight detection: add the explicit cue step + "grab sharpest still during the 2 s window."
  - §9 HUD: add a brief setup prompt ("glance at the weight").
  - §11 KPIs: weight accuracy is now measured on cued, readable frames (OCR accuracy in isolation); capture-rate is a separate later concern.
  - §12.2: drop "does the app reliably grab a readable weight frame" as a confound — the cue controls for it.

---

## Q6 — Matcher tolerance: forgiving / shape-based.

**Decision:** **Forgiving, shape-based matcher.** Normalize for tempo and amplitude and compare the *shape* of the motion (feature-vector + nearest-neighbor, or amplitude/time-normalized DTW) rather than raw signal. Borderline false matches are caught by the UNKNOWN reject class (Q4) plus a confidence threshold.

**Rationale / impact:**
- Directly serves Q2: founder-built templates must generalize to other users who move faster/slower/bigger. Shape comparison tolerates that variance; raw/strict matching would predictably fail cross-user.
- The UNKNOWN class + confidence threshold are the safety net against the extra false matches a forgiving matcher allows — Q4 and Q6 reinforce each other.
- **Doc impact:**
  - §4 / §10 M3: matcher = normalized feature-vector + kNN (and/or normalized DTW), not raw DTW. Feature set must be tempo/amplitude-invariant (e.g. axis energy ratios, normalized cadence, shape descriptors) rather than absolute magnitudes.
  - §13 R1 (cross-session/cross-user fragility): mitigation now explicitly includes normalization; the forgiving matcher is the primary defense.

---

## Q7 — Bulgarian split squat weight source.

**Decision:** **Dumbbells (label OCR).** The split squat is loaded with dumbbells; the POC reads the weight number printed on the dumbbell head during the setup glance (Q5). (Resolves the brief's "weight plates" phrasing, which doesn't match how this exercise is normally loaded.)

**Rationale / impact:**
- Best-case OCR scenario (label is close to the head camera during the glance).
- Conveniently the two test exercises now cover **both** weight-reading scenarios: dumbbell-label OCR (split squat) + pin-loaded stack OCR (pushdown). Good coverage for a 2-exercise POC.
- **Doc impact:** §6.1 weight row confirmed as dumbbell OCR; §10/§3 equipment list confirms a pair of dumbbells with legible markings; resolves Open Question #2 (dumbbell vs machine for exercise A → dumbbell).

---

## Q8 — Live-ness of on-screen results.

**Decision:** **On-device live, LLM values fill in.** IMU-derived values (split-squat reps + name) update **instantly and offline**. LLM-derived values (weight for both exercises; pushdown name/reps) appear **2–5 s later, non-blocking**, and if WiFi drops mid-set they queue and resolve after the set. No hard real-time LLM streaming.

**Rationale / impact:**
- Delivers the "real-time feedback" feel from the brief without pulling MVP-tier streaming/reconnection engineering into a feasibility POC.
- **Doc impact:**
  - §4 / §5.2: LLM client is async/non-blocking; HUD renders IMU values immediately and patches in LLM values on arrival.
  - §9 HUD: show per-metric pending state (e.g. weight shows a spinner/"…" until OCR returns).
  - §13 R6: confirmed as the chosen behavior (queue + retry + post-set resolution; on-device metrics unaffected by network).
  - §11 latency KPI: split-squat reps/name ≤ instant; LLM values ≤ ~5 s; both already in the table.

---

## Q9 — Exit gate: per-metric verdict, scope the MVP to the wins.

**Decision:** **Per-metric verdict.** Each (metric × exercise) cell gets an independent verdict — `works` / `works-with-vision` / `needs-work` / `fails`. The MVP is scoped to whatever passes; anything that fails becomes a **named R&D item**, not a blanket blocker.

**Rationale / impact:**
- Avoids one weak cell (likely pushdown-IMU or cross-user generalization) stalling the whole program when other parts clearly work.
- Turns the POC into an actionable scoping tool rather than a binary pass/fail.
- **Doc impact:**
  - §1 ("What success means") and §11: replace the single "primary go/no-go" with a **verdict matrix** (rows = the three metrics; columns = the two exercises + a cross-user column), each cell carrying one of the four verdicts.
  - §12.3 results doc: must output the filled verdict matrix + the resulting MVP scope list + the R&D backlog of failed cells.
  - Expected shape from current assumptions: split-squat reps/name (IMU) → likely `works`; pushdown name/reps → likely `works-with-vision`; weight (both) → `works` to `needs-work` depending on OCR; cross-user → the cell most likely to land `needs-work`.

---

## Summary of decisions (Q1–Q9)

| # | Branch | Decision |
|---|---|---|
| Q1 | Enrollment model | Founder-authored templates, stored centrally, matched against all users' live data; no per-user enrollment (out-of-box for end users). |
| Q2 | Cross-user testing | Founder full run + 1–2 other gym-goers (~5 sets/ex each), no enrollment by them. |
| Q3 | Form factor / IMU location | POC = phone on headband (head IMU). MVP = mini-camera in headband with its **own onboard IMU** (head). POC IMU work transfers. |
| Q4 | Reject class | Add an **UNKNOWN/other** class (idle, walking, racking, 1 off-target lift); recognition is 3-way. |
| Q5 | Weight-frame capture | **Explicit "glance at the weight ~2 s" cue**; grab sharpest still → LLM OCR. Passive capture deferred. |
| Q6 | Matcher tolerance | **Forgiving / shape-based** (normalize tempo + amplitude); UNKNOWN class + threshold catch false matches. |
| Q7 | Split-squat weight source | **Dumbbells** (label OCR). Pushdown = pin-stack OCR. Covers both reading scenarios. |
| Q8 | Live-ness | On-device values **instant/offline**; LLM values **fill in 2–5 s**, non-blocking, queue on WiFi drop. |
| Q9 | Exit gate | **Per-metric verdict matrix**; MVP scoped to wins, failures become R&D items. |

### Doc edits to `ironpal-poc-v1.md` — APPLIED
All nine decisions were folded into `ironpal-poc-v1.md`, touching: §1 (verdict matrix), §2.2/§2.3 (deferred items + second assumption), §4 (matcher + async LLM), §5.1 (founder-only enrollment + UNKNOWN seed), §5.2 (weight cue + async fill-in), §6.3 (weight cue), §7 (3-way fusion + UNKNOWN), §9 (HUD pending/UNKNOWN states), §10 (M1/M3/M7 + timeline), §11 (target thresholds + cross-user + verdict matrix), §12 (cross-user procedure + stress tests + output), §13 (R1/R5/R6), §14 (open questions #2–#5 resolved + M4 model verification), §15 (form-factor transfer). Open Question #1 (second test device) remains the only unresolved item.

