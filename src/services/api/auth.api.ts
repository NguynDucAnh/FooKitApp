import {apiClient} from './client';
import {ApiResponse, User} from '@types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/register', payload),

  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout'),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', {email}),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', {token, password}),

  getProfile: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{token: string}>>('/auth/refresh', {refreshToken}),
};
