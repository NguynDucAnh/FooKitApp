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

const AUTH_REQUEST_TIMEOUT_MS = 10_000;
const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google-login',
  '/api/auth/refresh-token',
];

let refreshPromise: Promise<string | null> | null = null;
let terminalSessionPromise: Promise<void> | null = null;

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isPublicAuthRequest(url?: string) {
  if (!url) return false;

  const normalizedUrl = url.split('?')[0].replace(/\/+$/, '').toLowerCase();
  return PUBLIC_AUTH_PATHS.some(path => normalizedUrl.endsWith(path));
}

export async function refreshAccessToken() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!accessToken || !refreshToken) return null;

  const response = await axios.post(`${API_URL}/api/Auth/refresh-token`, {
    accessToken,
    refreshToken,
  }, {
    timeout: AUTH_REQUEST_TIMEOUT_MS,
  });

  const nextAccessToken = response.data?.accessToken ?? response.data?.data?.accessToken ?? response.data?.token;
  const nextRefreshToken = response.data?.refreshToken ?? response.data?.data?.refreshToken ?? refreshToken;

  if (!nextAccessToken || !nextRefreshToken) return null;

  await saveTokens({ accessToken: nextAccessToken, refreshToken: nextRefreshToken });
  return nextAccessToken;
}

function getRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function terminateSessionOnce() {
  if (!terminalSessionPromise) {
    terminalSessionPromise = (async () => {
      try {
        await clearAuthStorage();
      } finally {
        router.replace('/(auth)/login');
      }
    })().finally(() => {
      terminalSessionPromise = null;
    });
  }
  return terminalSessionPromise;
}

axiosClient.interceptors.request.use(async (config) => {
  if (isPublicAuthRequest(config.url)) return config;

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

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextAccessToken = await getRefreshPromise();

      if (!nextAccessToken) throw error;

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      await terminateSessionOnce();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
