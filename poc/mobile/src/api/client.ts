import {getApiUrl, REQUEST_TIMEOUT_MS} from '../config';
import {getToken, saveAuth} from './auth';
import type {
  AuthTokenRequest,
  AuthTokenResponse,
  SessionCreateRequest,
  SessionCreateResponse,
  TemplateCreateRequest,
  TemplateCreateResponse,
  TemplateSyncResponse,
  VisionRecognizeRequest,
  VisionRecognizeResponse,
  VisionWeightRequest,
  VisionWeightResponse,
} from './types';

// HTTPS API client to the FastAPI backend (design §6/§7). Per-user bearer
// auth on every call. Single-shot calls here; exponential-backoff retry and
// offline-queue drain live in store/offlineQueue.ts (Q8).

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/** Network failure (offline) vs. a server error — used to decide queueing. */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {...options, signal: controller.signal});
  } catch (e) {
    throw new NetworkError(
      `Network request failed: ${(e as Error)?.message ?? 'unknown'}`,
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function authedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetchWithTimeout(getApiUrl(path), {...options, headers});
  return res;
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, `${res.status}: ${body}`);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Endpoints (design §6)
// ---------------------------------------------------------------------------

export async function authToken(
  req: AuthTokenRequest,
): Promise<AuthTokenResponse> {
  const res = await fetchWithTimeout(getApiUrl('/auth/token'), {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(req),
  });
  const data = await parseJsonOrThrow<AuthTokenResponse>(res);
  await saveAuth({token: data.token, role: data.role, userId: data.user_id});
  return data;
}

export async function templatesSync(
  sinceVersion: number,
): Promise<TemplateSyncResponse> {
  const res = await authedFetch(`/templates/sync?since=${sinceVersion}`, {
    method: 'GET',
  });
  return parseJsonOrThrow<TemplateSyncResponse>(res);
}

export async function createTemplate(
  req: TemplateCreateRequest,
): Promise<TemplateCreateResponse> {
  const res = await authedFetch('/templates', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return parseJsonOrThrow<TemplateCreateResponse>(res);
}

export async function visionWeight(
  req: VisionWeightRequest,
): Promise<VisionWeightResponse> {
  const res = await authedFetch('/vision/weight', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return parseJsonOrThrow<VisionWeightResponse>(res);
}

export async function visionRecognize(
  req: VisionRecognizeRequest,
): Promise<VisionRecognizeResponse> {
  const res = await authedFetch('/vision/recognize', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return parseJsonOrThrow<VisionRecognizeResponse>(res);
}

export async function createSession(
  req: SessionCreateRequest,
): Promise<SessionCreateResponse> {
  const res = await authedFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return parseJsonOrThrow<SessionCreateResponse>(res);
}

export async function exportSessions(): Promise<unknown> {
  const res = await authedFetch('/sessions/export', {method: 'GET'});
  return parseJsonOrThrow<unknown>(res);
}
