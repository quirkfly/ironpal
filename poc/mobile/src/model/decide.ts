// Decisions with explanations (design §5). Proposals for the debrief and the live ladder,
// each carrying the evidence that produced it; wording comes from package templates.

import {automation} from './levels';
import type {Decision, LevelState, RepSignal, SetResult} from '../types/model';

export interface ProposeInput {
  result: SetResult;
  repSignal: RepSignal;
  levelState: LevelState;
  weightPrior: {weight: number; unit: string} | null;
  ocr: {weight: number; unit: string; confidence: number} | null;
  thresholds: {t_reject: number; t_imu_high: number; t_ocr: number};
  templates?: Record<string, string>;
  /** Human labels for exercise ids (ontology canonical names). */
  names?: Record<string, string>;
  /** Date/weight/reps of the best-matching stored set, for the "matched your set from …" line. */
  bestSetInfo?: {date: string; weight: number | null; reps: number | null} | null;
}

const DEFAULT_TEMPLATES: Record<string, string> = {
  exercise_match: 'Matched your {exercise} from {date} ({conf}). Runner-up: {runner} ({runnerConf}).',
  exercise_prior: 'Looks like {exercise} ({conf}) — based on a prior, not your own set yet.',
  exercise_unknown: 'No steady rhythm I recognise (best guess {exercise}, {conf}).',
  reps_imu: '{n} reps from the headband — {rejected} candidate peak(s) rejected.',
  reps_vision: '{n} motion cycles seen; the headband cannot certify reps for this exercise.',
  reps_hard: 'This exercise cannot be counted from a headband — please enter the count.',
  weight_prior: 'Your usual {weight} {unit}.',
  weight_ocr_agree: 'Read {ocr} {unit} ({conf}), matches your usual {weight} {unit}.',
  weight_ocr_disagree: 'Read {ocr} {unit} ({conf}) but your usual is {weight} {unit} — which is it?',
  weight_none: 'I never saw the weight.',
  gate_unknown: 'No steady rhythm found (periodicity {periodicity} < {bar}).',
};

function fill(t: string, vars: Record<string, unknown>): string {
  return t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '?'));
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

export interface Proposals {
  exercise: Decision<string>;
  reps: Decision<number | null>;
  weight: Decision<number | null>;
}

