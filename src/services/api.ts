import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth API endpoints
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/Auth/login', { username, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  register: async (username: string, password: string, confirmPassword: string) => {
    const response = await api.post('/api/Auth/register', { username, password, confirmPassword });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
};

export default api;
