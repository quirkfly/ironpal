# IronPal — X (Twitter) Posts

**Source strategy:** [`ironpal-distribution-channel-plan.md`](./ironpal-distribution-channel-plan.md) + decisions log [`ironpal-distribution-channel-plan_grilled.md`](./ironpal-distribution-channel-plan_grilled.md)
**Account:** `@ironpal_co` → links to **ironpal.co**
**Phase:** Manual posting (free — see note). These are **drafts for the human gate** — scrub every image before posting.
**Last updated:** 2026-06-29

This is a **10-post chronological arc** tracing IronPal's *development*: how it's learning to read the **exercise**, the **reps**, and the **weight** from a first-person headband camera. Kickstarter is intentionally out of scope here — this is the product-build story.

---

## Guardrails baked in (do not violate when editing)

- **Honest, not hype.** Wins *and* misses. The real misses (deadlift→triceps pushdown, invisible reps) are the most compelling content and build trust — keep them.
- **No moat (Q2).** Show *what* happened and *what was learned in plain terms* — never the recognition method, prompts, KB rules, or sensor-fusion specifics.
- **Weight-reading framing (§7):** the headline-hard problem **being proven**, not a shipped, always-works feature. Genuine wins (the "spot on" plate read) are shown as wins; the frontier is shown as a frontier.
- **Privacy:** if it ever comes up — reps/exercise run on-device; weight uses one cloud frame that's deleted. NEVER "no cloud / faces blurred / works today."
- **CTA = soft "follow the build"** (Q10); `ironpal.co` only where it fits. Audience is builders first (Q9).
- **Manual posting is free** — the X API pay-per-use cost ($0.015/post, $0.20 with a link) only applies to Phase-2 automation. Posting these by hand costs $0.

### ✅ Export-ready images — attach these (`feed/batch2/images/`)
All X-sized, ≤ 5 MB, real analysis frames/montages. Total ~2.6 MB.

| Post | Pillar | File | Dims | What it shows |
|---|---|---|---|---|
| 1 | intro | `p01_mission_product.jpg` | 1080² | Product hero render |
| 2 | POV | `p02_pov_montage.jpg` | 1600×901 | Egocentric first-person montage |
| 3 | exercise | `p03_exercise_barbell.jpg` | 1600×1353 | Barbell handling montage (grip lesson) |
| 4 | exercise | `p04_exercise_cable_miss.jpg` | 1600×901 | Triceps cable montage (cable-vs-bar miss) |
| 5 | reps | `p05_reps_peaks.jpg` | 901×1600 | Rep "peaks" — weight looming each rep |
| 6 | reps | `p06_reps_invisible.jpg` | 1600×1014 | Axial-stroke reps (nearly invisible) |
| 7 | weight | `p07_weight_platewin.jpg` | 1219×1350 | Plate read off footage: 2 kg / 4.4 lb |
| 8 | weight | `p08_weight_frontier.jpg` | 1080² | Blurred weight stack (the frontier) |
| 9 | method | `p09_method_jointtrace.jpg` | 1500×1410 | Frame-by-frame joint tracing |
| 10 | close | `p10_close_lockup.jpg` | 1080² | Brand lockup |

