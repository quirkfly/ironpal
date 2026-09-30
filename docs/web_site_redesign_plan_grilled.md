# Web site redesign plan — grilling ledger (auto mode)

**Run 2026-09-30, `grill-me-auto`.** Source: [`web_site_redesign_plan.md`](web_site_redesign_plan.md).
Nobody confirmed anything; provenance is what separates "decided" from "invented".

`EVIDENCE` — from the repo or a measurement, cited. `ASSUMED` — my recommendation, with the
strongest argument against. `OPEN` — not mine to settle. `SETTLED` — the founder's instruction.

---

## A. The hero video

**Q1. Background video behind the copy, or a framed media block beside it?** — `SETTLED`
The founder pointed at `../gitnfit` for "layout and design of hero section video";
`gitnfit-landing-page/src/components/Hero.astro` is a full-bleed background `<video>` under a
gradient with the copy in the left column. That is the layout.

**Q2. Which clips go in?** — `EVIDENCE`
The three in `clips/web/` (K5, K7, K8) are the only silent renders; volumedetect peaks −45.8, −53.7,
−31.3 dBFS. Every other clip is a lip-synced line, and a man visibly talking in a muted loop reads
as a broken player. Only these three.

**Q3. Order.** — `ASSUMED` → K5 → K7 → K8
Product, then the interface counting, then the interface judging — the film's own escalation, and
the loop reopens on the strongest frame (band to the lens). *Against:* K8→K5 is the biggest jump of
the three (26.4); but Q5 dissolves it, and any other order puts a weaker frame first.

