// Level state machine (design §6.1). Pure functions over LevelProgress so they are testable
// without the store; the learner persists the result.

import type {LevelParams, LevelProgress, LevelState} from '../types/model';

export const XP = {cleanSet: 100, exactReps: 25, headshot: 25, newWeight: 30, hardMode: 40, newSession: 20};

export function emptyProgress(exerciseId: string, gymId: string | null): LevelProgress {
  return {
    exerciseId,
    gymId,
    state: 'locked',
    cleanSets: 0,
    distinctWeights: 0,
    integrity: 0,
    xp: 0,
    lastChange: 0,
    consecutiveCorrections: 0,
    sessionsWithHardMode: 0,
  };
}

export interface LevelTransition {
  from: LevelState;
  to: LevelState;
  reason: string;
}

/** Highest state the counts and integrity currently support (never below Recon once a set exists). */
export function eligibleState(p: LevelProgress, params: LevelParams): LevelState {
  if (p.cleanSets === 0) {
    return 'locked';
  }
  const cert = p.cleanSets >= params.certified.sets && p.distinctWeights >= params.certified.weights && p.integrity >= params.certified.integrity;
  const prov = p.cleanSets >= params.provisional.sets && p.integrity >= params.provisional.integrity;
  if (cert && p.sessionsWithHardMode >= params.veteran.sessions && p.cleanSets >= params.certified.sets + params.veteran.sets) {
    return 'veteran';
  }
  if (cert) {
    return 'certified';
  }
  if (prov) {
    return 'provisional';
  }
  return 'recon';
}

/**
 * Apply the counts/integrity after a confirmed clean set. Moves up when eligible; moves DOWN only
 * through [afterLiveCorrection] or an integrity drop below the provisional bar (design §6.1).
 */
export function afterCleanSet(p: LevelProgress, params: LevelParams, now: number): {progress: LevelProgress; transition: LevelTransition | null} {
  const next = {...p, consecutiveCorrections: 0};
  const target = eligibleState(next, params);
  const order: LevelState[] = ['locked', 'recon', 'provisional', 'certified', 'veteran'];
  let to = next.state;
  if (order.indexOf(target) > order.indexOf(next.state)) {
    to = target;
  } else if ((next.state === 'certified' || next.state === 'veteran') && next.integrity < params.provisional.integrity) {
    to = 'provisional';
  }
  if (to !== p.state) {
    return {progress: {...next, state: to, lastChange: now}, transition: {from: p.state, to, reason: to === 'provisional' && order.indexOf(p.state) > 2 ? 'integrity below bar' : 'counts and integrity reached'}};
  }
  return {progress: next, transition: null};
}

/** Two consecutive live corrections demote a certified exercise (design §6.1, ledger Q15). */
export function afterLiveCorrection(p: LevelProgress, params: LevelParams, now: number): {progress: LevelProgress; transition: LevelTransition | null} {
  const n = p.consecutiveCorrections + 1;
  if ((p.state === 'certified' || p.state === 'veteran') && n >= params.demoteAfterCorrections) {
    return {progress: {...p, state: 'provisional', consecutiveCorrections: 0, lastChange: now}, transition: {from: p.state, to: 'provisional', reason: `${n} consecutive corrections`}};
  }
  return {progress: {...p, consecutiveCorrections: n}, transition: null};
}

export function reset(p: LevelProgress, now: number): LevelProgress {
  return {...emptyProgress(p.exerciseId, p.gymId), xp: p.xp, lastChange: now};
}

/** What auto-logging the live HUD may do at this state (design §9.1). */
export function automation(state: LevelState): 'none' | 'propose' | 'ask' | 'auto' {
  switch (state) {
    case 'locked':
      return 'none';
    case 'recon':
      return 'propose';
    case 'provisional':
      return 'ask';
    default:
      return 'auto';
  }
}
