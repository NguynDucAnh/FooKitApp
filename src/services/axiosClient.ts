import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { API_URL } from '../constants';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../utils/tokenStorage';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function refreshAccessToken() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!accessToken || !refreshToken) return null;

  const response = await axios.post(`${API_URL}/api/Auth/refresh-token`, {
    accessToken,
    refreshToken,
  });

  const nextAccessToken = response.data?.accessToken ?? response.data?.data?.accessToken ?? response.data?.token;
  const nextRefreshToken = response.data?.refreshToken ?? response.data?.data?.refreshToken ?? refreshToken;

  if (!nextAccessToken || !nextRefreshToken) return null;

  await saveTokens({ accessToken: nextAccessToken, refreshToken: nextRefreshToken });
  return nextAccessToken;
}

axiosClient.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const nextAccessToken = await refreshPromise;
      refreshPromise = null;

      if (!nextAccessToken) throw error;

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      await clearAuthStorage();
      router.replace('/(auth)/login');
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
