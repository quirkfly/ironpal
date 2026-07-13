#!/usr/bin/env python3
"""Weight-reading accuracy harness for the IronPal video-analysis KB.

Joins predictions.json against ground_truth.json and reports accuracy WITHOUT a
human in the loop. The metric the founder cares about is CONFIDENT-WRONG: a
committed (non-abstained), high-confidence number that is actually wrong. The
whole abstain-first redesign exists to drive that number to ZERO -- so any
confident-wrong case makes this script exit non-zero (CI-gate friendly).

Scoring (per cases/INDEX.md): a prediction is CORRECT if the unit matches and
|predicted - actual| <= tolerance_kg for that rig (painted pin stacks: tol 0 =
exact; cast plates: one increment). Abstentions are NOT wrong -- they are the
correct output when the self-consistency gate fails; they cost COVERAGE, not
accuracy.

Usage:
    python3 scripts/kb/score_weights.py
    python3 scripts/kb/score_weights.py --gt <path> --pred <path> --min-confidence 0.7

Exit code 0 = clean (no confident-wrong). Exit code 1 = at least one
confident-wrong prediction (a regression that must be fixed).
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KB = os.path.normpath(os.path.join(HERE, "..", "..", "docs", "video-analysis-kb"))


def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--gt", default=os.path.join(KB, "ground_truth.json"))
    ap.add_argument("--pred", default=os.path.join(KB, "predictions.json"))
    ap.add_argument("--min-confidence", type=float, default=0.7,
                    help="confidence at/above which a WRONG committed read counts "
                         "as CONFIDENT-WRONG (the critical failure). Default 0.7.")
    args = ap.parse_args()

    gt = {c["id"]: c for c in load(args.gt)["cases"]}
    preds = {p["id"]: p for p in load(args.pred)["predictions"]}

    scorable = [c for c in gt.values() if c.get("scorable")]
    correct = wrong = abstained = confident_wrong = missing = 0
    rows = []

    for c in sorted(scorable, key=lambda x: x["id"]):
        cid, actual, tol, unit = c["id"], c["actual_kg"], c["tolerance_kg"], c["unit"]
        p = preds.get(cid)
        if p is None:
            missing += 1
            rows.append((cid, "NO-PRED", f"actual {actual}{unit}", "-", "no prediction in predictions.json"))
            continue

        if p.get("abstained") or p.get("predicted_kg") is None:
            abstained += 1
            rows.append((cid, "ABSTAIN", f"actual {actual}{unit}",
                         f"conf {p.get('confidence','?')}", "flagged for 1-tap confirm (not counted wrong)"))
            continue

        pv, pu, conf = p["predicted_kg"], p.get("unit", unit), float(p.get("confidence", 0.0))
        err = abs(pv - actual)
        ok = (pu == unit) and (err <= tol)
        if ok:
            correct += 1
            rows.append((cid, "CORRECT", f"{pv}{pu} vs {actual}{unit}",
                         f"conf {conf}", f"err {err:g} (tol {tol:g})"))
        else:
            wrong += 1
            tag = "WRONG"
            note = f"err {err:g} > tol {tol:g}" + ("" if pu == unit else f"; unit {pu}!={unit}")
            if conf >= args.min_confidence:
                confident_wrong += 1
                tag = "CONFIDENT-WRONG"
                note += "  <-- CRITICAL: committed a confident wrong number"
            rows.append((cid, tag, f"{pv}{pu} vs {actual}{unit}", f"conf {conf}", note))

    # --- report ---
    w = max((len(r[1]) for r in rows), default=8)
    print("\nWeight-reading accuracy harness")
    print("=" * 72)
    for cid, tag, vals, conf, note in rows:
        print(f"  {cid:>4}  {tag:<{w}}  {vals:<22} {conf:<10} {note}")
    print("=" * 72)

    committed = correct + wrong
    n = len(scorable)
    acc = (correct / committed * 100) if committed else float("nan")
    cov = (committed / n * 100) if n else float("nan")
    print(f"  scorable cases : {n}")
    print(f"  correct        : {correct}")
    print(f"  wrong          : {wrong}")
    print(f"  abstained      : {abstained}   (correct behaviour when unsure)")
    if missing:
        print(f"  missing pred   : {missing}")
    print(f"  CONFIDENT-WRONG: {confident_wrong}   (target = 0)")
    print(f"  accuracy (on committed reads) : {acc:.0f}%  [{correct}/{committed}]")
    print(f"  coverage (committed / scorable): {cov:.0f}%  [{committed}/{n}]")
    print()

    if confident_wrong:
        print(f"FAIL: {confident_wrong} confident-wrong prediction(s). "
              "Abstain instead of guessing -- fix before shipping.")
        return 1
    print("OK: no confident-wrong predictions. "
          "(Raise coverage by resolving abstentions via self-consistency, not by guessing.)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
