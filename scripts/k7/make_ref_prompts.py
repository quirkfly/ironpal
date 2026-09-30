#!/usr/bin/env python3
"""Emit the K7 reference-still prompts.

The images are only useful as keyframes if they differ in ONE thing: the arms.
Same man, same gym, same lens, same distance, same stance, same light. So they
are built from one shared template with a single substituted clause rather than
written out three times — hand-copying near-identical prompts is how a stray
word ends up in one of them and the set stops matching.

Two deliberate departures from the clip's own framing, both so that pose A can be
made by MIRRORING pose B (see scripts/k7/flip_ref.sh):

  * the subject is CENTRED, not left-of-centre. A mirror moves a left-third
    subject to the right third, which would fight the clip's framing
    instruction. The stills carry the POSE; the clip prompt carries the framing.
  * the headband's teal RING MARK is omitted, leaving only the stripe and the
    lens, which are symmetric. The ring sits on the right side and a mirror puts
    it on the left, i.e. burns a wrong-sided product into a reference. The ring
    comes from the minted `Peter` character at clip time instead.

    python3 scripts/k7/make_ref_prompts.py        # -> input/kickstarter/k7/ref_prompt_{1,2,3}.txt
"""
from pathlib import Path

OUT = Path("input/kickstarter/k7")

# Straight from founder_video_promo_config.json, characters[0].persona. Attaching
# the minted `Peter` character is better than this text if the tool allows it —
# then the description is redundant and the identity is already locked.
PERSONA = (
    "a lean, athletic 46-year-old White man with a closely shaved head, light stubble "
    "with a moustache and a short greying chin beard, fair skin, defined shoulders and "
    "arms, natural healthy skin tone with realistic warmth"
)

ARMS = {
    # Pose A. The generator has the same right-arm bias the video model has: asked
    # for this directly, it returns pose B. So the left arm is made the SUBJECT of
    # the sentence and the exercise is named for it — "a LEFT-ARM dumbbell curl" —
    # which is the one framing not yet tried. If it still comes back right-arm-up,
    # stop paying for it and mirror pose B with scripts/k7/flip_ref.sh.
    1: ("HE IS PERFORMING A LEFT-ARM DUMBBELL CURL: his LEFT arm is the one doing the "
        "work. HIS LEFT ARM IS FULLY CURLED UP, the left elbow bent tight and the left "
        "dumbbell raised to his left shoulder, right next to his chin. His right arm is "
        "doing nothing at all: it hangs slack and fully extended straight down by his "
        "side, with the right dumbbell low at his right thigh. LEFT DUMBBELL HIGH, RIGHT "
        "DUMBBELL LOW."),
    # Pose B. This one renders correctly first time — it is the generator's default.
    2: ("HE IS PERFORMING A RIGHT-ARM DUMBBELL CURL: his RIGHT arm is the one doing the "
        "work. HIS RIGHT ARM IS FULLY CURLED UP, the right elbow bent tight and the right "
        "dumbbell raised to his right shoulder, right next to his chin. His left arm is "
        "doing nothing at all: it hangs slack and fully extended straight down by his "
        "side, with the left dumbbell low at his left thigh. RIGHT DUMBBELL HIGH, LEFT "
        "DUMBBELL LOW."),
    3: ("BOTH ARMS ARE HALFWAY THROUGH THE MOVEMENT: both elbows bent to about a right "
        "angle, both forearms at about forty-five degrees, and both dumbbells level with "
        "each other at the height of his waist. The two dumbbells are at the SAME height as "
        "each other."),
    # --- the SIMULTANEOUS set. Poses 1 and 2 are single-arm and are wrong for a
    # two-arm curl; these two are its endpoints, with pose 3 as the midpoint.
    "bottom": (
        "HE IS AT THE VERY BOTTOM OF A TWO-ARM DUMBBELL CURL: BOTH arms hang straight "
        "down and fully extended by his sides, both elbows completely straight, and BOTH "
        "dumbbells are low at his thighs, level with each other. BOTH DUMBBELLS LOW."),
    "top": (
        "HE IS AT THE VERY TOP OF A TWO-ARM DUMBBELL CURL: BOTH arms are fully curled up "
        "together, both elbows bent tight, and BOTH dumbbells are raised to his shoulders, "
        "level with each other, close to his chin. BOTH DUMBBELLS HIGH."),
}

