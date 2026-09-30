# `ironpal_pitch_deck_plan.md` — grilled, auto mode

**2026-09-30.** Every branch of the deck plan walked and answered without the founder; each answer
is tagged `EVIDENCE` (checked in the repo, on the server, or by a measurement), `ASSUMED` (the
recommendation, with the strongest argument against), or `OPEN` (not mine to settle — money,
publishing, legal). The plan was folded to match. **23 decisions: 14 evidence · 6 assumed · 3 open.**

---

### Q1. Is the deck for the SASK jury or reusable for investors?
**EVIDENCE.** The form's headings (problem, solution, market, traction, team, fundraising) are the
rubric, and `SASK_2026_SUBMISSION.md` §3 already ruled that the panel wants an explainer, not the
consumer ad. Built for the jury; a later investor deck adds financials this one deliberately omits.

### Q2. Which template order — YC's, or the form's heading order?
**ASSUMED.** YC's order (title → problem → solution → product → traction → market → model → why
now → team → ask), with the competitive gap pulled to slide 3. The form's own order buries the
solution after market. *Against:* a jury skimming for its rubric headings might prefer them in its
order; mitigated by naming every slide with the rubric word in the footer kicker.

### Q3. How many slides?
**EVIDENCE.** Cap is 15 (form text in TASK.md). Plan uses 14 with one in reserve; the YC guidance
is that fewer, clearer slides win, and one-idea-per-slide leaves nothing to merge.

### Q4. Aspect ratio and canvas?
**EVIDENCE.** A panel reads a Drive link on a laptop (`SASK_2026_SUBMISSION.md` §5); 16:9 at
1920×1080 is the one that never shows letterbox bars in Drive's viewer, and every asset we have is
16:9 or square.

### Q5. Can the claims allowlist cover every product statement in the deck?
**EVIDENCE.** `founder_video_promo_config.json` → `claims_allowlist` (18 claims) plus the marketing
guardrails memory cover slides 2, 4–7, 9–10. Two deck-only facts come from `competitive-landscape.md`
(the table) and `poc/README.md` (the benchmark). Nothing on the deck is said that is not in one of
those sources. Checked by grep while writing §3.

### Q6. Does the POC "validate exercise and rep recognition on two exercises", as the first draft said?
**EVIDENCE — corrected.** No. `poc/README.md` and commit `2a4626a` say: live tick **4.4 ms** on the
A52 (release build), but *"match still unverified"* — the benchmark ran against an empty template
index. What is verified: the app runs on the phone (2026-05-31), BLE B2 on hardware (2026-08-05:
MTU 247, 0 sequence gaps), JVM 8/8, Jest 23, pytest 13, e2e Maestro 6/6 (2026-09-14). The traction
slide now says exactly that and drops the "validated on two exercises" line.

### Q7. Do we publish the early-bird reservation count?
**EVIDENCE — dropped.** Read on the production droplet (`root@45.55.36.33`,
`/opt/ironpal-api/server/emails.db`): the `emails` table has **0 rows**. Either nobody has reserved
or the form path is not wired end to end; either way there is no number to publish. The plan's own
rule applied: not flattering → the line is removed, not rounded. Worth checking the form wiring
before the campaign, separately from this deck.

### Q8. Which market numbers, and how sourced?
**EVIDENCE for $140B / $50B** (allowlist claims 16–17, rounded on purpose per
`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md` accuracy rule 1). **ASSUMED for "nearly 200M members":** the
script doc states the real figure is 195M but cites no source. Kept as *"nearly 200 million gym
members"* with a footnote "industry association estimate"; *against:* an uncited figure on a jury
slide invites the one question we cannot answer — if the founder has no source at hand, delete it
(one line in `deck.html`). The fitness-app market is deliberately not quoted (script doc: estimates
range $9–22B).

### Q9. Do we show a price?
**EVIDENCE.** No. `ironpal-landing-page-plan.md` and its ledger: no public figure until BOM and
tiers are locked. The model slide shows the *structure* (bundle → subscription → gym pack) and the
early-bird mechanics (up to ~50 % off, first 200), which are allowlisted.

### Q10. Do we show unit economics?
**EVIDENCE.** Yes, the volume BOM: **≈ $40–85 per unit at ~1k** and hand-built units ≈ $130–160
(`ironpal-tier1-capture-module-spec.md` §7). It is the one number that tells a jury this is a
sub-$100 build, and it is a documented estimate, labelled as such.

### Q11. Gym pack / B2B on the model slide?
**ASSUMED.** Shown as "later", one tile, no terms. The partnership and reward are OPEN in
`ironpal-self-training-prd.md` §15. *Against:* a jury may weigh a B2B line as vapour; it stays
because the Scout/gym-pack mechanic is the most defensible distribution idea in the docs.

