import {useCallback, useEffect, useRef, useState} from 'react';
import {ImuModule} from '../native/ImuModule';
import {SignalModule} from '../native/SignalModule';
import {CameraModule} from '../native/CameraModule';
import {
  fuseExercise,
  fuseReps,
  fuseWeight,
  type ExerciseDecision,
  type RepsDecision,
  type WeightDecision,
} from '../fusion/fusion';
import {isVisionLed} from './labels';
import {syncAndLoadTemplates} from '../store/templateSync';
import {
  drainQueues,
  sendOrQueueSession,
  sendOrQueueVisionRecognize,
  sendOrQueueVisionWeight,
} from '../store/offlineQueue';
import {WEIGHT_GLANCE_SEC} from '../config';
import type {
  DeviceInfo,
  HudState,
  MatchResult,
  RecognizeVisionResult,
  SessionSet,
  WeightVisionResult,
} from '../types/domain';
import type {SessionCreateRequest} from '../api/types';

// Live-set controller (spec §5.2). Orchestrates: template sync → weight glance
// (Q5) → rep phase (instant on-device IMU + async backend vision fill-in, Q8)
// → end set → confirm/correct. On-device values are instant & offline; LLM
// values render pending "…" then patch in.

type SetPhase = 'idle' | 'syncing' | 'weightGlance' | 'repping' | 'review';

const emptyHud = (setNumber: number): HudState => ({
  exercise: {value: null, confidence: null, source: 'unknown', pending: false},
  reps: {value: null, confidence: null, source: 'unknown', pending: false},
  weight: {value: null, confidence: null, source: 'vision', pending: false},
  weightUnit: 'kg',
  setNumber,
  recording: false,
  weightGlancePrompt: false,
});

export interface ReviewData {
  exercise: ExerciseDecision;
  reps: RepsDecision;
  weight: WeightDecision;
  startedAt: string;
  endedAt: string;
  llmCalls: number;
  llmCostEstimate: number;
}

