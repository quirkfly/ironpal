# K7 design plan — grilling ledger (auto mode)

**First run 2026-09-29. Re-grilled the same day** after the founder settled the exercise split
(curl → K7, Bulgarian split squat → K8) and chose the inset source (a dedicated app UI screen built
to the landing page's interface). Source: [`K7_design_plan.md`](K7_design_plan.md).

`EVIDENCE` — answered from the repo or a measurement, cited.
`ASSUMED` — my recommendation, with the strongest argument against.
`OPEN` — not mine to settle; the plan stays conditional on it.
`SETTLED` — decided by the founder; recorded with its consequences.

---

## Carried forward from the first run

| | | |
|---|---|---|
| Q1 | Does the app identify a bicep curl? | `EVIDENCE` — **no**, it is the designated negative class (`labels.ts`; `EXERCISE_DISPLAY.unknown` is `'—'`) |
| Q3 | Does the HUD update live during a set? | `EVIDENCE` — yes for IMU reps and an IMU-led name; not for weight, not for the vision-led pushdown |
| Q4 | Does the inset show a weight value? | `EVIDENCE` — **no**, `—` only. Claim 9, the guardrails, and the HUD's own pending state |
| Q6 | Extension of K6 or fresh generation? | `ASSUMED` — fresh; K6's extension broke its gesture guards and K7's hands are the film's highest risk |
| Q7 | Word budget | `EVIDENCE` — ≤ 16 words at 2.04 w/s on a fresh 8 s clip |
| Q8–Q11, Q13 | Dumbbell markings, exposure, framing repetition, band lettering, character | `EVIDENCE` — unchanged |
| Q14 | Is "real time" in the allowlist? | `OPEN` — still. Collides with claim 10's post-set framing |

## Q2 (revisited). Which exercise, and what follows? — `SETTLED`

**Curl in K7, Bulgarian split squat in K8.**

This resolves the first run's open question to **option B** — keep the shot, label the inset a
concept. The consequence is worth stating plainly rather than burying: **K7's inset is a designed
interface, not a recording of a working recogniser.** The *"Product interface concept"* label is
therefore doing real work, and §2.2 now records it as mandatory and not movable to an end card.

**The split also buys something the first run did not anticipate.** The split squat is enrolled,
IMU-led and POC-validated, so **K8's inset can be a real recording** while K7's cannot. The film
gets a deliberate escalation — K7 shows the interface, K8 shows the recogniser — and if only one can
be made truthful it must be K8. Recorded in the plan's new §7.

## Q15. Does the K7 screen differ from the landing page version? — `EVIDENCE`

**Yes, in three places, and all three are honesty edits.**

The landing page mockup (`AppModules.astro`) currently shows a **filled weight**:

```
<span class="scr__lbl">Weight</span><span class="scr__big">35<small>kg</small></span>
<div class="scr__row"><span>Set 1</span><span>12 × 35 kg</span></div>
```

A page can carry that because it is captioned as a concept inside hedged copy. **A promo clip is
watched, not read.** So the K7 screen shows `—` for Weight and reps-only log rows, and moves the
focus state from Weight to Exercise because K7 is about recognition. Recorded in §4.2.

**Worth raising separately:** the same reasoning arguably applies to the live site. Not this
document's call, but if a filled weight is too strong for an 8-second clip, it is worth a second
look at the page.

## Q16. Is the rep counter's job actually achievable in the clip? — `EVIDENCE`

**Yes, comfortably, and this vindicates the curl for the shot.** With the inset appearing at ~1.0 s
into an 8 s clip:

| | cadence | count events visible |
|---|---|---|
| alternating curl | ~1.2 s per arm | **~5.8** |
| Bulgarian split squat | ~2.5 s per rep | ~2.8 |

A counter that ticks six times reads as live; one that ticks three times reads as a static number
that changed once. **K7 got the right exercise for the mechanism it has to demonstrate**, even
though it is the wrong one for truthfulness — which is exactly the trade the founder made.

Consequence for K8, recorded in §7: **K8's line must be shorter**, so the picture has room to
complete two full reps.

## Q17. Does the phone shell fit the inset? — `EVIDENCE`

**No, not at K5's geometry.** The shell is `aspect-ratio: 9/18.6`. At K5's inset width of 470 px
that is **971 px tall**, against a 1080-line frame with margins — it does not fit.

Two ways out, recorded in §4.4: crop to the screen only and drop the bezel (which is what K3's
tracker inset does), or scale to fit height and accept ~270 px of width. **Decide from the rendered
frame.** This is the second time K5's numbers have failed to transfer, so the rule stands: measure
the clip, then place the inset.

## Q18. Where does the screen get built? — `ASSUMED`

**HTML/CSS, rendered and screen-recorded, in `scripts/k7/`**, matching `scripts/k3/` and
`scripts/k5/`.

The markup and every token already exist in `AppModules.astro`, so this is a small edit of something
real rather than an invention, and a built timeline is the only way to guarantee the counter lands
on the reps in the picture.

**Strongest argument against:** it is a second implementation of a UI that also exists in the RN app,
and the two will drift. Acceptable because the promo screen is deliberately *not* the shipped screen
— it shows `—` where the app shows a pending state, and reps-only where the app shows weight.

## Q19. Should the "Live set" screen ship in the actual app? — `OPEN`

The founder's brief says *"we will design a dedicated user interface screens for that as featured on
landing pages"*, which reads as a product intent, not only a promo asset.

If it ships, it needs to reconcile with `LiveHudScreen.tsx`, which already renders Exercise / Reps /
Weight with confidence and pending states — a richer, more honest surface than the marketing
mockup. **Merging a marketing concept into a working screen is a product decision with a real cost**
and is not auto-decidable. K7 does not depend on the answer.

---

## Tally

**19 questions across both runs — 11 EVIDENCE, 4 ASSUMED, 2 OPEN, 2 SETTLED by the founder.**

New this run: Q15 (the screen must diverge from the site on weight), Q16 (the curl is measurably the
right choice for a live counter), Q17 (the phone shell does not fit at K5's geometry), Q18 (build
location), Q19 (does the screen ship?).