### Q12. The ask — amount and split?
**OPEN.** No document sets a raise; the Kickstarter plan's $25–50k is a campaign goal, not a round.
Recommendation: a pre-seed sized to 200 integrated units + 12 months of the founder's time; the
founder fills `€[ask]`. Until then the slide ships with the fallback wording *"Pre-seed
conversations open — what the next twelve months need"* and the three uses, no figure. The build
script refuses to export a file containing `[ask]` unless told to allow placeholders, and the
fallback text contains none.

### Q13. Roadmap dates?
**EVIDENCE.** None on the slide. `kickstarter-launch-execution-plan.md` line 6: *Target Launch
Date: TBD*. The roadmap is a sequence with "done" marked on the POC step only.

### Q14. Team slide — mention the other startups?
**ASSUMED.** No. The memory and the growth playbook frame "8 startups by directing AI agents" as
the founder's personal-brand hook for an AI-builder audience; a startup-award jury reads it as
divided attention. The slide says solo technical founder, hybrid athlete, everything built and
shipped by him in public. *Against:* it is the truth and the founder may want it said; one line to
add if so.

### Q15. Contact details on the last slide?
**ASSUMED.** ironpal.co and the founder's e-mail (the session's identified user address, this is
his own submission). The X handle `@ironpal_co` in the playbook is a *planned* handle, not
verified to exist, so it is omitted. *Against:* the founder may prefer a different address.

### Q16. Which stills, and do we mirror any?
**EVIDENCE — no mirroring.** The band's ring mark sits on one side; a mirrored still would move it
and contradict the product slide. Layout instead crops with `object-position` so the subject sits
right of the copy. Stills chosen from `web/public/assets/peter/` and `web/public/video/`: cover
`hero-poster.jpg` (band held to lens), problem `peter-typing.jpg`, solution `peter-band-out.jpg`,
product `peter-band-to-lens.jpg` crop, team `peter-close.jpg`, footage backdrop for the app slide
`peter-walk-band.jpg`. All are frames of the campaign film, so deck and film match.

### Q17. The product render on a white background (`headband-hero.jpg`) — use it?
**ASSUMED.** No. It is the studio still with a wordmark on the band; the film's band carries the
ring only and the deck is dark. Using it would put two different bands in front of the jury.
*Against:* it is the sharpest product image in the repo; usable inside a white rounded card if the
product slide feels thin.

### Q18. App screens — real POC recording or the designed screens?
**EVIDENCE.** The designed screens (`scripts/k7/live_set.html`, `scripts/k8/squat_screen.html`),
labelled *Product interface concept* in-frame, because the POC classifies a curl as its negative
class and shows "—" (`scripts/k7/make_inset.sh` header), and form analysis is not built. Same
screens as the film and the site, rendered with the frozen-clock method (`add_init_script`,
`performance.now` stubbed) at a chosen instant: curl at 4.5 s of the 8 s set, squat at its
deepest frame (2.96 s, depth 1.0, `k8_depth.json`).

### Q19. Fonts?
**EVIDENCE.** Montserrat 800 + Inter (site tokens, `web/src`), loaded from Google Fonts at render
time — reachable (HTTP 200 checked). Neither is installed locally, so offline the script falls
back to Liberation Sans and prints a warning rather than silently rendering a different deck.

### Q20. PDF size budget?
**EVIDENCE.** Six JPEGs at 1920 px, q82 ≈ 150–250 kB each, two PNG screens ≈ 100 kB, fonts
subset by Chrome: well under 5 MB against a 30 MB cap. The script measures and asserts.

### Q21. Where does the build live, and does the founder commit it?
**ASSUMED.** `scripts/deck/` for the source, `docs/pitch_deck/` for the PDF and preview, mirroring
`scripts/master/` → `input/kickstarter/master/`. Nothing is committed by the build; the repo's
untracked docs and scripts remain the founder's call (see the mastering doc's open list).

### Q22. Who uploads to Google Drive and pastes the link?
**OPEN.** Publishing. The founder uploads, sets *anyone with the link*, pastes it into Tally. The
plan says so and the script stops at the PDF.

### Q23. Does the video slot get the music master?
**OPEN** — it is also a publishing choice, but the recommendation is firm: `K1_K9_master_eq_music.mp4`
(72.2 s, English, −14 LUFS, rebuilt today with the new K5) is the strongest and most recent cut.

---

## Worth a human veto, riskiest first

1. **Q12 — the ask.** The slide ships without a number. A jury reading "fundraising" expects one.
2. **Q8 — "nearly 200 million members"** has no citation in the repo. Delete it if unsure.
3. **Q14 — leaving the other startups off the team slide.** It shapes how the founder is read.
4. **Q7 — zero reservations in the database.** Not a deck decision, but the campaign's email path
   may be broken; check before the next public push.
5. **Q15 — the contact address.**
