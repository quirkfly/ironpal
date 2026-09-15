// Navigation params for the Studio surfaces (studio design §6). Kept as plain objects so the
// app's tiny state-based router (App.tsx) can hold them without a navigation library.

import type {DebriefAnswers, DebriefContext} from '../controller/useDebrief';
import type {QueueFocus, SetResult} from '../types/model';

/** An unsaved set — the Debrief's in-memory round, or a region just analysed in the Reel. */
export interface StudioDraft {
  result: SetResult;
  clipId: string | null;
  answers: DebriefAnswers;
  ctx: DebriefContext;
  regionId?: string | null;
}

export type StudioOpen =
  | {kind: 'set'; labeledSetId: string; focus?: QueueFocus; queueItemId?: string | null}
  | {kind: 'draft'; draft: StudioDraft; focus?: QueueFocus};

export type ReelOpen = {sessionId?: string | null; exerciseId?: string | null};

export type StudioMode = 'review' | 'marks' | 'bounds' | 'pins';
