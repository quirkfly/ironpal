# IronPal promo video — script V1: the opening pitch

**Status:** V1 · 2026-09-27 — **K1 line chosen (C)**; the character it needs is not minted yet  
**Scope:** clip K1 only. The other seven clips are unchanged and live in [`founder_video_final.md`](founder_video_final.md).  
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

## 5. What this changes downstream

Recorded, not yet applied. The committed config still holds the original eight clips.

1. **K1 is replaced** by option C: *“Gyms, a hundred and forty billion a year. Fitness trackers, fifty billion more.”* — 13 words, 7.6 s at a slow delivery.
2. **K2 becomes the catch.** The old K2 (*“my thumb kept the log, badly, while three tripods filmed everyone else”*) is the same complaint at personal scale, so it is absorbed rather than kept: something like *“All of it still needs you to type the set in, or wear something ridiculous.”* Clip count stays at eight and the script stays inside 60 s.
3. **K8’s punchline breaks and must be rewritten.** *“Six mirrors, three tripods, a ceiling camera. Mine’s the only one that deletes”* pays off tripods planted in the old K2. Remove those and the callback lands on nothing. The replacement has to pay off the new premise instead — the candidate is *“The smartest thing here is the one I forgot I was wearing.”* at 15 words, which answers both the AI framing and the cumbersome-device framing.
4. **The register shifts.** The old opening put a person and an objection in the first second; this one opens on a category. Slower to grab, but it does the job the brief asks for — explaining the world before the product arrives.

---

## 6. Open — needs your decision before anything is written or rendered

- ~~Which line.~~ **Settled: C.**
- **The industry observations are not product claims.** *“Everyone still types”* and *“wear something ridiculous”* are statements about the market, outside the claims allowlist, the same way the tripods were. None names a competitor, which keeps them safe, but they need your yes.
- **The revenue figures go on the record.** Quoting a market size in a founder video is a claim about the world; the rounding rules in §1 are there to keep it defensible.
- **K8’s new punchline**, once K2 is settled.
