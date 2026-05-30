import {useCallback, useRef, useState} from 'react';
import {ImuModule} from '../native/ImuModule';
import {SignalModule} from '../native/SignalModule';
import {createTemplate} from '../api/client';
import type {EnrollOption} from './labels';
import type {DeviceInfo} from '../types/domain';

// Enrollment controller (founder-only, Q1; spec §5.1). Records a take for a
// chosen label, extracts {featureVector, imuSeriesResampled} natively (D7),
// and POSTs it to /templates. Includes the UNKNOWN seed activities (Q4).

type EnrollPhase = 'idle' | 'recording' | 'saving';

export function useEnroll() {
  const [phase, setPhase] = useState<EnrollPhase>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeOption = useRef<EnrollOption | null>(null);
  const takeIdRef = useRef<Record<string, number>>({});
  const deviceInfoRef = useRef<DeviceInfo | null>(null);

  const ensureDeviceInfo = useCallback(async (): Promise<DeviceInfo | null> => {
    if (deviceInfoRef.current) {
      return deviceInfoRef.current;
    }
    if (!ImuModule.isAvailable()) {
      return null;
    }
    const info = await ImuModule.getDeviceInfo();
    deviceInfoRef.current = info;
    return info;
  }, []);

  const startRecording = useCallback(
    async (option: EnrollOption) => {
      setError(null);
      activeOption.current = option;
      await ensureDeviceInfo();
      if (ImuModule.isAvailable()) {
        await ImuModule.start();
      }
      if (SignalModule.isAvailable()) {
        await SignalModule.startEnroll(option.label);
      }
      setPhase('recording');
    },
    [ensureDeviceInfo],
  );

  const stopAndSave = useCallback(async () => {
    const option = activeOption.current;
    if (!option) {
      return;
    }
    setPhase('saving');
    try {
      let featureVector;
      let imuSeriesResampled: number[][] = [];
      let sampleRateHz = deviceInfoRef.current?.sampleRateHz ?? 0;

      if (SignalModule.isAvailable()) {
        const result = await SignalModule.finishEnroll();
        featureVector = result.featureVector;
        imuSeriesResampled = result.imuSeriesResampled;
        sampleRateHz = result.sampleRateHz;
      }
      if (ImuModule.isAvailable()) {
        await ImuModule.stop();
      }

      // Per-label take counter (multiple takes per exercise — spec §5.1).
      const key = option.title;
      const takeId = (takeIdRef.current[key] ?? 0) + 1;
      takeIdRef.current[key] = takeId;

      if (featureVector) {
        await createTemplate({
          exercise_label: option.label,
          take_id: takeId,
          device_orientation: deviceInfoRef.current?.sensorInfo
            ? {orientation: 'mounted', ...deviceInfoRef.current.sensorInfo}
            : null,
          sample_rate_hz: sampleRateHz,
          feature_vector: featureVector as unknown as Record<string, unknown>,
          imu_series: imuSeriesResampled,
        });
        setLastSaved(`${option.title} (take ${takeId})`);
      } else {
        setError('Native SignalModule unavailable — cannot extract template.');
      }
    } catch (e) {
      setError(`Save failed: ${(e as Error).message}`);
    } finally {
      activeOption.current = null;
      setPhase('idle');
    }
  }, []);

  return {phase, lastSaved, error, startRecording, stopAndSave};
}
