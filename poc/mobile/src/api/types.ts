// Wire types for the backend API contract (design §6). These match exactly
// what the FastAPI backend (owned by another process) implements under /api/v1.

import type {ExerciseLabel} from '../types/domain';

// POST /auth/token
export interface AuthTokenRequest {
  /** Static per-user credential / device id for POC auth (design §7). */
  user_id: string;
  secret?: string;
}
export interface AuthTokenResponse {
  token: string;
  role: 'founder' | 'tester';
  user_id: string;
}

// GET /templates/sync?since=<version>
export interface TemplateSyncWire {
  id: string;
  exercise_label: ExerciseLabel;
  take_id: number;
  device_orientation: Record<string, unknown> | null;
  sample_rate_hz: number;
  feature_vector: Record<string, unknown>;
  /** Resampled raw window (D4/D5/D7). */
  imu_series_resampled: number[][];
  version: number;
}
export interface TemplateSyncResponse {
  version: number;
  templates: TemplateSyncWire[];
}

// POST /templates (founder enrollment)
export interface TemplateCreateRequest {
  exercise_label: ExerciseLabel;
  take_id: number;
  device_orientation: Record<string, unknown> | null;
  sample_rate_hz: number;
  feature_vector: Record<string, unknown>;
  imu_series: number[][];
}
export interface TemplateCreateResponse {
  id: string;
  version: number;
}

// POST /vision/weight
export interface VisionWeightRequest {
  exercise_hint: ExerciseLabel;
  frame: string; // base64 jpeg
}
export interface VisionWeightResponse {
  weight: number;
  unit: string;
  confidence: number;
}

// POST /vision/recognize
export interface VisionRecognizeRequest {
  frames: string[]; // base64 jpegs
  orientation: string; // "supine|upright|..."
}
export interface VisionRecognizeResponse {
  exercise: ExerciseLabel;
  reps: number;
  confidence: number;
}

// POST /sessions
export interface SessionCreateRequest {
  started_at: string;
  ended_at: string;

  detected_exercise: ExerciseLabel | null;
  exercise_confidence: number | null;
  exercise_source: string;

  detected_reps: number | null;
  reps_confidence: number | null;
  reps_source: string;

  detected_weight: number | null;
  weight_confidence: number | null;
  weight_source: string;

  corrected_exercise: ExerciseLabel | null;
  corrected_reps: number | null;
  corrected_weight: number | null;

  is_rest_window: boolean;

  device_model: string;
  sensor_info: Record<string, unknown>;
  sample_rate_hz: number;
  has_gyro: boolean;

  llm_calls: number;
  llm_cost_estimate: number;
  notes: string | null;
}
export interface SessionCreateResponse {
  id: string;
}