export function useLiveSet() {
  const [phase, setPhase] = useState<SetPhase>('idle');
  const [hud, setHud] = useState<HudState>(emptyHud(1));
  const [review, setReview] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deviceInfoRef = useRef<DeviceInfo | null>(null);
  const latestMatch = useRef<MatchResult | null>(null);
  const visionResult = useRef<RecognizeVisionResult | null>(null);
  const weightResult = useRef<WeightVisionResult | null>(null);
  const startedAtRef = useRef<string>('');
  const llmCallsRef = useRef(0);
  const setNumberRef = useRef(1);

  // Load device metadata once (D4/D5).
  useEffect(() => {
    if (!ImuModule.isAvailable()) {
      return;
    }
    ImuModule.getDeviceInfo()
      .then(info => {
        deviceInfoRef.current = info;
      })
      .catch(e => setError(`Device info failed: ${e.message}`));
  }, []);

  // Subscribe to live match results (instant on-device IMU — Q8).
  useEffect(() => {
    const unsub = SignalModule.onResult((r: MatchResult) => {
      latestMatch.current = r;
      // Recompute HUD whenever a fresh on-device result arrives.
      setHud(prev => recomputeHud(prev));
    });
    return unsub;
    // recomputeHud is stable (reads only refs); the subscription must be set
    // up once on mount, not re-bound on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recomputeHud = useCallback((prev: HudState): HudState => {
    const imu = latestMatch.current;
    if (!imu) {
      return prev;
    }
    const exDecision = fuseExercise(imu, visionResult.current);
    const repsDecision = fuseReps(
      exDecision.exercise,
      imu,
      visionResult.current,
    );
    const weightDecision = fuseWeight(weightResult.current);
    const visionLed = isVisionLed(exDecision.exercise);

    return {
      ...prev,
      exercise: {
        value: exDecision.exercise,
        confidence: exDecision.confidence,
        source: exDecision.source,
        pending: false,
      },
      reps: {
        value: repsDecision.reps,
        confidence: repsDecision.confidence,
        source: repsDecision.source,
        // Pushdown reps come from the backend — pending until vision returns.
        pending: visionLed && visionResult.current == null,
      },
      weight: {
        value: weightDecision.weight,
        confidence: weightDecision.confidence,
        source: weightDecision.source,
        // Weight is always backend OCR — pending until it returns (Q8).
        pending: weightResult.current == null,
      },
      weightUnit: weightDecision.unit,
    };
  }, []);

  // -------------------------------------------------------------------------
  // Start set: sync templates, run the weight glance, begin the rep phase.
  // -------------------------------------------------------------------------
  const startSet = useCallback(async () => {
    setError(null);
    setReview(null);
    visionResult.current = null;
    weightResult.current = null;
    latestMatch.current = null;
    llmCallsRef.current = 0;
    startedAtRef.current = new Date().toISOString();

    setHud({...emptyHud(setNumberRef.current), recording: true});

    // Drain any queued work + refresh templates (DR3 / Q8).
    setPhase('syncing');
    try {
      await drainQueues();
      await syncAndLoadTemplates();
    } catch (e) {
      // Offline is fine — cached templates already loaded by syncAndLoad.
      console.warn('[useLiveSet] sync failed (continuing offline):', e);
    }

    // Begin native sampling so the buffer is warm before the rep phase.
    if (ImuModule.isAvailable()) {
      await ImuModule.start();
    }

    // Weight glance (Q5): prompt, grab sharpest still, send for OCR (async).
    setPhase('weightGlance');
    setHud(prev => ({...prev, weightGlancePrompt: true}));
    void runWeightGlance();

    // Rep phase: start live matching (instant on-device, Q8).
    setPhase('repping');
    setHud(prev => ({...prev, weightGlancePrompt: false}));
    if (SignalModule.isAvailable()) {
      await SignalModule.startLive();
    }
    // runWeightGlance is stable (refs-only); declared below — safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runWeightGlance = useCallback(async () => {
    if (!CameraModule.isAvailable()) {
      return;
    }
    try {
      const frame = await CameraModule.captureSharpestStill(
        WEIGHT_GLANCE_SEC * 1000,
      );
      // exercise_hint helps the OCR prompt; best-effort from current match.
      const hint =
        latestMatch.current?.exercise &&
        latestMatch.current.exercise !== 'unknown'
          ? latestMatch.current.exercise
          : 'bulgarian_split_squat';
      const res = await sendOrQueueVisionWeight({
        exercise_hint: hint,
        frame,
      });
      if (res) {
        llmCallsRef.current += 1;
        weightResult.current = {
          weight: res.weight,
          unit: res.unit,
          confidence: res.confidence,
        };
        setHud(prev => recomputeHud(prev));
      }
    } catch (e) {
      console.warn('[useLiveSet] weight glance failed:', e);
    }
  }, [recomputeHud]);

  // Kick a pushdown vision-recognize once the matcher leans vision-led.
  const runVisionRecognize = useCallback(async () => {
    if (!CameraModule.isAvailable()) {
      return;
    }
    try {
      const frames = await CameraModule.captureFrameSequence(6, 250);
      const res = await sendOrQueueVisionRecognize({
        frames,
        orientation: 'upright',
      });
      if (res) {
        llmCallsRef.current += 1;
        visionResult.current = {
          exercise: res.exercise,
          reps: res.reps,
          confidence: res.confidence,
        };
        setHud(prev => recomputeHud(prev));
      }
    } catch (e) {
      console.warn('[useLiveSet] vision recognize failed:', e);
    }
  }, [recomputeHud]);

  // When the live match starts pointing at the pushdown, fire vision once.
  const visionFiredRef = useRef(false);
  useEffect(() => {
    if (phase !== 'repping') {
      visionFiredRef.current = false;
      return;
    }
    const m = latestMatch.current;
    if (
      !visionFiredRef.current &&
      m &&
      m.isRepping &&
      // Either the IMU leans pushdown, or IMU is too quiet to decide (B case).
      (m.exercise === 'triceps_pushdown' || m.exercise === 'unknown')
    ) {
      visionFiredRef.current = true;
      void runVisionRecognize();
    }
  }, [phase, hud, runVisionRecognize]);

  // -------------------------------------------------------------------------
  // End set: stop sampling, assemble the review (confirm/correct) data.
  // -------------------------------------------------------------------------
  const endSet = useCallback(async () => {
    if (SignalModule.isAvailable()) {
      await SignalModule.stopLive();
    }
    if (ImuModule.isAvailable()) {
      await ImuModule.stop();
    }
    const imu =
      latestMatch.current ??
      ({
        exercise: 'unknown',
        reps: 0,
        confidence: 0,
        isRepping: false,
        knnDistance: Infinity,
        dtwDistance: Infinity,
      } as MatchResult);

    const exDecision = fuseExercise(imu, visionResult.current);
    const repsDecision = fuseReps(
      exDecision.exercise,
      imu,
      visionResult.current,
    );
    const weightDecision = fuseWeight(weightResult.current);

    setReview({
      exercise: exDecision,
      reps: repsDecision,
      weight: weightDecision,
      startedAt: startedAtRef.current,
      endedAt: new Date().toISOString(),
      llmCalls: llmCallsRef.current,
      // ~$0.02/session target (design §4.4); flat estimate per LLM call.
      llmCostEstimate: llmCallsRef.current * 0.01,
    });
    setPhase('review');
    setHud(prev => ({...prev, recording: false}));
  }, []);

  // -------------------------------------------------------------------------
  // Confirm/correct: write the SessionSet (detected + corrected) and queue it.
  // The corrections are ground truth (Q9).
  // -------------------------------------------------------------------------
  const confirmSet = useCallback(
    async (corrected: {
      exercise: SessionSet['correctedExercise'];
      reps: number | null;
      weight: number | null;
      isRestWindow: boolean;
      notes: string | null;
    }) => {
      if (!review) {
        return;
      }
      const dev = deviceInfoRef.current;
      const payload: SessionCreateRequest = {
        started_at: review.startedAt,
        ended_at: review.endedAt,

        detected_exercise: review.exercise.exercise,
        exercise_confidence: review.exercise.confidence,
        exercise_source: review.exercise.source,

        detected_reps: review.reps.reps,
        reps_confidence: review.reps.confidence,
        reps_source: review.reps.source,

        detected_weight: review.weight.weight,
        weight_confidence: review.weight.confidence,
        weight_source: review.weight.source,

        corrected_exercise: corrected.exercise,
        corrected_reps: corrected.reps,
        corrected_weight: corrected.weight,

        is_rest_window: corrected.isRestWindow,

        device_model: dev?.deviceModel ?? 'unknown',
        sensor_info: dev?.sensorInfo ?? {},
        sample_rate_hz: dev?.sampleRateHz ?? 0,
        has_gyro: dev?.hasGyro ?? false,

        llm_calls: review.llmCalls,
        llm_cost_estimate: review.llmCostEstimate,
        notes: corrected.notes,
      };

      await sendOrQueueSession(payload);
      setNumberRef.current += 1;
      setReview(null);
      setPhase('idle');
      setHud(emptyHud(setNumberRef.current));
    },
    [review],
  );

  return {
    phase,
    hud,
    review,
    error,
    startSet,
    endSet,
    confirmSet,
  };
}
