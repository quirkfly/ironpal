import {useCallback, useState} from 'react';
import {propose, type Proposals} from '../model/decide';
import {commit, type CommitOutcome} from '../model/learner';
import {campaignOf, repSignalOf} from '../model/packageManager';
import * as store from '../model/store';
import type {ComposedParams} from '../model/params';
import type {ConfirmedSet, ModelPackage, SetResult} from '../types/model';

// Debrief controller (design §2.2–§2.3): proposals with explanations → the user's four answers
// → quality gates → learner.commit. Deferrable; never blocks the next set.

export interface DebriefAnswers {
  exerciseId: string;
  repsConfirmed: number | null;
  weight: number | null;
  weightUnit: string;
  weightState: 'confirmed' | 'unreadable' | 'unsure';
  /** Confirmed rep tops in seconds from the window start; defaults to the detected ones. */
  repTopsSec?: number[];
}

export interface DebriefContext {
  pkg: ModelPackage;
  params: ComposedParams;
  sessionId: string;
  gymId: string | null;
  rotation: number[][] | null;
  calibrated: boolean;
}

/** Quality gates (feature PRD §7.5). Missing evidence fails the gate; it never guesses. */
export function evaluateGates(result: SetResult, answers: DebriefAnswers, repSignal: string, calibrated: boolean): Record<string, boolean> {
  const motion = result.repsDetected >= 3 && (result.periodicity ?? 0) >= 0.25;
  const link = result.seqGaps === 0 && result.saturated === 0;
  const repAgreement =
    repSignal === 'imu' || repSignal === 'fusion'
      ? answers.repsConfirmed != null && Math.abs(answers.repsConfirmed - result.repsDetected) <= 1
      : true;
  return {motion, link, repAgreement, rig: calibrated};
}

export function useDebrief() {
  const [proposals, setProposals] = useState<Proposals | null>(null);
  const [outcome, setOutcome] = useState<CommitOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(async (result: SetResult, ctx: DebriefContext, exerciseHint: string | null) => {
    const exerciseId = result.match?.label && result.match.label !== 'unknown' ? result.match.label : exerciseHint ?? result.match?.candidates[0]?.exerciseId ?? 'unknown';
    const level = await store.levelProgress(exerciseId, ctx.gymId);
    const prior = await store.weightPrior(exerciseId, ctx.gymId);
    const names = (ctx.pkg as unknown as {exercise_names?: Record<string, string>}).exercise_names ?? {};
    setOutcome(null);
    setProposals(
      propose({
        result,
        repSignal: repSignalOf(ctx.pkg, exerciseId) ?? 'vision',
        levelState: level?.state ?? 'locked',
        weightPrior: prior,
        ocr: null, // OCR reconcile is P1 (design §14)
        thresholds: {t_reject: ctx.params.engine.t_reject, t_imu_high: ctx.params.engine.t_imu_high, t_ocr: ctx.params.engine.t_ocr},
        templates: ctx.pkg.explanations,
        names,
      }),
    );
  }, []);

  const confirm = useCallback(async (result: SetResult, answers: DebriefAnswers, ctx: DebriefContext) => {
    setBusy(true);
    setError(null);
    try {
      const repSignal = repSignalOf(ctx.pkg, answers.exerciseId) ?? 'vision';
      const gates = evaluateGates(result, answers, repSignal, ctx.calibrated);
      const t0 = (result.tOpenNs - result.tStartNs) / 1e9;
      const t1 = (result.tCloseNs - result.tStartNs) / 1e9;
      const confirmed: ConfirmedSet = {
        setId: result.setId,
        sessionId: ctx.sessionId,
        exerciseId: answers.exerciseId,
        tStartSec: Math.max(0, t0),
        tEndSec: Math.max(t0 + 1, t1),
        repTopsSec: answers.repTopsSec ?? result.reps.map(r => r.tPeakSec),
        repsConfirmed: answers.repsConfirmed,
        weight: answers.weight,
        weightUnit: answers.weightUnit,
        weightState: answers.weightState,
        gymId: ctx.gymId,
        stationId: null,
      };
      const out = await commit({result, confirmed, repSignal, campaign: campaignOf(ctx.pkg, answers.exerciseId), gates, packageParams: ctx.pkg.params, canonicalRotation: ctx.rotation});
      setOutcome(out);
      return out;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  return {proposals, outcome, busy, error, open, confirm};
}
