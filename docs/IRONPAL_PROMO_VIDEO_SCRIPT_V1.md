**Status:** V1 · 2026-09-29 — **shoot closed: all nine clips shot (K1–K9).** Punch list in §5.18. Allowlist entry 19 and the eight-clip config are the two things blocking a scripted run; K7, K8 and K9 are not yet in the repo, so none of the last three is measured and K7's inset is still on placeholder timings. Runtime is ~76.5 s against a ~59 s budget
**Scope:** clips K1 to K6, all shot. The remaining clips are unchanged and live in [`founder_video_final.md`](founder_video_final.md).  
**The six scripts this came from:** [`founder_video_scripts.md`](founder_video_scripts.md) · **the machine form:** [`founder_video_promo_config.json`](founder_video_promo_config.json) · **how to drive Flow:** [`founder_video_flow_runbook.md`](founder_video_flow_runbook.md)

> **The brief for this rework.** K1 stops being the personal hook (*“Yes, there’s a camera on my head”*) and becomes an argument: the fitness industry is enormous, it is full of tracking, and all of it still needs you to type. The founder delivers it to camera in slow motion, as a pitch. **The headband must not be visible in K1** — it is introduced later, so the clip needs a Peter who is not wearing one.

---

## 1. Task 1 — what the fitness industry actually makes

Figures are for 2026 and were checked on 2026-09-27. Estimates differ between research firms, so the last column says what may safely be said out loud.