export function propose(input: ProposeInput): Proposals {
  const T = {...DEFAULT_TEMPLATES, ...(input.templates ?? {})};
  const names = input.names ?? {};
  const name = (id: string) => names[id] ?? id;
  const m = input.result.match;
  const winner = m?.candidates[0];
  const runner = m?.candidates[1];
  const priorMatched = winner ? winner.source !== 'own' : false;

  // ---- exercise
  let exercise: Decision<string>;
  if (!m || m.label === 'unknown') {
    exercise = {
      kind: 'exercise',
      value: winner?.exerciseId ?? 'unknown',
      confidence: m?.confidence ?? 0,
      source: 'unknown',
      needsConfirm: true,
      explanation: {
        summary: fill(T.exercise_unknown, {exercise: name(winner?.exerciseId ?? 'unknown'), conf: pct(m?.confidence ?? 0)}),
        evidence: {candidates: m?.candidates ?? [], tReject: input.thresholds.t_reject, periodicity: input.result.periodicity, energy: input.result.energy},
        alternatives: (m?.candidates ?? []).map(c => ({label: name(c.exerciseId), score: 1 / (1 + c.dFused)})),
      },
    };
  } else {
    const auto = automation(input.levelState);
    const high = m.confidence >= input.thresholds.t_imu_high;
    exercise = {
      kind: 'exercise',
      value: m.label,
      confidence: m.confidence,
      source: priorMatched ? 'prior' : 'imu',
      needsConfirm: !(auto === 'auto' && high),
      explanation: {
        summary: priorMatched
          ? fill(T.exercise_prior, {exercise: name(m.label), conf: pct(m.confidence)})
          : fill(T.exercise_match, {
              exercise: name(m.label),
              date: input.bestSetInfo?.date ?? 'an earlier session',
              conf: pct(m.confidence),
              runner: runner ? name(runner.exerciseId) : '—',
              runnerConf: runner ? pct(1 / (1 + runner.dFused)) : '—',
            }),
        evidence: {
          candidates: m.candidates,
          decidedBy: winner && winner.dDtw < winner.dKnn ? 'dtw' : 'knn',
          priorMatched,
          bestTemplateId: winner?.templateId,
          margin: m.margin,
          levelState: input.levelState,
        },
        alternatives: m.candidates.map(c => ({label: name(c.exerciseId), score: 1 / (1 + c.dFused)})),
        flipIf: runner ? `${name(runner.exerciseId)} would need a closer cadence and shape (margin ${m.margin.toFixed(2)})` : undefined,
      },
    };
  }

  // ---- reps
  let reps: Decision<number | null>;
  const zeroPhase = input.result.peaksZeroPhase ?? [];
  const confirmedN = input.result.repsDetected;
  const rejected = Math.max(0, zeroPhase.length - confirmedN);
  if (input.repSignal === 'hard') {
    reps = {kind: 'reps', value: null, confidence: 0, source: 'manual', needsConfirm: true, explanation: {summary: T.reps_hard, evidence: {repSignal: 'hard'}}};
  } else if (input.repSignal === 'vision') {
    reps = {
      kind: 'reps',
      value: confirmedN || null,
      confidence: 0.3,
      source: 'imu',
      needsConfirm: true,
      explanation: {summary: fill(T.reps_vision, {n: confirmedN}), evidence: {repSignal: 'vision', peaks: input.result.reps}},
    };
  } else {
    const conf = Math.min(1, (input.result.periodicity ?? 0) + 0.3);
    reps = {
      kind: 'reps',
      value: confirmedN,
      confidence: conf,
      source: 'imu',
      needsConfirm: automation(input.levelState) !== 'auto' || conf < 0.8,
      explanation: {
        summary: fill(T.reps_imu, {n: confirmedN, rejected}),
        evidence: {peaks: input.result.reps, zeroPhasePeaksSec: zeroPhase, cadenceHz: input.result.cadenceHz, periodicity: input.result.periodicity, dominantChannel: input.result.dominantChannel},
      },
    };
  }

  // ---- weight
  let weight: Decision<number | null>;
  const prior = input.weightPrior;
  const ocr = input.ocr;
  if (ocr && ocr.confidence >= input.thresholds.t_ocr && (!prior || Math.abs(ocr.weight - prior.weight) <= Math.max(2.5, 0.1 * prior.weight))) {
    weight = {kind: 'weight', value: ocr.weight, confidence: ocr.confidence, source: 'vision', needsConfirm: false, explanation: {summary: prior ? fill(T.weight_ocr_agree, {ocr: ocr.weight, unit: ocr.unit, conf: pct(ocr.confidence), weight: prior.weight}) : `Read ${ocr.weight} ${ocr.unit} (${pct(ocr.confidence)}).`, evidence: {ocr, prior, rule: 'ocr_accept'}}};
  } else if (ocr && prior) {
    weight = {kind: 'weight', value: prior.weight, confidence: 0.5, source: 'fused', needsConfirm: true, explanation: {summary: fill(T.weight_ocr_disagree, {ocr: ocr.weight, unit: ocr.unit, conf: pct(ocr.confidence), weight: prior.weight}), evidence: {ocr, prior, rule: 'ocr_disagree'}}};
  } else if (prior) {
    weight = {kind: 'weight', value: prior.weight, confidence: 0.6, source: 'prior', needsConfirm: true, explanation: {summary: fill(T.weight_prior, {weight: prior.weight, unit: prior.unit}), evidence: {prior, rule: 'prior_only'}}};
  } else {
    weight = {kind: 'weight', value: null, confidence: 0, source: 'unknown', needsConfirm: true, explanation: {summary: T.weight_none, evidence: {rule: 'no_evidence'}}};
  }

  return {exercise, reps, weight};
}

export function gateExplanation(periodicity: number, energy: number, pOn: number, templates?: Record<string, string>): Decision<'unknown'> {
  const T = {...DEFAULT_TEMPLATES, ...(templates ?? {})};
  return {
    kind: 'gate',
    value: 'unknown',
    confidence: periodicity,
    source: 'rule',
    needsConfirm: false,
    explanation: {summary: fill(T.gate_unknown, {periodicity: periodicity.toFixed(2), bar: pOn}), evidence: {periodicity, energy, pOn}},
  };
}