**Q4. Are the web clips the master's clips, so geometry and timings transfer?** — `EVIDENCE`, no
Mean-pixel difference against the master's inputs: K5 20.7, K8 9.6 (identical renders score 0.1);
the master's K7 source no longer exists as a bare file. Everything picture-derived is re-measured:
subject columns (K5 676–1216, K7 384–788, K8 928–1204), K7 rep tops (0.96 · 2.58 · 4.38 s + one
to confirm), K8 depth signal (re-extracted at implementation by the K8 plan's rows-16–22 method).

**Q5. Hard cuts or dissolves between beats?** — `EVIDENCE` → 0.5 s dissolves
Measured: K5→K7 25.6, K7→K8 15.8, K8→K5 26.4 mean-pixel at the cut, against ~1 within a clip and
33 for the K6 tail-to-mat cut that had to be removed. A background loop is glanced at, not watched;
hard jumps of that size read as glitches. **Loop seam:** the file ends with a 0.5 s dissolve from
K8's tail into K5's first frames, so when the browser jumps to frame 0 the picture is one it has
already arrived at. Runtime 8+8+8 − 2×0.5 + 0.5 = **23.5 s**.

**Q6. K7 inset placement.** — `EVIDENCE`
Subject ends at 788 px; 1132 px free on the right. 560 wide at x = 1300, y = 60 → ends 1860, 512
px clear. The film's K7 numbers are not reused (Q4).

**Q7. K8 inset — left as in the film, or right?** — `EVIDENCE` → right
The film plan chose left because he faces left and the left third is empty. On this page the left
column is the copy under the heaviest scrim (`.96` at 0 %). Measured free right margin is 716 px; a
520-wide inset at x = 1340 ends 1860, 136 px clear of his back at 1204. Right — and both insets
then sit in the same region of the loop. *Against:* he faces away from the inset; irrelevant for a
UI panel, and the copy column matters more.

**Q8. The mirror-figure in the background of K7 — and, found during implementation, K8 — re-roll or mask?** — `OPEN`
Confirmed at full resolution in both: K7 has a man with his back to camera, curling, beside a tripod
at x 780–1000 / y 235–440, above the rack against the wall; K8 has a smaller one at x 900–980 /
y 225–355 beside the far end of the barbell. *"He is ALONE in the shot"* was ignored twice.
**Recommendation: re-roll both** — the silent curl and the side-view squat are the two prompts that
rendered first time; 20 credits. Spending credits is the founder's call, so the build ships with
stopgaps: K7 masked with a wall-coloured feathered patch kept off the rack (a first attempt sampled
the floor and painted a visible brown blob — corrected), K8's gallery still painted, K8's video left
alone because the figure overlaps the bar. Nothing waits on it.

**Q9. Dim to gitnfit's `brightness(.55)`, or less?** — `ASSUMED` → `.7`
gitnfit's video has nothing to read. This one carries two app screens with 19–32 px type; at 55 %
they go to mud. *Against:* at 70 % the copy over K5 (subject centred, 676–1216) has less scrim to
sit on — mitigated by the scrim already being `.96` at the left edge, where the copy is.

**Q10. Keep the floating HUD card in the hero?** — `ASSUMED` → remove
It fakes a reps/weight ticker in the right column, which is exactly where the K7/K8 insets now
are: two UIs, one lying. The video is the HUD. *Against:* it is the only element that stays legible
on phones (Q12) — but Q12 hands that job to the FormTracking section.

**Q11. Poster frame.** — `ASSUMED` → `web/K5.mp4` @ 6.5 s
Band held to the lens, eyes on camera. It is also the ProductSpotlight image (Q17), so one still
does the first paint, reduced-motion and the product slot.

**Q12. Phones: `object-fit: cover` crops the sides — the insets vanish.** — `ASSUMED`
Keep the video on phones (gitnfit does; nothing in its CSS hides it below 720 px) with
`object-position: 35% 50%` so K7's Peter (left of centre) and K5's (centred) stay in frame; accept
that the right-hand insets are cropped out on narrow screens. The **FormTracking section carries
the live screen** for those viewers, at phone scale, interactive. *Against:* poster-only on phones
would save ~3 MB per mobile visit; the founder asked for the video to be seen, and `preload=
"metadata"` already defers the bytes until autoplay is permitted.

**Q13. Encode.** — `EVIDENCE`
Reference `promo.mp4`: 1920×1080, 43.6 s, 3.0 MB ≈ 550 kbps. Target the same class: H.264 CRF 26,
preset slow, faststart, no audio track (the tracks are near-silent and autoplay requires `muted`
anyway); ≤ 3 MB at 23.5 s. VP9 WebM as an optional first source. `dist/` is gitignored, `public/`
is not — a 3 MB binary in the repo is within reason for this site.

## B. The page

**Q14. Are any current site images Peter?** — `EVIDENCE`, none
Sheeted all seven: `hero-bench` and `worn-headband-male` are another athlete, `worn-headband` and
`cta-bg` a woman, `wide-athlete` a third man, `pov-weightstack` a hand, `headband-hero` the product.
`og.jpg` unverified, treated as not Peter. All replaced.

**Q15. Where do pictures of Peter come from?** — `EVIDENCE` → the film's frames
His real photographs (`geggen/…/reference/`) are two outdoor selfies in a winter hat and a race cap
and a 466 px B&W upscale — wrong room, wrong resolution. The Leonardo K8 figure was generated from
a persona description, not the mint, and is not recognisably him. Every K1–K9 clip *is* the minted
Peter in the gym in the wardrobe; nine frames were chosen from a 12-candidate sheet. *Against:*
they are AI renders — as is every image currently on the site (§3.3 of the plan).

**Q16. Remove `VideoReveal`?** — `EVIDENCE` → yes
`reveal.mp4` is hands-only in a pale daylit gym — the framing the founder rejected outright
(*"anonymous hand … will kill the video"*) and the wrong room. Its job — the band coming out of the
bag — is now the hero's first beat. The 4.1 MB file goes with it.

**Q17. ProductSpotlight: the studio still of the product, or Peter holding it?** — `SETTLED`
"Only images of Peter" — so `peter-band-to-lens`. *Against, for the record:* the studio still is the
only image with the wordmark legible; it is kept on disk and could return as a small inset if the
lockup is missed.

**Q18. The K6 defect frame (hands splayed at face height).** — `EVIDENCE` → not used
§5.12 of the promo doc records it as a broken take. Excluded from the candidate set.

**Q19. Alt text: "a man" or "Peter"?** — `ASSUMED` → Peter, by name
The instruction is not "a man in the gym", it is the founder. Naming him is the point and is true.

## C. The form-tracking section

**Q20. May the site claim form tracking?** — `EVIDENCE` → only as being built
`claims_allowlist` (18 entries) has no form/technique/posture/coaching claim; the site does not
claim it; the K8 design plan §5 records that the headband cannot see the body. The site's own
precedent for an unshipped headline is weight-reading — a module plus a hedge. Copy and FAQ say
*being built rather than shipped*; no "corrects", "coach", "trainer", score or verdict. *Against:*
the founder chose an assertive line for the K8 clip; a site line is a validated claim in a way a
film line was not, and the stronger wording is allowlist entry 19 — a decision, not a copy edit.

**Q21. Interactive live screen, or a video of the screen?** — `SETTLED` → live
The brief says "interactive UI screens", and `squat_screen.html` already renders from a depth
value with no dependencies. It becomes `FormTracking.astro`, driven by the measured web-K8 depth
signal, looping, paused off-screen. The hero's insets stay as baked video (a background loop cannot
host live DOM under `object-fit: cover`).

**Q22. Placement.** — `ASSUMED` → after AppModules, before Stats, id `#form`
The fourth thing the interface shows, in the film's order. No Nav item: three anchors is the whole
nav and "The tech" reaches it. *Against:* a `#form` nav item would advertise the newest idea;
adding a fourth anchor also crowds the mobile nav.

**Q23. Phone-shell scale and type.** — `EVIDENCE`
AppModules' `.phone` is `clamp(238px, 26vw, 290px)` with `scr__*` type at 10–32 px; the inset's
19–32 px sizes were for a 620-wide render. The section reuses AppModules' shell and type so the
four screens on the page read as one app.

**Q24. Reduced motion in the live screen.** — `ASSUMED` → hold the bottom-of-squat frame
The most informative single frame: all three markers at their extremes.

## D. Shipping

**Q26. The squat still beside the form phone.** — `EVIDENCE` → behind the phone
Screenshot of the first build: at the media box's real width (half the 1140 px wrap, minus padding)
the phone took its 290 px and the sibling still collapsed to ~80 px — useless. Moved behind the phone
at 34 % opacity, the pattern AppModules already uses for its background image. Verified at 1440 and
390 px.

**Q25. Deploy.** — `OPEN`
The plan ends at a built `dist/` with a verified asset set. Publishing is external and the
founder's action.

---

**26 decisions: 13 evidence · 8 assumed · 3 settled · 2 open** (Q8 re-roll both clips, Q25 deploy).
