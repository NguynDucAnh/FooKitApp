// src/services/foodApi.ts
// Axios instance dành riêng cho Food endpoints
// Dùng expo-secure-store để lấy token (an toàn hơn AsyncStorage)

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const foodApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080',
  timeout: 15000,
});

foodApi.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default foodApi;
