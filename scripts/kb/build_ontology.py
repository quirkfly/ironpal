#!/usr/bin/env python3
"""Build the IronPal exercise ontology for the supervised-learning phase.

Every label produced during gym data collection must resolve to exactly one
entry here -- that is what keeps labels consistent across sessions, labelers and
prompt revisions (docs/ironpal-supervised-learning-phase-plan.md Sec 1.1).

LICENSING (why the sources are what they are):
  * free-exercise-db (github.com/yuhonas/free-exercise-db) is released under the
    Unlicense -- public domain. It is the ONLY source copied into the output, so
    ontology.json carries no downstream obligation and is safe in a commercial
    product.
  * wger (wger.de/api/v2) is excellent but its exercise data is CC-BY-SA 4.0,
    which is COPYLEFT: merging it would make this ontology a derivative work
    that must itself be shared alike. We therefore read wger only as a COVERAGE
    CROSS-CHECK -- to find gaps worth authoring ourselves -- and copy nothing.
    That check is reported, never emitted into the ontology.
  * Fitbod (or any competitor app) is deliberately NOT a source: bulk extraction
    of a competitor's curated catalogue implicates their ToS and EU database
    rights (Directive 96/9/EC). Exercise names are facts; the compilation is not.

The fields that matter most to IronPal do not exist in ANY public dataset,
because no one else is doing egocentric recognition -- head_motion_class,
egocentric_visibility and rep_signal decide whether the headband IMU or the
camera can carry the rep clock at all (docs/video-analysis-kb/sensor-fusion.md).
Those are hand-authored for Tier 1 (TIER1 below, grounded in the case ledger)
and only heuristically guessed for Tier 2, where every record is flagged
needs_review=true. Never train on an inferred field without confirming it.

Usage:
    python3 scripts/kb/build_ontology.py --cache <dir>          # offline, from cache
    python3 scripts/kb/build_ontology.py --cache <dir> --fetch  # download sources first
    python3 scripts/kb/build_ontology.py --out docs/video-analysis-kb/ontology.json
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.request

FED_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
WGER_API = "https://wger.de/api/v2/"
UA = "IronPal-ontology-build/1.0 (github.com/quirkfly/ironpal)"

# --- IronPal-specific vocabularies -----------------------------------------
# equipment_class drives weight_read_strategy, which maps 1:1 onto the read
# procedures already proven in docs/video-analysis-kb/weight-reading.md.
WEIGHT_STRATEGY = {
    "barbell":    "plate_faces_plus_bar",       # sum plate denominations + bar mass
    "dumbbell":   "cast_number_or_plate_sum",   # fixed: read cast number; loadable: sum plates + confirmed handle
    "kettlebell": "cast_number",
    "cable":      "pin_stack_count_empty_holes",
    "machine":    "pin_stack_or_plate_loaded",  # ambiguous per machine -- confirm at enrollment
    "bodyweight": "not_applicable",
    "band":       "unsupported",                # band tension is not readable from video
    "other":      "unsupported",
}

EQUIPMENT_MAP = {
    "barbell": "barbell", "e-z curl bar": "barbell",
    "dumbbell": "dumbbell", "kettlebells": "kettlebell",
    "cable": "cable", "machine": "machine",
    "body only": "bodyweight", "bands": "band",
    "exercise ball": "other", "foam roll": "other",
    "medicine ball": "other", "other": "other", "none": "other",
}

# Categories that are not resistance sets with countable reps and a readable load.
OUT_OF_SCOPE_CATEGORIES = {"stretching", "cardio"}

# --- Tier 1: hand-authored, grounded in the case ledger ---------------------
# rep_signal: which sensor can actually certify a rep.
#   imu    -> head/torso translates vertically; the headband IMU is the clock
#   vision -> head still but the implement enters frame; vision must arbitrate
#   fusion -> both contribute; neither alone is reliable
#   hard   -> NEITHER is reliable on its own (axial stroke + head still);
#             needs a wrist IMU or machine telemetry. Case 003 is the proof.
# egocentric_visibility: what the headband camera can actually see.
#   visible | partial | occluded | floor_reference | not_applicable
TIER1 = [
    # --- barbell ---
    dict(slug="barbell-back-squat", name="Barbell Back Squat", equipment="barbell",
         syn=["back squat", "squat", "barbell squat"],
         head="moving", plane="sagittal", vis="occluded", rep="imu",
         note="Bar sits behind the neck, outside the FOV -- depth is read from floor distance, not the bar."),
    dict(slug="barbell-front-squat", name="Barbell Front Squat", equipment="barbell",
         syn=["front squat"], head="moving", plane="sagittal", vis="partial", rep="imu"),
    dict(slug="barbell-deadlift", name="Barbell Deadlift", equipment="barbell",
         syn=["deadlift", "conventional deadlift"],
         head="moving", plane="sagittal", vis="visible", rep="imu",
         note="Bar travels floor->hip inside the FOV; case 002 confirmed the trajectory is the discriminator."),
    dict(slug="romanian-deadlift", name="Romanian Deadlift", equipment="barbell",
         syn=["rdl", "stiff leg deadlift"], head="moving", plane="sagittal", vis="visible", rep="imu"),
    dict(slug="barbell-bench-press", name="Barbell Bench Press", equipment="barbell",
         syn=["bench press", "flat bench press"],
         head="still", plane="sagittal", vis="visible", rep="vision",
         note="Supine with the head fixed on the bench -- the head IMU sees almost nothing."),
    dict(slug="incline-barbell-bench-press", name="Incline Barbell Bench Press", equipment="barbell",
         syn=["incline bench press"], head="still", plane="sagittal", vis="visible", rep="vision"),
    dict(slug="barbell-overhead-press", name="Barbell Overhead Press", equipment="barbell",
         syn=["overhead press", "military press", "ohp", "standing press"],
         head="moving", plane="sagittal", vis="visible", rep="fusion",
         note="Bar passes the face and the torso extends -- both channels carry partial signal."),
    dict(slug="barbell-bent-over-row", name="Barbell Bent-Over Row", equipment="barbell",
         syn=["barbell row", "bent over row", "pendlay row"],
         head="still", plane="sagittal", vis="visible", rep="vision",
         note="Torso is held static in the hinge, so head motion is near zero despite a large bar excursion."),
    dict(slug="barbell-curl", name="Barbell Curl", equipment="barbell",
         syn=["barbell biceps curl", "ez bar curl"],
         head="still", plane="sagittal", vis="visible", rep="vision",
         note="Case 002 ground truth. Supinated grip is what separates this from an upright row."),
    dict(slug="barbell-hip-thrust", name="Barbell Hip Thrust", equipment="barbell",
         syn=["hip thrust"], head="moving", plane="sagittal", vis="partial", rep="fusion"),
    # --- dumbbell ---
    dict(slug="dumbbell-biceps-curl", name="Dumbbell Biceps Curl", equipment="dumbbell",
         syn=["dumbbell curl", "db curl", "alternating dumbbell curl"],
         head="still", plane="sagittal", vis="visible", rep="vision",
         note="Cases 001 and 007. Alternating vs simultaneous halves/doubles the looming count -- record which."),
    dict(slug="dumbbell-shoulder-press", name="Dumbbell Shoulder Press", equipment="dumbbell",
         syn=["dumbbell overhead press", "seated dumbbell press"],
         head="still", plane="sagittal", vis="visible", rep="vision"),
    dict(slug="dumbbell-lateral-raise", fed="Side Lateral Raise", name="Dumbbell Lateral Raise", equipment="dumbbell",
         syn=["lateral raise", "side raise", "dumbbell side lateral"],
         head="still", plane="frontal", vis="visible", rep="vision",
         note="Implement stays small and at arm's length -- the proximity cue that separates raises from curls."),
    dict(slug="dumbbell-front-raise", name="Dumbbell Front Raise", equipment="dumbbell",
         syn=["front raise"], head="still", plane="sagittal", vis="visible", rep="vision"),
    dict(slug="dumbbell-bench-press", name="Dumbbell Bench Press", equipment="dumbbell",
         syn=["db bench press"], head="still", plane="sagittal", vis="visible", rep="vision"),
    dict(slug="dumbbell-row", fed="One-Arm Dumbbell Row", name="Single-Arm Dumbbell Row", equipment="dumbbell",
         syn=["dumbbell row", "one arm row"], head="still", plane="sagittal", vis="visible", rep="vision"),
    dict(slug="dumbbell-fly", name="Dumbbell Fly", equipment="dumbbell",
         syn=["dumbbell flye", "chest fly", "shoulder flyes", "pec fly"],
         head="still", plane="transverse", vis="visible", rep="vision"),
    dict(slug="dumbbell-pullover", name="Dumbbell Pullover", equipment="dumbbell",
         syn=["triceps pullover", "dumbbell triceps pullover"],
         head="still", plane="sagittal", vis="visible", rep="vision",
         note="Implement arcs directly over the face -- unusually clean egocentric visibility."),
    dict(slug="bulgarian-split-squat", prim=["quadriceps"], sec=["glutes", "hamstrings"], name="Bulgarian Split Squat", equipment="dumbbell",
         syn=["rear foot elevated split squat", "rfess"],
         head="moving", plane="sagittal", vis="partial", rep="imu",
         note="POC v1 target exercise (docs/ironpal-poc-v1.md)."),
    dict(slug="walking-lunge", name="Walking Lunge", equipment="dumbbell",
         syn=["lunge", "dumbbell lunge"], head="moving", plane="sagittal", vis="partial", rep="imu"),
    dict(slug="goblet-squat", name="Goblet Squat", equipment="dumbbell",
         syn=["kettlebell goblet squat"], head="moving", plane="sagittal", vis="visible", rep="imu"),
    # --- cable ---
    dict(slug="triceps-cable-pushdown", name="Triceps Cable Pushdown", equipment="cable",
         syn=["cable pushdown", "tricep pushdown", "rope pushdown"],
         head="still", plane="sagittal", vis="visible", rep="hard",
         note="Case 003: head still AND the stroke is axial/short -- vision counted 0 of 5 real reps. "
              "Trace the cable to the stack; a straight-bar attachment looks exactly like a barbell."),
    dict(slug="seated-cable-row", fed="Seated Cable Rows", name="Seated Cable Row", equipment="cable",
         syn=["cable row", "low row"], head="still", plane="transverse", vis="visible", rep="vision"),
    dict(slug="lat-pulldown", name="Lat Pulldown", equipment="cable",
         syn=["pulldown", "wide grip pulldown"],
         head="still", plane="frontal", vis="visible", rep="vision",
         note="Bar descends past the face, giving a large and reliable looming cycle."),
    dict(slug="cable-biceps-curl", name="Cable Biceps Curl", equipment="cable",
         syn=["cable curl"], head="still", plane="sagittal", vis="visible", rep="vision"),
    dict(slug="cable-lateral-raise", name="Cable Lateral Raise", equipment="cable",
         syn=["cable side raise"], head="still", plane="frontal", vis="visible", rep="vision"),
    # --- machine ---
    dict(slug="leg-press", name="Leg Press", equipment="machine",
         syn=["45 degree leg press", "sled press"], head="still", plane="sagittal", vis="partial", rep="vision"),
    dict(slug="leg-extension", name="Leg Extension", equipment="machine",
         syn=["knee extension", "quad extension"], head="still", plane="sagittal", vis="partial", rep="vision"),
    dict(slug="seated-leg-curl", name="Seated Leg Curl", equipment="machine",
         syn=["leg curl", "hamstring curl"],
         head="still", plane="sagittal", vis="occluded", rep="hard",
         note="Legs move below and behind the FOV; expect the same failure mode as case 003."),
    dict(slug="standing-calf-raise-machine", name="Standing Calf Raise (Machine)", equipment="machine",
         syn=["calf raise", "machine calf raise"],
         head="moving", plane="sagittal", vis="occluded", rep="imu",
         note="Whole body translates vertically -- small amplitude but clean IMU periodicity."),
    dict(slug="hack-squat-machine", name="Hack Squat (Machine)", equipment="machine",
         syn=["hack squat", "hackenschmidt", "hackenschmidt machine"],
         head="moving", plane="sagittal", vis="occluded", rep="imu"),
    dict(slug="chest-press-machine", prim=["chest"], sec=["triceps", "shoulders"], name="Chest Press (Machine)", equipment="machine",
         syn=["machine chest press", "seated chest press"],
         head="still", plane="sagittal", vis="visible", rep="vision"),
    dict(slug="shoulder-press-machine", name="Shoulder Press (Machine)", equipment="machine",
         syn=["machine shoulder press"], head="still", plane="sagittal", vis="visible", rep="vision"),
    # --- bodyweight ---
    dict(slug="pull-up", fed="Pullups", name="Pull-Up", equipment="bodyweight",
         syn=["pullup", "pull ups"], head="moving", plane="frontal", vis="visible", rep="imu"),
    dict(slug="chin-up", name="Chin-Up", equipment="bodyweight",
         syn=["chinup"], head="moving", plane="sagittal", vis="visible", rep="imu"),
    dict(slug="dip", name="Dip", equipment="bodyweight",
         syn=["triceps dip", "parallel bar dip"], head="moving", plane="sagittal", vis="partial", rep="imu"),
    dict(slug="push-up", fed="Pushups", name="Push-Up", equipment="bodyweight",
         syn=["pushup", "press up"], head="moving", plane="sagittal", vis="floor_reference", rep="imu",
         note="No implement -- reps are read from the floor rising and falling."),
]


def norm(s):
    """Normalize a name for matching: lowercase, strip punctuation, collapse space."""
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", (s or "").lower())).strip()


# Tokens that carry no discriminating power when joining names.
STOPWORDS = {"the", "a", "with", "and", "of", "on", "in", "to", "grip", "medium", "standing"}


def best_match(queries, index, pin=None):
    """Join a Tier-1 name to a free-exercise-db record.

    `pin` is an exact source name that overrides the fuzzy match. Needed because
    token-superset matching produced two joins that were confidently wrong:
    "Seated Cable Row" -> "upright cable row" (traps, not middle back) and
    "Pull-Up" -> "scapular pull up" (traps, not lats). Both are supersets of our
    tokens but different movements, so the borrowed muscle data was wrong. When
    a fuzzy join is wrong, pin it rather than widening the heuristic.

    Exact match first; otherwise the source record whose name is a TOKEN SUPERSET
    of one of our names, preferring the fewest extra tokens. free-exercise-db
    qualifies almost everything ("Barbell Bench Press - Medium Grip"), so exact
    matching alone found only 13 of 37 Tier-1 entries and silently dropped the
    public-domain muscle metadata for the rest.

    Only muscles/mechanic/force are borrowed from the match -- never an IronPal
    field -- so a slightly over-qualified variant is still a safe join. The
    matched name is recorded on the entry as source_match so a wrong join is
    visible on inspection rather than buried.
    """
    if pin and norm(pin) in index:
        return index[norm(pin)], norm(pin)
    for q in queries:
        if norm(q) in index:
            return index[norm(q)], norm(q)
    best, best_extra = None, None
    for q in queries:
        qt = {t for t in norm(q).split() if t not in STOPWORDS}
        if len(qt) < 2:                      # 1-token queries match far too much
            continue
        for name, rec in index.items():
            nt = {t for t in name.split() if t not in STOPWORDS}
            if qt <= nt:                     # source name contains all our tokens
                extra = len(nt - qt)
                if best_extra is None or extra < best_extra:
                    best, best_extra = (rec, name), extra
    return best if best else (None, None)


def fetch_sources(cache):
    """Download both sources into the cache. wger is fetched for the coverage
    cross-check only -- see the licensing note in the module docstring."""
    os.makedirs(cache, exist_ok=True)

    def get(url):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)

    json.dump(get(FED_URL), open(os.path.join(cache, "free-exercise-db.json"), "w"))
    out, url = [], WGER_API + "exerciseinfo/?format=json&limit=200"
    while url:
        d = get(url)
        out.extend(d["results"])
        url = d.get("next")
        if url:
            time.sleep(0.4)  # be polite to a free community API
    json.dump(out, open(os.path.join(cache, "wger_exerciseinfo.json"), "w"))


def infer_tier2(rec, equipment):
    """Heuristics for Tier 2. Deliberately coarse -- every result is flagged
    needs_review, because guessing the rep_signal wrong is worse than a gap."""
    n = norm(rec.get("name"))
    whole_body = any(k in n for k in (
        "squat", "lunge", "deadlift", "clean", "snatch", "jerk", "jump", "pull up",
        "pullup", "chin up", "dip", "push up", "pushup", "step up", "burpee",
        "calf raise", "thrust", "carry", "sled",
    ))
    head = "moving" if whole_body else "still"
    if equipment == "bodyweight":
        vis = "floor_reference" if not whole_body else "partial"
    elif head == "moving":
        vis = "partial"
    else:
        vis = "visible"
    rep = "imu" if head == "moving" else "vision"
    plane = "frontal" if any(k in n for k in ("lateral", "fly", "flye", "pulldown")) else "sagittal"
    return head, plane, vis, rep


def build(cache):
    fed = json.load(open(os.path.join(cache, "free-exercise-db.json")))

    # Index the public-domain source by normalized name and by Tier-1 synonym.
    by_name = {}
    for r in fed:
        by_name.setdefault(norm(r.get("name")), r)

    entries, claimed = [], set()

    for t in TIER1:
        # Attach public-domain muscle/mechanic metadata where a source record matches.
        match, matched_name = best_match([t["name"]] + t["syn"], by_name, pin=t.get("fed"))
        if match:
            claimed.add(norm(match.get("name")))
        entries.append(dict(
            id=t["slug"], canonical_name=t["name"], synonyms=sorted(set(t["syn"])),
            tier=1,
            equipment_class=t["equipment"],
            weight_read_strategy=WEIGHT_STRATEGY[t["equipment"]],
            head_motion_class=t["head"], motion_plane=t["plane"],
            egocentric_visibility=t["vis"], rep_signal=t["rep"],
            mechanic=(match or {}).get("mechanic"),
            force=(match or {}).get("force"),
            primary_muscles=(match or {}).get("primaryMuscles", []) or t.get("prim", []),
            secondary_muscles=(match or {}).get("secondaryMuscles", []) or t.get("sec", []),
            notes=t.get("note"),
            ironpal_fields_authored=True, needs_review=False,
            source_match=matched_name,   # which free-exercise-db name was joined; audit this
            sources=(["free-exercise-db"] if match else []) + ["ironpal-authored"],
        ))

    skipped = 0
    for r in fed:
        n = norm(r.get("name"))
        if n in claimed:
            continue
        if (r.get("category") or "").lower() in OUT_OF_SCOPE_CATEGORIES:
            skipped += 1
            continue
        equipment = EQUIPMENT_MAP.get(str(r.get("equipment")).lower(), "other")
        head, plane, vis, rep = infer_tier2(r, equipment)
        entries.append(dict(
            id=re.sub(r"[^a-z0-9]+", "-", n).strip("-"),
            canonical_name=r.get("name"), synonyms=[], tier=2,
            equipment_class=equipment,
            weight_read_strategy=WEIGHT_STRATEGY[equipment],
            head_motion_class=head, motion_plane=plane,
            egocentric_visibility=vis, rep_signal=rep,
            mechanic=r.get("mechanic"), force=r.get("force"),
            primary_muscles=r.get("primaryMuscles", []),
            secondary_muscles=r.get("secondaryMuscles", []),
            notes=None,
            ironpal_fields_authored=False, needs_review=True,
            source_match=n,
            sources=["free-exercise-db"],
        ))
    return entries, skipped


def coverage_check(cache, entries):
    """Estimate how much of wger's English catalogue our ontology already spans.

    READ-ONLY: wger is CC-BY-SA, so nothing here is copied into the ontology --
    we only count, and report a handful of unmatched names as authoring leads.

    Matching is CONTAINMENT, not equality: wger names are heavily modified
    ("Wide Push-Up", "Slow Squat"), so exact matching reported a ~93% gap that
    was almost entirely a naming-convention artifact. A wger name counts as
    spanned if any ontology name/synonym appears inside it, or vice versa.
    Treat the result as a rough authoring lead, not a precise coverage figure.
    """
    path = os.path.join(cache, "wger_exerciseinfo.json")
    if not os.path.exists(path):
        return None
    known = {norm(e["canonical_name"]) for e in entries}
    for e in entries:
        known.update(norm(s) for s in e["synonyms"])
    known = {k for k in known if len(k) > 3}    # drop stubs that match everything

    names = set()
    for r in json.load(open(path)):
        for t in r.get("translations", []):
            if t.get("language") == 2 and t.get("name"):   # 2 = English (verified)
                names.add(norm(t["name"]))

    unmatched = sorted(n for n in names
                       if not any(k in n or n in k for k in known))
    return dict(
        method="substring containment, English names only; rough lead not a precise metric",
        wger_english_names=len(names),
        spanned=len(names) - len(unmatched),
        unmatched=len(unmatched),
        unmatched_sample=unmatched[:15],
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default="input/kb/ontology-sources")
    ap.add_argument("--out", default="docs/video-analysis-kb/ontology.json")
    ap.add_argument("--fetch", action="store_true", help="download sources before building")
    args = ap.parse_args()

    if args.fetch:
        fetch_sources(args.cache)
    if not os.path.exists(os.path.join(args.cache, "free-exercise-db.json")):
        sys.exit(f"no cached sources in {args.cache}; re-run with --fetch")

    entries, skipped = build(args.cache)
    cov = coverage_check(args.cache, entries)

    doc = dict(
        _comment=(
            "IronPal exercise ontology. Every gym-session label must resolve to one id here. "
            "Tier 1 entries have hand-authored IronPal fields (head_motion_class, "
            "egocentric_visibility, rep_signal) grounded in docs/video-analysis-kb/cases/. "
            "Tier 2 entries are heuristically inferred and carry needs_review=true -- confirm "
            "before training on them. Rebuild: python3 scripts/kb/build_ontology.py --fetch"
        ),
        sources=[
            dict(name="free-exercise-db", url="https://github.com/yuhonas/free-exercise-db",
                 license="Unlicense (public domain)", role="exercise names and muscle/mechanic metadata (copied)"),
            dict(name="wger", url="https://wger.de/api/v2/",
                 license="CC-BY-SA 4.0", role="coverage cross-check only -- NOT copied, to keep this "
                                              "ontology free of share-alike obligations"),
            dict(name="ironpal-authored", url=None, license="proprietary",
                 role="head_motion_class, egocentric_visibility, rep_signal, synonyms, tier"),
        ],
        counts=dict(total=len(entries),
                    tier1=sum(1 for e in entries if e["tier"] == 1),
                    tier2=sum(1 for e in entries if e["tier"] == 2),
                    skipped_out_of_scope=skipped),
        coverage_vs_wger=cov,
        exercises=sorted(entries, key=lambda e: (e["tier"], e["id"])),
    )
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
        f.write("\n")

    c = doc["counts"]
    print(f"wrote {args.out}")
    print(f"  tier 1 (authored): {c['tier1']}")
    print(f"  tier 2 (inferred, needs_review): {c['tier2']}")
    print(f"  skipped (stretching/cardio): {c['skipped_out_of_scope']}")
    if cov:
        print(f"  wger cross-check: {cov['spanned']}/{cov['wger_english_names']} English names spanned, "
              f"{cov['unmatched']} unmatched (authoring leads)")
    rep = {}
    for e in entries:
        rep[e["rep_signal"]] = rep.get(e["rep_signal"], 0) + 1
    print(f"  rep_signal split: {rep}")


if __name__ == "__main__":
    main()
