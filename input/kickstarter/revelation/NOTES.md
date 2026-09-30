# `ironpal_revelation` — the reveal, with Peter in it

**Written 2026-09-30.** Prompt: [`clip_prompt.txt`](clip_prompt.txt). Replaces the hands-only reveal
currently on the landing page (`web/public/assets/reveal.mp4`).

## What the landing-page clip actually is, measured

4.00 s · 4096×2304 · 24 fps, and three things about it drove this prompt:

- **It is hands-only**, framed at waist level — no face, no head. That is the *"anonymous hand
  pulling a headband out of a bag"* framing the founder rejected outright as something that
  *"will kill the video instantly"*.
- **It is the wrong gym.** Pale cream floor, daylight, bright blurred equipment. K1–K7 are all
  *dark, moody, matte black rubber floor, lit low and warm*. Cutting the existing clip against the
  film would read as two different places.
- **The band in it is unbranded**, and he wears a black t-shirt with a teal sleeve band rather than
  the film's tank top.

**So the prompt reuses its action and its rhythm — one hand into the bag, one continuous lift — and
replaces its framing, its room and its wardrobe.**

## The decisions, and why

**Medium shot, waist up, not the close-up.** The whole point of the rework is that Peter is in it.
That costs band size: at 50 mm and two metres the band is smaller in frame than the landing clip's
macro view. It is the right trade — the film already carries the product in close-up in K5, and the
still `band_in_hand` carries the full lockup — but **do not expect this clip to read as a branding
shot.** Its job is the founder holding the thing he built.

**The lift is stated as travel, not position.** K7 cost eight takes, and the two frozen ones both
came from clauses a motionless man satisfies. Here the band *"travels the whole distance, from down
inside the bag to up at his chest"*, with three named waypoints — hidden, top edge clearing the rim,
hanging clear — and *"it rises once and it does not go back down."*

**The grip is the hand guard, and this is the highest hand risk in the project.** Two hands, one of
them closing around a *deformable* object, moving up through the frame toward the face. K5 and K6
protected hands by keeping them empty; that is unusable here. So the guard is a fixed pose to hold
rather than a prohibition to obey: *grip stays closed for the entire clip, never lets go, never
opens the palm, never swaps hands*, plus an explicit clause that the band keeps its shape and does
not turn into another object.

**Silent.** The landing page autoplays it muted, so a line buys nothing — and K7 established that a
lip-synced line is what suppresses movement, with the silent variant rendering correctly first time.
Silence is asked for three ways (mouth closed, no speech, audio silence) because no other clip in
this project has a deliberately silent one.

## Two things to settle before spending credits

1. **Which character.** The prompt names **`Peter Headband`** because that is the character that
   exists in the Flow project — but that character's wardrobe *puts the band on his head*, and in a
   reveal he must not already be wearing it. The prompt overrides this explicitly (*he is NOT
   wearing a headband on his head; the only headband in the shot is the one in his hand*), **and
   that override is untested.** If a bandless character exists (the config has `Peter Pitch`),
   resolve against that instead and the conflict disappears. **Check this first — it is the most
   likely way this clip fails.**
2. **Reference stills would probably pay for themselves.** K7 took eight takes on prompt wording
   alone; K8 landed first time with stills attached. Two would cover this: the band still inside the
   bag with his hand entering, and the band held at chest height. The same discipline applies — one
   template, one substituted clause (`scripts/k7/make_ref_prompts.py` is the pattern).

---

# The spoken version — `clip_prompt_spoken.txt`, which replaces K5

**Written 2026-09-30.** Same reveal action, but he **speaks K5's line while doing it**, so this is a
replacement for §5.9's K5 prompt rather than a landing-page asset. The silent
[`clip_prompt.txt`](clip_prompt.txt) above stays as the muted loop for the web page.

## The sync is the whole opportunity, and it is free

K5's line is three sentences, and the action has three beats. They line up exactly:

| he says | his hand does |
|---|---|
| *"IronPal."* | right hand down inside the bag, closing on the band, starting to draw it up |
| *"A headband."* | **the band clears the rim and comes fully into view** |
| *"It watches my set and fills in the log itself."* | holds it at chest height, turns its face to camera, eyes up to the lens |

**The object appears on the word that names it.** That is the strongest sync available in this film
and it costs nothing — the line was already written that way, in three clipped fragments, before
anyone thought of pulling the band out of a bag.

It is also the mechanism K7 spent four attempts proving: pinning motion to the phrases of the line
stops the movement and the speech competing and makes them one performance. **It failed on K7 for a
reason that does not apply here** — the curl's one-armed prior overrode every instruction. A single
lift has no competing prior.

## The risk, stated honestly, and why it is lower than it looks

**Speech plus movement is the combination that cost K7 eight takes.** But the failures there were
all *cyclic exercise* — four curls, repeated, counted. Everything in this film that speaks while
making a **single gesture** has worked first time: K1 and K4 walking, K2 gesturing, K5 and K6
standing, K9 walking. A lift out of a bag is a gesture, not an exercise. **This is much closer to
what works than to what failed.**

