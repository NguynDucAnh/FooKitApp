import React, { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { AuthUser, ChangePasswordRequest, GoogleLoginRequest, LoginRequest, RegisterRequest, SetCredentialsRequest, UpdateProfileRequest } from '../types/auth';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveStoredUser,
} from '../utils/tokenStorage';
import { getAuthErrorMessage } from '../utils/authErrors';
import { getRolesFromJwt, hasAdminRole, isJwtExpired } from '../utils/jwt';

const AUTH_CLOCK_SKEW_SECONDS = 30;

interface AuthContextValue {
  currentUser: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  googleLogin: (payload: GoogleLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setCredentials: (payload: SetCredentialsRequest) => Promise<void>;
  linkGoogle: (payload: GoogleLoginRequest) => Promise<void>;
  updateProfile: (payload: UpdateProfileRequest, localDraft?: Partial<AuthUser>) => Promise<AuthUser>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  updateLocalUser: (user: AuthUser) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function hydrateAuth() {
      try {
        const [token, refreshToken, user] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
          getStoredUser(),
        ]);
        if (!isActive) return;

        if (!token || !refreshToken || isJwtExpired(token, undefined, AUTH_CLOCK_SKEW_SECONDS)) {
          await clearAuthStorage();
          if (!isActive) return;
          setAccessToken(null);
          setCurrentUser(null);
          return;
        }

        const roles = user?.roles?.length ? user.roles : getRolesFromJwt(token);
        setAccessToken(token);
        setCurrentUser(user ? {
          ...user,
          roles,
          role: user.role ?? roles[0],
          isAdmin: user.isAdmin ?? hasAdminRole(roles),
        } : null);
      } catch {
        if (!isActive) return;
        setAccessToken(null);
        setCurrentUser(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void hydrateAuth();

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    accessToken,
    isAuthenticated: !!accessToken,
    loading,

    async login(payload) {
      const result = await authService.login(payload);
      setAccessToken(result.tokens.accessToken);
      setCurrentUser(result.user);
    },

    async register(payload) {
      const result = await authService.register(payload);
      setAccessToken(result.tokens.accessToken);
      setCurrentUser(result.user);
    },

    async googleLogin(payload) {
      const result = await authService.googleLogin(payload);
      setAccessToken(result.tokens.accessToken);
      const nextUser = { ...result.user, isGoogleAccount: true };
      await saveStoredUser(nextUser);
      setCurrentUser(nextUser);
    },

    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        Alert.alert('Đăng xuất', getAuthErrorMessage(error));
      } finally {
        setAccessToken(null);
        setCurrentUser(null);
        router.replace('/(auth)/login');
      }
    },

    async setCredentials(payload) {
      await authService.setCredentials(payload);
      if (currentUser) {
        const nextUser = {
          ...currentUser,
          username: payload.username.trim(),
          hasCredentials: true,
        };
        await saveStoredUser(nextUser);
        setCurrentUser(nextUser);
      }
    },

    async linkGoogle(payload) {
      await authService.linkGoogle(payload);
    },

    async updateProfile(payload, localDraft) {
      const updatedProfile = await userService.updateProfile(payload);
      const nextFullName = updatedProfile.fullName ?? payload.fullName;
      const nextAvatarUrl = updatedProfile.avatarUrl ?? localDraft?.avatarUrl ?? currentUser?.avatarUrl;
      const nextUser: AuthUser = {
        ...(currentUser ?? {
          username: updatedProfile.username ?? '',
          name: nextFullName,
          email: updatedProfile.email ?? '',
        }),
        ...localDraft,
        id: updatedProfile.id ?? currentUser?.id,
        username: updatedProfile.username ?? currentUser?.username ?? '',
        email: updatedProfile.email ?? currentUser?.email ?? '',
        name: nextFullName,
        fullName: nextFullName,
        avatarUrl: nextAvatarUrl,
      };

      await saveStoredUser(nextUser);
      setCurrentUser(nextUser);
      return nextUser;
    },

    async changePassword(payload) {
      await userService.changePassword(payload);
    },

    async updateLocalUser(user) {
      await saveStoredUser(user);
      setCurrentUser(user);
    },
  }), [accessToken, currentUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
