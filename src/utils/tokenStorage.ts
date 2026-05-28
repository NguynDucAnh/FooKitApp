import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, AuthUser } from '../types/auth';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LEGACY_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'authUser';

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY).then(token => token ?? AsyncStorage.getItem(LEGACY_TOKEN_KEY));
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function saveTokens(tokens: AuthTokens) {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, tokens.accessToken],
    [REFRESH_TOKEN_KEY, tokens.refreshToken],
    [LEGACY_TOKEN_KEY, tokens.accessToken],
  ]);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, LEGACY_TOKEN_KEY]);
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
