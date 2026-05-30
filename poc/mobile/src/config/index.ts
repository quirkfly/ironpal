import {BACKEND_BASE_URL, IRONPAL_AUTH_TOKEN, IRONPAL_ROLE} from '@env';
import type {UserRole} from '../types/domain';

// ---------------------------------------------------------------------------
// Backend / network config
// ---------------------------------------------------------------------------

// Backend is self-hosted and internet-facing over HTTPS (decision D2). All
// endpoints live under <base>/api/v1 (design §6). For local dev against a
// laptop backend reached via `adb reverse tcp:8080 tcp:8080`, point this at
// http://localhost:8080 in .env (debug builds allow cleartext).
const DEFAULT_BACKEND_BASE_URL = 'https://ironpal.example.com';

let backendBaseUrl = BACKEND_BASE_URL || DEFAULT_BACKEND_BASE_URL;

export const API_PREFIX = '/api/v1';

export const getBackendBaseUrl = (): string => backendBaseUrl;
export const setBackendBaseUrl = (url: string): void => {
  backendBaseUrl = url;
};
export const getApiUrl = (path: string): string =>
  `${backendBaseUrl}${API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;

// ---------------------------------------------------------------------------
// Auth / role
// ---------------------------------------------------------------------------

/**
 * Pre-seeded bearer token for sideload convenience (Q1/D4). In a full flow
 * this is replaced by the result of POST /auth/token. May be empty.
 */
export const SEEDED_AUTH_TOKEN: string | undefined = IRONPAL_AUTH_TOKEN || undefined;

/** Founder unlocks enroll mode; tester is live-only (Q1/Q2). */
export const USER_ROLE: UserRole =
  IRONPAL_ROLE === 'tester' ? 'tester' : 'founder';

// ---------------------------------------------------------------------------
// Signal-processing constants (design §5). Mirrored in SignalModule (Kotlin);
// kept here so the JS layer can reason about windows/thresholds for the HUD.
// ---------------------------------------------------------------------------

/** Canonical resample rate so cross-device templates compare (D4). */
export const CANONICAL_SAMPLE_RATE_HZ = 50;

/** Rep-cadence band-pass corners in Hz (design §5.1). */
export const REP_BAND_LOW_HZ = 0.2;
export const REP_BAND_HIGH_HZ = 1.5;

/** Sliding analysis window length in seconds for the matcher/rep counter. */
export const ANALYSIS_WINDOW_SEC = 4;

/** Matcher reject threshold — below this confidence → UNKNOWN (Q4/§7). */
export const T_REJECT = 0.45;
/** IMU-high threshold: above this, trust the IMU label outright (§7, A path). */
export const T_IMU_HIGH = 0.7;
/** Vision-high threshold: above this, trust the vision label (§7, B path). */
export const T_VIS_HIGH = 0.65;
/** OCR confidence below this → prompt manual confirm (§7 weight). */
export const T_OCR = 0.6;

/** Weight-glance capture window length (Q5). */
export const WEIGHT_GLANCE_SEC = 2;

// ---------------------------------------------------------------------------
// Offline-queue / retry config (Q8)
// ---------------------------------------------------------------------------

export const RETRY_BASE_DELAY_MS = 1000;
export const RETRY_MAX_DELAY_MS = 60_000;
export const RETRY_MAX_ATTEMPTS = 8;
export const REQUEST_TIMEOUT_MS = 20_000;
