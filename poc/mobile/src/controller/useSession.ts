import {useCallback, useRef, useState} from 'react';
import {IMU_SOURCE} from '../config';
import {ImuModule} from '../native/ImuModule';
import {SignalModule} from '../native/SignalModule';
import {compose, toEngineJson, type ComposedParams} from '../model/params';
import {ensureBundled} from '../model/packageManager';
import {installPackagePriors, loadIndex} from '../model/priors';
import * as store from '../model/store';
import type {ModelPackage} from '../types/model';

// Session controller (design §2.1): package → params → engine configure → index load →
// recorder → calibration ritual. One session per gym visit.

export type SessionPhase = 'idle' | 'starting' | 'calibrating' | 'ready' | 'stopping';

export interface SessionState {
  phase: SessionPhase;
  sessionId: string | null;
  pkg: ModelPackage | null;
  params: ComposedParams | null;
  rotation: number[][] | null;
  calibration: {residualDeg: number; nodAxisDominance: number; angleToPreviousDeg: number} | null;
  indexCount: number;
  error: string | null;
}

const MIN_FREE_MB = 500;

export function useSession() {
  const [state, setState] = useState<SessionState>({phase: 'idle', sessionId: null, pkg: null, params: null, rotation: null, calibration: null, indexCount: 0, error: null});
  const gymRef = useRef<string | null>(null);

  const start = useCallback(async (gymId: string | null) => {
    setState(s => ({...s, phase: 'starting', error: null}));
    try {
      gymRef.current = gymId;
      const pkg = await ensureBundled();
      await installPackagePriors(pkg);
      const params = compose(pkg.params, await store.fittedParams());
      const certified = new Set((await store.allLevelProgress()).filter(p => p.state === 'certified' || p.state === 'veteran').map(p => p.exerciseId));
      const exercises = [...pkg.campaign_map.imu, ...pkg.campaign_map.fusion, ...pkg.campaign_map.vision, ...pkg.campaign_map.hard];
      const sessionId = `sess_${Date.now()}`;
      let indexCount = 0;
      if (SignalModule.isAvailable()) {
        const free = await ImuModule.getFreeSpace().catch(() => null);
        if (free && free.freeBytes < MIN_FREE_MB * 1e6) {
          throw new Error(`Low storage: ${(free.freeBytes / 1e6).toFixed(0)} MB free`);
        }
        await ImuModule.prepare(IMU_SOURCE);
        await SignalModule.configure(toEngineJson(params.engine), null);
        indexCount = (await loadIndex(exercises, certified))?.count ?? 0;
        await ImuModule.startSession(sessionId).catch(() => null); // imu.jsonl + meta.json (BLE rig)
        await SignalModule.startSession(sessionId);
      }
      await store.transaction(async () => {
        const db = await import('../store/db');
        const h = await db.getDb();
        await h.executeSql(
          'INSERT OR REPLACE INTO model_sessions (id, started_at, gym_id, rig_id, imu_source, calibration_json, rotation_deg, seq_gaps, free_space_ok, log_dir) VALUES (?,?,?,?,?,?,?,?,?,?)',
          [sessionId, Date.now(), gymId, IMU_SOURCE === 'BLE' ? 'elp-nano' : 'phone', IMU_SOURCE, null, 0, 0, 1, null],
        );
      });
      setState({phase: 'calibrating', sessionId, pkg, params, rotation: null, calibration: null, indexCount, error: null});
    } catch (e) {
      setState(s => ({...s, phase: 'idle', error: (e as Error).message}));
    }
  }, []);

  /**
   * Calibration ritual, shortened form (design §3.1): one worn-upright hold + three nods.
   * P0 limitation: both IMU paths are gravity-removed, so the worn-gravity vector is taken as
   * −g along the device's nominal up axis (device +Z); the nods still fix the pitch axis.
   */
  const calibrate = useCallback(async () => {
    if (!SignalModule.isAvailable()) {
      setState(s => ({...s, phase: 'ready'}));
      return;
    }
    try {
      const nods = await SignalModule.runCalibration('nods');
      const res = await SignalModule.computeCalibration([0, 0, -9.81], nods.nodGyroEnergy ?? [1, 0, 0]);
      const db = await import('../store/db');
      const h = await db.getDb();
      await h.executeSql('UPDATE model_sessions SET calibration_json = ? WHERE id = ?', [JSON.stringify(res), state.sessionId]);
      await SignalModule.configure(toEngineJson(state.params!.engine), res.rotation);
      setState(s => ({...s, phase: 'ready', rotation: res.rotation, calibration: {residualDeg: res.residualDeg, nodAxisDominance: res.nodAxisDominance, angleToPreviousDeg: res.angleToPreviousDeg}}));
    } catch (e) {
      setState(s => ({...s, error: (e as Error).message}));
    }
  }, [state.sessionId, state.params]);

  const skipCalibration = useCallback(() => setState(s => ({...s, phase: 'ready'})), []);

  const stop = useCallback(async () => {
    setState(s => ({...s, phase: 'stopping'}));
    try {
      if (SignalModule.isAvailable()) {
        const summary = await SignalModule.stopSession();
        await ImuModule.stopSession().catch(() => null);
        const db = await import('../store/db');
        const h = await db.getDb();
        await h.executeSql('UPDATE model_sessions SET seq_gaps = ? WHERE id = ?', [summary.seqGaps, state.sessionId]);
      }
    } finally {
      setState(s => ({...s, phase: 'idle', sessionId: null}));
    }
  }, [state.sessionId]);

  return {state, start, calibrate, skipCalibration, stop, gymId: gymRef.current};
}
