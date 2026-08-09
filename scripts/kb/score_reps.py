#!/usr/bin/env python3
"""Rep-counting accuracy harness for the IronPal video-analysis KB.

Sibling of score_weights.py, same four-state semantics, same CI gate: any
CONFIDENT-WRONG rep count exits non-zero.

Reps differ from weight in one important way. The rep-counting skill reports a
RANGE ("~N, range a-b"), not an integer, because egocentric vision genuinely
cannot certify an integer. So a prediction can fail in two distinct ways, and
conflating them would be wrong:

  WRONG      the range does NOT contain the true count -- an actual false claim
  IMPRECISE  the range contains it but is too wide to be useful ("6-12")

IMPRECISE is deliberately NOT counted as wrong. Asserting "6-12" when the truth
is 8 is not a falsehood, it is a soft abstention -- so it costs COVERAGE, not
accuracy, exactly like an explicit abstain. Only a range that excludes the truth
is wrong, and only a confident wrong one fails the build.

Scoring (docs/ironpal-essential-exercise-video-capture-plan_grilled.md Q4):

  rep_signal != 'imu'   CORRECT if true count is inside [lo,hi] AND (hi-lo) <= 2
  rep_signal == 'imu'   CORRECT only on an EXACT integer match -- the IMU is
                        supposed to deliver the count, so a range means the IMU
                        path did not do its job

Usage:
    python3 scripts/kb/score_reps.py
    python3 scripts/kb/score_reps.py --max-range-width 2 --min-confidence 0.7
    python3 scripts/kb/score_reps.py --self-test

Exit code 0 = clean (no confident-wrong). Exit code 1 = at least one
confident-wrong prediction.
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KB = os.path.normpath(os.path.join(HERE, "..", "..", "docs", "video-analysis-kb"))

CORRECT, WRONG, IMPRECISE, ABSTAIN = "CORRECT", "WRONG", "IMPRECISE", "ABSTAIN"


def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def classify(pred, actual, rep_signal, max_width):
    """-> (state, lo, hi, note). Pure, so the self-test can exercise it."""
    if pred is None:
        return None, None, None, "no prediction"

    if pred.get("reps_abstained") or (
            pred.get("predicted_reps") is None and pred.get("reps_range") is None):
        return ABSTAIN, None, None, "abstained (not counted wrong)"

    rng = pred.get("reps_range")
    if rng:
        lo, hi = int(rng[0]), int(rng[1])
    else:
        lo = hi = int(pred["predicted_reps"])
    width = hi - lo

    if not (lo <= actual <= hi):
        return WRONG, lo, hi, f"range [{lo},{hi}] excludes actual {actual}"

    if rep_signal == "imu":
        point = pred.get("predicted_reps")
        if width == 0 and point == actual:
            return CORRECT, lo, hi, "exact (imu bar)"
        return IMPRECISE, lo, hi, (
            f"imu exercise needs an EXACT integer; got "
            f"{'range' if width else 'point'} [{lo},{hi}]")

    if width <= max_width:
        return CORRECT, lo, hi, f"contains {actual}, width {width} <= {max_width}"
    return IMPRECISE, lo, hi, f"contains {actual} but width {width} > {max_width} — too wide to use"


def self_test():
    """Verify the classifier on hand-checked cases, including the imu bar."""
    print("self-test: rep classification")
    cases = [
        # (pred,                                   actual, signal,  expect)
        ({"predicted_reps": 8},                        8, "vision", CORRECT),
        ({"predicted_reps": 8},                        9, "vision", WRONG),
        ({"predicted_reps": 8, "reps_range": [7, 9]},  9, "vision", CORRECT),
        ({"predicted_reps": 9, "reps_range": [6, 12]}, 8, "vision", IMPRECISE),
        ({"predicted_reps": 9, "reps_range": [6, 12]}, 4, "vision", WRONG),
        ({"reps_abstained": True},                     5, "hard",   ABSTAIN),
        ({"predicted_reps": 10},                      10, "imu",    CORRECT),
        ({"predicted_reps": 10, "reps_range": [9, 11]}, 10, "imu",  IMPRECISE),
        ({"predicted_reps": 10},                      11, "imu",    WRONG),
    ]
    ok = True
    for pred, actual, sig, expect in cases:
        got, lo, hi, note = classify(pred, actual, sig, 2)
        good = got == expect
        ok &= good
        print(f"  {str(pred)[:40]:42} actual={actual:<3} {sig:7} -> "
              f"{got:<9} {'PASS' if good else 'FAIL (want ' + expect + ')'}")
    print("self-test:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--gt", default=os.path.join(KB, "ground_truth.json"))
    ap.add_argument("--pred", default=os.path.join(KB, "predictions.json"))
    ap.add_argument("--min-confidence", type=float, default=0.7,
                    help="confidence at/above which a WRONG count counts as "
                         "CONFIDENT-WRONG. Default 0.7.")
    ap.add_argument("--max-range-width", type=int, default=2,
                    help="widest usable range, hi-lo. Default 2 (i.e. +/-1).")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    gt = load(args.gt)["cases"]
    preds = {p["id"]: p for p in load(args.pred)["predictions"]}

    # Reps have their own scorable flag: a clip can have a readable weight but
    # an unusable rep window, or vice versa.
    scorable = [c for c in gt if c.get("scorable_reps")]
    if not scorable:
        print("No cases with `scorable_reps: true` in ground_truth.json — nothing to score.")
        return 0

    tally = {CORRECT: 0, WRONG: 0, IMPRECISE: 0, ABSTAIN: 0}
    confident_wrong = missing = 0
    rows = []

    for c in sorted(scorable, key=lambda x: x["id"]):
        cid, actual = c["id"], c["actual_reps"]
        sig = c.get("rep_signal", "vision")
        p = preds.get(cid)
        state, lo, hi, note = classify(p, actual, sig, args.max_range_width)

        if state is None:
            missing += 1
            rows.append((cid, "NO-PRED", f"actual {actual}", "-", sig, note))
            continue

        conf = float((p or {}).get("reps_confidence", 0.0))
        tag = state
        if state == WRONG and conf >= args.min_confidence:
            confident_wrong += 1
            tag = "CONFIDENT-WRONG"
            note += "  <-- CRITICAL: committed a confident wrong count"
        tally[state] += 1

        shown = "abstained" if state == ABSTAIN else f"[{lo},{hi}] vs {actual}"
        rows.append((cid, tag, shown, f"conf {conf}", sig, note))

    w = max((len(r[1]) for r in rows), default=8)
    print("\nRep-counting accuracy harness")
    print("=" * 96)
    for cid, tag, vals, conf, sig, note in rows:
        print(f"  {cid:>4}  {tag:<{w}}  {vals:<20} {conf:<10} {sig:<7} {note}")
    print("=" * 96)

    # Committed = claims that could be right or wrong. IMPRECISE and ABSTAIN are
    # both "declined to commit" and so cost coverage, not accuracy.
    committed = tally[CORRECT] + tally[WRONG]
    n = len(scorable)
    acc = (tally[CORRECT] / committed * 100) if committed else float("nan")
    cov = (committed / n * 100) if n else float("nan")
    print(f"  scorable cases : {n}")
    print(f"  correct        : {tally[CORRECT]}")
    print(f"  wrong          : {tally[WRONG]}")
    print(f"  imprecise      : {tally[IMPRECISE]}   (contained the answer but too wide — costs coverage)")
    print(f"  abstained      : {tally[ABSTAIN]}   (correct behaviour when unsure)")
    if missing:
        print(f"  missing pred   : {missing}")
    print(f"  CONFIDENT-WRONG: {confident_wrong}   (target = 0)")
    print(f"  accuracy (on committed counts)  : {acc:.0f}%  [{tally[CORRECT]}/{committed}]")
    print(f"  coverage (committed / scorable) : {cov:.0f}%  [{committed}/{n}]")
    print()

    if confident_wrong:
        print(f"FAIL: {confident_wrong} confident-wrong count(s). "
              "Widen the range or abstain -- do not commit a number you cannot defend.")
        return 1
    print("OK: no confident-wrong counts. "
          "(Raise coverage by tightening ranges with better evidence, not by guessing.)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
