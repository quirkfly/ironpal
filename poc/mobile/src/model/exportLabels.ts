// Export in-app labels in the shape `scripts/kb/score_reps.py` / `score_weights.py` read
// (studio design §10.7), so a session labelled in the Studio can be graded against the KB ground
// truth without a converter.

import {repSignalOf} from './packageManager';
import * as store from './store';
import type {LabeledSetRow} from './store';
import type {ModelPackage, RepSignal} from '../types/model';

export interface PredictionRow {
  id: string;
  exercise: string;
  exercise_name: string;
  session_id: string;
  predicted_kg: number | null;
  unit: string;
  confidence: number;
  abstained: boolean;
  method: string;
  predicted_reps: number | null;
  reps_range: [number, number] | null;
  reps_confidence: number;
  reps_abstained: boolean;
  reps_method: string;
  label_source: string;
  counted: boolean;
}

export interface PredictionsFile {
  _comment: string;
  predictions: PredictionRow[];
}

export function buildPredictions(sets: LabeledSetRow[], repSignalOfFn: (id: string) => RepSignal | null, names: Record<string, string>): PredictionsFile {
  const predictions: PredictionRow[] = sets.map(s => {
    const rs = repSignalOfFn(s.exerciseId);
    const reps = s.repsConfirmed ?? (s.repMarks.length ? s.repMarks.length : null);
    const repsAbstained = reps == null;
    let range: [number, number] | null = null;
    let repsConf = 0;
    if (reps != null) {
      if (rs === 'imu' || rs === 'fusion') {
        range = [reps, reps];
        repsConf = s.gates.repAgreement === false ? 0.5 : 0.9;
      } else {
        range = [Math.max(0, reps - 1), reps + 1];
        repsConf = rs === 'hard' ? 0.6 : 0.7;
      }
    }
    const weightAbstained = s.weightState !== 'confirmed' || s.weightDeclared == null;
    return {
      id: s.id,
      exercise: s.exerciseId,
      exercise_name: names[s.exerciseId] ?? s.exerciseId,
      session_id: s.sessionId,
      predicted_kg: weightAbstained ? null : s.weightDeclared,
      unit: s.weightUnit ?? 'kg',
      confidence: weightAbstained ? (s.weightState === 'unsure' ? 0.4 : 0.2) : 0.9,
      abstained: weightAbstained,
      method: weightAbstained ? `user declared ${s.weightState}` : 'user declared in-app',
      predicted_reps: reps,
      reps_range: range,
      reps_confidence: repsConf,
      reps_abstained: repsAbstained,
      reps_method: rs === 'imu' || rs === 'fusion' ? 'headband rep clock, user confirmed' : 'user declared count',
      label_source: s.labelSource ?? 'debrief',
      counted: s.counted,
    };
  });
  return {
    _comment: 'IronPal in-app labels (Studio export). One row per labeled set; ids are labeled_sets.id. Readable by scripts/kb/score_reps.py and score_weights.py.',
    predictions,
  };
}

export async function exportSessionLabels(sessionId: string, pkg: ModelPackage): Promise<string> {
  const sets = await store.labeledSetsForSession(sessionId);
  const names = (pkg as unknown as {exercise_names?: Record<string, string>}).exercise_names ?? {};
  return JSON.stringify(buildPredictions(sets, id => repSignalOf(pkg, id), names), null, 2);
}
