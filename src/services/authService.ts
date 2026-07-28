import axiosClient from './axiosClient';
import {
  AuthResponse,
  AuthTokens,
  AuthUser,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
  SetCredentialsRequest,
} from '../types/auth';
import { clearAuthStorage, saveStoredUser, saveTokens } from '../utils/tokenStorage';
import { getRolesFromJwt, hasAdminRole } from '../utils/jwt';
import { getBooleanField, getStringField } from '../utils/apiNormalize';

const AUTH_BASE = '/api/Auth';

function getResponseData(response: AuthResponse) {
  return response.data && typeof response.data === 'object' ? response.data : response;
}

function getTokens(response: AuthResponse): AuthTokens {
  const data = getResponseData(response) as AuthResponse;
  const accessToken = response.accessToken ?? response.token ?? data.accessToken ?? data.token;
  const refreshToken = response.refreshToken ?? data.refreshToken ?? '';

  return {
    accessToken: accessToken ?? '',
    refreshToken,
  };
}

function normalizeRoles(user: Partial<AuthUser>, token?: string) {
  const responseRoles = [
    ...(Array.isArray(user.roles) ? user.roles : []),
    ...(user.role ? [user.role] : []),
  ];
  const roles = responseRoles.length ? responseRoles : getRolesFromJwt(token);
  return roles;
}

function getUser(response: AuthResponse, fallbackUsername: string, token?: string): AuthUser {
  const data = getResponseData(response) as AuthResponse | Partial<AuthUser>;
  const user = (response.user ?? ('user' in data ? data.user : data) ?? {}) as Partial<AuthUser>;
  const roles = normalizeRoles(user, token);
  const fullName = getStringField(user, ['fullName', 'FullName', 'full_name', 'name']);
  const username = getStringField(user, ['username', 'userName', 'UserName']) ?? fallbackUsername;

  return {
    id: getStringField(user, ['id', 'Id', 'user_id']) ?? user.id,
    username,
    name: fullName ?? username,
    fullName: fullName ?? username,
    email: getStringField(user, ['email', 'Email']) ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
    role: user.role ?? roles[0],
    roles,
    isAdmin: user.isAdmin ?? hasAdminRole(roles),
    hasCredentials: getBooleanField(user, ['hasCredentials', 'has_credentials']),
    isGoogleAccount: getBooleanField(user, ['isGoogleAccount', 'is_google_account']),
  };
}

async function persistAuth(response: AuthResponse, fallbackUsername: string) {
  const tokens = getTokens(response);
  const user = getUser(response, fallbackUsername, tokens.accessToken);

  if (tokens.accessToken) {
    await saveTokens(tokens);
  }
  await saveStoredUser(user);

  return { tokens, user };
}

export const authService = {
  async login(payload: LoginRequest) {
    const username = payload.username.trim();
    const response = await axiosClient.post<AuthResponse>(`${AUTH_BASE}/login`, {
      username,
      password: payload.password,
    });
    return persistAuth(response.data, username);
  },

  async register(payload: RegisterRequest) {
    const username = payload.username.trim();
    const response = await axiosClient.post<AuthResponse>(`${AUTH_BASE}/register`, {
      username,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    });
    return persistAuth(response.data, username);
  },

  async googleLogin(payload: GoogleLoginRequest) {
    const response = await axiosClient.post<AuthResponse>(`${AUTH_BASE}/google-login`, payload);
    return persistAuth(response.data, 'google-user');
  },

  async logout() {
    try {
      await axiosClient.post(`${AUTH_BASE}/logout`, {});
    } finally {
      await clearAuthStorage();
    }
  },

  async setCredentials(payload: SetCredentialsRequest) {
    return axiosClient.put(`${AUTH_BASE}/set-credentials`, payload);
  },

  async linkGoogle(payload: GoogleLoginRequest) {
    return axiosClient.post(`${AUTH_BASE}/link-google`, payload);
  },
};
