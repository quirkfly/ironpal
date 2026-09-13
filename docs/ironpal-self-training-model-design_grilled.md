# Grilled — Self-Training Model Design (auto mode)

Decisions resolved on **2026-09-13** against
[`ironpal-self-training-model-design.md`](ironpal-self-training-model-design.md), **without user
interaction**. Tags: **EVIDENCE** (from the repo, cited) · **ASSUMED** (the interactive
recommendation, with the strongest counter) · **OPEN** (money, legal, external). Decisions from the
two PRD ledgers are inherited, not re-asked.

**Tally: 12 questions — 5 EVIDENCE · 7 ASSUMED · 0 OPEN.** Nothing here spends money or binds
legally.

---

### Q1 — Leave-one-out integrity: native or JS?

**EVIDENCE.** The TS mirror `src/signal/dsp.ts` does implement the full matcher
(`matchAgainstTemplates`), so a JS-side LOO is *possible* — but it would require every stored window
to cross the bridge into JS, which design decision D6 forbids ("raw samples never cross the bridge;
only results do"), and it would make the mirror a production path instead of a test aid.
**Decision:** integrity runs natively. `SignalModule.scoreAll(exerciseIds[])` returns, per template,
its top-k `{templateId, exerciseId, dFused}` with itself excluded; `integrity.ts` only aggregates.
The mirror stays a Jest fixture.

### Q2 — Do per-rep templates enter the set-level index?

**ASSUMED.** No. Rep windows (½ cycle each side of a confirmed top) feed the rep-shape fit, the
explanation graphic and a future Tier B; putting them in the index would multiply it by ~8 and make
the top-8 prefilter fill with one exercise's reps. *Against:* rep-level DTW could separate tempo
variants; revisit if integrity plateaus.

### Q3 — Show the provisional live label on the HUD during a set?

**ASSUMED.** Suppressed by default; available as an opt-in "provisional label" setting, consistent
with the feature ledger Q10 (a wrist glance is optional, never required). *Against:* seeing the label
appear mid-set is motivating; it is also the moment it is least reliable (kNN-only).

### Q4 — Package signature algorithm?

**EVIDENCE.** Ed25519 is in `java.security` only from API 33; `minSdkVersion = 24`
(`android/build.gradle`); no crypto library exists in the app or in any sibling project
(`grep` over `~/job_stuff/prj/*/package.json` and the Gradle files finds none). **Decision:**
**ECDSA P-256 (`SHA256withECDSA`)**, available in the platform on every supported API level, zero
dependencies; IronPal's public key compiled into the app. Security is equivalent for this purpose
(integrity and origin of a data bundle).

### Q5 — Replay parity for CI: JVM build of the engine or the TS mirror?

**EVIDENCE** for the gap: the Android module has **no unit-test source set and no JUnit dependency**
(`app/src/test` absent; no `testImplementation` in `app/build.gradle`), so a JVM path must be added
either way. **Decision:** add a JVM test source set and a small `SignalEngineCli` (JUnit + a `main`)
that replays `imu.jsonl` through the *same* Kotlin code; the TS mirror covers JS-layer logic only.
*Against:* slower CI than Jest; parity with the shipped code is worth it.

### Q6 — Negative harvesting cap at 5 per session?

**ASSUMED.** Yes: the `T_reject` fit needs ≥ 20 negatives (≈ 4 sessions), which is also about when a
user has ≥ 10 own sets, its other precondition. *Against:* a gym with long walks between stations
offers far more REST than 5 windows; the cap keeps negatives from outnumbering positives in the index.

### Q7 — Is `op-sqlite` + SQLCipher on RN 0.84 new architecture proven anywhere in the portfolio?

**EVIDENCE that it is not:** no sibling project depends on `op-sqlite`, SQLCipher, or any RN crypto
library. **Decision:** keep the choice, but the P0 plan starts with a one-day spike on the A52; the
fallback (`EncryptedFile`-wrapped plain SQLite behind the same `store.ts` API) is designed in (§15 D6).

### Q8 — Canonicalizer: gravity triad from six holds + nod axis for forward?

**ASSUMED.** Yes, with a fit-quality residual that can reject the ritual. The features used for
matching are orientation-invariant by construction (`Dsp.extractFeatures`: axis-energy *ratios*,
cadence, duty, asymmetry, flatness, jerk), so a poor rotation degrades DTW channel choice and the rep
clock's channel, not the kNN prefilter. *Against:* a soft band can rotate between holds; the residual
gate and "last good `R_head`" fallback handle it.

### Q9 — Gate hysteresis values?

**ASSUMED** from evidence: today's constants are `gatePeriodicity = 0.3`, `gateEnergy = 0.02`
(`SignalModule.kt`); the design uses `P_on 0.35 / P_off 0.25 / E_on 0.02` and a two-tick arming
requirement so a single noisy tick cannot open the gate. Package parameters; tuned in P0 replay.

### Q10 — Tick period?

**EVIDENCE.** `scheduleWithFixedDelay(300, 400 ms)` in `SignalModule.kt`. Kept as the package default
`tick_ms: 400`; the RepClock runs per sample and does not depend on it.

### Q11 — `float16` windows?

**ASSUMED.** Values are m/s² and rad/s within ±100; DTW operates on z-normalised series, so 3
significant digits are ample; halves the store. *Against:* a future feature relying on tiny
amplitudes (tremor) would want `float32`; the column carries `channels`/`rate_hz` and can carry a
`dtype` later.

### Q12 — Migration order: refactor before any behaviour change?

**ASSUMED.** Yes: `SignalEngine` + `ModelParams` land first with the POC's exact constants as package
`2026.09.0`, so replaying the POC's own sessions must reproduce its decisions before fits, negatives
or levels are switched on. *Against:* slower to first visible feature; it is what makes every later
change attributable.

---

## Assumptions most worth a human veto (riskiest first)

1. **Q7 — the encrypted-SQLite library** is unproven in this portfolio; the spike is day one of P0.
2. **Q2 — rep templates kept out of the index.** If tempo variants confuse the set-level matcher,
   this is the first knob.
3. **Q8 — the calibration maths** on a soft headband; the residual gate is the only protection.
4. **Q6 — negative cap**; too few negatives and `T_reject` never fits, too many and they crowd the
   prefilter.