TEMPLATE = """A photorealistic still frame from a fitness commercial, with NO WRITING IN IT: no captions, no titles, no logos, no letters and no numerals anywhere in the image.

{persona}, stands in a dark, moody weights gym: matte black rubber floor, racks and benches behind him, lit low and warm. FULL-LENGTH SHOT, HEAD TO TOE, on a 35mm lens at chest height about four metres away — his trainers just above the bottom edge of the frame and a small gap of room above his head. He stands CENTRED in the frame, the same distance from the left edge as from the right. HE FACES THE CAMERA SQUARELY: chest, both shoulders and face turned straight toward the lens, not angled, not in profile. He stands on the spot with his feet about shoulder-width apart.

He holds a plain matte-black dumbbell in his left hand and a plain matte-black dumbbell in his right hand, palms facing up, elbows in at his sides. {arms}

He wears a plain black tank top, matte-black training shorts with a thin electric-teal stripe down the outer seam of each leg, plain black trainers, and a matte-black fabric headband worn across his forehead with a thin electric-teal stripe along its lower edge and a small flush lens at the front centre with a tiny teal light beside it. The headband carries NO lettering and NO other marking of any kind. The two dumbbells are a matched pair, plain, smooth and completely unmarked — no numbers, no letters, no logos on them.

His mouth is slightly open, mid-sentence, talking to camera, with his eyes on the lens. He is alone in the frame. Warm key light reaches his face and his forehead so the headband is lit and sharp. Evenly exposed, not crushed dark. Sharp focus throughout, no motion blur.
"""


# --- K8: the same idea for a side-on barbell squat -------------------------------
# K7 cost eight takes partly because the reference stills arrived seventh. K8 gets
# them first. Nothing here is mirror-safe and nothing needs to be: a squat has no
# left/right configuration for the model to get wrong, which is the whole reason
# the movement was chosen.

K8_OUT = Path("input/kickstarter/k8")

K8_POSES = {
    "top": (
        "HE IS STANDING TALL AT THE TOP OF THE SQUAT: legs straight, hips and knees "
        "fully extended, the barbell high on his shoulders, his body at its full height."),
    "bottom": (
        "HE IS AT THE VERY BOTTOM OF THE SQUAT: knees bent deep, hips sunk down and "
        "back, his THIGHS LEVEL WITH THE FLOOR, the barbell carried low with him, his "
        "back straight and his chest up."),
}

K8_TEMPLATE = """A photorealistic still frame from a fitness commercial, with NO WRITING IN IT: no captions, no titles, no logos, no letters and no numerals anywhere in the image.

{persona}, is doing a BARBELL BACK SQUAT in a dark, moody weights gym: matte black rubber floor, racks and benches behind him, lit low and warm. HE IS SEEN FROM THE SIDE, IN PROFILE: he faces frame-LEFT, so the camera sees him from HIS RIGHT-HAND SIDE, his right shoulder and the right side of his head toward the lens. He looks straight ahead in the direction he is facing, NOT at the camera. The barbell rests across his upper back and shoulders and he grips it with both hands; because he is side-on, the bar points toward the camera and away from it, so only its near end and near plate are seen edge-on and the bar does NOT stretch across the picture.

{pose}

FULL-LENGTH SHOT, HEAD TO TOE, on a 35mm lens at chest height about four metres away — his trainers just above the bottom edge of the frame and a small gap of room above his head. He stands CENTRED in the frame, on clear floor well away from any rack.

The barbell is one plain matte-black bar with a plain matte-black disc at each end, completely unmarked — no numbers, no letters and no logos on it. He wears a plain black tank top, matte-black training shorts with a thin electric-teal stripe down the outer seam of each leg, plain black trainers, and a matte-black fabric headband worn across his forehead with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on its RIGHT side — the side facing the camera. The headband carries NO lettering of any kind.

His mouth is slightly open, mid-sentence. He is alone in the frame. Warm key light reaches his face and his forehead so the headband is lit and sharp. Evenly exposed, not crushed dark. Sharp focus throughout, no motion blur.
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for n, arms in ARMS.items():
        p = OUT / f"ref_prompt_{n}.txt"  # 1/2/3 = alternating set; bottom/top = simultaneous
        p.write_text(TEMPLATE.format(persona=PERSONA, arms=arms))
        print(f"wrote {p}  ({len(p.read_text().split())} words)")

    # The three must differ only in the arm clause. Prove it rather than trust it.
    texts = [(OUT / f"ref_prompt_{n}.txt").read_text() for n in ARMS]
    shared = [t.replace(a, "<ARMS>") for t, a in zip(texts, ARMS.values())]
    print("K7 stills identical apart from the arm clause:", len(set(shared)) == 1)

    K8_OUT.mkdir(parents=True, exist_ok=True)
    for name, pose in K8_POSES.items():
        p = K8_OUT / f"ref_prompt_{name}.txt"
        p.write_text(K8_TEMPLATE.format(persona=PERSONA, pose=pose))
        print(f"wrote {p}  ({len(p.read_text().split())} words)")
    k8 = [(K8_OUT / f"ref_prompt_{n}.txt").read_text() for n in K8_POSES]
    k8_shared = [t.replace(p, "<POSE>") for t, p in zip(k8, K8_POSES.values())]
    print("K8 stills identical apart from the pose clause:", len(set(k8_shared)) == 1)


if __name__ == "__main__":
    main()
