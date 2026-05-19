import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../types';
import api from '../../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = { user: null, token: null, loading: false, error: null };

export const login = createAsyncThunk('auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', payload);
      await AsyncStorage.setItem('token', res.data.token);
      return res.data;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk('auth/register',
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', payload);
      await AsyncStorage.setItem('token', res.data.token);
      return res.data;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'Đăng ký thất bại');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(logout.fulfilled, (s) => { s.token = null; s.user = null; });
  },
});

export default authSlice.reducer;