| what | 2026 | note | source |
|---|---|---|---|
| Global health and fitness clubs | **$142.6 bn** | up from $131.3 bn in 2025, ~9.7 % CAGR | [Fortune Business Insights](https://www.fortunebusinessinsights.com/health-and-fitness-club-market-108652) |
| Clubs worldwide | **207,800** | — | [Wellness Creatives](https://www.wellnesscreatives.com/fitness-industry-statistics-growth/) |
| Members worldwide | **195 m+** | say “nearly two hundred million”, never “two hundred million” | [Wellness Creatives](https://www.wellnesscreatives.com/fitness-industry-statistics-growth/) |
| Fitness trackers market, 2026 | **$51.3 bn** | the spend on things you strap on | [Statista](https://www.statista.com/outlook/hmo/digital-health/digital-fitness-well-being/fitness-trackers/worldwide/) |
| US fitness market, 2026 | **$48.2 bn** | 81 m US members, an all-time high | [ABC Fitness](https://abcfitness.com/abc-articles/fitness-industry-statistics/) |
| Fitness apps, 2026 | **$9.1–22.4 bn** | estimates diverge by a factor of two — **do not quote this one** | [Statista](https://www.statista.com/outlook/hmo/digital-health/digital-fitness-well-being/health-wellness-coaching/fitness-apps/worldwide/) · [Research and Markets](https://www.researchandmarkets.com/reports/5767298/fitness-app-market-report) |

**Two accuracy rules for anything spoken on camera.**

1. **Round to “a hundred and forty billion”.** The precise figure varies by firm and a decimal invites a challenge the video does not need.
2. **“Nearly two hundred million members”, never “two hundred million”.** The real number is 195 million. The video is on the record and this is a free correction.

Do not quote the fitness-app market. The 2026 estimates run from $9.1 bn to $22.4 bn depending on how the category is drawn, which is not a number to put in a founder’s mouth.

---

## 2. The K1 line — scale only

**“Everyone still types” has been cut from every option.** That complaint is K2’s job now, so K1 states the size of the industry and stops. Each line below also says **fitness** out loud: “gyms” on its own leaves the category to be inferred, and this clip exists to establish it.

**The delivery changes the budget.** At the 2.04 words/second measured on the handlr renders an 8-second clip holds 16 words — but this one is a slow, deliberate pitch, and at roughly 1.7 words/second it holds only 13. Lines are measured at both rates and the ones that overrun a slow reading are marked. Pick from the safe ones unless the first render shows the voice running faster than expected.

| | words | normal | slow | line |
|---|---|---|---|---|
| **A** | 12 | 5.9 s | 7.1 s | The fitness industry makes a hundred and forty billion dollars a year. |
| **B** | 14 | 6.9 s | 8.2 s **overruns** | The fitness industry, a hundred and forty billion a year. Trackers, fifty billion more. |
| **C** ← | 13 | 6.4 s | 7.6 s | Gyms, a hundred and forty billion a year. Fitness trackers, fifty billion more. |
| **D** | 14 | 6.9 s | 8.2 s **overruns** | The fitness industry, a hundred and forty billion a year. Two hundred million members. |
| **E** | 13 | 6.4 s | 7.6 s | The fitness industry is worth a hundred and forty billion dollars. Every year. |
| **F** | 14 | 6.9 s | 8.2 s **overruns** | Nearly two hundred million gym members. A hundred and forty billion dollars a year. |

**CHOSEN 2026-09-27: C.**  “Gyms, a hundred and forty billion a year. Fitness trackers, fifty billion more.”

**Why C — gyms plus trackers — fits a slow delivery.** It carries two figures rather than one, which is what makes it an argument instead of a statistic, it names fitness explicitly through “fitness trackers”, and it is one of the few that still fits if the delivery is slow. The tracker number is what earns K2: fifty billion dollars spent on things you strap on, and not one of them can tell you what you lifted.

A note on the arithmetic, in case it is ever challenged. The two figures are **separate markets**, not a whole and its part — health clubs are $142.6 bn, fitness trackers are $51.3 bn alongside them. So “fifty billion more” is correct and “fifty billion of that” would not be. Do not add them into a single number either; the categories are drawn by different firms and the sum would be yours, not theirs.

What each option is doing:

- **A** — plainest, names the industry.
- **B** — industry plus trackers — two numbers.
- **C** — gyms plus trackers — fits a slow delivery.
- **D** — scale plus people.
- **E** — shortest, heaviest.
- **F** — members first.

---

## 3. How K1 is shot

| | |
|---|---|
| framing | waist-up, facing camera. **No clip in this script is full-body** — verified against the builder: five of eight are tight head-and-shoulders and the widest, K1 and K8, are medium-wide from the waist up. Full-body is also where a generated face drifts worst. |
| word budget | **13 words, not 16.** A slow delivery costs about two words of the clip — see §2. |
| delivery | slow motion, a pitch delivered to camera. Measured and unmeasured: the pipeline asks for “genuine expression, real inflection” because a flat reading was the complaint on two handlr clips; slow motion is a new instruction and the first render will say whether Flow honours it. |
| product | **absent.** No headband, nothing on his head, nothing around his neck. |
| character | `Peter Pitch`, not `Peter` — see §4. |

**Absence has to be asserted, not merely left out.** A prompt that simply fails to mention a headband will get one back, because the character it resolves against wears one. The body prompt in §4 spells out the bare head in its own sentence for that reason.

---

## 4. Task 2 — `Peter Pitch`, the bandless character

> **Minted 2026-09-27.** `Peter Pitch` exists in the project with both variants, built from the approved `Peter` portrait plus the tank-top photograph. The config carries him as cast slot `pitch`, and K1 is the only clip that resolves against him.

### 4.1 Why a second character and not a second variant

Clips resolve against a **character**, and the existing `Peter` carries the headband in his body variant — that is the whole point of him. A K1 generated against him inherits the band. So K1 needs its own character, minted the same way, wearing nothing on his head.

The name must differ too. Two characters sharing a name is a documented hazard in the pipeline notes: which one a prompt resolves against is unmeasured. Driving the interface by hand you attach the chip explicitly, so the risk is mostly yours to misclick — but distinct names remove it.

### 4.2 References

| | |
|---|---|
| 1 (the anchor) | **the approved Portrait from the existing `Peter`**, via *Add from project* — the highest-resolution image of the face that exists in this project, and already Flow-native |
| 2 | `~/job_stuff/prj/geggen/products/ironpal/reference/peter_01_tanktop_x4.png` — ground truth against the portrait being a generation of a generation, and it establishes the black tank top |
| **not** | `band_as_worn.png`, obviously. Nor `peter_face_colour_x4.png` (mirrored sunglasses hide the eyes) or `headband-hero.jpg` (the studio object that produced a chunky gadget). |

The first image is treated as the character reference, so order matters.

### 4.3 Portrait prompt

Unchanged from the version that worked. Paste the whole block — the background and framing clauses are at the end, and a truncated paste is what put a brick wall behind the first attempt.

```
Head-and-shoulders portrait of this exact person. Keep their face: same bone structure, same hairline, same eyes, same mouth. Do not change who they are, do not smooth, slim or de-age them; keep age-appropriate skin texture. Natural, healthy, realistic skin tone — NOT grey, waxy or pale-green. Replace the background with a plain, evenly lit neutral warm-grey wall — no brick, no texture, no marks, no objects, no other people, and no text or logos anywhere. Framing: head-and-shoulders to mid-chest, squared to camera, eyes open and looking into the lens, soft natural daylight from the front. Sharp and in focus.
```

### 4.4 Body prompt

The waist-up version that finally held the likeness, with every band clause removed and the bare head asserted. The long anti-beautification paragraph stays: Flow applies a fitness-model prior in a gym setting — hollowing cheeks, narrowing the face, hooding the eyes, thinning the lips — and naming each of those is what beat it.

```
Waist-up shot of the exact man in the portrait reference, standing and facing camera in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm.

THE FACE IS THE PRIORITY AND MUST MATCH THE PORTRAIT REFERENCE EXACTLY. He is 46 and looks it. His face is BROAD and square, with FULL cheeks — soft flesh over them, NOT hollow, NOT gaunt, NOT carved or chiselled. His jaw is soft and square, NOT tapered to a point. His eyes are rounded and open with visible upper eyelids, NOT narrow, NOT hooded, NOT squinting. His nose is fairly broad with a rounded tip, NOT thin or sharp. His lips are full, especially the lower lip. Ordinary skin with real lines and texture around the eyes and forehead. His head is completely shaved bald, no hair at all, and he has light stubble with a moustache and a short greying chin beard. He is a lean 46-year-old man, NOT a fitness model, NOT a magazine cover athlete. Do not idealise, beautify, slim or harden his face in any way.

He wears a plain black tank top. His head is BARE — nothing on it at all: no headband, no hat, no cap, no strap, nothing across his forehead and nothing around his neck. His forehead and shaved scalp are completely uncovered.

Keep exactly that gym setting. Natural, healthy, realistic skin tone. Sharp and in focus, nobody else in frame.
```

---

### 4.5 `Peter Pitch FullBody` — the full-length K1

A third character, for a full-length version of K1. Same man, same portrait, a differently framed body variant. The project then holds three characters whose names all begin *Peter*, so attach the chip deliberately — which of two same-named characters a prompt resolves against is undocumented, and three is worse than two.

**Portrait:** identical to `Peter Pitch` — reuse the same approved image and the same prompt (§4.3). Do not regenerate it; a second generation is a second chance to drift.

**References for the body:** the `Peter Pitch` portrait, then `peter_01_tanktop_x4.png`. Same as §4.2 and for the same reasons.

**Body prompt:**

```
Full-length shot, head to toe, of the exact man in the portrait reference, standing in a gym and facing camera.

THE GYM IS THE ONE IN THE SECOND REFERENCE IMAGE — the same room, the same equipment, the same lighting. A proper modern free-weights floor: matte black rubber flooring, a long black steel rack of dumbbells running along the wall behind him, a black flat bench, dark painted walls, lit low and warm from above with pools of light on the floor. It is NOT a basement, NOT a bare concrete cellar, NOT a grubby or derelict room, and the walls are NOT brown, stained, mottled or unfinished.

FRAMING: he stands close to camera, filling about ninety percent of the frame height with only a small margin above his head and below his feet. Shot on a 35mm lens at chest height from roughly three metres. His head must be LARGE enough that his face reads clearly — if his head looks small in frame the shot is wrong.

THE FACE MUST MATCH THE PORTRAIT REFERENCE EXACTLY. He is 46 and looks it. His face is BROAD and square, with FULL cheeks — soft flesh over them, NOT hollow, NOT gaunt, NOT carved or chiselled. His jaw is soft and square, NOT tapered. His eyes are rounded and open with visible upper eyelids, NOT narrow or hooded. His nose is fairly broad with a rounded tip. His lips are full. Ordinary skin with real lines and texture. His head is completely shaved bald with no hair at all, light stubble, a moustache and a short greying chin beard. He is a lean 46-year-old man, NOT a fitness model. Do not idealise, beautify, slim or harden his face.

POSE: relaxed and grounded, like a man about to say something he means — feet about shoulder-width apart, weight settled slightly onto one leg, shoulders square and open, chin level, arms hanging naturally and loosely at his sides. NOT stiff, NOT rigid, NOT feet-together, NOT posed like an identity photograph.

He wears a plain matte-black tank top, matte-black training shorts with a single thin electric-teal stripe running down the outer seam of each leg — the same electric teal as the IronPal accent — and plain black trainers. There is NO writing, NO lettering, NO numbers and NO logo anywhere on his clothing or shoes. Nothing on his head — no headband, no hat, no cap, no strap, nothing across his forehead and nothing around his neck.

Natural, healthy, realistic skin tone. Sharp and in focus, nobody else in frame.
```

> **Minted 2026-09-27, on the second attempt.** The first full-length prompt put him in a grubby brown basement with stained concrete walls, framed from too far back, standing like a mugshot. What fixed it was not more words about the gym but **a second reference image: `Peter Pitch`’s own approved waist-up body variant** — the right man, the right room, and no band to bleed through. Words could hold the room at waist-up and could not hold it at full length, because full length shows far more room to invent.

Three things in it are there because of what full-length costs:

- **The framing paragraph fights the distance, and had to get specific.** “Fills the frame height” was satisfied from three rooms away. Naming a lens, a camera height and a distance, and saying outright that a small head means the shot is wrong, is what brought it close.
- **The pose had to be rescued from the mugshot.** “Arms relaxed at his sides” with “stands squarely” produced feet together and arms pinned. It now names a stance: weight onto one leg, shoulders open, chin level, and an explicit *not posed like an identity photograph*.
- **The room is named by what it must NOT be.** A positive description alone lost to the model’s prior for a gym, which is apparently a cellar. Ruling out basement, bare concrete, grubby and brown does work a longer description does not.
- **The anti-beautification paragraph is unchanged**, because it is what beat the drift at waist-up and the pull is stronger here, not weaker.
- **Legwear had to be invented.** No previous variant showed below the waist and no reference photograph does either. Plain black training shorts and dark trainers keep the silhouette dark against the dark gym; say so if you would rather have joggers, and it is a one-line change.

**Judge it against the waist-up version before choosing.** The honest expectation is that the face is weaker here — that is a property of the framing, not of the prompt — and the question is whether the extra scale is worth it for a pitch delivered standing.

---

## 5. The K1 prompt, ready to paste

Built by the pipeline’s own `cast.py build_prompt` from the config, then two edits it cannot make itself — the delivery clause and the pronouns, both below. Settings chip on **video · 9:16 · 720p · 8s · x1**, Agent chip **off**, and attach **`Peter Pitch`**, not `Peter`.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter Pitch stands squarely on the gym floor facing camera, still and unhurried, weight settled, moving slowly and deliberately, delivering it like a statement of fact in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Medium-wide shot, the person clearly visible from the waist up with room around him, talking to camera. He faces the camera and delivers the line straight to camera, eyes on the lens — not looking down, not looking away, not at a phone. He is wearing a plain black tank top, with nothing on his head — no headband, no hat, no cap, no strap, nothing across his forehead and nothing around his neck — the exact SAME outfit in every shot. He is ALONE in the shot — no other people in frame. His skin has a natural, healthy, photorealistic tone with realistic warmth — NOT grey, pale-green, waxy, gaunt or zombie-like. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing is worn in or over his ears. No equipment, wires or accessories are visible on him or anywhere in the room. NO devices and NO screens anywhere in this shot: no phone in his hand or at his ear, no laptop, tablet or monitor, and no readable text, logos, UI or writing in frame. His hands are empty and stay RELAXED AND STILL at his sides for the whole clip — he never picks anything up or puts anything down, does NOT gesture, count on his fingers, or raise a hand, because a raised or gesturing hand is where extra and malformed fingers appear. The background is ONE fixed room and does not change, shift or cut to a different place at any point in the clip; the camera does not move. Audio: one clear man's voice, lip-synced to him, spoken SLOWLY and DELIBERATELY, with weight and conviction — an unhurried, measured delivery that lands each figure, real inflection rising and falling as a person's does, a short pause between the two sentences. Serious and matter-of-fact, NOT wry, NOT jokey, NOT flat, NOT monotone, NOT read aloud. ONE single take: "Gyms, a hundred and forty billion a year. Fitness trackers, fifty billion more.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing. Say that line EXACTLY ONCE, word for word, start to finish — all 15 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence. Do NOT say any part of the line a second time. Do NOT ad-lib, pad, or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last. The voice must NOT change speaker, gender, age or timbre part way through, and NO second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed. No other dialogue, no ambient sound, no music.
```

### 5.1 The full-length alternative

Same line, same delivery, resolved against **`Peter Pitch FullBody`**. Four clauses differ from the waist-up version: the character name, the framing, the wardrobe (this is the only shot that shows below the waist) and the stance.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter Pitch FullBody stands on the gym floor, feet about shoulder-width apart with his weight settled slightly onto one leg, shoulders square and open, chin level, still and settled, delivering it like a statement of fact in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. FULL-LENGTH SHOT, head to toe: he stands close to camera and fills about ninety percent of the frame height, with only a small margin above his head and below his feet, shot on a 35mm lens at chest height. His head must be LARGE enough that his face reads clearly — if his head looks small in frame the shot is wrong. He faces the camera and delivers the line straight to camera, eyes on the lens — not looking down, not looking away, not at a phone. He is wearing a plain matte-black tank top, matte-black training shorts with a single thin electric-teal stripe running down the outer seam of each leg — the same electric teal as the IronPal accent — and plain black trainers, with nothing on his head — no headband, no hat, no cap, no strap, nothing across his forehead and nothing around his neck — the exact SAME outfit in every shot. He is ALONE in the shot — no other people in frame. His skin has a natural, healthy, photorealistic tone with realistic warmth — NOT grey, pale-green, waxy, gaunt or zombie-like. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing is worn in or over his ears. No equipment, wires or accessories are visible on him or anywhere in the room. NO devices and NO screens anywhere in this shot: no phone in his hand or at his ear, no laptop, tablet or monitor, and no readable text, logos, UI or writing in frame. His hands are empty and stay RELAXED AND STILL at his sides for the whole clip — he never picks anything up or puts anything down, does NOT gesture, count on his fingers, or raise a hand, because a raised or gesturing hand is where extra and malformed fingers appear. The background is ONE fixed room and does not change, shift or cut to a different place at any point in the clip; the camera does not move. Audio: one clear man's voice, lip-synced to him, spoken SLOWLY and DELIBERATELY, with weight and conviction — an unhurried, measured delivery that lands each figure, real inflection rising and falling as a person's does, a short pause between the two sentences. Serious and matter-of-fact, NOT wry, NOT jokey, NOT flat, NOT monotone, NOT read aloud. ONE single take: "Gyms, a hundred and forty billion a year. Fitness trackers, fifty billion more.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing. Say that line EXACTLY ONCE, word for word, start to finish — all 13 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence. Do NOT say any part of the line a second time. Do NOT ad-lib, pad, or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last. The voice must NOT change speaker, gender, age or timbre part way through, and NO second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed. No other dialogue, no ambient sound, no music.
```

### 5.2 The full-length walking take

Standing still read as inert once cut. Here he **walks toward a locked-off camera while talking**, closing from about five metres to about two across the eight seconds — so the clip begins full-length and ends waist-up, which is the framing every other clip in the script uses. The cut into K2 therefore matches instead of jumping. He gestures as he comes, his face is engaged, and the voice is enthusiastic rather than grave.

**This lifts a ban the pipeline put there for a measured reason, so read this before rendering.** `cast.py` forbids gestures outright — *“a raised or gesturing hand is where extra and malformed fingers appear”* — and an enthusiastic salesman who talks with his hands is precisely the shot that defect attacks. The ban is lifted deliberately and replaced with the narrowest version of the thing:

- gestures stay **low and open**, waist to chest, palms out, well below the face — hands near the face and splayed fingers are where digits multiply;
- **no finger-counting and no pointing**, the two shapes that most often come back wrong;
- **both hands inside the frame at all times**, because a hand that leaves and re-enters is regenerated from nothing;
- an explicit **five correctly shaped fingers per hand, in every frame**, which costs nothing to state.

Budget for more re-rolls on this clip than on a still one. That is the price of the gestures, and it is a fair one — inert is worse than occasionally re-rolled.

A walk contradicts three clauses, and all three are rewritten rather than left to fight:

- **The action** planted him still with his weight on one leg.
- **The framing** fixed him at one distance; it now describes a move, with an explicit floor and ceiling on it so he cannot walk out of shot or past the lens.
- **The hands sentence** said they stay STILL and must not gesture. Rewritten to the constrained gestures above.
- **The delivery** was grave and matter-of-fact. It is now energetic and confident. Worth noting that this *relaxes* the word budget: the 13-word cap in §2 was priced for a slow reading, and an enthusiastic one is faster, so the line has room rather than being tight.

**The camera clause is deliberately untouched.** It stays locked off and *he* closes the gap. A moving camera plus a moving subject is the combination most likely to come back as drifting geometry.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter Pitch FullBody walks steadily straight toward the camera, one stride after another, animated and enthusiastic, talking with his hands as he comes, his face alive and engaged — eyebrows active, eyes bright, a genuine smile breaking through as he lands each figure. His movement is fluid and natural throughout, never stiff, never robotic, never stop-start in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. A LOCKED-OFF SHOT ON A 35mm LENS AT CHEST HEIGHT, and he walks INTO it. He begins full-length, head to toe, about five metres from the camera, and closes steadily to about two metres by the end of the clip, finishing framed from the waist up. He grows noticeably larger in frame across the shot. He never walks out of frame, never passes the camera, and stays centred throughout. He faces the camera and delivers the line straight to camera, eyes on the lens — not looking down, not looking away, not at a phone. He is wearing a plain matte-black tank top, matte-black training shorts with a single thin electric-teal stripe running down the outer seam of each leg — the same electric teal as the IronPal accent — and plain black trainers, with nothing on his head — no headband, no hat, no cap, no strap, nothing across his forehead and nothing around his neck — the exact SAME outfit in every shot. He is ALONE in the shot — no other people in frame. His skin has a natural, healthy, photorealistic tone with realistic warmth — NOT grey, pale-green, waxy, gaunt or zombie-like. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing is worn in or over his ears. No equipment, wires or accessories are visible on him or anywhere in the room. NO devices and NO screens anywhere in this shot: no phone in his hand or at his ear, no laptop, tablet or monitor, and no readable text, logos, UI or writing in frame. His hands are empty for the whole clip but they MOVE: he talks with them the way an enthusiastic person does, open palms, relaxed fingers, easy natural gestures that punctuate the line and flow with his stride. Keep every gesture LOW and OPEN — between waist and chest height, well below his face — with both hands inside the frame at all times. He never picks anything up or puts anything down, never counts on his fingers, never points at the camera, and never splays or fans his fingers. Each hand has exactly five correctly shaped fingers in every frame. The background is ONE fixed room and does not change, shift or cut to a different place at any point in the clip; the camera does not move. Audio: one clear man's voice, lip-synced to him, spoken with ENERGY and ENTHUSIASM — the voice of a man genuinely excited about what he is saying, confident, warm and persuasive, the pitch rising and falling, leaning into each figure and landing it. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "Gyms, a hundred and forty billion a year. Fitness trackers, fifty billion more.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing. Say that line EXACTLY ONCE, word for word, start to finish — all 13 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence. Do NOT say any part of the line a second time. Do NOT ad-lib, pad, or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last. The voice must NOT change speaker, gender, age or timbre part way through, and NO second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed. No other dialogue, no ambient sound, no music.
```

### 5.3 K2 — the catch

**“Billions poured into AI, and the smartest thing in this gym is still your thumb.”** 15 words, ≈ 7.4 s.

Same salesman, same performance, three things different:

- **He has stopped walking.** K1 closed from five metres to two; K2 picks him up there, so the cut is continuous rather than a jump back.
- **Medium framing, not the tight close-up** the old K2 used. A close-up puts the gestures outside the frame; full-length loses the face. Waist-up keeps both, with his hands in the lower half of the shot.
- **Still the BANDLESS character.** The product does not appear until K3, so K2 resolves against `Peter Pitch`, not `Peter`.

It also sets up the ending. If K8 keeps *“the smartest thing here is the one I forgot I was wearing”*, this line and that one bookend the film: the same question asked at the start and answered at the end. **If K8’s punchline changes, this line loses half its value** and should be revisited.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter Pitch has stopped walking and stands close to camera now, still animated and enthusiastic, talking with his hands, leaning slightly in on the last few words in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Medium waist-up shot, close to camera, upper body and face clearly in frame with his hands visible in the lower half of the shot. NOT a tight close-up and NOT full-body. He faces the camera and delivers the line straight to camera, eyes on the lens — not looking down, not looking away, not at a phone. He is wearing a plain black tank top, with nothing on his head — no headband, no hat, no cap, no strap, nothing across his forehead and nothing around his neck — the exact SAME outfit in every shot. He is ALONE in the shot — no other people in frame. His skin has a natural, healthy, photorealistic tone with realistic warmth — NOT grey, pale-green, waxy, gaunt or zombie-like. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing is worn in or over his ears. No equipment, wires or accessories are visible on him or anywhere in the room. NO devices and NO screens anywhere in this shot: no phone in his hand or at his ear, no laptop, tablet or monitor, and no readable text, logos, UI or writing in frame. His hands are empty for the whole clip but they MOVE: he talks with them the way an enthusiastic person does, open palms, relaxed fingers, easy natural gestures that punctuate the line. Keep every gesture LOW and OPEN — between waist and chest height, well below his face — with both hands inside the frame at all times. He never picks anything up or puts anything down, never counts on his fingers, never points at the camera, and never splays or fans his fingers. Each hand has exactly five correctly shaped fingers in every frame. The background is ONE fixed room and does not change, shift or cut to a different place at any point in the clip; the camera does not move. Audio: one clear man's voice, lip-synced to him, spoken with ENERGY and ENTHUSIASM — the voice of a man genuinely excited about what he is saying, confident, warm and persuasive, the pitch rising and falling, leaning into each figure and landing it. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "Billions poured into AI, and the smartest thing in this gym is still your thumb.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing. Say that line EXACTLY ONCE, word for word, start to finish — all 15 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence. Do NOT say any part of the line a second time. Do NOT ad-lib, pad, or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last. The voice must NOT change speaker, gender, age or timbre part way through, and NO second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed. No other dialogue, no ambient sound, no music.
```

---

### 5.4 K3 — the old way

**“Mine’s been doing it for years. Exercise, sets, reps, weight. All by hand.”** 13 words, ≈ 6.4 s.

Six earlier wordings were written and all six were rejected for the same structural reason: they **opened a new topic** instead of continuing the one K2 leaves mid-air. K2 ends *“… is still your thumb”* — a setup with an implied *look*. A line that answers it by introducing a subject (*“So this is the tracking”*, *“Every set ends the same way”*) reads as a different scene however well it is written. The chosen line points at the thumb instead: **“Mine’s”** is the hook, and it is two words long.

The second half of the distance was **register**, not writing. The first K3 prompt carried the builder’s default delivery clause — *“warmth and a little wry humour”* — while K1 and K2 are an enthusiastic pitch. Flat exposition after two clips of sell reads as a cut to somewhere else. K3 uses the same `DELIVERY_SALES` clause they do.

Four things this shot has to do that no earlier clip did:

- **He is between sets of front squats.** A loaded barbell racked at chest height behind him and a light sheen of sweat are what make “between sets” read without him saying it. The movement is not free choice — it has to match the exercise in the PIP, §5.5.
- **The plates are PLAIN and unmarked.** Real plates carry numbers, numerals in frame breach the standing ban, and Veo garbles them regardless. The weight correspondence lives in the inset, where it is legible and correct, and is deliberately absent from the picture.
- **A phone is in his hand and his thumb is moving.** The no-props and no-gesture bans are lifted for this clip only. A held object plus a tapping thumb is the highest-artefact hand configuration in the film — budget more retries here than anywhere else.
- **The right third of the frame is kept empty.** He stands left of centre so the inset has somewhere to live. Without that instruction the PIP covers him.

**The screen faces HIM and is never seen.** The first render got this exactly wrong — he stood centred, smiling, holding a blank phone up beside his face with the screen presented to the lens, like a man in a phone advertisement. That was the prompt’s fault, not the model’s: calling the screen *a blank dark rectangle* made the screen a SUBJECT, and a subject is something the model wants to show you. Describing what is on the screen at all — even *nothing* — invites it into frame.

So the screen now faces his own face and is turned away from the lens, and the prompt says the camera sees the back and edge of the phone only. Nothing has to be rendered on it, which removes the problem instead of constraining it: Veo cannot draw a legible interface, and one it invents that resembles a real product is the copyright trap this project already hit with Leonardo and Fitbod. The interface arrives as the inset instead, far more legible than a phone screen at this framing could ever be.

**Typing is the spine of the shot, not a detail in it.** In the first version the tapping was a subordinate clause buried mid-sentence, and the model simply did not do it. It is now the first thing the prompt says about him, repeated as an explicit negative list — not showing, not presenting, not holding up beside his face, not waving — and pinned with *never above the middle of his chest*. Plain *chest height* was not enough to stop him lifting it to his face. The same render also centred him, so the framing clause now names the RIGHT THIRD as empty rather than asking for “slightly left of centre”.

**It is a fresh generation, not an Extend.** A phone cannot materialise in a hand out of K2’s final 24 frames, and the subject changes from the industry to his own hands, which wants a cut. The join is hidden by bringing the inset in during K2’s last half-second, so the cut lands while the eye is on the inset — free, post-only, no generation risk.

**It resolves against the minted `Peter Pitch` character — not a reference photo.** This distinction has bitten before and is worth stating plainly: a reference photo is a **minting** input, used once when the character is built. Per clip, Flow resolves the character **by name**, matching the name in the prompt text against the project’s cast, with the character card attached as an ingredient. Naming a .png at generation time attaches nothing and Flow silently invents a person instead.

So, exactly as for K1 and K2: **Add ingredients to the prompt box → the `Peter Pitch` card → Add to prompt**, and the words *Peter Pitch* must survive in the pasted text. They open the prompt below, so do not trim the first sentence.

**`Peter Pitch`, not `Peter` and not `Peter Pitch FullBody`.** `Peter` carries the headband in his body variant and the product does not appear until K4. `Peter Pitch FullBody` is the full-length variant K1’s walking take used; K3 is a waist-up shot, the same framing family as K2, so it wants the same character K2 resolved against — which is what keeps the two clips looking like one man in one room. 16:9.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter Pitch has just finished a set of front squats and is standing in front of the rack ENTERING THE SET INTO AN APP ON HIS PHONE. He holds the phone LOW, down in front of his chest, tilted up toward his own face so that the SCREEN FACES HIM and is turned AWAY from the camera. The thumb of that same hand taps the screen steadily and continuously, entering numbers, from the first frame of the clip to the last. He looks DOWN at the phone while he taps and talks, lifting his eyes to the camera only for the last few words. TYPING IS THE ACTION OF THIS SHOT: he is NOT showing the phone to the camera, NOT presenting it, NOT holding it up beside his face, NOT waving it about. The phone NEVER rises above the middle of his chest, the screen NEVER turns toward the lens, and NO part of the screen is visible in frame at any point — the camera sees the BACK and EDGE of the phone only. The setting is a dark, moody weights gym: matte black rubber floor, a squat rack with a loaded barbell racked at chest height directly behind him, a rack of dumbbells further back, lit low and warm. The barbell plates are PLAIN MATTE BLACK with NO numbers, NO letters and NO markings of any kind on them. Medium shot, waist up: his head and upper body sit in the LEFT half of the frame with the phone in his hands in the lower left, and the RIGHT THIRD of the frame is EMPTY — only the dim gym behind, nothing important in it. His face stays clearly visible to camera the whole time, tilted down toward the phone but never hidden, turned away or obscured by his hand or the phone. He is wearing a plain black tank top, with nothing on his head — no headband, no hat, no cap, no strap, nothing across his forehead and nothing around his neck. He is ALONE in the shot — no other people in frame. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing is worn in or over his ears. He holds ONE ordinary dark phone in ONE hand, that hand having exactly five correctly shaped fingers, and the other hand rests easily at his side. He does not swap hands and does not point at the camera. No other devices and no other screens anywhere in the shot: no laptop, tablet or monitor, and no readable text, logos, UI or writing in frame. The background is ONE fixed room and does not change, shift or cut to a different place at any point in the clip; the camera does not move. Audio: one clear man's voice, lip-synced to him, spoken with ENERGY and ENTHUSIASM — the voice of a man genuinely excited about what he is saying, confident, warm and persuasive, the pitch rising and falling, leaning into each figure and landing it. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "Mine's been doing it for years. Exercise, sets, reps, weight. All by hand.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing. Say that line EXACTLY ONCE, word for word, start to finish — all 13 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence. Do NOT say any part of the line a second time. Do NOT ad-lib, pad, or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last. The voice must NOT change speaker, gender, age or timbre part way through, and NO second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed. No other dialogue, no ambient sound, no music.
```

**If Flow refuses it: *“This prompt might violate our policies about generating prominent people”*.** K2 hit the same refusal and eventually passed. Two things to know before changing anything:

1. **The refusal is free** — the dialog says so — and the classifier is stochastic. **Retry twice before touching the prompt.**
2. **The face description was the likely trigger, and it was redundant anyway.** The earlier draft carried a paragraph specifying skin tone, warmth, sweat and a list of things his face must not look like. With the `Peter Pitch` card attached, the character already carries the likeness — so a prompt that also describes a real human face in detail buys nothing and gives the classifier the one thing it reacts to. **It has been removed above**, along with the word *photorealistic*. If you pasted an earlier version, this is the difference.

If it still refuses after retries, drop to the short form. Length itself is surface area for the classifier. K2’s short fallback drifted wardrobe and room, so the wardrobe negative, the ALONE clause and the room description stay in even here:

```
Peter Pitch has just finished a set of front squats and stands in front of the rack in a dark, moody weights gym with a matte black rubber floor, a loaded barbell racked behind him and dumbbells further back, lit low and warm. The barbell plates are plain matte black with no numbers and no markings. He holds a phone in one hand at chest height, thumb tapping the screen steadily, entering numbers, looking DOWN at it as he talks and lifting his eyes to camera only at the end. The screen faces HIM and is turned AWAY from the camera; no part of it is visible in frame. He does not hold the phone up beside his face or show it to the lens. Medium shot, waist up. He stands slightly LEFT of centre with clear empty space on the RIGHT of the frame. He is wearing a plain black tank top with nothing on his head — no headband, no hat, no cap, no strap. He is ALONE in the shot. Each hand has exactly five correctly shaped fingers. Nothing in this shot is written on: no captions, no subtitles, no letters or numerals anywhere in frame. The camera does not move. Audio: one clear man's voice, lip-synced to him, upbeat, confident and persuasive, ONE single take: "Mine's been doing it for years. Exercise, sets, reps, weight. All by hand.". Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and then stop. One single speaker for the whole line; nobody else speaks. No music.
```

### 5.5 The PIP inset — driving a real tracker app

The inset was first specced as a hand-built HTML mock of a workout log. It is not: a mock looks like a mock. It is a **real third-party tracker app on the A52, driven by a Maestro flow** — real touch ripples, a real keypad, real commit latency.

| | |
|---|---|
| flow | `scripts/k3/manual-log.yaml` |
| runner | `scripts/k3/record.sh` — mirrors `scripts/e2e/run.sh` |
| cutter | `scripts/k3/make_pip.py` — fits a take to the VO length |
| compositor | `scripts/k3/compose.sh` — lays the inset over the rendered clip |
| output | `input/kickstarter/k3/` — the take, the 6.4 s cut, and a first-frame PNG |

**The crop is a guard, not a framing choice.** The full screen carries the app’s name, its orange primary button and its bottom navigation, and K3 frames this UI as the clumsy old way — an identifiable competitor in that role is exactly what this project ruled out once before (*“never a Fitbod screenshot and never the name”*, on `old_log_typing` in the promo config). The crop is **1080×1050 at y=290**, measured from the ink bounding box across a whole take rather than eyeballed: top edge just above the exercise title, bottom edge just under the keypad’s last row. Everything identifying falls outside it. **Do not widen it.**

Five things that cost time and are now handled in the code, recorded so they are not rediscovered:

- **`uiautomator` sees nothing in this app.** It is a WebView and dumps an empty FrameLayout. Maestro’s own driver *does* see inside, which is the only reason any assertion works.
- **Digit selectors are ambiguous.** The keypad digits and the set-row numbers are both bare `"1"`/`"2"`/`"3"`, and the generated `ext-element-NNN` ids are not stable across sessions. Digits are tapped by point. Those points are safe: the keypad renders at the **same bounds** whichever row is opened — only its pointer arrow moves.
- **Maestro has no sleep command.** The usual workaround, a held zero-distance swipe, *scrolls this app*; one take ended up parked on the exercise demo video instead of the log. There are no explicit pauses: Maestro’s own per-command latency is already an unhurried typing rhythm.
- **Maestro reinstalls its driver on every `test` invocation.** An externally started recorder captured 60–98 s of static screen ahead of the action, varying run to run. Recording is bracketed *inside* the flow with `startRecording`/`stopRecording` instead.
- **`assertVisible` does not mean on screen.** Maestro’s hierarchy includes off-screen WebView nodes with bounds clamped to the panel edge, so `"kg"` asserted true while the page was scrolled to the muscle map. The flow scrolls to top first and asserts the entered value **after** the taps, which is what actually proves the coordinates landed.

**Order of operations.** Generate the clip first, then record the inset to match it. The clip costs credits and retries; the inset is a one-minute re-run. The app walks forward through the workout as sets complete, so the movement on screen drifts — `record.sh` defaults to `EXERCISE="Front Squat"` and fails if the app is elsewhere. Override with `EXERCISE="Back Squat" scripts/k3/record.sh`. Because of the off-screen-node caveat above that assertion can pass on the wrong name, so the runner also writes the take’s first frame out as a PNG — that still is the check that settles it. If the app has walked past the movement you want, use its **Replace Exercise** control rather than completing sets to cycle round.

**One honest weakness.** After the first weight is committed the app auto-fills the remaining rows itself, which slightly undercuts *“all by hand”*. The flow can be changed to clear and retype each row if that matters more than the extra seconds.

### 5.6 K3 as shot and composed — DONE

**Rendered:** `Man_typing_into_phone_1080p_20260928234101.mp4`, 1920×1080, 24 fps, 8.00 s, in `geggen/products/ironpal/clips/`. It took two attempts and one policy refusal; §5.4 records what each one got wrong.

**Composed:** `K3_composed.mp4`, same geometry and duration, audio untouched, built by `scripts/k3/compose.sh [clip] [pip] [out]`. The inset is what carries the meaning of this shot — the clip deliberately hides the phone screen, so without the composite K3 is a man looking at a phone for no stated reason.

| | |
|---|---|
| inset size and position | **520×506 at (1334, 250)**, 3 px `#00E5CC` border |
| in | 1.2 s, 0.35 s fade |
| out | 7.6–8.0 s, 0.40 s fade |

**The geometry is not the spec written before the shoot, and that is deliberate.** The earlier plan sized the inset by height (68 % of frame) on the assumption of a tall phone-shaped asset. The cropped asset is nearly square, and he turned out to occupy the left and centre of frame, so the inset is sized by WIDTH into the dim right third instead and held at eye level. Measure the clip, then place the inset — not the other way round.

The timing tracks the story rather than simply appearing: nothing for the first 1.2 s so the shot establishes, then the inset arrives showing `8 reps / X kg` — **empty, waiting** — the keypad and `80` around 3.5 s, the filled log by 6 s.

**Two things found in the composite that are worth knowing for every later clip:**

- **The source clip darkens over its final two frames**, Y dropping from 60 to 39. A held bright inset flashes across them. The fade-out is timed to land exactly on that tail. Check for this on every Veo render before overlaying anything.
- **The inset is shorter than the clip** (6.33 s against 8.00 s), so its last frame is held with `tpad`. Without that the app vanishes mid-sentence and the shot loses its subject before the line lands.

**Open, and it is an edit decision rather than a production one:** the inset currently ends with the clip. It could instead be held across the K3→K4 cut the way it is held across K2→K3, hiding that join too.

### 5.7 K4 — the turn

**“Eventually I got tired of typing and started building my own solution.”** 12 words, ≈ 7.1 s at a reflective pace.

**The line arrived 19 words long and had to come down to 12.** At the slow, inward delivery this beat wants — 1.70 words a second, not the 2.04 of a pitch — 19 words is **11.2 s** against an 8 s clip. The budget for a reflective clip is about 13 words, and that is a different ceiling from the ~16 a brisk clip allows. Worth holding on to: **the register sets the word count**, so the delivery has to be decided before the line is written, not after.

**It keeps the salesmanship of K1–K3 — that was a deliberate reversal.** The first draft of this clip turned the register inward: a fourth delivery clause, quieter than a pitch, and a man walking lost in thought with his eyes off the lens. The argument for it was that the energy drop IS the story beat. The argument against it won: **continuity**. Three clips of one man selling, then one clip of a different, flatter man, reads as a different scene — which is exactly the failure the early K3 lines had, and it is not worth re-running deliberately for a single beat.

So `DELIVERY_SALES_TURN` reproduces the opening of `DELIVERY_SALES` **verbatim**, asserted in the generator, and changes only the middle clause — *“leaning into each figure”* belongs to a line with figures in it. The frustration becomes a **colour on the first half of the line** rather than the mood of the clip: a flash of it on *“tired of typing”*, the energy lifting into conviction on *“started building my own solution”*, landing the last three words like the start of something.

**The action had to follow the register.** A man not looking at the lens cannot carry a pitch, so the staging changed with the delivery: he talks to camera the whole way, his free hand gestures the way it does in K2, and the frustration survives as **one rueful beat** — his eyes drop to the phone early, once, then come back to the lens and stay there. That is the whole of the fed-up moment, and it is enough.

**It resolves against `Peter Pitch FullBody`.** This is the full-length walking character K1’s walking take used — not the waist-up `Peter Pitch` that K2 and K3 resolved against — because the shot is head-to-toe and the matte-black shorts with the electric-teal outer-seam stripe are visible. Still bandless: the product is the next scene’s job. **Add ingredients → the `Peter Pitch FullBody` card → Add to prompt**, and the name must survive in the pasted text.

Four deliberate choices in the staging:

- **He plays it to camera, walking into the shot, gesturing.** Same blocking as K1’s walking take and the same gesture rules as K2 — low, open, between waist and chest, always in frame, five fingers asserted. Known to work, and it is what keeps the four clips looking like one continuous piece to camera.
- **The phone is still in his hand, and he has stopped using it.** It hangs loosely at his side, and he drops his eyes to it for a single beat early on. That carries the frustration physically and links straight back to K3 without a word being spent on it. He explicitly does not type on it, raise it, or show it to camera — the failure mode K3 already demonstrated.
- **He walks INTO a locked-off 35mm shot**, five metres closing to two, finishing waist-up. Reused verbatim from K1’s walking take because it is known to work; what differs is the energy, not the blocking.
- **No inset, so no reserved frame space.** K3 had to keep its right third empty. K4 does not, and the framing is free because of it.

**Curiosity is carried by the last four words, not by withholding.** *“started building my own solution”* names that a solution exists and refuses to say what it is. The alternative considered was ending unresolved — *“There had to be a better way”* — which trails off instead of pointing. Pointing is the stronger setup for a reveal.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no logos, no UI, and no letters or numerals anywhere in frame. Peter Pitch FullBody walks steadily straight toward the camera through a dark, moody weights gym — matte black rubber floor, a black flat bench, racks of dumbbells and a squat rack around him, lit low and warm — talking to camera the whole way, animated and engaged, his face alive: eyebrows active, eyes bright, energy building across the line. He carries a dark phone loosely in one hand down at his side and, early in the clip, drops his eyes to it for a single beat with a rueful, fed-up look before lifting them straight back to the lens, where they stay for the rest of the shot. He does NOT type on it, NOT raise it and NOT show it to the camera. His free hand MOVES as he talks, the way an enthusiastic person's does — open palm, relaxed fingers, easy natural gestures that punctuate the line and flow with his stride, kept LOW and OPEN between waist and chest height, well below his face, and always inside the frame. A LOCKED-OFF SHOT ON A 35mm LENS AT CHEST HEIGHT, and he walks INTO it: he begins full-length, head to toe, about five metres away, and closes steadily to about two metres by the end, finishing framed from the waist up and growing noticeably larger across the shot. His stride is even and natural, never stiff, never robotic, never stop-start. He never leaves frame, never passes the camera and stays centred throughout. The camera does not move and the room behind him never changes or cuts to a different place. He is wearing a plain matte-black tank top, matte-black training shorts with a single thin electric-teal stripe running down the outer seam of each leg — the same electric teal as the IronPal accent — and plain black trainers, with nothing on his head: no headband, no hat, no cap, no strap, nothing across his forehead and nothing around his neck. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing worn in or over his ears. He is ALONE in the shot — no other people in frame. Each hand has exactly five correctly shaped fingers in every frame. He never counts on his fingers, never points at the camera and never splays or fans his fingers. There are no other devices anywhere in the shot: no laptop, tablet or monitor. Audio: one clear man's voice, lip-synced to him, spoken with ENERGY and ENTHUSIASM — the voice of a man genuinely excited about what he is saying, confident, warm and persuasive, the pitch rising and falling, a flash of real frustration on the first half of the line and the energy lifting into conviction on the second, landing the last three words like the start of something. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "Eventually I got tired of typing and started building my own solution.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing. Say that line EXACTLY ONCE, word for word, start to finish — all 12 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence, and do NOT ad-lib, pad or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last, not changing speaker, gender, age or timbre part way through, and no second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed. No other dialogue, no ambient sound, no music.
```

> **The clip count has now broken its cap, and this is the moment it became unavoidable.** With K4 as its own beat the film runs: money, catch, old way, **turn**, device, offline, privacy, worn, progress, close — **ten clips against a cap of eight**, and 80 s against a 60 s target. Two beats have to go or merge. The standing proposal is still the two privacy beats, `what_stays` and `what_goes`, which make the same argument twice; a second candidate is now `worn`, whose point K4 and the reveal largely make between them. **This needs deciding before K5 is written** — see §9.

### 5.8 K4 as shot — DONE

**Rendered:** `K4.mp4` in `geggen/products/ironpal/clips/` (from `Man_walking_in_gym_1080p_20260929001850.mp4`), 1920×1080, 24 fps, 8.00 s, with audio. No policy refusal this time.

**What landed.** The walk-in works: he starts full-length at distance and finishes waist-up, growing across the shot, centred, never leaving frame. The electric-teal seam stripe reads clearly. The gestures are low and open with clean hands. He is bandless, alone, and there is no burned-in text anywhere.

**What did not land: the phone.** It is in his hand for roughly the first half-second and then is effectively gone — the rueful glance down at it never reads. The consequence is narrative, not cosmetic: the physical link back to K3 is no longer in the picture and the line has to carry the connection on its own, which it does, but less well. Recorded rather than re-rolled. **If K4 is ever re-generated, the phone beat needs its own sentence early in the prompt with a duration on it**, the way the typing beat in K3 eventually needed.

**Continuity note for the edit: this is a different corner of the gym.** K4 has a black wall with a pale pillar, visible ceiling spots and a tiled floor edge; K1–K3 are dressed warmer and tighter. Measured, mean luminance is actually LOWER here — **55.4 against K3’s 60.6** — so it is the dressing that differs, not the exposure, and a grade will not reconcile it. Worth deciding deliberately in the edit whether it still reads as one gym.

**Audio, for the studio pass:** K4 is **−24.5 LUFS** against K3’s **−20.0** — 4.5 LU apart. Another instance of the per-clip inconsistency in [`audio_issue.md`](audio_issue.md), which is being handled once for the whole film rather than per join. Not touched here.

**One thing this clip does NOT have**, which is worth checking on every render rather than assuming: K3 darkened over its final two frames and any overlay had to fade out onto that. K4’s last four frames sit steady at Y=57, so there is no tail hazard here.

### 5.9 K5 — the reveal

**“IronPal. A headband. It watches my set and fills in the log itself.”** 13 words, ≈ 6.4 s. Claims 1 and 2, both in the allowlist.

Two ways to reveal a product were on the table: the object in isolation on a bench, or worn while he describes it. **Worn won on three independent grounds, and none of them is taste.**

1. **A product-only shot has no face, so Veo invents a narrator voice.** Every clip so far is anchored to a mouth. Take the mouth away and the model generates an unrelated speaker — which hands the deferred audio pass something no EQ reconciles, on top of the per-clip level drift already logged in [`audio_issue.md`](audio_issue.md).
2. **A close product shot demands legible branding, and that is where this project has failed twice.** Kling floated the logo off the band under motion; Leonardo produced a competitor lookalike. At worn distance a matte-black band with a teal stripe reads as itself and the branding burden mostly disappears.
3. **Continuity.** K4 was deliberately kept in the sales register to stop the film fracturing. A product-only cutaway one clip later breaks the same pattern from the other direction.

**The object still gets its close-up — as a composited inset**, the mechanism already proven in K3. `scripts/k5/make_inset.sh` builds it: a slow push-in (1.00→1.08 over 6.4 s) on `input/kickstarter/storyboarding/S3/selected.jpg`, cropped to the band and rendered to `input/kickstarter/k5/k5_product_inset.mp4` at 940×560. Every branding element reads — ring mark, wordmark, teal stripe, lens, lit LED.

**Why a still and not the real footage.** `web/public/assets/reveal.mp4` is the anonymous-hand shot that was rejected outright, and it is unbranded anyway — frame-checked, no ring, no LED. The physical prop photograph is unbranded and badly lit. The generated still is the only asset that carries the full branding correctly, and feeding it in as an inset means **the branding is never Veo’s job**.

**The wordmark is deliberately split between the two.** The real band carries lettering; the minted `Peter` character does **not** — the prompt gives it the plain teal ring only, and says so explicitly. Lettering on a garment is exactly what the no-writing ban exists to stop, and Veo garbles small type regardless. So the ring reads on his head and the wordmark reads in the inset, which is where it is legible anyway.

**It resolves against `Peter`, not `Peter Pitch`** — the band-wearing character, whose wardrobe carries the product. This is the clip those two separate mintings existed for. The generator asserts the bandless name cannot appear here.

**He does not touch the band.** A reveal wants the gesture, but the head is where artefacts appear and this is the one clip whose product must look right; a hand crossing the band risks deforming it. Gestures stay low and open as in K2 and K4, and the inset does the pointing. Worth revisiting only if the clip looks inert without it.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no logos, no UI, and no letters or numerals anywhere in frame. Peter stands on the gym floor talking straight to camera, animated and engaged, his face alive: eyebrows active, eyes bright, in a dark, moody weights gym — matte black rubber floor, a black flat bench, racks of dumbbells behind him, lit low and warm. Medium shot, waist up: his head and upper body sit in the LEFT half of the frame and the RIGHT THIRD is EMPTY, only the dim gym behind and nothing important in it. His head sits high enough that the band across his forehead is CLEARLY VISIBLE and sharp. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side. The band carries NO lettering and NO writing of any kind — the plain teal ring only. He is ALONE in the shot — no other people in frame. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing worn in or over his ears. His hands MOVE as he talks, the way an enthusiastic person's does — open palms, relaxed fingers, easy natural gestures that punctuate the line, kept LOW and OPEN between waist and chest height, well below his face, and always inside the frame. He never raises a hand to his head or touches the band, never counts on his fingers, never points at the camera and never splays or fans his fingers. Each hand has exactly five correctly shaped fingers in every frame. There are no devices and no screens anywhere in the shot: no phone, laptop, tablet or monitor. The camera does not move and the room behind him never changes or cuts to a different place. Audio: one clear man's voice, lip-synced to him, spoken with ENERGY and ENTHUSIASM — the voice of a man genuinely excited about what he is saying, confident, warm and persuasive, the pitch rising and falling, a note of quiet pride as he names it and real conviction as he says what it does. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "IronPal. A headband. It watches my set and fills in the log itself.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing. Say that line EXACTLY ONCE, word for word, start to finish — all 13 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence, and do NOT ad-lib, pad or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last, not changing speaker, gender, age or timbre part way through, and no second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed. No other dialogue, no ambient sound, no music.
```

### 5.10 K5 as shot — DONE

**Rendered:** `K5.mp4` (from `Man_talking_in_gym_1080p_20260929005303.mp4`), 1920×1080, 24 fps, 8.00 s, with audio.

**The band came out clean, and that is the headline.** Matte black, teal stripe along the lower edge, flush lens at front centre, lit teal point beside it, teal ring mark on the right. **This is the first time in this project that model-rendered product branding has held up** — Kling floated the logo off the surface under motion and Leonardo produced a competitor lookalike. What is different here is that the band is a *character wardrobe* resolved by name, not a graphic asked for in a prompt, and the mark is a plain ring rather than type.

**Three defects, none fatal:**

- **A faint smudge sits beside the ring mark** where the prompt said NO lettering. It is not legible as type at full frame — it reads as a scuff — but it is the garbled-wordmark failure in miniature, and it appears despite an explicit ban. **Do not crop in on the right of the band**, and re-check it in any later clip that carries the product.
- **He is centred, not left.** Measured, the subject spans columns **579–1326** of 1920 against a frame centre of 960. The prompt asked for the RIGHT THIRD empty; what it got is a **594 px** clear right margin instead of 640. Still workable — see the geometry below — but “LEFT half / RIGHT THIRD empty” is evidently a weak instruction, and a later clip that needs an inset should say it more than once.
- **The last two frames jump BRIGHTER**, 44.7 → 61.6. K3 darkened at its tail and K5 blows out at its; the direction differs, the hazard does not. Fade any overlay before the tail and trim those frames in the edit.

**Inset geometry, measured against the actual frame** (the K3 lesson: place the inset after measuring the clip, never from a plan written before it):

| | |
|---|---|
| source | `input/kickstarter/k5/k5_product_inset.mp4`, 940×560 |
| inset size | **470×280** |
| position | **x = 1390, y = 380** — 64 px clear of his shoulder at 1326 |
| in / out | as K3: fade in after the shot establishes, fade out before the bright tail |

**Continuity, measured across the three clips shot so far.** These are the numbers the grade and the audio pass will have to reconcile, and they are drifting in one direction:

| | K3 | K4 | K5 |
|---|---|---|---|
| mean luminance | 60.6 | 55.4 | **45.7** |
| integrated loudness | −20.0 LUFS | −24.5 | **−16.5** |

Three clips, three exposures, and an **8 LU spread** in loudness. The audio is going to the studio pass already; the **exposure drift is not yet anyone’s job** and should be, because a 15-point luminance walk across three consecutive clips will read as three different rooms.

### 5.11 K6 — the extension

**“Tiny camera. Motion sensors. And my own model, running on your phone.”** 12 words, ≈ 5.9 s.

**Budget against 7.02 s, not 8.0 s.** An extension is not a clip. K1→K2 measured **7.02 s** of added footage, so the ceiling is 14 words rather than 16, and three of the six candidates sat at 6.9 s — a tenth of a second of margin, and 7.02 s is a measurement, not a guarantee. B’s clipped fragments buy 1.1 s of headroom, which is the whole reason to prefer it.

**The prompt is short on purpose.** Extend conditions on the previous clip’s final frames, so the character, wardrobe, room and lighting arrive with the picture. Re-specifying them wins nothing and hands the policy classifier more surface to react to. **It does not name the character at all** — the K2 extension that worked did not either, and the refusal K3 hit was a named-person classifier. The generator asserts the name cannot creep back in.

**It restarts the speech rather than pretending it never stopped.** K5 ends on an explicit *stops speaking, mouth closed* and the extension sees those frames. K2’s prompt could say *“continues without pausing”* because K1 ran into it mid-flow; here that would fight the conditioning frames, so the wording is *picks the thought straight back up*.

**The no-lettering ban is restated.** K5 grew a faint smudge beside the ring mark despite an explicit ban (§5.10); every clip carrying the product now reasserts it.

**Three things this line is careful NOT to say.** They are the difference between a claim and a problem:

- **It does not say “nothing leaves your phone”.** Reps and exercise recognition run on-device; **weight-reading uploads a single frame** (claim 5). “My own model, running on your phone” is scoped to the model and stops there. No K6–K7 line may say *no cloud*, *no server* or *never leaves your device*.
- **It says “motion sensors”, not “IMU”.** Not only register: **the IMU is not in the claims allowlist**. Claim 7 covers the 8 mm lens and the LED and stops there. Low-risk hardware fact, but it is a new claim and belongs in the list.
- **It says “on your phone”, and the allowlist says the band.** Claim 4 reads *“on the band itself”*; the self-training PRD and the POC both put the model in the app on the phone. **These cannot both stay true once K6 is shot.** Reconcile claim 4 before the clip is rendered, not after.

Generate as an **Extend in Scene Builder on Veo 3.1 Lite** — the only tier that extends — 16:9, following §6 of the runbook. Expect a fresh audio render at its own level: K5 is already −16.5 LUFS against K4’s −24.5, and that goes to the studio pass rather than the prompt.

```
He picks the thought straight back up and keeps talking to camera, still animated and enthusiastic, standing exactly where he is. His hands come up and MOVE as he speaks — open palms, relaxed fingers, easy gestures that punctuate the line, kept LOW and OPEN between waist and chest height, well below his face, both inside the frame, five correctly shaped fingers on each. He does not count on his fingers, does not point at the camera, and never raises a hand to his head or touches the headband. The headband stays exactly as it is: the same matte-black band with the thin electric-teal stripe, the small flush lens and the tiny teal light, and NO lettering or writing appears on it at any point. The camera does not move and the room does not change. Audio: one clear man's voice, lip-synced to him, spoken with ENERGY and ENTHUSIASM — confident, warm and persuasive, the pitch rising and falling, landing each of the three things in turn. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "Tiny camera. Motion sensors. And my own model, running on your phone.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture. No captions, no subtitles, no titles, no logos, and no letters or numerals anywhere in frame. Say that line EXACTLY ONCE, word for word — all 12 words, in that order — and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence, and do NOT ad-lib or add filler words that are not written above. ONE single speaker for the WHOLE line, the same man's voice from the first word to the last, not changing speaker, gender, age or timbre part way through, and no second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed. No other dialogue, no ambient sound, no music.
```

### 5.12 K6 as shot — DONE, with three defects

**Rendered** as an Extend and downloaded as a Scene Builder zip. Note the format: a scene download comes back at **1280×720**, not the 1920×1080 a single-clip download gives. K5 in that zip is 8.00 s and K6 is **7.00 s** — confirming the ~7 s extension window §5.11 budgets against. Composed output: `K5_K6_composed.mp4`, 15.02 s.

**The extension held continuity where it mattered** — same man, same band, same room, and the band still renders correctly with stripe, lens, light and ring mark.

**Three defects, all in the extension half:**

- **The shot size jumps.** K6 pushes noticeably closer than K5 despite *standing exactly where he is* and *the camera does not move*. Extend inherits position from the frames but evidently not framing discipline.
- **The hands break their guards outright.** K6 puts them at face height with fingers splayed, against explicit *LOW and OPEN … well below his face* and *never splays or fans his fingers*. Both instructions were present and both were ignored. **Gesture guards do not survive an extension** — assume they will need a re-roll rather than a re-word.
- **The join flashes.** K5’s last two frames jump to Y 61.6/62.1 from ~45.7, and K6 opens at 60.0 and decays over six frames. The result is four or five washed frames at the 8 s mark. **Trimming K5’s last three frames fixes it** and costs nothing.

**Audio: −12.2 LUFS against K5’s −16.4** — 4.2 LU apart, the same per-extension drift as K1→K2. The running spread across everything shot so far is now K4 −24.5, K3 −20.0, K5 −16.4, K6 −12.2 — **12 LU end to end**, and monotonically climbing in shoot order, which is worth the studio pass knowing.

**One oddity to watch.** The filenames inside the zip read `<root>_<context>_</context>_<instruction>_<prompt>…`, so XML wrapper markup reached Flow as part of the submitted text. It did not visibly harm this render, but prompts should go in as plain text — anything that looks like markup is just more tokens for the model to interpret.
```
```


### 5.13 K7 — the demonstration

**“No buttons. No pausing. I lift, it logs the exercise, the reps and the weight.”** 15 words, ≈ 7.4 s. The design plan — inset, honesty constraints — is [`K7_design_plan.md`](K7_design_plan.md); this section is the line and the prompt.

> **Fourteen revisions on 2026-09-29, in this order.** First the framing: the opening take came back **waist-up when it needs to be head to toe**. Then the line: option A (*“My hands are busy…”*) was replaced by the founder with **option B, extended to name the weight**. Then the exercise: after three one-armed takes the founder replaced the alternating dumbbell curl with a **barbell curl — one long bar, both hands** — the structural fix rather than another wording of the same instruction. Then the prompt itself: take 4 came back with the bar **held still for the whole clip**. Then the exercise again — the founder's datum that **the single-arm curl had rendered cleanly** identified the real culprit as the model's one-armed curl prior, and K7 became a **goblet squat**. Then back to **dumbbells, both arms curling together** before the squat was ever rolled. That froze too, which killed the barbell theory and exposed a bug in the instruction itself — *always at the same height as each other* is satisfied perfectly by a man standing still. K7 then went to a **single-arm curl** with a **silent two-arm variant** under it — and the silent one **rendered, with both arms curling**, which settles it: the lip-synced line was what suppressed the movement all along. Then the founder closed the mux route — **the voice must come from the generation, no external audio** — and rejected the single-arm shot, so K7 went back to the hardest combination there is: **alternating arms with the line burned in** — which failed a fourth time, on a fourth distinct construction. A goblet squat was proposed as the one untried cell in the grid; before it was rolled the founder proposed **three reference stills of the arm positions** instead, which is a better lever than any wording — alternation stops being something the model must invent and becomes a path between pictures. **K7 is an alternating curl driven by three reference images** — and when the image generator turned out to share the video model's right-arm bias, **pose A became a mirror of pose B** rather than a seventh argument with a prior. The first clip built this way still curled right-handed — because **the reference attached to it was pose B**, measured, so the model obeyed the picture it was given. Pose A is now made and on disk — and then the founder **dropped alternation entirely**: K7 is a **two-arm curl, both arms together**, driven by BOTTOM / MIDDLE / TOP references. All fourteen are folded in below; **there is one clip prompt.**

**What the line change did.** Option B as offered read *“No buttons. No pausing. I lift, it logs the exercise and the reps.”* — 13 words. The founder added **“and the weight”**, taking it to 15. That is a small edit with two large consequences, one good and one that needs a decision.

**The good one: it is now near-verbatim claim 1.** `claims_allowlist[0]` reads *“IronPal is a headband that watches your set from your point of view and logs the exercise, your reps and the weight.”* The spoken line is that claim, in Peter’s words, in the same order. Nothing needs amending to say it, and *“I lift, it logs”* still makes **no timing claim** — no *while*, no *real time* — so claim 10 (§2.1) stays untouched, which was the whole reason the previous line was chosen.

**The one that needed a decision: the inset showed `—` for weight.** **Settled** — the Weight field now reads a static `12 kg` and the log rows read `12 × 12 kg`, which is option 2 of the three set out below the prompt. It is set before the inset appears and never animates, so §2.3's actual prohibition — dramatising the read on camera — still holds.

**It still does not name the exercise, and that is deliberate.** `labels.ts` seeds the bicep curl as the `unknown` class and `EXERCISE_DISPLAY.unknown` is `'—'`; a line that said *“it knows I’m curling”* would be contradicted by the repo. *“The exercise”* in the abstract is claim 1 and carries no such problem. The inset names it, under the *“Product interface concept”* label, which is exactly the division of labour §2.2 argues for.

**The word budget has no margin left.** 15 words at 2.04 w/s is **7.35 s in an 8 s clip**, and he is talking while curling. It is the joint-longest line in the film with K2, and K2 was delivered standing still. It fits; it is not comfortable. If the take runs out of clip, *“and the weight”* is what comes off — which puts the line back at 13 and the inset back in agreement with it.

**The picture still makes the live claim the line avoids.** The inset counter increments in sync with the curls — that is the whole persuasive content of the clip. Choosing a line that dodges the wording does not dodge the frame. The clean resolution is still to amend claim 10 to cover live-during-set IMU behaviour, which `LiveHudScreen` genuinely does; until then the concept label is carrying it. **Open, §6.1 of the design plan, unchanged by this choice.**

**Fresh generation, not an Extend** (§5 of the design plan). K6 was an extension and broke its gesture guards outright — hands at face height, fingers splayed, against two explicit instructions (§5.12). K7 has the highest hand risk in the film: two hands gripping objects, moving through the frame, passing close to the face at the top of every rep. Extending into a failure mode that has already happened once is not worth the continuity, and the cut is hidden by bringing the inset in across it as K2→K3 does.

#### What the two faults cost, and what the fix is

**Fault 1 — the framing came back waist-up.** The clip now runs **full length, head to toe**, on the same locked-off 35mm at chest height K1 and K4 used, at about four metres instead of two.

- **It changes the wardrobe.** `Peter`’s character card stops at the tank top and the band — there is nothing below the waist in it, because every clip he has appeared in was waist-up. A head-to-toe shot renders legs that nothing specifies. So the prompt now states the lower half explicitly, **matching `Peter Pitch FullBody` in K4 verbatim**: matte-black training shorts with a single thin electric-teal stripe down the outer seam of each leg, and plain black trainers. Without that sentence K7 and K4 are two different men from the waist down.
- **It costs band size, and that is a real cost.** §3.1 of the design plan priced this exactly — *“tighter loses the dumbbells at the bottom of the rep; wider loses the band”* — and full length is the wider end. At four metres the band is a few dozen pixels of forehead. It is the right trade anyway: K5 and K6 already carry the product in close-up and the still inset shows the full lockup, so K7’s job is the demonstration, not the product shot. But **do not expect this clip to read as branding**, and the lit-forehead clause matters more now, not less.
- **It makes the floor part of the shot.** Waist-up hid everything below the frame; head-to-toe puts the rubber floor and his feet in it. The prompt now clears the floor explicitly — no bags, bottles, towels or loose weights — and plants his stance so he cannot wander.
- **One genuine upside: the inset gets easier.** A full-length subject is a narrower column, so the empty right third is less of a fight than it was in K5, and the inset can very likely run larger than the 470 px §4.4 starts from. **Measure it from the render.**

**Fault 2 — one arm, three times, and the fix is now structural.** The history is worth keeping because it is the clearest example in this project of a prompt problem that was not a prompt problem:

| round | what was asked | result |
|---|---|---|
| 1 | *“curls them ALTERNATELY — right arm up and down, then left arm up and down”* | one arm |
| 2 | spelled-out beat sequence, *right, left, right, left*, a count of four, four negatives, and a clause for what the idle arm does | one arm |
| 3 | the arms described as a continuous **see-saw** — opposed positions holding in every frame, the action moved to the front of the prompt, the count dropped, the prompt cut 15 % | superseded |

**The founder cut round three short and changed the exercise instead, which is the right call.** Every version above was an instruction the model could ignore, and it ignored each one. **A barbell has no one-armed version.** Two hands on one rigid bar is not a behaviour to be requested — it is the only thing the object permits, so the failure mode becomes impossible rather than repeatedly forbidden. That is worth more than any wording.

**It is also an easier pose to render.** Two independent dumbbells are two objects whose relative position the model has to invent every frame; a bar fixes both hands at a constant spacing on a single rigid body. The hand risk §3.4 calls the highest in the film drops with it, and the grip guard gets simpler: both hands stay wrapped around the same bar.

**What the switch costs — and both costs are in the framing, not the action.**

- **The bar can cross his face.** §1 preferred dumbbells partly because *a barbell across the front delts* obstructs the face and the band, and that risk is real: the band is the product and it sits on the forehead. The prompt caps the movement at **chest height and no higher** — *never in front of his face, never crossing his chin* — which is a strict curl anyway, not a front raise.
- **The bar is wide enough to eat the inset’s right third.** Measured, not estimated: a 35 mm lens at four metres frames **4.11 m** of width, so a 2.2 m Olympic bar is **53.5 %** of the frame. With him centred at 33 % of frame width the bar spans 6 % to 60 % and clears the right third with **134 px** to spare at 1920. With him **centred**, it spans 23 % to 77 % and sits squarely across the inset.

  **So the left-of-centre instruction just became load-bearing, and it is the instruction with the worst track record in this film** — K5 was asked for an empty right third and came back centred with a 594 px margin instead of 640 (§5.10). It is now stated three ways: his position, the empty right third, and an explicit clause that **the right end of the bar stays out of the right third**. If a take comes back centred, it is a re-roll rather than something the edit can crop around.

**One thing the switch retires.** §1’s second bullet argued for alternating because it gives the counter a beat every ~1.2 s rather than ~2.5 s. A two-arm barbell curl runs ~1.5–2 s a rep, so an 8 s clip carries **three or four** count events rather than six. That is still comfortably above the *“a counter that increments twice does not read as live”* floor the bullet was defending, and it is bought with a failure mode that is gone rather than managed.

#### Take 4, measured — the barbell arrived and the exercise disappeared

`Man_lifting_barbell_in_gym_20260929152409.mp4` — 1280×720, 24 fps, 8.00 s. **Flow’s own auto-title is the diagnosis: *Man lifting barbell in gym*. The model’s summary of a 1,068-word prompt contains no curl.**

Measured across 64 frames at 8 fps:

| | asked for | delivered |
|---|---|---|
| the exercise | four barbell curls, bar moving in every frame | **none.** Arms straight, bar hanging at thigh level, for the entire clip. **Zero oscillation** — the bar’s vertical track is monotonic, which is the push-in below, not a rep |
| framing | full length, head to toe, locked off | **knee-up at the start, waist-up by the end** — and the drift between them means the camera **pushed in** on a shot specified as locked off |
| position | left of centre, ~33 % of frame width | **~55 %** — centred, so the bar spans the frame and the right third is not clear |
| the bar | plain, unmarked | ✅ plain matte-black bar and discs, no numerals |
| hands | both on the bar, five fingers | ✅ clean |
| band, wardrobe | teal ring, no lettering | ✅ band reads correctly |

**Three of the four product-side guards held. Every motion and framing instruction failed.** That is the shape of the problem, and it points at the prompt rather than at the model.

> **Corrected after the fact.** The founder supplied the missing datum: **the single-arm curl rendered cleanly.** So the primary cause of take 4's inertness is not the prompt at all — it is that **the model's curl prior is one-armed, and a barbell forbids the one-armed version**, leaving the conflict nowhere to resolve except stillness. The two prompt defects below are real and were worth fixing, but they are contributing factors, not the explanation. See the exercise change immediately after this post-mortem.

**Two defects in the prompt, both measurable:**

1. **It never named the exercise.** 1,068 words and the word *bicep* does not appear once; *curl* appears twice, as `CURLS IT` and in the trailing `keeps curling`. The prompt described a movement in joint-by-joint mechanics — *bends both elbows, sweeps the bar in an arc* — instead of naming the thing every training caption in the world names. **A named exercise is a strong prior; a described one is a weak one**, and Flow’s auto-title shows which of the two it actually picked up.
2. **It was 6.9 % negations — 74 of them.** *NOT press overhead, never crosses his chin, chest height AND NO HIGHER, never in front of his face, does NOT swing or lean back, stands still on the spot, feet planted, does NOT walk, step, turn or drift, camera does not move, room never changes.* Every one of those was added to stop a specific wrong motion, and their sum is a description of **a man standing still**. The cheapest way to satisfy seventy-four prohibitions is to do nothing. **The guards written to protect the movement are what suppressed it.**

The height cap deserves singling out: *chest height AND NO HIGHER*, *never in front of his face*, *never crosses his chin* and *does NOT press it overhead* are four separate instructions all pushing the bar **down**, against one instruction asking it to go up. It is not surprising which won.

**The rewrite below was drafted as take 5 and never rendered**, because the exercise changed first. Its lessons carry into the squat prompt and are worth keeping on the record: 1,068 words → **701**, negations 6.9 % → **5.3 %**, with the changes structural rather than louder:

- **It names the exercise, in capitals, in the second sentence**: *Peter is DOING BARBELL BICEP CURLS*, with *curl* used nine more times.
- **It asserts the motion positively and repeatedly** — *CURLS IT UP AND DOWN, OVER AND OVER, THROUGHOUT THE ENTIRE CLIP*, **four full curls**, *about one curl every two seconds*, and then the flat statement of what take 4 got wrong: **THE BAR IS MOVING IN EVERY SINGLE FRAME**, *he is NOT standing still and he is NOT simply holding the bar*.
- **The height cap collapses from four clauses to one** — *the bar stays below his chin so that his face and the headband are never hidden*. That keeps the only thing the cap was for and stops four instructions pulling downward.
- **The stillness language is gone.** *Stands still on the spot, feet planted, does NOT walk, step, turn or drift* have been cut entirely; they were guarding against a failure that has never once occurred, and they were describing the failure that keeps occurring.
- **The camera clause now names the observed defect**: *never moves, never zooms and never pushes in — the framing is identical in the first frame and in the last.*

**If the squat is inert too, the construction changes rather than the wording.** The first fallback is the single-arm curl — proven to render, and set out under the exercise change below. If *that* somehow fails as well, the talking is the thing to drop, and it is cheap:

- **Generate K7 silent** — eight seconds of barbell curls, full length, no line, no lip-sync. A pure action clip is a far easier generation, and nothing else in the prompt has ever failed.
- **Carry the line as voiceover** over it in the edit. The film is already going to a studio audio pass for the 12 LU loudness spread across K3–K6 ([`audio_issue.md`](audio_issue.md)), so one clip's line arriving as VO costs a take, not a workflow.
- **The inset is unaffected** — it was always going to be composited, and frame-accurate agreement between the counter and the reps is easier to hit against a clip whose reps are not competing with a mouth.

What that gives up is the founder on camera saying it, in a film whose method is exactly that — so it sits third, behind the squat and the single-arm curl.

#### Take 5 never rendered — the exercise changed instead

After take 4 the founder asked for an exercise the model can actually render, and supplied the fact that settles the diagnosis: **the single-arm curl rendered cleanly. The motion was never the problem — getting a second arm into it was.**

That reads the five takes differently, and better:

| take | asked for | what came back |
|---|---|---|
| 1–3 | two dumbbells, arms alternating | **one arm curling, cleanly.** Good motion, wrong count of arms |
| 4 | one barbell, both hands | **no motion at all** |

**The model's prior for "curl" is one-armed.** Ask for two dumbbells and it renders the prior and ignores the instruction — which is what happened three times. Put both hands on a bar and the prior becomes physically impossible: a barbell cannot be curled one-handed, so there is nowhere for it to go, and it resolved the conflict by **not moving at all**. That explains take 4's inertness better than the prompt's negation load does, and it also explains why three rounds of more explicit alternation wording changed nothing: they were arguing with a prior, not with an ambiguity.

**So the selection rule is not "big motion" or "whole body". It is: pick a movement whose default prior is already the thing you want.** Every K7 attempt so far has asked the model to render a variant of a movement whose most common form is something else. That is the one thing none of the wording could fix.

**K7 becomes a goblet squat: one dumbbell held at the chest in both hands, squatting down and standing up.**

- **"Squat" has no competing single-limb variant.** The default squat is two-legged and two-handed. There is no prior for the model to collapse into, which is exactly what sank takes 1–4. This is the whole argument, and the rest is bonus.
- **It is a strong, common, single-word exercise prior.** Take 4's prompt never named its exercise at all (see the post-mortem above); this one is named in the second sentence, and the model has seen a great many squats.
- **The rep boundary is enormous.** The whole silhouette drops and rises, so a viewer counts it without trying — which is the only thing the inset actually needs from the picture, and far more legible at four metres than a forearm sweep.
- **Nothing crosses his face.** The dumbbell sits at the chest below the chin, so the band stays visible at the top and the bottom of every rep — unlike a barbell curl, a front squat or any press.
- **The arms stay narrow, so the right third stays clear.** This retires the geometry problem the 2.2 m bar created (§3.1): a dumbbell at the chest is about 40 cm wide against the bar's 53.5 % of frame width.
- **There is still a weight in shot**, which the line requires — *"it logs the exercise, the reps and the weight"* over a man lifting nothing would be its own problem.

**What §1 said against a squat, and why it no longer holds.** The objection was *"a squat reads as a blur head-on"*, written when K7 was framed **waist-up**, where a squat leaves the frame entirely. K7 has been full length since the founder's first correction, and at full length a squat is the most legible movement available.

**The fallback, and it is a strong one: a deliberate single-arm dumbbell curl.** It is the only K7 motion that has actually rendered in five takes, so its risk is known to be near zero. Prompted *as* a single-arm curl — the other hand empty and relaxed at his side — it stops being a half-finished alternating curl and becomes a shot that was designed that way. Reps are countable, the weight is in shot, the band is clear and the right third is clear. **If the squat comes back wrong, this is the next roll, not another rewrite.** The only thing against it is that the founder asked for both arms, which is an aesthetic call and now a well-informed one.

**One cost of the squat, and it is real: K8 is a Bulgarian split squat** (§7), so the film runs squat into squat. They look different — K7 standing and two-legged at full length with a dumbbell at the chest, K8 with one foot back on a bench — and K8 exists for a different reason: it is the enrolled, IMU-led exercise whose inset can be a **real** POC recording. But it is a repetition that was not there before, and it is being accepted rather than missed.

**No new honesty problem.** A goblet squat is not one of `labels.ts`'s enrolled classes either — `bulgarian_split_squat`, `triceps_pushdown`, `unknown` — so it resolves to `unknown` and displays `'—'` exactly as the curl did. §2.2 is unchanged: the inset is a designed interface concept and the *"Product interface concept"* label stays load-bearing.

#### Back to dumbbells — simultaneous, which is the one form never tried

The squat prompt was never rolled. The founder returned K7 to a dumbbell curl before it was rendered, so the squat reasoning above stands unused rather than refuted, and the fallback ladder still applies.

**The important thing about this version: it asks for both arms curling TOGETHER, not in turns.** Across five takes that is the only form of the movement that has not been attempted:

| | asked | result |
|---|---|---|
| takes 1–3 | two dumbbells, **alternating** | one arm curling, cleanly |
| take 4 | one barbell, both hands | no movement at all |
| **take 5** | **two dumbbells, both arms at once** | **untried** |

**Why it is worth the roll rather than going straight to the proven single-arm curl.** Alternation asks for a phase relationship between two limbs — one up while the other is down — which is an ordering the generation has no mechanism to hold, and it lost to the one-armed prior three times. Simultaneity asks for the opposite: **no phase at all.** Both arms do the same thing at the same moment, which is not a sequence to be tracked but a symmetry to be maintained, and a mirrored pose is something these models are good at. *“Dumbbell bicep curl”* with both arms rising together is also one of the most commonly captioned forms of the movement, so the prior is working with the instruction instead of against it.

**The instruction that carries it is geometric, not procedural:** *the left dumbbell and the right dumbbell are ALWAYS AT THE SAME HEIGHT AS EACH OTHER, in every single frame — both down at his thighs together, both halfway up together, both up at his shoulders together.* That is a relation which either holds in a frame or does not, so it survives the collapse into a motion prior in a way *“right, then left, then right”* cannot. It is the see-saw idea from round three, inverted into the form the model can actually keep.

**The known risk, stated plainly.** Unlike the barbell, two dumbbells leave the one-armed prior physically available — so if the symmetry instruction is ignored, take 5 degrades to takes 1–3 rather than to take 4's freeze. That is the better of the two failure modes but it is still a failure.

**Everything learned from take 4 is carried in:** the exercise is named in the second sentence and *curl* appears nine times; the motion is asserted positively with a count and a cadence; the height cap is a single clause; the stillness language is gone; the camera clause names the push-in explicitly. **750 words at 4.8 % negations**, against take 4's 1,068 at 6.9 %.

**If it comes back one-armed, take the single-arm curl and stop re-rolling.** It is the only K7 motion that has ever rendered. Prompted *as* a single-arm curl — one dumbbell, the other hand empty and relaxed at his side — it reads as a shot that was designed that way rather than one that half failed, the reps stay countable, the weight stays in shot, and the band and the right third are unaffected.

#### Take 5 froze too — and the symmetry instruction is why

The two-arm dumbbell curl came back with **no movement at all**, same as the barbell. That kills the theory in the take-4 post-mortem: a barbell forbids the one-armed prior, but **two dumbbells do not**, and it froze anyway. The record is now unambiguous:

| take | asked | result |
|---|---|---|
| 1–3 | two dumbbells, **alternating** | one arm curling, **cleanly** |
| 4 | one barbell, both hands | **frozen** |
| 5 | two dumbbells, **both arms together** | **frozen** |

**Every prompt that demanded two arms has produced stillness or one arm. The only motion this clip has ever rendered is a single arm curling.**

**And take 5's key instruction was self-defeating.** It read: *the left dumbbell and the right dumbbell are ALWAYS AT THE SAME HEIGHT AS EACH OTHER, in every single frame.* That was written as a geometric relation that survives compression better than a sequence — and it does, but **a man standing perfectly still satisfies it perfectly.** Two dumbbells hanging motionless at his thighs are always at the same height as each other. The constraint was supposed to force symmetry *during* a movement; what it actually described, in its strongest reading, was a static pose. Take 4 was over-prohibited; take 5 handed the model a stillness-shaped solution and it took it.

**The rule that falls out: never write a motion constraint that stillness satisfies.** A symmetry clause has to be about *travel* — *each dumbbell travels from thigh to shoulder and back, four complete journeys* — not about relative position, which holds just as well at rest.

**So K7 goes to the one thing that has actually rendered: a single-arm curl.** This is not a concession dressed up — it is the only form of this movement the model has produced in five attempts, and it satisfies what the founder asked for this time round: **he faces camera, the exercise is performed correctly, and both hands are visible throughout.** The left hand holds its own dumbbell down at his side, in frame for the whole clip. That is a normal, correct single-arm curl, and takes 1–3 already proved the model renders exactly this picture — it was their failure mode, which makes it this prompt's safest request.

Two changes beyond the arm count, both from the founder's note:

- **Facing camera is now stated explicitly** — chest, shoulders and face square to the lens, not turned, not in profile, not side-on. It had been implied by *talks straight to camera* and never asserted as a body orientation.
- **Both hands visible** is its own clause, separate from the framing: both in frame, neither hidden behind his body, for the whole clip.

**Every stillness-shaped clause is gone.** There is no *always at the same height*, no *both together*, no *stands still*, no *feet planted*. What remains is travel: *his right forearm is moving in every single frame*, four curls, thigh to shoulder and back.

#### If you still want both arms curling: drop the spoken line

Worth stating separately, because it is a different trade rather than another rewrite. **The three frozen and one-armed takes all had one thing in common with the five clips that worked: a lip-synced line to camera.** Talking is the strongest prior in every K7 prompt, and it is the one thing never varied. A two-arm curl and an eight-second monologue may simply not both fit.

The test is cheap and the fix is already in the film's plan:

- **Generate K7 silent** — both arms curling, full length, no line, no lip-sync, with the symmetry clause written as travel rather than position.
- **Carry the line as voiceover** in the edit. The film is already going to a studio audio pass for the 12 LU loudness spread across K3–K6 ([`audio_issue.md`](audio_issue.md)), so one clip arriving as VO costs a take, not a workflow. He is still on camera; only the lip-sync goes.
- **The inset is unaffected** — always composited, and easier to sync against reps that are not competing with a mouth.

The silent variant of the prompt is below the main one, ready to paste.

#### The silent two-arm version worked — and the voice for it already exists

> **SHELVED 2026-09-29.** The founder has ruled that the line must be burned in by the generator and that **no external audio may be used at all**, which closes this route. `input/kickstarter/k7/k7_voice_take4.wav` and `scripts/k7/add_voice.sh` are kept, not deleted — the measurements below are the fallback of last resort, and the finding that the lip-synced line is what suppresses the movement is what the current prompt is built around. Everything in this subsection is on the record rather than in the plan.

**Take 6, the silent variant, rendered.** Both arms curling, which is what five spoken takes could not produce. That settles the question the silent prompt was written to test: **the lip-synced line was what suppressed the movement.** It was the one variable never changed across takes 1–5, and removing it fixed the shot on the first attempt.

**The line does not need generating, buying or re-recording. It is already in the failed takes.** Takes 4 and 5 froze the *body*; the audio came out correctly in both. Measured on take 4:

| | |
|---|---|
| duration | 8.00 s, 48 kHz stereo |
| speech | continuous from **0.3 s to 7.5 s** — 7.2 s, matching the 15-word line's predicted ≈7.4 s |
| level | **−17.4 LUFS**, true peak −2.8 dBFS, LRA 1.8 LU |

That is a complete, in-character delivery in the **same Veo-generated voice** as the rest of the film. It is extracted to `input/kickstarter/k7/k7_voice_take4.wav`.

**Why not ElevenLabs**, which the production plan recommends for voiceover: it would be **a different man**. K3–K6 are all Veo voices resolved from the same character, and dropping a TTS read into clip seven would be audible in a way the existing 12 LU level spread is not — level is fixable in the studio pass, timbre is not. The failed takes are free, already paid for, and already the right voice.

**Both clips are 8.00 s and the speech sits inside the window, so it is a straight mux.** `scripts/k7/add_voice.sh` does it:

```
./scripts/k7/add_voice.sh <silent_k7.mp4>            # → input/kickstarter/k7/K7.mp4
```

Video is stream-copied, never re-encoded. The script warns rather than guesses if the two durations are more than 0.15 s apart — a line drifting against the picture is worse than a script that stops. **Level is deliberately left alone**: the whole film goes to one studio pass for the K3–K6 spread ([`audio_issue.md`](audio_issue.md)), and normalising one clip in isolation just moves the problem.

**The honest cost: his mouth is closed while the line plays.** This is a dub, and K7 becomes the one clip in the film where the founder is on camera but not lip-syncing.

**Why it costs less here than anywhere else in the film**, and this is worth checking rather than assuming: K7 is the only **full-length** clip that carries a line. At head-to-toe framing in a 1080-line frame a 1.8 m man spans roughly 900 px, which puts his head at about 110 px and his mouth at about 20 px across — and the working render is 720p, so smaller again. **Lip-sync is not readable at that size.** K5 and K6 are waist-up and a dub would be obvious in both; K7 is the one place in this film where it is nearly invisible.

**Check the render before accepting that.** The argument holds only if take 6 actually came back head-to-toe as prompted — take 4 was asked for full length and returned knee-up, tightening to waist-up. If take 6 is tighter than prompted, the mouth is bigger and the dub starts to show; the fallback then is a lip-sync pass (Wav2Lip or similar) over the muxed clip, which is a post step rather than another generation.

#### The hardest combination, asked for directly — alternating arms AND the voice in the generation

**Two corrections from the founder, and the first one is a documentation fault rather than a render fault.** §5.13 carried two prompts, the single-arm one first. That is the one that got rolled, and it returned exactly what it asks for: **one arm curling, voice burned in.** Two prompts in one section with no ranking was a bad way to leave it. **There is now one prompt.**

**The second correction closes the voiceover route.** The line must come from the generation, not from a mux — so `k7_voice_take4.wav` and `scripts/k7/add_voice.sh` are shelved rather than deleted, and the reasoning above them is kept because it is still the fallback of last resort if this is ever revisited.

**That leaves the combination the record says is hardest**, and it is worth being straight about before spending credits on it:

| | spoken line | result |
|---|---|---|
| alternating, ×3 | yes | one arm — but **clean motion every time** |
| both arms together | yes | frozen |
| barbell, both hands | yes | frozen |
| both arms together | **no** | **worked** |
| single arm | yes | worked, and is what was just rejected |

**Alternating plus an in-generation line has been attempted three times and never landed.** Nothing here promises the fourth attempt is different. What it does have is a construction none of the first three used.

**Round 1** said *“alternately”* — an adverb, and the weakest possible form. **Round 2** enumerated beats — *right, left, right, left* — which is an ordering the generation has nothing to hold it with. **Round 3** described a see-saw, which was better but had the same hole the later two-arm prompt had: *one up while the other is down* **is satisfied by a man standing perfectly still** with one arm raised. Every version so far has been satisfiable without moving, or has asked for a sequence rather than a state.

**Round 4 asserts three things at once, and no two of them can be satisfied by the same wrong answer:**

1. **Travel, per arm, with a count.** *Each dumbbell travels the FULL distance from thigh to shoulder and back, and EACH ARM DOES THIS TWICE — four lifts in total, two right, two left.* Stillness fails this outright, and so does a one-armed take: the count is per arm, not per clip.
2. **Anti-phase as a permanent state.** *The two dumbbells are NEVER at the same height as each other — one is up near a shoulder while the other is down at a thigh, and they keep swapping.* This is what makes it alternating rather than simultaneous, and combined with (1) a static pose cannot satisfy it either.
3. **The lifts are pinned to the speech.** *His RIGHT arm lifts as he says “No buttons.”, his LEFT as he says “No pausing.”, his RIGHT again on “I lift, it logs the exercise,”, his LEFT again on “the reps and the weight.”*

**Point 3 is the actually new idea, and it is the one worth the credits.** Every previous prompt asked for the arm movement as an independent track running alongside a line the model was going to render anyway — and when the two competed, the line won and the arms lost, five times. This version does not ask them to compete: **it makes the curls part of the speech performance**, hung off the four phrases the model is already committed to producing in order. The line is 15 words at ≈7.4 s, so four phrases land at roughly 1.85 s apart, which is a natural alternating-curl cadence — the timing works out without being forced.

**If it fails, the realistic options are narrow, and none of them is another rewrite.** Alternating prompts have produced clean motion every single time, just one-armed, so **re-rolling for variance is a genuine option** in a way it was not for the frozen takes — the movement renders, the arm count is what wanders. Beyond that the choice is between the two forms already proven with voice attached: one arm curling, or a shot with no spoken line at all. Both have been rejected once, which is the founder's call to make, not a reason to keep spending on a fourth phrasing.

#### Four attempts at alternation, four one-armed takes — stop rewriting the curl

Pinning the lifts to the phrases did not work either. That is **four distinct constructions** for the same instruction — an adverb, an enumerated beat sequence, a see-saw, and a speech-pinned schedule — and every one returned a clean curl with the right arm and an idle left. A fifth phrasing is not a plan; it is the same purchase made a fifth time.

**Here is the whole grid, which is the only thing that should decide the next roll:**

| movement | line in the generation | result |
|---|---|---|
| curl, alternating | yes | **one arm** — ×4, four different constructions |
| curl, both arms together | yes | **frozen** |
| curl, barbell, both hands | yes | **frozen** |
| curl, both arms together | no | **worked** |
| curl, single arm | yes | **worked** — rejected by the founder |
| curl, both arms + external voice | mux | **worked** — rejected by the founder |
| **squat, both legs** | **yes** | **NEVER TRIED** |

**One cell is empty, and the mechanism says it is the one that should work.**

The freezes and the one-armed takes have the same cause read two ways. **The model's prior for a curl is one-armed.** Given two dumbbells it renders the prior and ignores the instruction — one arm, four times. Given a barbell, or an explicit both-arms-together instruction, the prior is contradicted outright and the conflict resolves into **not moving at all**. Remove the line and there is enough headroom to follow the instruction instead of the prior, which is why the silent two-arm take worked on the first attempt.

**A squat has no competing prior to fight.** The default squat is two-legged. The instruction and the prior agree, so there is no conflict to resolve into stillness and no one-limbed version to fall back on. **That is the difference from every curl attempt, and it is the reason the squat is worth the credits where a fifth curl phrasing is not.** It also delivers the founder's actual requirement — both sides of the body visibly working — by construction rather than by instruction, which is the lesson of the last three days written in one sentence.

The squat prompt was drafted after take 4 and never rolled because the exercise changed again first. It is below, updated with the two things learned since: **the explicit square-to-camera clause**, and **the four squats pinned to the four phrases of the line**, which costs nothing and is the one mechanism that has not been given a fair test on a movement that can actually render.

> **Superseded the same day.** The squat was never rolled: the founder proposed **three reference stills of the arm positions** instead, which attacks the problem at a better point — see the section below. The grid and the mechanism above are kept because they are what the reference route falls back on, and because the squat remains the strongest option if the references do not take.

**If the references and the squat are both refused, there are exactly three remaining options and all three are decisions rather than rewrites:**

1. **A single-arm curl with the line** — proven, rejected once. It is a correct, normal exercise; a viewer who is not looking for a second arm does not miss one.
2. **Both arms, silent, line muxed on** — proven, rejected once. The measurements and the script are in the shelved subsection above.
3. **Re-roll the alternating prompt for variance.** Unlike the frozen takes, alternating prompts *always* produce clean motion — the arm count is what wanders. It is the only failure in this clip with a plausible chance of coming good on repetition, so it is a real option, but it is a lottery ticket at 10 credits a draw and nobody should pretend otherwise.

**The minimal-curl variant, if the curl must stay.** One untried cheapening exists: ask for **two lifts, not four** — one right, one left, one per half of the line, at roughly 3.7 s each. It is the least the model can be asked to do and still be alternating, and demand is the one axis never reduced. The counter then moves twice, which §1 warns *"does not read as live"*, so this buys an alternating picture at the cost of the inset's credibility. It is a worse clip than the squat and a better one than a fifth rewrite.

#### The reference-image route — alternation as a path through pictured states

The founder's idea, and it is a better lever than any wording. **Four text constructions failed because they all asked the model to invent the alternation. Three stills do not ask — they show it.** Position A and position B are the thing the prompt could never make stick, and a picture of each removes the ambiguity entirely.

**The one property that makes the set work: the three images must be identical in everything except the arms.** Same man, same gym, same lens, same distance, same stance, same light, same wardrobe. If the framing or the lighting shifts between them, the clip inherits three different shots and has to reconcile them, which is worse than no references at all. So they are **generated from one template with a single substituted clause** rather than written out three times — hand-copying three near-identical prompts is exactly how a stray word ends up in one of them.

```
python3 scripts/k7/make_ref_prompts.py     # → input/kickstarter/k7/ref_prompt_{1,2,3}.txt
```

The script asserts the invariant and prints whether it holds. The three poses:

| image | right arm | left arm | how it is made |
|---|---|---|---|
| **A** (`ref_prompt_1.txt`) | straight down, dumbbell at the thigh | fully curled, dumbbell at the shoulder | **mirror of B** — `scripts/k7/flip_ref.sh`. Try the prompt once first |
| **B** (`ref_prompt_2.txt`) | fully curled, dumbbell at the shoulder | straight down, dumbbell at the thigh | generated; renders first time |
| **C** (`ref_prompt_3.txt`) | halfway, elbow at a right angle | halfway, elbow at a right angle — both level at waist height | generated |

**C is the crossing frame**, which is what makes the set describe a movement rather than two endpoints. In an alternating curl the arms pass each other in the middle; without C the model has to guess the path between A and B, and guessing the path is what it has been getting wrong.

**Generate the stills from the minted `Peter` character if the tool allows it.** The persona text in the template is lifted from `characters[0].persona` in the config so the prompts stand alone, but a still generated off the character has the identity already locked, and identity drift across three references would defeat the point. Attach `Peter`, then the template text. **One caveat now that the stills are mirror-safe:** the character's wardrobe carries the right-side ring mark, so a still generated off `Peter` may show it despite the template omitting it. If it does, either mirror from a ringless generation or accept the ring on the wrong side in A alone — it is a few pixels at this framing, and the clip prompt re-states the correct side.

**The clip prompt is `input/kickstarter/k7/clip_prompt.txt`**, and it is built around the images rather than repeating the pose descriptions as instructions. It names each reference by what it shows and then gives the path:

> **A, then C, then B, then C, then A, then C, then B** — reaching A twice and B twice, so **each arm lifts twice**.

That is the same four-lift count every failed version asked for, but expressed as *a route between pictures you are holding* instead of an abstract property of two limbs. It also carries the framing forward by reference — *exactly as in the three reference images* — which is the first time the full-length, left-of-centre framing has had a picture backing it instead of a sentence, and framing has failed nearly as often as the arms.

**The image generator has the same right-arm bias.** `ref_prompt_1` and `ref_prompt_2` both came back as **right arm up, left arm down** — the generator rendered its default whichever pose was asked for, exactly as the video model has done five times. Arguing with it in prose has now failed at two different layers of the stack.

**So pose A is made by mirroring pose B, which is free and deterministic.** A horizontal flip of *right up, left down* **is** *left up, right down*. `scripts/k7/flip_ref.sh` does it.

**That only works if nothing in the frame is left-right asymmetric, so two things changed in the stills:**

- **The subject is now CENTRED, not left-of-centre.** A mirror moves a left-third subject to the **right** third — measured on a test image, 17 % of width becomes 83 % — which would hand the clip a reference fighting its own framing instruction. The stills now carry the **pose**; the clip prompt carries the **framing**, and says so explicitly: *he is to the LEFT of centre in the clip even though he is centred in the reference images.*
- **The headband's teal ring mark is gone from the stills**, leaving the stripe and the lens, which are symmetric. The ring sits on the right side, so a flip would burn a **wrong-sided product** into a reference for the one clip whose job is showing the product. The ring is re-stated in the clip prompt and comes from the minted `Peter` character, where it has rendered correctly since K5.

**What still mirrors is the background**, and that is accepted rather than solved: the gym is dark, low-contrast and generic, and the clip prompt now takes the room and the framing from its own text rather than from the stills. If the racks swapping sides between references turns out to matter, drop A and give the clip B and C only — two positions and the crossing frame still establish that the arms take turns.

**`ref_prompt_1` is also rewritten, as the cheaper thing to try first.** It now names the movement for the working arm — *HE IS PERFORMING A LEFT-ARM DUMBBELL CURL: his LEFT arm is the one doing the work* — and describes the right arm as doing nothing at all. Naming the exercise for the limb is the one framing not yet tried, and single-arm curls are the one thing this model renders reliably; it may simply need telling which arm. **If it comes back right-arm-up again, stop paying for it and flip pose B.**

**Two practical notes before spending credits.**

- **This is a by-hand operation.** `cast.py`'s `_reference_for` gives an automated clip exactly one reference photograph, so three references only exist when driving Flow's interface directly, attaching them as ingredients alongside the character. Do not expect the scripted path to reproduce it.
- **If it comes back frozen, drop C and keep A and B.** Strong reference images can be read as *the* frame rather than as waypoints — the failure mode that produced takes 4 and 5 from a different direction. Two opposed endpoints give the model less to lock onto and still fix the thing that matters, which is that both arms take turns.

#### The reference used was pose B — measured, and it explains the take completely

The clip was generated with the images from `ref_prompt_1` and `ref_prompt_3` attached, and came back right-arm-only. **The `ref_prompt_1` render is pose B.** He faces camera, so the raised dumbbell on the viewer's *left* is **his right arm**; the lowered one on the viewer's right is his left.

**So the references were telling the clip to curl with the right arm, and it obeyed.** That is not another failure of the reference technique — it is the technique working exactly as intended on the wrong input. Every earlier take failed because the model ignored an instruction; this one failed because it followed a picture, which is the first encouraging result in seven attempts.

**Pose A is now made and on disk.** `input/kickstarter/k7/ref_A_left_up.jpg` — the pose-B render mirrored by `scripts/k7/flip_ref.sh`, verified by eye: the raised dumbbell is on the viewer's right, i.e. his left arm. The three references to attach:

| | file | pose |
|---|---|---|
| **A** | `input/kickstarter/k7/ref_A_left_up.jpg` | left arm up, right arm down — **the mirror** |
| **B** | `input/kickstarter/k7/ref_B_right_up.jpg` | right arm up, left arm down — the original render |
| **C** | `input/kickstarter/k7/ref_C_halfway.jpg` | both halfway |

**Two things to know about them.**

- **A and B are exact mirrors, so the subject moves across the frame** — measured, 33 % of width in B becomes 67 % in A. The stills were rewritten to centre him for exactly this reason, but these two were generated before that change. It is left as-is rather than re-generated because the pose is what the references are for, and the clip prompt now states the framing itself and says outright that *he is to the LEFT of centre in the clip even though he is centred in the reference images.* If the clip starts drifting him across frame, regenerate B from the current `ref_prompt_2.txt` and re-mirror.
- **C is weak.** The render has his arms nearly straight with the dumbbells at hip height, not the right-angle elbows the prompt asked for. It reads closer to the bottom of the movement than the middle. Worth re-rolling if the clip's arms look like they barely travel.

**The flip is quality-sensitive**, which cost a first attempt: ffmpeg's default JPEG quality turned a 435 kB reference into 31 kB. `flip_ref.sh` now passes `-q:v 2` and prints both file sizes, because a soft reference is a worse reference.

#### The character is called `Peter Headband`, not `Peter`

Caught by the founder. Every K7 prompt has opened with *"Peter is DOING…"* against a Flow project whose band-wearing character is named **`Peter Headband`**. `clip_prompt.txt` is corrected.

**This is a real bug and it is not the cause of the one-armed takes** — pose B in the references is, and the founder attached the character by hand anyway. But it is worth fixing rather than leaving: the runbook's trap 3 exists precisely because a name in the pasted text that does not resolve is a documented hazard, and §5.7 records that `Peter Pitch FullBody` had to *"survive in the pasted text"* for K4.

**It is wider than K7.** The runbook §2.4 instructs renaming the minted character to `Peter`, and that did not happen — so the name in this document's K1–K6 prompts has never matched the project either. Those clips rendered correctly regardless, which suggests the by-hand attachment does the real work and the text name is weaker than the runbook implies. **Left for the founder to decide**: either rename the character in Flow to `Peter` as the runbook says, or update the name across §5.3–§5.12 to `Peter Headband`. Changing it in one place and not the other is the only genuinely bad option, and K7 is currently that one place.

#### Alternation conceded — both arms together, with references that match

The founder has dropped alternation. `clip_prompt.txt` now asks for a **two-arm curl, both arms moving together**, which is the right call: seven takes and six constructions failed to make two arms take turns, and the one time the movement rendered with both arms working it was this form.

**The references have to change with it, and that is the part most likely to be missed.** `ref_A_left_up.jpg` and `ref_B_right_up.jpg` are **single-arm poses** — attaching either to a two-arm prompt shows the model one arm working, which is exactly the input that produced the last failure. The alternating set is now the wrong set.

**The simultaneous set is three positions on one path**, and `make_ref_prompts.py` emits two new prompts for the endpoints:

| | file | pose |
|---|---|---|
| **BOTTOM** | `ref_prompt_bottom.txt` | both arms straight down, both dumbbells at the thighs |
| **MIDDLE** | `ref_prompt_3.txt` *(already rendered as `ref_C_halfway.jpg`)* | both elbows at a right angle, both dumbbells at waist height |
| **TOP** | `ref_prompt_top.txt` | both arms fully curled, both dumbbells at the shoulders |

`ref_prompt_{1,2}.txt` and the two single-arm stills stay on disk for the alternating variant, which is now a fallback rather than the plan.

**No right-arm bias to fight this time.** Every failure so far came from asking for a configuration the model's prior disagrees with. *Both arms down* and *both arms up* are symmetric — there is no left-versus-right for the prior to get wrong, and the generator has no reason to return one of them when asked for the other. **These two stills should render first time**, unlike poses A and B.

**MIDDLE is the one to check before spending a clip on it.** The existing `ref_C_halfway.jpg` came back with his arms nearly straight and the dumbbells at hip height rather than the right-angle elbows the prompt asked for — closer to BOTTOM than to the middle. With BOTTOM now its own reference, a weak MIDDLE is worse than before: two of the three references would be showing the same thing, and the clip would have nothing describing the top half of the travel. **Re-roll it, or drop MIDDLE and give the clip BOTTOM and TOP only** — two endpoints an equal distance apart still describe the full journey.

**The prompt avoids the clause that froze take 5.** That version said *the two dumbbells are always at the same height as each other in every frame*, which a man standing perfectly still satisfies. This one states the requirement as travel instead — *each dumbbell travels the FULL distance from thigh to shoulder and back, four complete up-and-down journeys each* — plus a flat **THE DUMBBELLS ARE NEVER PARKED**, and the three reference positions make the path a picture rather than a description.

**The honest risk.** Both arms together **with the line** is the combination that froze twice (takes 4 and 5). What is different now is the references: a freeze happens when an instruction contradicts a prior and the model has nowhere to go, and three stills showing the arms in three different places along a path leave stillness unsupported by anything on screen. That is a reason for optimism, not a guarantee. **If it freezes again, the finding from take 6 stands: remove the spoken line and the movement renders** — and that route is only closed because the founder ruled out external audio, which is a decision that can be revisited more cheaply than another six prompt rewrites.

#### The guards that survive into every version

The rest were cut (see the post-mortem above). These four earn their place — each is a measured failure, not a precaution:

- **The bar and its discs are banned from carrying numerals.** Plate numbers are the most likely source of writing in this frame — the same rule K3’s barbell plates ran under — and the no-writing ban has already been breached once by a band smudge (§5.10).
- **The grip is the hand guard.** K5 and K6 protected the hands by keeping them low, open and empty — unusable here, so its replacement is the inverse: hands stay *closed around the bar for the entire shot*, never let go, never open, never splay. A fixed pose to hold beats a prohibition to obey, which is what K6 ignored. **The bar makes this guard much stronger than the dumbbell version was**: one rigid object holds both hands at a constant spacing, so there is far less for the model to invent between frames.
- **The exposure is specified in the prompt.** Measured means are drifting — K3 60.6, K4 55.4, K5 46.2, K6 49.7 — and the band sits in the most easily shadowed part of the frame while his head dips on each rep.
- **The framing is stated as a position and a negative**, and the camera clause now names the specific defect take 4 produced — *never zooms and never pushes in, the framing is identical in the first frame and in the last*. K5 was asked for an empty right third and came back centred (§5.10); take 4 came back centred at 55 % **and** pushed in. This is the instruction with the worst record in the film.

**He keeps curling after the last word.** K5 ends on *stops speaking, mouth closed*, which is right for a clip that will be extended; K7 is not extended, and a man who freezes the instant he finishes talking gives the edit no tail to fade the inset over.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT: no captions, no subtitles, no titles, no logos and no letters or numerals anywhere in frame. Peter Headband is DOING TWO-ARM DUMBBELL BICEP CURLS in a dark, moody weights gym — matte black rubber floor, racks and benches behind him, lit low and warm — and he talks to camera while he curls. BOTH OF HIS ARMS CURL TOGETHER, AT THE SAME TIME, AS A MATCHED PAIR.

THE REFERENCE IMAGES SHOW THE POSITIONS HIS ARMS PASS THROUGH, and the clip moves through them. TAKE THE ARM POSITIONS FROM THE REFERENCE IMAGES; take the framing, the camera and where he stands in the frame from this prompt. REFERENCE BOTTOM: both arms hanging straight down and fully extended, both dumbbells low at his thighs. REFERENCE MIDDLE: both elbows bent to a right angle, both dumbbells level with each other at waist height. REFERENCE TOP: both arms fully curled up, both dumbbells raised to his shoulders close to his chin.

HE MOVES SMOOTHLY AND CONTINUOUSLY THROUGH THOSE POSITIONS, IN THIS ORDER, OVER AND OVER: BOTTOM, MIDDLE, TOP, MIDDLE, BOTTOM — and that is one curl. HE DOES FOUR OF THEM between the first second and the last, about one curl every two seconds. EACH DUMBBELL TRAVELS THE FULL DISTANCE from his thigh up to his shoulder and all the way back down again, FOUR COMPLETE UP-AND-DOWN JOURNEYS EACH. BOTH FOREARMS ARE SWEEPING THROUGH THE AIR IN EVERY SINGLE FRAME: the left dumbbell rises and falls the full distance and the right dumbbell rises and falls the full distance, together.

THE DUMBBELLS ARE NEVER PARKED. He is NOT standing still, he is NOT holding the dumbbells in one place, and he does NOT let either arm hang idle while the other works — both arms lift on every single one of the four curls. The clip opens with him ALREADY MID-CURL, both dumbbells already on their way up.

His elbows stay in at his sides, and the dumbbells stay below his chin so that his face and the headband across his forehead stay visible at every point in the movement. Both of his hands are in clear view throughout — never behind his back, never behind his legs, never out of frame.

His clothing, the headband and the gym are as in the reference images, with one addition: the headband also carries a small teal ring mark on its RIGHT side, and no lettering of any kind. The framing is NOT taken from the reference images — it is this: a LOCKED-OFF FULL-LENGTH SHOT on a 35mm lens about four metres away, framed HEAD TO TOE from his trainers to a small gap above his head; he faces the camera squarely, chest and shoulders front-on; and he stands WELL OVER TO THE LEFT, about a third of the way across the frame, so that the RIGHT THIRD of the picture is empty gym. He is to the LEFT of centre in the clip even though he is centred in the reference images. The camera never moves, never zooms and never pushes in — the framing is identical in the first frame and in the last. He is alone in frame. Each hand keeps five correctly shaped fingers wrapped around its dumbbell, and both dumbbells keep the same solid shape and size throughout, plain and unmarked with no numbers and no letters on them.

Audio: one clear man's voice, lip-synced to him, confident, warm and persuasive — the first two short sentences clipped, the last opening out and landing the three things in turn. Steady and in control: a man who is working, not straining. NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "No buttons. No pausing. I lift, it logs the exercise, the reps and the weight.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display or superimpose them, or any fragment of them, anywhere in the picture. Say the line EXACTLY ONCE, word for word, all 15 words in that order, and then STOP — no repeats, no echo, no stammer, no ad-libs, no filler. ONE single speaker throughout, the same man's voice from the first word to the last, and no second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking but KEEPS CURLING to the end of the clip. No other dialogue, no ambient sound, no music.
```

**Render notes.** Resolves against **`Peter Headband`**, the band-wearing character as it is actually named in the Flow project — not `Peter Pitch`, and not `Peter Pitch FullBody`, whose shorts this prompt borrows but whose head is bare. 16:9, a single clip rather than a Scene Builder extend, so the download comes back at 1920×1080 (a scene zip would give 1280×720, §5.12). Submit as **plain text**: the K6 zip filenames showed XML wrapper markup reaching Flow inside the prompt (§5.12).

**Judge a take in this order.**

1. **Does the LEFT arm lift twice?** Count per arm, not per clip — the take must reach position B twice as well as position A twice. Counting total reps is what hides this failure.
2. **Is he square to the lens, with both hands in view?** Front-on, not angled, neither hand hidden.
3. **Is it head to toe, and does the framing hold?** Trainers in frame from the first frame to the last, with no push-in. **This one now also decides whether the dub shows** — see the voice section above.
4. **Is he left of centre?** Measured. The dumbbell retires the 2.2 m bar's geometry problem, but the right third still has to be clear for the inset, and this instruction has the worst record in the film — K5 came back centred and take 4 came back at 55 %.
5. **The hands** — five fingers on each, closed around the handles, no melt at the top of the rep.
6. **The dumbbells carry no numerals**, and the band no lettering or smudge beside the ring.
7. **Do the dumbbells stay below his chin** so the band reads throughout?
8. **His eyes stay on the lens** through every rep, and the line is spoken once, in his own voice, with no second speaker.
9. **The tail direction** — K3 darkened over its last frames, K5 blew out over its.

#### The weight now needs settling in the inset

He says *“and the weight”* over a screen that, as built, shows `—` in the Weight field and never resolves it. **Three ways out, and the second is the recommendation:**

1. **Leave the dash.** Cheapest, and the worst of the three: a viewer who reads the screen sees the product failing to do the thing he just said it does. A dash beside a spoken claim reads as *it hasn’t got it*, which is a harsher statement than saying nothing.
2. **Show a static weight** — a plain number, set before the inset appears, **never animating and never resolving on camera**, with the *“Product interface concept”* label unchanged. This is what the landing page already does (`AppModules.astro` shows a filled weight under the same label), so it introduces no claim the site does not already make. §4.2’s argument against it was that *“a promo clip is watched, not read”* — true, but the line now makes the claim **in audio**, which is the stronger channel of the two. Refusing it in the picture buys nothing and costs coherence. What §2.3 actually forbids is **dramatising the read** — a number that lands on camera, in sync with a glance at the dumbbell. A static value does not do that.
3. **Drop the Weight field.** No contradiction, but the line names three things and the screen shows two, which draws the eye to the gap.

Taking option 2 also settles the log rows: §4.2 keeps them at reps only for the same reason, and `Set 1 · 12 × 35 kg` becomes the consistent form. **Both changes are now in** — `scripts/k7/live_set.html` carries `WEIGHT = 12` and the log rows print `12 × 12 kg`. Verified in the rendered inset.

**Then retune the inset.** `REP_TIMES` in `scripts/k7/live_set.html` holds six placeholder ticks at a ~1.2 s alternating cadence and `START_REP` opens at 6; the prompt asks for four lifts across the clip, so expect **four** count events and treat both numbers as wrong until measured against the take. Measure the rep turnarounds, retune, re-render `scripts/k7/make_inset.sh`, and place the inset from the measured frame — the §4.4 starting geometry was derived from K5’s waist-up subject and does not transfer to a full-length one.

### 5.14 K7 as shot — DONE

**Rendered and accepted by the founder** on the two-arm prompt with the BOTTOM / MIDDLE / TOP references attached, resolving against `Peter Headband`. It took **eight takes and seven constructions**, which makes it by far the most expensive clip in the film and the one with the most transferable lessons.

> **Not yet measured.** The clip is not in the repo, so unlike K3–K6 this entry carries no luminance, loudness or geometry figures. Drop it in `geggen/products/ironpal/clips/` and the numbers below can be filled in — three of them are not optional.

**What has to be measured before the edit, in order:**

1. **The rep timings.** `REP_TIMES` in `scripts/k7/live_set.html` still holds six placeholder ticks at a ~1.2 s alternating cadence with `START_REP` at 6. The clip is a two-arm curl at ~2 s a rep, so **every one of those numbers is wrong**. Measure the actual turnarounds, retune, re-render `scripts/k7/make_inset.sh`. Frame-accurate agreement between the counter and the picture is the entire persuasive content of this clip (§4.3 of the design plan) — it is the only thing K7 has that the other clips do not.
2. **The inset geometry.** §4.4's starting numbers came from K5's waist-up subject and do not transfer to a full-length one. Measure his right edge, then place.
3. **Mean luminance.** K3 60.6, K4 55.4, K5 46.2, K6 49.7 — a 15-point walk that will read as different rooms unless someone owns it. K7 was specified to the mid-50s.
4. **Integrated loudness.** K3 −20.0, K4 −24.5, K5 −16.4, K6 −12.2 LUFS — a 12 LU spread going to one studio pass ([`audio_issue.md`](audio_issue.md)).

**The lessons worth carrying to K8**, because they were paid for eight times over:

- **A model's prior beats any wording.** Alternation failed on an adverb, an enumerated beat sequence, a see-saw, a speech-pinned schedule and two sets of reference stills. The prior for a curl is one-armed and no phrasing overturned it. **Ask for the thing whose default already matches.**
- **Never write a motion constraint that stillness satisfies.** *The two dumbbells are always at the same height as each other* is satisfied perfectly by a man standing still, and take 5 froze for exactly that reason. State travel, not relative position.
- **Prohibitions suppress motion.** Take 4's prompt was 1,068 words at 6.9 % negations and rendered a man holding a barbell perfectly still. The final prompt is 748 at 4.7 %.
- **Name the exercise.** Take 4 never used the word *bicep* or *squat* once; Flow's own auto-title came back *"Man lifting barbell in gym"*, which is the model telling you what it actually read.
- **Reference stills beat description — and they are obeyed literally.** The first reference-driven take curled right-handed because **the still attached to it was right-handed**. That was the technique working, on the wrong input.
- **Check the character name.** Every prompt in §5.3–§5.12 says `Peter`; the Flow project's character is `Peter Headband`. Corrected in K7 only — see §5.13.

### 5.15 K8 — the form beat, and the claim it needs

**The brief:** a squat shot from the side, on a line along the lines of *"it even corrects my form during the exercise — no personal trainer needed."*

#### The claim problem, before the wordings

**Form correction is not in the allowlist, and it is not anywhere else either.** Checked: none of the 18 entries in `claims_allowlist` mentions form, technique, posture or coaching; the site does not claim it; the POC does not do it; the model design does not describe it. **It is a brand-new capability claim, and it is the only line in the film that would assert something the project has no basis for at all** — weight-reading at least has claim 9 hedging it as *"the hard problem being built"*.

That does not block the clip. It does mean the line has to be chosen with the distinction in view, so the wordings below are graded:

- 🔴 **asserts it today** — needs a new allowlist entry and something real behind it.
- 🟡 **asserts the capability without a tense** — reads as present, defensible only if 🔴 is.
- 🟢 **frames it as next** — supportable now, because the camera and the angle genuinely are what form assessment needs.

**Two structural consequences the founder should decide on, not discover later.**

1. **K8 was the film's honest proof clip.** §7 of the design plan reserved it for the **Bulgarian split squat** precisely because that is enrolled, IMU-led and POC-validated, so **K8's inset could be a real recording** where K7's had to be a concept. The escalation was *K7 shows the interface, K8 shows the recogniser*. A form-correction K8 gives that up: the film's least supportable claim replaces its only demonstrable one. **If the form beat is wanted, it is worth asking whether it should be K9 rather than replacing K8.**
2. **It breaks the K2 bookend.** §5.3 records that K2's *"the smartest thing in this gym is still your thumb"* was written to pay off against a K8 punchline of *"the smartest thing here is the one I forgot I was wearing"* — and says in terms: *"if K8's punchline changes, this line loses half its value."* It is changing. K2 is already shot, so this is an edit-stage decision about what the film closes on.

#### Six wordings

All are inside the 16-word ceiling; he is squatting while talking, so the shorter ones have real margin.

| | words | ≈ | line | risk |
|---|---|---|---|---|
| **A** | 11 | 5.4 s | It even fixes my form. No trainer, no mirror, no guessing. | 🔴 |
| **B** | 14 | 6.9 s | It watches my depth on every rep. That used to be someone else's job. | 🔴 |
| **C** | 14 | 6.9 s | No trainer watching. No mirror. Just the thing on my head, learning my form. | 🟡 |
| **D** | 15 | 7.4 s | Same camera, same angle, every set. Once it counts the rep, it can judge it. | 🟡 |
| **E** | 13 | 6.4 s | It already knows what I lifted. How well I lifted it is next. | 🟢 |
| **F** | 15 | 7.4 s | It sees every rep from where I see it. Form is what it learns next. | 🟢 |

**What each is doing**

- **A** — the brief, said plainly. Shortest and punchiest, and the only one that uses "no trainer" as the close rather than the setup. It is also the single most exposed sentence in the film.
- **B** — swaps the abstract "form" for one concrete, checkable thing: **depth**, which is exactly what a side-view squat shows. More persuasive than A and no more defensible. *Note: the original of this line ended "that used to cost sixty an hour" — cut, because the allowlist's "not said" list bans **any dollar figure**.*
- **C** — "learning my form" is present progressive, which reads as *in progress* rather than *done*. The softest wording that still sounds like a feature. Whether that survives a sceptical reading is a judgement call, which is why it is amber and not green.
- **D** — makes the argument instead of the claim: the device already counts reps from a first-person view, so it is already looking at the thing form assessment needs. Earns the idea without asserting it.
- **E** — **the recommendation.** It builds straight off K7's line (*"it logs the exercise, the reps and the weight"*) — *knows what I lifted* → *how well I lifted it* — so the two clips become one escalating thought rather than two separate boasts. Shortest of the green options, which matters most in the clip where he is under load.
- **F** — the fullest green version, and the one that says the quiet part: *from where I see it*. The first-person angle is the product's actual differentiator and no competitor has it.

**None of them says "no personal trainer needed" in those words**, and that is deliberate: it is the half of the brief that carries the claim without carrying any information. A, B and C keep the sentiment; the green three let the picture make that point instead.

#### Production notes for a side view

- **A side-on subject cannot hold eye contact**, and every clip in the film so far is delivered to the lens. Either accept that K8 is the one clip where he addresses the room rather than the camera, or shoot it **three-quarter** — which still shows squat depth while keeping one eye on the lens. Worth deciding before the prompt is written, not after.
- **A side view is the right angle for the claim**, which is a genuine point in its favour: depth, knee travel and back angle are exactly what a coach looks at from the side, so the picture argues for the line.
- **The side view finally shows the ring mark.** The band's teal ring sits on the **right side** of the headband — invisible in every front-on clip. Shoot him facing frame-left and his right side is to camera, so the product's only branding reads properly for the first time in the film.
- **Facing frame-left also fights the inset.** He looks out of frame-left with the empty space behind him, which is compositionally backwards. Facing frame-right puts the ring away from camera. **The ring and the inset space cannot both be had from a side view** — pick one, and if it is the inset, K8 keeps the same left-of-centre framing as K7.
- **The squat takes the head down and back up**, a much bigger excursion than the curl's. Whatever the framing, he has to stay in frame at the bottom of every rep, and the key has to keep reaching the band.

#### The line, chosen

> **SUPERSEDED.** Option E below was chosen first and then replaced when the founder revised the brief to assert form correction outright. **The live line is option C of the revised set — see "Revised brief" further down.** Kept on the record because the reasoning for E is still the argument for what K8 gives up.

**Chosen first — option E: "It already knows what I lifted. How well I lifted it is next."** 13 words, ≈ 6.4 s. Green: it makes no present-tense form claim, so it needs no new allowlist entry, and *knows what I lifted* is claim 1, which K7 has already said out loud. The two clips read as one escalating thought rather than two separate boasts.

**The two structural questions above are still open** — whether the form beat should be K9 rather than replacing the Bulgarian split squat, and what the film now closes on given K2 was written to bookend a different K8 punchline. Neither blocks the render.

#### The exercise: a barbell back squat, and why the side view makes it possible

**A barbell is normally the wrong choice for this film** — K7 measured a 2.2 m bar at **53.5 %** of a 4.11 m frame at four metres, wide enough to lie straight across the inset. **From the side that problem disappears.** The bar points toward the camera and away from it, so only the near end and its plate are in shot, edge-on. The side view buys back the most legible "what I lifted" prop in the gym at no cost in width, which is the one genuine gift this angle gives.

It also picks a movement whose prior is already right, which is K7's most expensive lesson: a squat has no one-legged variant for the model to fall back on, and no left/right configuration to get wrong. **Nothing in this prompt is arguing with a prior.**

#### The composition, and the one thing it costs

Three requirements collide in a side view and only two can be had at once:

- **The band's ring reads.** The teal ring sits on the **right side** of the headband and has been invisible in every front-on clip in the film. Facing frame-**left** puts his right side to camera, so K8 is the first and only clip where the product's branding is legible in motion.
- **He is not looking out of the near edge.** Facing left means the open floor has to be in front of him, so he sits in the **right half** of the frame.
- **That moves the inset to the LEFT third**, where K3, K5 and K7 all put it on the right.

**The inset side is the thing being spent, and it is the cheapest of the three.** A UI panel is not scenery — it does not need him looking away from it — whereas a reversed subject either hides the branding or has him nose-to-the-frame-edge. Worth a deliberate look in the edit, since it is the only clip that breaks that pattern.

**He is in profile, so there is no eye contact**, and every other clip in the film is delivered to the lens. The prompt states it as a positive — *he looks straight ahead in the direction he is facing and he does NOT turn to look at the camera* — rather than leaving the model to invent a compromise. If that reads as a break in the film's method when cut, the fallback is a **three-quarter** angle, which still shows squat depth and keeps one eye on the lens, at the cost of some of the ring.

#### Reference stills, provided up front this time

K7 cost eight takes partly because the reference stills arrived seventh. **K8 gets them first.** `scripts/k7/make_ref_prompts.py` now also emits a side-view pair into `input/kickstarter/k8/`:

| | file | pose |
|---|---|---|
| **TOP** | `ref_prompt_top.txt` | standing tall, hips and knees extended, bar high on the shoulders |
| **BOTTOM** | `ref_prompt_bottom.txt` | thighs level with the floor, hips sunk down and back |

Same discipline as K7's: one template, one substituted clause, and the script asserts the two are otherwise byte-identical. **Neither needs mirroring and neither should fight the generator** — a squat top and a squat bottom are unambiguous, with no left/right configuration for the prior to get wrong. That is the second reason this exercise was the right pick.

**The prompt** is `input/kickstarter/k8/clip_prompt.txt` — 836 words at 4.5 % negations, the exercise named twelve times, travel stated rather than position (*his whole body and the barbell travel the full distance down and back up, four complete journeys*), the anti-freeze clause (*he is NOT simply holding the bar on his shoulders*), a locked-off camera clause naming the push-in, and `Peter Headband` as the character.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT: no captions, no subtitles, no titles, no logos and no letters or numerals anywhere in frame. Peter Headband is DOING BARBELL BACK SQUATS, SEEN FROM THE SIDE, in a dark, moody weights gym — matte black rubber floor, racks and benches behind him, lit low and warm — and he talks while he squats.

HE IS IN PROFILE: he faces frame-LEFT, so the camera sees him from HIS RIGHT-HAND SIDE, his right shoulder and the right side of his head toward the lens. He looks straight ahead in the direction he is facing and he does NOT turn to look at the camera. The barbell rests across his upper back and shoulders and he grips it with both hands. Because he is side-on, the barbell points toward the camera and away from it, so only the near end of the bar and its near plate are seen, edge-on — the bar does NOT stretch across the picture.

THE SQUATTING IS THE WHOLE POINT OF THE SHOT. He SQUATS DOWN AND STANDS BACK UP, OVER AND OVER, THROUGHOUT THE ENTIRE CLIP: he bends his knees and sinks his hips down and back until his thighs are level with the floor, then drives all the way up to standing tall, then sinks straight back down again — FOUR FULL SQUATS between the first second and the last, about one squat every two seconds. HIS WHOLE BODY AND THE BARBELL TRAVEL THE FULL DISTANCE DOWN AND BACK UP, FOUR COMPLETE JOURNEYS. HIS BODY IS RISING OR FALLING IN EVERY SINGLE FRAME. He is NOT standing still and he is NOT simply holding the bar on his shoulders: he is actively squatting, down and up, repeatedly, the whole time. The clip opens with him ALREADY MID-SQUAT, already on his way down.

His back stays straight, his chest stays up and his head stays level all the way down and all the way up, so the headband across his forehead stays visible at the top and at the bottom of every squat. The small teal ring mark sits on the RIGHT side of the headband, which is the side facing the camera, and reads clearly. The headband is matte-black fabric with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and NO lettering of any kind.

A LOCKED-OFF FULL-LENGTH SHOT ON A 35mm LENS at chest height, about four metres away: he is framed HEAD TO TOE, from his trainers to a small gap above his head, and his whole body and the whole barbell stay inside the frame at the top of every squat and at the bottom of every squat. This is a FULL-LENGTH shot, not waist-up and not a close-up. The camera never moves, never zooms and never pushes in — the framing is identical in the first frame and in the last. He stands in the RIGHT half of the frame, about two thirds of the way across, facing LEFT into open floor, so that the LEFT THIRD of the picture is empty gym. He stands on clear floor well away from any rack, with nothing lying at his feet, and he does NOT walk, step or turn.

The barbell is one plain matte-black bar with a plain matte-black disc at each end, completely unmarked — no numbers, no letters and no logos anywhere on it. He wears a plain black tank top, matte-black training shorts with a thin electric-teal stripe down the outer seam of each leg, and plain black trainers. He is alone in frame. Warm key light reaches his face and his forehead so the headband stays lit and sharp, and the shot is evenly exposed, not crushed dark. Each hand keeps five correctly shaped fingers wrapped around the bar, and the bar keeps the same solid straight shape and the same length throughout.

Audio: one clear man's voice, lip-synced to him, confident, warm and persuasive — the three things in the first sentence rattled off in turn, the second sentence landing them, and the last one flat, dry and certain. Steady and in control: a man who is working, not straining. NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless, NOT grunting. ONE single take: "Depth, back angle, knees. It checks all of it. That used to need a trainer.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display or superimpose them, or any fragment of them, anywhere in the picture. Say the line EXACTLY ONCE, word for word, all 15 words in that order, and then STOP — no repeats, no echo, no stammer, no ad-libs, no filler. ONE single speaker throughout, the same man's voice from the first word to the last, and no second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking but KEEPS SQUATTING to the end of the clip. No other dialogue, no ambient sound, no music.
```

#### Revised brief — the form claim, made directly

**The shot works.** The founder reports the K8 prompt capturing a side-view squat cleanly on **Omni 1.1 Flash**, which is the first K7/K8 movement prompt to land without a fight. The reference-stills-first approach and the choice of a movement with no competing prior both held.

**The line changes to assert form correction outright.** Option E — *"It already knows what I lifted. How well I lifted it is next."* — was the green, future-framed version; the founder has decided the clip should state the capability instead. **That is a decision, not an oversight**: the claim question in §5.15 was raised before the first six wordings and has been answered.

**What it requires, stated once so it does not get lost.** Form correction is in none of the 18 entries in `claims_allowlist`, on none of the site, and in none of the POC or model-design docs. `validate_claims` fails a run whose line cannot be traced to the list, so **the list needs a new entry before this renders**, and something behind it before it ships. A conservative wording that covers every option below:

> **19. App · form feedback** — IronPal watches the set from your point of view and flags form problems it can see — squat depth, back angle, bar path — during the set rather than after it. Like weight-reading, this is being built rather than shipped.

The hedge in the second sentence matters more than the first: **claim 9 is the precedent** for putting an unfinished capability on the record honestly, and it is the reason weight-reading can be said out loud in K7 without overclaiming.

#### Six wordings

All within the 16-word ceiling. He is squatting under a bar while talking, so the 12-word options have real margin and the 15-word ones have none.

| | words | ≈ | line |
|---|---|---|---|
| **A** | 12 | 5.9 s | It even corrects my form during the exercise. No personal trainer needed. |
| **B** | 12 | 5.9 s | It fixes my form mid-rep. No trainer. No mirror. No second guessing. |
| **C** | 15 | 7.4 s | Depth, back angle, knees — it checks all of it. That used to need a trainer. |
| **D** | 15 | 7.4 s | It corrects my form while I'm still in the rep. Nobody has to watch me. |
| **E** | 15 | 7.4 s | The only trainer I need is the one on my head. It corrects me mid-set. |
| **F** | 14 | 6.9 s | It corrects my form. No trainer, no mirror, no one pretending not to watch. |

**What each is doing**

- **A** — the founder's sentence, trimmed of *"so … is"*. Shortest, plainest, and the safest bet if the clip is tight; it is also the only one that says *personal trainer* in full, which is the phrase the brief keeps returning to.
- **B** — the clipped-fragment register K5, K6 and K7 all settled into (*"IronPal. A headband."* / *"Tiny camera. Motion sensors."*). Same length as A, more rhythm, and *mid-rep* is a stronger word than *during the exercise* because it is specific about when.
- **C** — replaces the abstract *form* with the three things a side view actually shows. **The most persuasive of the six and the most exposed**: naming depth, back angle and bar path is a much more testable promise than "form".
- **D** — puts the weight on *while I'm still in the rep*, which is the real differentiator against a post-set app. Needs the live-during-set framing that claim 10 still does not cover (§2.1), so it carries two unlisted claims rather than one.
- **E** — **the recommendation, for a reason outside the line itself.** *"The only trainer I need is the one on my head"* rhymes structurally with K2's *"the smartest thing in this gym is still your thumb"* — the bookend §5.3 warned would be lost when K8's punchline changed. This partially restores it: the film opens on the smartest thing in the gym being your thumb and closes on the only thing you need being on your head. That is worth more than a marginally tighter sentence.
- **F** — the one with a joke in it, and it obeys the comedy rubric: the target is the gym, not the viewer and not a competitor. *No one pretending not to watch* is the recognition beat the rubric asks for — everyone has been watched mid-set by someone studying the ceiling. Straightest-faced delivery wins it.

#### CHOSEN — option C

**"Depth, back angle, knees. It checks all of it. That used to need a trainer."** 15 words, ≈ 7.4 s. `input/kickstarter/k8/clip_prompt.txt` is updated: the line, the word count in the say-it-once clause (13 → 15), and the delivery clause, which now asks for *the three things rattled off in turn, the second sentence landing them, and the last one flat, dry and certain.*

**One punctuation change.** It was offered as *"Depth, back angle, knees — it checks all of it."*; the em dash is set as a full stop instead. Same 15 words in the same order, and three short sentences match the register K5, K6 and K7 settled into. It also keeps a dash out of the spoken-line field, which no prompt in this film has risked.

**Why C is the right pick despite being the most exposed.** It is the only one of the six whose words are answered by the picture. A side view of a squat *is* depth, back angle and knee travel — the three things it names are the three things the frame shows, so the line and the shot argue for each other instead of the line asserting over the top of a generic image. That is the same property that made K7's *"my hands are busy"* work, and the reason the side view was worth its costs (§5.15).

**It raises the bar on the allowlist entry, and the draft above already covers it.** Entry 19 names *squat depth, back angle, bar path* precisely because the most specific wording was on the table; C uses *knees* rather than *bar path*, which is within it. **The hedge in its second sentence is now doing real work** — three named checks is a materially more testable promise than "form", so the *being built rather than shipped* clause is what keeps it honest.

**Watch the length in the take.** 15 words is the joint-longest line in the film, delivered under a loaded barbell, and 7.4 s of an 8 s clip. If it runs out of room, *"That used to need a trainer"* is the half to shorten — the three checks are what make the line worth saying.

**On "no personal trainer needed".** Only A keeps it verbatim. B, C, E and F all convert it into something concrete — a mirror, a person, a cost, a pair of eyes — because *"no personal trainer needed"* asserts the benefit without showing it. The clip has eight seconds and the picture is already doing the work; the words are better spent on what it checks than on what it replaces.

### 5.16 K8 as shot — DONE. The film is shot.

**Rendered and accepted by the founder** on `input/kickstarter/k8/clip_prompt.txt` with line C, generated on **Omni 1.1 Flash**, resolving against `Peter Headband`. **K8 is the eighth and last clip: K1–K8 are all in hand.**

**It landed without a fight, and that is the headline.** K7 took eight takes and seven constructions; K8's movement worked on the prompt as written. Three things were different, and all three came from K7's bill:

- **The movement's default prior was already the shot.** A squat has no one-legged variant and no left/right configuration to get wrong. Every K7 failure was the model preferring its prior to the instruction; K8 never asked it to choose.
- **The reference stills were written before the first roll**, not seventh — `input/kickstarter/k8/ref_prompt_{top,bottom}.txt`, one template, one substituted clause, asserted byte-identical otherwise.
- **The prompt was built to K7's measured shape from the start**: exercise named twelve times, travel stated rather than relative position, the anti-freeze clause, 4.5 % negations against take 4's 6.9 %.

> **Not measured.** Like K7, the clip is not in the repo, so this entry carries no luminance, loudness or geometry. **Both of the last two clips are now undocumented numerically**, and the edit needs those numbers more than any single clip did.

#### What the finished film still needs

> **SUPERSEDED by §5.18** once K9 was added. Kept because the reasoning behind each item lives here; **the live list is in §5.18.**

**Blocking the render pipeline**

1. **Allowlist entry 19 does not exist yet.** `validate_claims` fails a run whose line cannot be traced to `claims_allowlist`, and **K8's line asserts a capability that is on none of the 18 entries**. The draft wording is in the section above. This is the only item that stops a scripted run outright.

**Blocking the edit**

2. **K7 and K8 are not in `geggen/products/ironpal/clips/`.** Everything below needs them.
3. **K7's inset is still wrong.** `REP_TIMES` in `scripts/k7/live_set.html` holds six placeholder ticks at a ~1.2 s alternating cadence with `START_REP` at 6; the clip is a two-arm curl at ~2 s a rep. Measure the turnarounds, retune, re-render `scripts/k7/make_inset.sh`, place from the measured frame. **Frame-accurate agreement between the counter and the picture is the entire persuasive content of K7** — it is the one thing that clip has that the other seven do not.
4. **Does K8 have an inset at all?** The composition was decided on the assumption that it does: he faces frame-left so the band's teal ring reads, which puts him in the right half and **moves the inset to the LEFT third**, breaking the pattern K3, K5 and K7 set. **If K8 carries no inset, that whole trade was paid for nothing** and the shot could have been framed the other way. Worth settling before the edit rather than discovering it there.
5. **Exposure drift is still nobody's job.** Measured: K3 60.6, K4 55.4, K5 46.2, K6 49.7. A 15-point walk across consecutive clips reads as different rooms, and a grade will not reconcile dressing differences (§5.8 on K4's corner of the gym).
6. **Loudness spread, 12 LU end to end** — K4 −24.5, K3 −20.0, K5 −16.4, K6 −12.2 — going to one studio pass ([`audio_issue.md`](audio_issue.md)) rather than per-join fixes.
7. **Tail frames.** K3 darkened over its last two, K5 blew out over its and K6 opened bright off it; trimming K5's last three fixes the K5→K6 flash at no cost. Check K7's and K8's tails before fading anything onto them.

**Decisions, not tasks**

8. **`Peter` vs `Peter Headband`.** Every prompt in §5.3–§5.12 names a character that does not exist in the Flow project; K7 and K8 are corrected and the rest are not. Either rename the mint or update those sections — one place changed and not the other is the only genuinely bad state, and the film is currently in it.
9. **What the film closes on.** §5.3 recorded that K2's *"the smartest thing in this gym is still your thumb"* was written to pay off against a K8 punchline of *"the smartest thing here is the one I forgot I was wearing"*, and warned that if K8's punchline changed, K2 would lose half its value. It changed. Option E of the revised set (*"the only trainer I need is the one on my head"*) would have partly restored the echo; C does not, and C is the better line on its own terms. **The bookend is now the edit's problem** — either the end card carries it, or the film accepts an opening that no longer lands.
10. **K8 replaced the film's only demonstrable inset.** It was reserved for the Bulgarian split squat because that is enrolled, IMU-led and POC-validated, so its inset could be a **real recording** where every other is a concept. The escalation was *K7 shows the interface, K8 shows the recogniser*. As shot, **no clip in the film shows the recogniser working.** If that matters, it is a ninth clip, not a re-edit.

### 5.17 K9 — the outro, and the bookend it accidentally repairs

**The brief:** Peter with the headband, full screen, walking toward camera with K1's energy. **10 s on Omni 1.1 Flash, the first 2 s silent** so K8 can land. A CTA, along the lines of *"Give your thumb a break. Join me on IronPal and take your fitness journey to the next level!"*

#### "Give your thumb a break" is the best thing in the brief, and it fixes something that was broken

§5.16 recorded the film's closing problem: K2's *"Billions poured into AI, and the smartest thing in this gym is still your thumb"* was written to pay off against a K8 punchline that no longer exists, and §5.3 warned in terms that *"if K8's punchline changes, this line loses half its value."*

**The thumb is back.** *"Give your thumb a break"* answers K2 directly — the film opens on your thumb being the smartest thing in the gym and closes on giving it a rest. That is the bookend, arriving one clip later than planned and from a CTA rather than a punchline. **Every wording below keeps a callback to the thumb or to the typing** for that reason; it is the single most valuable word in the brief and it should not be traded for a better-sounding sentence.

#### The half that should go

*"Take your fitness journey to the next level"* is the one line in the film that could belong to any product. Everything else is specific — a thumb, 3×8 at 80 kg, the smartest thing in the gym, depth and back angle and knees — and specificity is the whole voice. A generic benefit phrase at the close undoes some of that, and it spends four or five words saying nothing a viewer can act on.

**What replaces it is a concrete ask**, which the allowlist supports precisely: reserving costs nothing today, it locks the price and a 48-hour head start (claim 12), early-bird is up to about 50 % off and limited to the first 200 (claim 13), it is built in the open by a solo founder (claim 14), and `ironpal.co` is where you reserve (claim 15).

#### Budget

**10 s minus 2 s of silence is an 8 s speaking window** — the widest in the film, but it is a walking, energetic delivery like K1's, and §5.2 measured that register at both rates. At a brisk **2.04 w/s that is 16 words**; at the **1.7 w/s of a slower, more deliberate read it is only 13**, and five of the six below overrun a slow reading. **If the take comes back measured rather than brisk, E is the only one that certainly fits.**

| | words | brisk | slow | line |
|---|---|---|---|---|
| **A** | 14 | 6.9 s | 8.2 s ⚠ | Give your thumb a break. Reserve your spot at ironpal.co — it costs nothing today. |
| **B** | 14 | 6.9 s | 8.2 s ⚠ | Give your thumb a break. First two hundred spots, at ironpal.co. Reserving is free. |
| **C** | 14 | 6.9 s | 8.2 s ⚠ | Stop typing. Start lifting. Reserve your spot at ironpal.co before the two hundred go. |
| **D** | 16 | 7.8 s | 9.4 s ⚠ | Give your thumb a break. I'm building this in the open — come build it with me. |
| **E** | 13 | 6.4 s | 7.6 s | Give your thumb a break. Early backers get up to half off. ironpal.co. |
| **F** | 14 | 6.9 s | 8.2 s ⚠ | Your thumb has done enough. Reserve an early spot at ironpal.co — costs you nothing. |

**What each is doing**

- **A — the recommendation.** Thumb callback, the ask, and the objection handled in one breath: *it costs nothing today* is the sentence that converts, because the thing stopping a stranger from clicking is the assumption that reserving means paying. Claims 12 and 15, nothing strained.
- **B** — swaps the free-ness for scarcity. *First two hundred* is claim 13 and it is true, but scarcity from a solo founder pre-launch reads harder than it is; A's objection-handling does more work on a cold audience.
- **C** — the strongest register, and the only one built from the film's own clipped fragments (*"IronPal. A headband."* / *"Tiny camera. Motion sensors."* / *"No buttons. No pausing."*). *Stop typing. Start lifting.* is the most quotable line of the six. It trades the thumb for the typing, which is a K3/K4 callback rather than a K2 one — the bookend survives, slightly weaker.
- **D** — the founder angle, claim 14. *"Come build it with me"* is the most honest ask in the set and the most on-brand for a build-in-public campaign, but at 16 words it has no margin at all and it never says what to do.
- **E** — the only one that certainly fits a slow delivery, and the only one leading with the discount. *Up to half off* is claim 13's *"up to about 50 %"* — **keep the "up to"**; *"half off"* flat would be an overclaim, and it is one word.
- **F** — A with a drier opening. *"Your thumb has done enough"* is funnier than *"give your thumb a break"* and slightly less clear; a coin-flip against A on taste.

#### Production notes

- **`ironpal.co` is already on the end card** for 2.5 s in accent teal, alongside *"A camera on your head. Handled honestly."* So a line that omits the URL is not leaving the viewer stranded — D is viable on those grounds, and any of the others could drop it to buy two words. **Saying it and showing it is still stronger**, and costs nothing here.
- **The URL must be spoken, never written in frame.** The no-writing ban applies to K9 like every other clip, and Kling and Leonardo both proved small type renders as scribble. The end card is a composited graphic, not a generated one.
- **The 2 s of silence is a prompt instruction, not an edit.** It has to be asked for explicitly — *he walks for the first two seconds without speaking, mouth closed, and then begins* — or the model will start him talking on frame one and the pause has to be bought back by trimming, which costs the walk.
- **It is `Peter Headband`, and that is a change from K1.** K1's walking take resolved against `Peter Pitch FullBody` — the **bandless** character, because the product had not been revealed yet. K9 is the same blocking with the band on, so it needs the band-wearing character and a full-length wardrobe: the shorts with the teal outer-seam stripe and the trainers, which `Peter Headband`'s card does not carry (§3.3 of the K7 design plan). **State the lower half in the prompt**, exactly as K7 and K4 had to.
- **A ninth clip breaks the config again.** `primitives.json` caps a promo at `max_clips: 4` and `max_beats: 6`; those were already raised to accommodate eight. Nine clips and a 10 s duration both need the numbers moved again — and every other clip in the film is 8 s, so the 10 s length is a new case for the assembly step, not just for Flow.

#### CHOSEN — option A

**"Give your thumb a break. Reserve your spot at ironpal.co. It costs nothing today."** 14 written words. The prompt is `input/kickstarter/k9/clip_prompt.txt`.

**One punctuation change**: offered with an em dash before *it costs nothing today*, set here as a full stop. Same 14 words in the same order, and three short sentences match the register the film settled into. No prompt in this film has put a dash in the spoken-line field.

**The timing is tighter than the word count suggests, and this is the thing to watch.** *"ironpal.co"* is one written word and **three spoken ones** — *ironpal dot co* — so the line is **16 spoken words**: **7.8 s brisk in an 8.0 s speaking window**, and 9.4 s at a slower read. **It fits only if the delivery is energetic**, which is what the brief asks for and what K1's walking take delivered. **If it overruns, cut "your spot"** — *"Reserve at ironpal.co. It costs nothing today."* is 14 spoken words at 6.9 s and loses nothing that converts.

**The prompt says how to pronounce it**, because this is the first spoken URL in the film: *he says the web address ALOUD AS THE WORDS "ironpal dot co" — spoken naturally as words, NOT spelled out letter by letter and NOT read as punctuation.* Left unstated, a model reading a dotted string is as likely to spell it as say it.

#### What this prompt reuses, and the one thing it adds

**The blocking is K1's walking take and K4's, verbatim where it can be.** Both worked: a locked-off 35 mm at chest height, him walking INTO it from about five metres to about two, starting full-length and finishing waist-up, centred, never leaving frame or passing the camera. That framing is the most-proven thing in the film and there is no reason to invent for the last clip.

**The gesture rules come with it** — empty hands, low and open between waist and chest, both in frame, five correctly shaped fingers, no counting, no pointing, no splaying. §5.2 records why that ban was lifted and narrowed rather than kept: an enthusiastic salesman who cannot use his hands reads as inert.

**The one new instruction is the silence**, and it needed stating three ways because it is the only part of this clip with no precedent: as a blocking beat (*for the first two seconds he walks toward the camera without speaking, mouth closed, no lip movement*), as an audio instruction (*SILENCE for the first two seconds — no voice, no speech, no breath, no ambient sound*), and as an ordering (*only AFTER those two seconds does he begin to speak*). **A pause that is not asked for has to be bought back by trimming**, and trimming the head of this clip costs the walk-in that makes it work.

**Wardrobe is stated in full, and that is deliberate.** K9 is the same blocking as K1's walking take but resolves against **`Peter Headband`**, not the bandless `Peter Pitch FullBody` — the product is revealed now. That character's card stops at the tank top and the band (§3.3 of the K7 design plan), so the shorts with the electric-teal outer-seam stripe and the black trainers are named in the prompt, exactly as K4 and K7 had to. Without that sentence K9 and K1 are two different men from the waist down, in the two clips that bookend the film.

**No inset, so no reserved frame space.** K3, K5 and K7 all had to keep a third of the picture empty; K9 does not, and the framing is free because of it — he stays centred, which is what a walk-in wants anyway.

#### A correction to the take-4 lesson

The draft came in at **6.2 % negations** and that looked high against §5.14's finding that take 4 froze at 6.9 %. **Measured against the prompts that actually worked, it is not high at all:**

| prompt | words | negations | density | result |
|---|---|---|---|---|
| K1 walking take | 739 | 48 | **6.5 %** | ✅ worked |
| K4 | 681 | 44 | **6.5 %** | ✅ worked |
| K5 | 580 | 36 | **6.2 %** | ✅ worked |
| K7 take 4 | 1,068 | 74 | **6.9 %** | ❌ frozen |
| **K9** | 866 | 54 | **6.2 %** | — |

**So the lesson needs narrowing: negation load suppresses *exercise* motion, not locomotion or standing.** Every clip in this film that walks or stands has run at 6.2–6.5 % and rendered correctly. What sank take 4 was not the density on its own but that its prohibitions all pulled in one direction — *chest height and no higher, never in front of his face, never crosses his chin, does not press overhead* — against a single instruction asking the bar to rise, while the model's curl prior was already fighting the arm count. **No instruction in K9 fights another, and walking is the most-proven motion in the film**, so the prompt is left at full strength rather than trimmed to hit a number that was never the cause.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT: no captions, no subtitles, no titles, no logos and no letters or numerals anywhere in frame. Peter Headband WALKS STEADILY STRAIGHT TOWARD THE CAMERA through a dark, moody weights gym — matte black rubber floor, a black flat bench, racks of dumbbells behind him, lit low and warm — animated and enthusiastic, his face alive: eyebrows active, eyes bright, a genuine smile breaking through. He is ALREADY WALKING in the very first frame. His stride is even and natural, never stiff, never robotic, never stop-start.

THE FIRST TWO SECONDS ARE SILENT. For the first two seconds of the clip he walks toward the camera WITHOUT SPEAKING — mouth closed, no lip movement of any kind, eyes on the lens, still smiling and still walking. Only AFTER those two seconds does he begin to speak, and he keeps walking while he speaks.

A LOCKED-OFF SHOT ON A 35mm LENS AT CHEST HEIGHT, and he walks INTO it: he begins FULL-LENGTH, head to toe, about five metres from the camera, and closes steadily to about two metres by the end of the clip, finishing framed from the waist up. He grows noticeably larger in frame across the shot. He stays centred throughout, he never walks out of frame and he never passes the camera. The camera itself does not move, does not zoom and does not pan, and the room behind him never changes or cuts to a different place.

He faces the camera and delivers the line straight to camera, eyes on the lens — not looking down, not looking away. His head is up so that the IronPal headband across his forehead is CLEARLY VISIBLE and sharp for the whole clip, and it grows more legible as he closes on the camera. He is wearing a plain black tank top, matte-black training shorts with a single thin electric-teal stripe running down the outer seam of each leg, plain black trainers, and the IronPal headband: matte-black fabric with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side. The headband carries NO lettering and NO writing of any kind — the plain teal ring only. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing worn in or over his ears.

His hands are EMPTY for the whole clip but they MOVE: he talks with them the way an enthusiastic person does — open palms, relaxed fingers, easy natural gestures that punctuate the line and flow with his stride. Every gesture stays LOW and OPEN, between waist and chest height, well below his face, with both hands inside the frame at all times. He never raises a hand to his head or touches the headband, never picks anything up, never counts on his fingers, never points at the camera and never splays or fans his fingers. Each hand has exactly five correctly shaped fingers in every frame. He is ALONE in the shot — no other people in frame. There are no devices and no screens anywhere in the shot: no phone, laptop, tablet or monitor. Warm key light reaches his face and his forehead so the headband stays lit and sharp, and the shot is evenly exposed, not crushed dark.

Audio: SILENCE for the first two seconds — no voice, no speech, no breath, no ambient sound and no music while he walks. Then one clear man's voice, lip-synced to him, spoken with ENERGY and ENTHUSIASM — the voice of a man genuinely excited about what he is saying, confident, warm and persuasive, the pitch rising and falling, an easy grin on the first sentence, the invitation landed openly on the second, and the last four words said plainly and reassuringly. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "Give your thumb a break. Reserve your spot at ironpal.co. It costs nothing today.". He says the web address ALOUD AS THE WORDS "ironpal dot co" — spoken naturally as words, NOT spelled out letter by letter and NOT read as punctuation. Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing. Say the line EXACTLY ONCE, word for word, start to finish — all 14 words, in that order — and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence, and do NOT ad-lib, pad or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last, not changing speaker, gender, age or timbre part way through, and no second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed, still walking toward the camera. No other dialogue, no ambient sound, no music.
```

### 5.18 K9 as shot — DONE. The shoot is closed.

**Rendered and accepted by the founder** on `input/kickstarter/k9/clip_prompt.txt` with line A, generated on **Omni 1.1 Flash**, resolving against `Peter Headband`. **K9 is the ninth and last clip. K1–K9 are all in hand and nothing further needs generating.**

**It landed on the prompt as written**, like K8 and unlike K7 — and for the same reason, stated once more because it is the one lesson worth carrying out of this film: **the shot asked the model for something its priors already agree with.** Walking toward a locked-off camera while talking is the most-proven motion in this film (K1 and K4 both landed it), the gesture rules came with it, and nothing in the prompt fought anything else.

> **Not measured.** Like K7 and K8, the clip is not in the repo. **Three of the nine clips are now undocumented numerically** — the last three shot — and every remaining item on the punch list needs them.

**Two things to check on this clip specifically**, because both are unprecedented in the film and neither can be assumed:

1. **Did the first two seconds come back silent?** It was asked for three ways — as blocking, as an audio instruction and as an ordering — but no other clip in the film has a deliberate pause, so there is no prior take saying whether Flow honours one. If speech starts on frame one, the pause has to be bought back by trimming the head, which costs the walk-in.
2. **Is the URL said as words?** *"ironpal dot co"*, not spelled out and not read as punctuation. The line is **16 spoken words in an 8.0 s window** — 7.8 s at a brisk read, with 0.2 s of margin — so also check it does not run into the tail. **If it overruns, cut "your spot"**: *"Reserve at ironpal.co. It costs nothing today."* is 6.9 s.

#### Runtime, now that everything is shot

**8 × 8 s + 1 × 10 s + a 2.5 s end card = 76.5 s.** The original brief in [`founder_video_final.md`](founder_video_final.md) budgeted **115 words → ≈ 58.9 s with the card**, and §5.7 already recorded the clip count breaking its cap once. **The film is now about 30 % longer than the target it was designed to.**

That is not automatically wrong — it is a Kickstarter pitch, not an ad — but it is a decision that should be made deliberately in the edit rather than discovered at upload. The two obvious levers, in order of what they cost:

- **Trim the joins.** K5's last three frames already have to go to fix the K5→K6 flash (§5.12); tails across all nine will give back a second or two for free.
- **Cut a beat.** §5.7 flagged the two privacy beats, `what_stays` and `what_goes`, as making the same argument twice, and named them as the standing merge candidates before K5 was even written. That question was deferred and is now due.

#### The punch list, as it stands with the shoot closed

Superseding the list in §5.16 — items are unchanged except where the ninth clip moved them.

**Blocking a scripted run**

1. **Allowlist entry 19 does not exist.** K8's line asserts form correction, which is on none of the 18 entries, and `validate_claims` fails a run it cannot trace. Draft wording is in §5.15. **Still the only item that stops the pipeline outright.**
2. **The config describes eight clips, not nine.** `clips` and `segments` both hold 8, `primitives.json` caps `max_clips`/`max_beats` at numbers already raised once for eight, and **every clip in the config is 8 s** — K9's 10 s is a new case for the assembly step, not only for Flow.

**Blocking the edit**

3. **K7, K8 and K9 are not in `geggen/products/ironpal/clips/`.** Everything below needs them.
4. **K7's inset is still on placeholder timings.** `REP_TIMES` in `scripts/k7/live_set.html` holds six ticks at a ~1.2 s alternating cadence with `START_REP` at 6, against a two-arm curl at ~2 s a rep. Measure, retune, re-render `scripts/k7/make_inset.sh`. **Frame-accurate agreement between the counter and the picture is the entire persuasive content of K7.**
5. **Does K8 have an inset?** Its composition was decided assuming one, which is why he faces frame-left and the inset moves to the LEFT third, breaking the pattern K3, K5 and K7 set. If there is no inset, that trade was paid for nothing.
6. **Exposure drift** — K3 60.6, K4 55.4, K5 46.2, K6 49.7, and three clips unmeasured. Still nobody's job.
7. **Loudness, 12 LU end to end** — K4 −24.5, K3 −20.0, K5 −16.4, K6 −12.2 — to one studio pass ([`audio_issue.md`](audio_issue.md)).
8. **Tails.** K3 darkens, K5 blows out, K6 opens off it. Trim K5's last three frames; check K7's, K8's and K9's before fading anything onto them.

**Decisions**

9. **`Peter` vs `Peter Headband`.** K7, K8 and K9 name the real character; §5.3–§5.12 still name one that does not exist. Half-fixed is the worst state and the film is in it.
10. **Runtime, 76.5 s against ≈ 59 s.** See above.
11. **No clip shows the recogniser working.** K8 was holding that slot before it became the form beat — it was reserved for the Bulgarian split squat precisely because that is enrolled, IMU-led and POC-validated, so its inset could be a real recording rather than a concept. Recovering it is a tenth clip, not a re-edit. **With the shoot closed this is now a deliberate omission rather than a pending task**, and worth recording as such.

**The bookend is repaired.** §5.16 listed it as an open decision: K2's *"the smartest thing in this gym is still your thumb"* had lost the K8 punchline it was written against. K9's *"Give your thumb a break"* answers it — the film opens on the thumb being the smartest thing in the gym and closes on giving it a rest. **Item closed.**

---

## 6. Two edits the builder cannot make

**The delivery clause.** The builder asks every clip for *“warmth and a little wry humour”*, which is right for the deadpan beats and wrong for a figures pitch. Replaced with a slow, measured read that lands each number and pauses between the two sentences.

**The pronouns — and this one nearly did real damage.** `cast.py` writes every prompt in the plural (*“They face the camera”*, *“Their hands stay still”*) because its personas rotate and gender varies per promo. This cast does not rotate, and a plural pronoun sitting next to a clause that insists he is ALONE is the one ambiguity the shot cannot afford.

The fix is `pipeline/promo/pronouns.py`, and it works **phrase by phrase, never word by word**. A blanket swap was tried first and silently destroyed the two sentences that stop the spoken line being painted into the picture, because their pronouns refer to **the words**, not the man:

> Those words are SPOKEN ALOUD ONLY — **they** are audio, not a caption.  
> Do NOT write, display, superimpose or print **them**, or any word or fragment of **them** …

Word-level substitution turns those into *“he is audio”* and *“print him”* — nonsense in the exact clause that prevents burned-in captions, which is the defect that ruined three of four clips on a handlr run. Both corruptions were produced and caught before anything rendered. The module now asserts those two clauses survive intact and raises if any plural escapes elsewhere. One trap inside the trap: the tail of that same sentence, *“not on their clothing”*, is the man’s and does get swapped.

---

## 7. Slow motion is the one thing K1 cannot have

The brief asked for slow motion. **A talking clip cannot be slow motion**, and finding that out after a render would cost 10 credits and produce something unusable.

Flow bakes the voice-over into the clip and lip-syncs it to the mouth. Slowing the picture desynchronises the mouth from the words, whether the retime happens inside the generation or afterwards in the edit. There is no setting that slows the picture and leaves the audio alone.

What the brief actually wants is gravitas, and that is available: **slow, deliberate movement and an unhurried, weighty delivery, at normal frame rate.** The action asks him to stand still with his weight settled and move slowly; the audio clause asks for a measured read that lands each figure, with a pause between the two sentences. The mouth stays in sync and the clip still feels like a pitch rather than a remark.

If genuine slow motion is wanted somewhere in this video, it belongs on a clip with **no speech** — a cutaway, not a piece to camera.

---

## 8. What this changes downstream

Recorded, not yet applied. The committed config still holds the original eight clips.

1. **K1 is replaced** by option C: *“Gyms, a hundred and forty billion a year. Fitness trackers, fifty billion more.”* — 13 words, 7.6 s at a slow delivery.
2. **K2 becomes the catch.** The old K2 (*“my thumb kept the log, badly, while three tripods filmed everyone else”*) is the same complaint at personal scale, so it is absorbed rather than kept: something like *“All of it still needs you to type the set in, or wear something ridiculous.”* Clip count stays at eight and the script stays inside 60 s.
3. **K8’s punchline breaks and must be rewritten.** *“Six mirrors, three tripods, a ceiling camera. Mine’s the only one that deletes”* pays off tripods planted in the old K2. Remove those and the callback lands on nothing. The replacement has to pay off the new premise instead — the candidate is *“The smartest thing here is the one I forgot I was wearing.”* at 15 words, which answers both the AI framing and the cumbersome-device framing.
4. **The register shifts.** The old opening put a person and an objection in the first second; this one opens on a category. Slower to grab, but it does the job the brief asks for — explaining the world before the product arrives.

---

## 9. Open — needs your decision before anything is written or rendered

- ~~Which line.~~ **Settled: C.**
- ~~The bandless character.~~ **Minted as `Peter Pitch`.**
- **The industry observations are not product claims.** *“Everyone still types”* and *“wear something ridiculous”* are statements about the market, outside the claims allowlist, the same way the tripods were. None names a competitor, which keeps them safe, but they need your yes.
- **The revenue figures go on the record.** Quoting a market size in a founder video is a claim about the world; the rounding rules in §1 are there to keep it defensible.
- **K8’s new punchline**, once K2 is settled.
- ~~The K3 line.~~ **Settled and shot.** The clip is rendered and composed with its inset — §5.6.
- ~~The K4 line and register.~~ **Settled and shot.** Your line kept verbatim; the register stays salesmanship rather than the inward turn first drafted — §5.7 carries the argument both ways, §5.8 what the render did and did not deliver.
- **The clip count is now the blocking decision.** With K3 (old way) and K4 (the turn) both as their own beats the film runs ten clips — money, catch, old way, turn, device, offline, privacy, worn, progress, close — against a cap of **eight** in `primitives.json`, already raised once, and 80 s against a 60 s target. `founder_video_promo_config.json` still holds the OLD K3 (the device reveal, `cast_slot: founder`, band visible), so the config and this document disagree until the restructure is settled. Two beats have to go or merge. The candidates, in order of how little they cost: the two privacy beats `what_stays` and `what_goes`, which make the same argument twice; and `worn`, whose point K4 and the reveal largely make between them. **This needs an answer before K5 is written.**
- **The line about the founder’s own thumb** (*“Mine’s been doing it for years”*) is self-deprecating rather than aimed at anyone, which keeps it inside the comedy rubric, but it is a line about you and needs your yes like the others.
