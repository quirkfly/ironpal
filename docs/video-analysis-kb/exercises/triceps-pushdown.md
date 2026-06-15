# Triceps pushdown (cable)

**Equipment:** cable machine / pulley + bar (or rope) attachment, plates on a weight stack or loading
pin, standing.
**Status:** ✅ seen in a real KB clip — **case 003** (`20260615_122213.mp4`), user-confirmed. (I MISSED
it: called it "no exercise" then "deadlift" — see the THE BIG TELL below.)

## THE BIG TELL — it's a CABLE exercise: the bar connects to a weight via a flexible CABLE/CHAIN
The single identifier that separates this from a barbell lift: **a flexible cable or chain runs from the
held bar/handle to a weight stack / loading pin / pulley.** A cable **straight-bar attachment looks
exactly like a short barbell** when held both-hands pronated — the ONLY way to tell them apart is to
**trace what comes off the bar**: a cable/chain to a load = cable machine; rigid loaded ends + no cable =
barbell. (Case 003: I saw the cable/chain three times and mislabelled it "accommodating-resistance chain"
and "draw-wire instrumentation," then called the attachment a "barbell" and the pin-loaded plates a
"loaded bar" → wrongly concluded deadlift. Plates can sit on a **cable loading pin**, not just a bar.)
There is **no floor↔hip trajectory** — don't go looking for one; a pushdown is arm-driven elbow
extension with the person stationary.

## Visual signature

- **Third-person:** standing at a cable stack, upper arms pinned to sides, elbows extend to push
  the attachment down, forearms rotate down to near-lockout, then control back up.
- **Egocentric (headband):** **little head motion** — this is the key tell. You see the cable/
  attachment and the **forearms extending downward in the lower frame**; the weight stack may be
  visible moving. Because the head barely moves, sensor/IMU motion is weak — vision carries it.

## Rep definition

One rep = elbow extension (forearms push down to lockout) → controlled return to ~90°. Count
completed down-pushes (lockouts).

**⚠ Egocentric vision can't count these reliably (case 003: 5 reps, I counted 0).** The stroke is
**axial** — the bar goes down/away **along the head-down camera's view axis** — and the head **tracks
the bar** while barely moving (head-still). Result: real reps cause almost **no image-plane motion**,
so the bar looks static and reads as "handling/setup." Do NOT infer "no reps" from an in-frame-static
bar. The reliable rep clock is the **cable-displacement / weight-stack motion sensor (or a wrist IMU)**,
not the headband IMU and not vision. See rep-counting.md "AXIAL / depth-stroke reps are nearly INVISIBLE."

## Weight reading

Pin-loaded stack — read the number at the **pin**, not the top plate (see `weight-reading.md`).
The stack is often visible in the egocentric frame; grab the clearest pin frame.

## Confusions to rule out

- Cable bicep curl (motion goes *up*, supinated grip).
- Straight-arm pulldown (shoulder-driven, elbows stay extended).
- Lat pulldown (seated, pulling a high bar toward the chest, whole-arm).
- **Barbell deadlift / free-weight lift (case 003 MISS):** the straight-bar attachment + pronated
  both-hands grip + pin-loaded plates mimic a loaded barbell. Disambiguator: **trace the cable** — a
  flexible line from the bar to a weight = this (cable pushdown); rigid bar, no cable, bar travels
  floor↔hip = deadlift. A cluttered home-gym floor (mats, DBs, EMG/enrollment gear) is NOT evidence of
  free weights.