> ⚠️ **Per-image scrub before posting (Q12):** these are real first-person home/gym frames — no faces or paths are visible, but confirm per image. The plate frame deliberately shows a legible "2 kg / 4.4 LB" embossing (that's the point); fine to post.

---

## Post 1 — The mission
**Pillar:** intro · **Image:** `p01_mission_product.jpg`

> 🔧 Build log #1
>
> I'm building IronPal: a headband camera that watches your set and logs it for you — the exercise, the reps, the weight — so you never tap your phone between sets.
>
> The catch: it has to read all of that from a camera on your *head*. That's the whole challenge.
>
> Follow the build. 👇

- *Alt:* "IronPal concept render — matte-black fitness headband with a small front camera and teal LED."

## Post 2 — What the headband actually sees
**Pillar:** POV · **Image:** `p02_pov_montage.jpg`

> #2 — Here's the problem in one image.
>
> This is what the headband sees: your own hands, some equipment, the floor, motion blur. No tidy side-on gym-cam angle. No labels.
>
> Exercise, reps, weight — all of it has to come from this messy first-person view.
>
> Could you tell what exercise this is?

- *Alt:* "A grid of egocentric (head-mounted) frames looking down at hands and gym equipment — the raw input IronPal works from."
- *Engagement:* opens a guessing game — replies = engagement.

## Post 3 — Naming the exercise (and the grip that fooled me)
**Pillar:** exercise recognition · **Image:** `p03_exercise_barbell.jpg`

> #3 — Teaching it to name the exercise.
>
> First hard lesson: the grip decides everything. Palms-up vs palms-down turns the *same* arm motion into two completely different lifts.
>
> Early on it confidently called a barbell curl an "upright row" — because it trusted a blurry frame instead of actually reading the hands. Wrong.
>
> Scorecard kept in public. 📋

- *Alt:* "First-person montage of a barbell being handled, looking down at the bar and floor."

## Post 4 — The miss that taught me the most
**Pillar:** exercise recognition · **Image:** `p04_exercise_cable_miss.jpg`

> #4 — My most useful mistake so far.
>
> I was *certain* this was a deadlift. Loaded bar, both hands gripping, pulling.
>
> It was a triceps cable pushdown. 🤦
>
> A cable-machine straight bar looks identical to a barbell from a headband — until you notice what it's connected to. That single tell changes the whole answer.
>
> Confident ≠ correct. What would you have guessed?

- *Alt:* "Egocentric montage of a triceps cable pushdown — a straight bar held in both hands, looking down."
- *Engagement:* "what would you have guessed?"

## Post 5 — Counting the reps
**Pillar:** rep counting · **Image:** `p05_reps_peaks.jpg`

> #5 — Counting reps from your own POV.
>
> A trick that works: watch the weight *loom*. It swells huge as it rises toward your face at the top of each rep, shrinks at the bottom. Count the peaks.
>
> On this alternating curl set it landed within a rep of the truth. Not perfect — but close, and sharper every clip.
>
> Count the peaks 👇 how many do you get?

- *Alt:* "A grid of rep peaks — a dumbbell appearing large and close at the top of each curl, from the headband view."
- *Engagement:* "how many do you get?" (the montage is countable by eye).

## Post 6 — When the reps are invisible
**Pillar:** rep counting · **Image:** `p06_reps_invisible.jpg`

> #6 — The reps a camera literally can't see.
>
> On a triceps pushdown your head stays dead still and the bar pushes straight *away* from you — so the picture barely changes frame to frame. Vision counted zero. Reality: 5 clean reps.
>
> That's exactly why IronPal pairs the camera with motion sensors. The camera alone isn't enough — and pretending it is would be dishonest.

- *Alt:* "Closely-spaced frames of a triceps pushdown where the image barely changes between reps — the 'invisible rep' problem."

## Post 7 — Reading the weight (a real win)
**Pillar:** weight · **Image:** `p07_weight_platewin.jpg`

> #7 — The hard one: reading the actual weight.
>
> No QR codes, no calibration — just whatever the camera can see. On this set it read the plate straight off the footage: **2 kg / 4.4 lb.** The lifter's verdict? "Spot on." ✅
>
> This is the feature almost nothing else attempts. It's not solved everywhere yet — but moments like this are the whole reason I'm building it.

- *Alt:* "A hand holding a cast-iron plate with '2 kg / 4.4 LB' embossing legible — read directly from first-person footage."

## Post 8 — …and why weight is brutal
**Pillar:** weight · **Image:** `p08_weight_frontier.jpg`

> #8 — Same goal, a much meaner frame.
>
> Mid-rep the plates blur, the numbers smear, the stack half-hides behind a hand. Now read *that*.
>
> Weight-reading is the frontier I'm still cracking. I'd rather show you the ugly frames than fake a demo.
>
> How would *you* read the load off a shot like this?

- *Alt:* "A motion-blurred first-person view of a weight stack, plate numbers barely legible."
- *Engagement:* genuine open question to builders/lifters.

## Post 9 — How it actually gets better
**Pillar:** method · **Image:** `p09_method_jointtrace.jpg`

> #9 — The unglamorous part nobody posts.
>
> Every clip, it commits a guess — exercise, reps, weight — *before* the truth is revealed. Then we score it: predicted vs actual, and bank the lesson.
>
> Slow, boring, and the only honest way to know it's actually improving instead of just *sounding* confident.

- *Alt:* "A montage tracing a working joint frame-by-frame through a movement."

## Post 10 — Where this is going
**Pillar:** close + CTA · **Image:** `p10_close_lockup.jpg`

> #10 — The whole point:
>
> Walk into any gym, do your workout, walk out — and your entire session is already logged. No phone, no buttons, no "wait, was that 8 or 9?"
>
> It's early. The misses above are real. But it gets sharper every single clip.
>
> Following along → ironpal.co

- *Alt:* "IronPal logo lockup — circle mark + wordmark on black."
- *CTA:* the one post that carries the `ironpal.co` link (keep links rare — they throttle reach and cost on the API later).

---

## Posting plan (chronological, 2×/week per Q5)

| # | Theme | Pillar | Image | Slot |
|---|---|---|---|---|
| 1 | Mission | intro | product render | Wk1 · Tue (pin) |
| 2 | What it sees | POV | egocentric montage | Wk1 · Fri |
| 3 | Naming the exercise | exercise | barbell montage | Wk2 · Tue |
| 4 | Most useful miss | exercise | cable montage | Wk2 · Fri |
| 5 | Counting reps | reps | rep peaks | Wk3 · Tue |
| 6 | Invisible reps | reps | axial stroke | Wk3 · Fri |
| 7 | Reading weight (win) | weight | plate read | Wk4 · Tue |
| 8 | Weight is brutal | weight | blurred stack | Wk4 · Fri |
| 9 | How it improves | method | joint trace | Wk5 · Tue |
| 10 | Where it's going | close | lockup | Wk5 · Fri |

**Reminders**
- Manual posting = **$0**; just paste text + attach the `feed/batch2/images/` file.
- Reply to every comment during validation (Q4); tag any `ironpal.co` signups `source=social`.
- Posts 2, 4, 5, 8 end on a question — lean into the replies; that's the engagement signal that matters.
- After ~4 weeks / these 10 posts, run the **Q4 go/no-go** before building any automation.

---

## Founder amplification & personal-account growth

The playbook for boosting these posts from the founder's personal account — and growing that account from 0 followers organically ($0) — now lives in its own doc:

→ [`ironpal-personal-account-growth-and-amplification-playbook.md`](./ironpal-personal-account-growth-and-amplification-playbook.md)
