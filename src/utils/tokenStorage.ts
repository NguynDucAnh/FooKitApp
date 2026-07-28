import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AuthTokens, AuthUser } from '../types/auth';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LEGACY_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'authUser';
const SECURE_TOKENS_KEY = 'fookit.authTokens.v1';

interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

let tokenReadPromise: Promise<StoredTokens> | null = null;

function normalizeToken(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseSecureTokens(value: string | null): StoredTokens | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<AuthTokens>;
    const accessToken = normalizeToken(parsed.accessToken);
    const refreshToken = normalizeToken(parsed.refreshToken);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  } catch {
    return null;
  }
}

async function readTokens(): Promise<StoredTokens> {
  const secureValue = await SecureStore.getItemAsync(SECURE_TOKENS_KEY);
  const secureTokens = parseSecureTokens(secureValue);
  if (secureTokens) return secureTokens;

  if (secureValue) {
    await SecureStore.deleteItemAsync(SECURE_TOKENS_KEY);
  }

  const legacyEntries = await AsyncStorage.multiGet([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    LEGACY_TOKEN_KEY,
  ]);
  const legacy = Object.fromEntries(legacyEntries);
  const accessToken =
    normalizeToken(legacy[ACCESS_TOKEN_KEY]) ?? normalizeToken(legacy[LEGACY_TOKEN_KEY]);
  const refreshToken = normalizeToken(legacy[REFRESH_TOKEN_KEY]);

  if (accessToken && refreshToken) {
    await SecureStore.setItemAsync(
      SECURE_TOKENS_KEY,
      JSON.stringify({ accessToken, refreshToken }),
    );
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, LEGACY_TOKEN_KEY]);
  }

  return { accessToken, refreshToken };
}

function getTokenSnapshot() {
  if (!tokenReadPromise) {
    tokenReadPromise = readTokens().finally(() => {
      tokenReadPromise = null;
    });
  }
  return tokenReadPromise;
}

export async function getAccessToken() {
  return (await getTokenSnapshot()).accessToken;
}

export async function getRefreshToken() {
  return (await getTokenSnapshot()).refreshToken;
}

export async function saveTokens(tokens: AuthTokens) {
  const accessToken = normalizeToken(tokens.accessToken);
  const refreshToken = normalizeToken(tokens.refreshToken);
  if (!accessToken || !refreshToken) {
    throw new Error('Không thể lưu phiên đăng nhập không hợp lệ');
  }

  await SecureStore.setItemAsync(
    SECURE_TOKENS_KEY,
    JSON.stringify({ accessToken, refreshToken }),
  );
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, LEGACY_TOKEN_KEY]);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(SECURE_TOKENS_KEY),
    AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, LEGACY_TOKEN_KEY]),
  ]);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const rawUser = await AsyncStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export async function saveStoredUser(user: AuthUser) {
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export async function clearStoredUser() {
  await AsyncStorage.removeItem(AUTH_USER_KEY);
}

export async function clearAuthStorage() {
  await Promise.all([clearTokens(), clearStoredUser()]);
}
