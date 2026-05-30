import {getDb} from './db';
import {
  createSession,
  visionRecognize,
  visionWeight,
  NetworkError,
} from '../api/client';
import {
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_ATTEMPTS,
  RETRY_MAX_DELAY_MS,
} from '../config';
import type {
  SessionCreateRequest,
  VisionRecognizeRequest,
  VisionRecognizeResponse,
  VisionWeightRequest,
  VisionWeightResponse,
} from '../api/types';

// Offline queue + exponential-backoff retry (Q8). On-device IMU metrics never
// touch this; only network-dependent values (sessions, vision) queue and drain
// when connectivity returns or post-set.

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function backoffDelay(attempt: number): number {
  const exp = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * RETRY_BASE_DELAY_MS;
  return Math.min(RETRY_MAX_DELAY_MS, exp + jitter);
}

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), ms));

// ---------------------------------------------------------------------------
// Session queue
// ---------------------------------------------------------------------------

export async function enqueueSession(
  payload: SessionCreateRequest,
): Promise<string> {
  const db = await getDb();
  const id = uuid();
  await db.executeSql(
    `INSERT INTO session_queue (id, payload, attempts, created_at)
     VALUES (?, ?, 0, ?)`,
    [id, JSON.stringify(payload), new Date().toISOString()],
  );
  return id;
}

async function removeSession(id: string): Promise<void> {
  const db = await getDb();
  await db.executeSql('DELETE FROM session_queue WHERE id = ?', [id]);
}

async function bumpSessionAttempts(id: string): Promise<void> {
  const db = await getDb();
  await db.executeSql(
    'UPDATE session_queue SET attempts = attempts + 1 WHERE id = ?',
    [id],
  );
}

// ---------------------------------------------------------------------------
// Vision queue
// ---------------------------------------------------------------------------

export type VisionKind = 'weight' | 'recognize';

export async function enqueueVision(
  kind: VisionKind,
  payload: VisionWeightRequest | VisionRecognizeRequest,
): Promise<string> {
  const db = await getDb();
  const id = uuid();
  await db.executeSql(
    `INSERT INTO vision_queue (id, kind, payload, attempts, created_at)
     VALUES (?, ?, ?, 0, ?)`,
    [id, kind, JSON.stringify(payload), new Date().toISOString()],
  );
  return id;
}

async function removeVision(id: string): Promise<void> {
  const db = await getDb();
  await db.executeSql('DELETE FROM vision_queue WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// Send-with-retry helpers. A single network failure → queue and bail; a
// successful send → resolve. The drainer retries queued rows with backoff.
// ---------------------------------------------------------------------------

/**
 * Try to POST a session immediately; on network failure queue it for drain.
 * Returns true if sent inline, false if queued.
 */
export async function sendOrQueueSession(
  payload: SessionCreateRequest,
): Promise<boolean> {
  try {
    await createSession(payload);
    return true;
  } catch (e) {
    if (e instanceof NetworkError) {
      await enqueueSession(payload);
      return false;
    }
    throw e;
  }
}

/**
 * Try a weight-OCR call; on network failure queue it. Returns the result if
 * it came back inline, or null if it was queued (HUD shows pending — Q8).
 */
export async function sendOrQueueVisionWeight(
  payload: VisionWeightRequest,
): Promise<VisionWeightResponse | null> {
  try {
    return await visionWeight(payload);
  } catch (e) {
    if (e instanceof NetworkError) {
      await enqueueVision('weight', payload);
      return null;
    }
    throw e;
  }
}

export async function sendOrQueueVisionRecognize(
  payload: VisionRecognizeRequest,
): Promise<VisionRecognizeResponse | null> {
  try {
    return await visionRecognize(payload);
  } catch (e) {
    if (e instanceof NetworkError) {
      await enqueueVision('recognize', payload);
      return null;
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Drainers — call on launch, at "Start set", and after connectivity returns.
// ---------------------------------------------------------------------------

let draining = false;

export async function drainQueues(): Promise<void> {
  if (draining) {
    return;
  }
  draining = true;
  try {
    await drainSessions();
    await drainVision();
  } finally {
    draining = false;
  }
}

async function drainSessions(): Promise<void> {
  const db = await getDb();
  const [result] = await db.executeSql(
    'SELECT * FROM session_queue ORDER BY created_at ASC',
  );
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    if (row.attempts >= RETRY_MAX_ATTEMPTS) {
      continue; // give up for now; surfaced in debug overlay
    }
    try {
      await createSession(JSON.parse(row.payload) as SessionCreateRequest);
      await removeSession(row.id);
    } catch (e) {
      await bumpSessionAttempts(row.id);
      if (e instanceof NetworkError) {
        // Still offline — stop the drain, retry later.
        break;
      }
      // Server error: back off then continue to the next row.
      await sleep(backoffDelay(row.attempts));
    }
  }
}

async function drainVision(): Promise<void> {
  const db = await getDb();
  const [result] = await db.executeSql(
    'SELECT * FROM vision_queue ORDER BY created_at ASC',
  );
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    if (row.attempts >= RETRY_MAX_ATTEMPTS) {
      continue;
    }
    try {
      if (row.kind === 'weight') {
        await visionWeight(JSON.parse(row.payload) as VisionWeightRequest);
      } else {
        await visionRecognize(
          JSON.parse(row.payload) as VisionRecognizeRequest,
        );
      }
      await removeVision(row.id);
    } catch (e) {
      const db2 = await getDb();
      await db2.executeSql(
        'UPDATE vision_queue SET attempts = attempts + 1 WHERE id = ?',
        [row.id],
      );
      if (e instanceof NetworkError) {
        break;
      }
      await sleep(backoffDelay(row.attempts));
    }
  }
}

export async function pendingCounts(): Promise<{
  sessions: number;
  vision: number;
}> {
  const db = await getDb();
  const [s] = await db.executeSql('SELECT COUNT(*) AS c FROM session_queue');
  const [v] = await db.executeSql('SELECT COUNT(*) AS c FROM vision_queue');
  return {
    sessions: s.rows.item(0).c as number,
    vision: v.rows.item(0).c as number,
  };
}