What genuinely is risky is the object: a *deformable* fabric loop gripped in a moving hand, which
nothing in this project has attempted. The grip guard is stated as a fixed pose to hold rather than
a prohibition to obey, plus an explicit clause that the band keeps its shape and does not turn into
another object.

## What changed from K5's prompt, and why

- **His hands can no longer talk.** K5's proven delivery clause asked for *open palms, relaxed
  fingers, easy natural gestures kept LOW and OPEN* — impossible when one hand is in a bag and the
  other is steadying it. **The energy is reassigned to his face**: eyebrows active, eyes bright, a
  genuine smile breaking through as the band comes clear, a slight lean in on the last few words.
  The audio delivery clause is kept **verbatim** from K5 because it is proven.
- **He is bare-headed, and that is now load-bearing.** K5 had the band on his forehead; here it must
  be in the bag. Stated three ways.
- **The right third stays empty.** Kept from K5 — see the open question below.

## Two things to settle

1. **The character override is still untested, and it matters more here.** The prompt resolves
   against `Peter Headband`, whose wardrobe *puts the band on his head* — and this clip's entire
   premise is that it is in the bag. The override is explicit (*his head is bare … the only headband
   anywhere in the shot is the one he lifts out*), but if a bandless character exists, use it. **This
   is the most likely way the clip fails.**
2. **Does K5 still need its product inset?** §5.9 added `k5_product_inset.mp4` — a push-in on the
   branded still — precisely *because* he could not hold the band up. **Now he does.** The inset may
   have become redundant, or may still be wanted because it carries the wordmark the generated band
   will not have. The prompt keeps the right third empty either way, so the option stays open and
   costs nothing; decide it from the render.

---

# Take 1 of the spoken version, and the hold fix — 2026-09-30

**What rendered (the `K5.mp4` now in the master):** 8.00 s. The lift itself worked — the band
clears the rim at ~1.5 s, on cue, grip closed, shape intact, no lettering, head bare. **The hold did
not.** Measured from a 2 fps contact sheet and the speech envelope:

| time | band | voice |
|---|---|---|
| 0–1.5 s | in the bag, coming up | "IronPal." |
| 1.5–4.5 s | at chest height, turned to camera | "A headband. It watches my set…" |
| **4.5–8.0 s** | **sinks steadily, resting on the bag rim, low in frame, by the end** | "…fills in the log itself." ends at 6.4 s, then 1.6 s of silence |

So the viewer gets about three seconds of band at chest height, most of it while it is still rising
and turning, and the clip ends with it back down at the bag. The founder's note: *"he puts it back
immediately as soon as he finishes talking and the viewer has not had enough time to notice it."*

**Why the prompt lost.** The hold was carried by one clause — *"keeps it there until the end of the
clip"* — against the model's strongest ending prior, which is to return the hands to rest and put
the object away. K7's lesson was that a motionless man satisfies a position clause; this is the
mirror: a clip that ends "naturally" satisfies a duration clause and still lowers the band.

**What changed in `clip_prompt_spoken.txt`** (previous text kept as `clip_prompt_spoken_v1.txt`):

1. **The hold is an end state, not a duration.** *"THE BAND STAYS UP THERE, AT CHEST HEIGHT, FOR
   THE REST OF THE CLIP — through the last word, through the silence after it, to the final
   frame."* And he *"finishes the line well before the clip ends and simply stands there presenting
   the band."*
2. **The travel clause got its mirror.** The lift was stated as travel with waypoints and that
   worked; now the non-travel is stated the same way: *never sinks, never lowers, never drifts
   back toward the bag, never touches the rim, never goes back inside; right hand stays raised from
   the moment it clears until the very last frame.*
3. **A dedicated ending clause**, because the ending is where it failed: *"THE CLIP ENDS MID-HOLD.
   No putting-away, no lowering, no wrapping-up gesture, no return to rest… The LAST frame shows the
   band held clearly ABOVE the bag at chest height, at least as high as it was on the word
   'headband' — never lower than that in any later frame."* A comparison to a named earlier moment
   gives the model something concrete to keep.
4. **The audio tail says the same thing**: silent, mouth closed, *band raised exactly where it was
   on the last word, for every remaining frame.*

Nothing else moved: the lift beats, the grip guard, the bare head, the framing and the verbatim
delivery clause are as in take 1, since those all rendered.

**When it comes back:** check the last second first. If the band is still at chest height at 8.0 s
the clip drops into the master with `K5` untrimmed as before (`build.py`, then `--music`). If it
still sinks, the fallback that costs no credits is to **freeze-frame** the best hold frame (~3.5 s)
for the tail of the clip — the camera is locked off and he is nearly still there, so a 2 s hold on
one frame reads as a pause, not a freeze. The product inset question from above is still open.
