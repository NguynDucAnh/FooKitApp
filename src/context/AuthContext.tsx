import React, { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { AuthUser, GoogleLoginRequest, LoginRequest, RegisterRequest, SetCredentialsRequest } from '../types/auth';
import { getAccessToken, getStoredUser, saveStoredUser } from '../utils/tokenStorage';
import { getAuthErrorMessage } from '../utils/authErrors';

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
  updateLocalUser: (user: AuthUser) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrateAuth() {
      const [token, user] = await Promise.all([getAccessToken(), getStoredUser()]);
      setAccessToken(token);
      setCurrentUser(user);
      setLoading(false);
    }

    hydrateAuth();
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
      setCurrentUser(result.user);
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
    },

    async linkGoogle(payload) {
      await authService.linkGoogle(payload);
    },

    async updateLocalUser(user) {
      await saveStoredUser(user);
      setCurrentUser(user);
    },
  }), [accessToken, currentUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
