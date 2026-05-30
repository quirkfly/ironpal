import AsyncStorage from '@react-native-async-storage/async-storage';
import {SEEDED_AUTH_TOKEN, USER_ROLE} from '../config';
import type {UserRole} from '../types/domain';

// Per-user bearer token (design §7). For the POC this is either pre-seeded
// from .env (sideload convenience) or fetched once via POST /auth/token and
// cached in AsyncStorage. Distinguishes founder (enroll) vs tester (live-only).

const TOKEN_KEY = 'ironpal.auth.token';
const ROLE_KEY = 'ironpal.auth.role';
const USER_ID_KEY = 'ironpal.auth.userId';

export interface AuthState {
  token: string;
  role: UserRole;
  userId: string;
}

let cached: AuthState | null = null;

export async function loadAuth(): Promise<AuthState | null> {
  if (cached) {
    return cached;
  }
  const [token, role, userId] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(ROLE_KEY),
    AsyncStorage.getItem(USER_ID_KEY),
  ]);
  if (token) {
    cached = {
      token,
      role: role === 'tester' ? 'tester' : 'founder',
      userId: userId ?? 'unknown',
    };
    return cached;
  }
  // Fall back to the seeded token if present.
  if (SEEDED_AUTH_TOKEN) {
    cached = {token: SEEDED_AUTH_TOKEN, role: USER_ROLE, userId: 'seeded'};
    return cached;
  }
  return null;
}

export async function saveAuth(state: AuthState): Promise<void> {
  cached = state;
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, state.token),
    AsyncStorage.setItem(ROLE_KEY, state.role),
    AsyncStorage.setItem(USER_ID_KEY, state.userId),
  ]);
}

export async function clearAuth(): Promise<void> {
  cached = null;
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(ROLE_KEY),
    AsyncStorage.removeItem(USER_ID_KEY),
  ]);
}

export async function getToken(): Promise<string | null> {
  const auth = await loadAuth();
  return auth?.token ?? null;
}
