// src/store/slices/authSlice.ts
// ✅ Fixed theo API_Documentation.xlsx:
//   - Login: POST /api/Auth/login, body { username, password }, token = res.data.data.accessToken
//   - Register: POST /api/Auth/register, body { username, password, confirmPassword }, data: null → không lưu token
//   - Logout: gọi POST /api/Auth/logout lên server + xóa SecureStore local
//   - Lưu cả accessToken (key: 'token') và refreshToken (key: 'refreshToken') vào SecureStore

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { User } from '../../types';
import api from '../../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// ── Login ──────────────────────────────────────────────────────────────────
// BE: POST /api/Auth/login
// Body: { username, password }   ← "username" có thể là email hoặc username
// Response: { success, data: { accessToken, refreshToken } }
export const login = createAsyncThunk(
  'auth/login',
  async (payload: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/Auth/login', payload);
      const { accessToken, refreshToken } = res.data.data;
      // Lưu token vào SecureStore (an toàn hơn AsyncStorage)
      await SecureStore.setItemAsync('token', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      return { accessToken };
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string; detail?: string } } };
      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      return rejectWithValue(message);
    }
  },
);

// ── Register ───────────────────────────────────────────────────────────────
// BE: POST /api/Auth/register
// Body: { username, password, confirmPassword }
// Response: { success: true, data: null }  ← KHÔNG trả token
// Sau register → redirect về Login để user tự đăng nhập
export const register = createAsyncThunk(
  'auth/register',
  async (
    payload: { username: string; password: string; confirmPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post('/api/Auth/register', payload);
      // BE trả data: null — không có token ở đây
      return res.data; // { success: true, message: "Registration successful!" }
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string; detail?: string; errors?: unknown } } };
      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        'Đăng ký thất bại. Vui lòng thử lại.';
      return rejectWithValue(message);
    }
  },
);

// ── Logout ─────────────────────────────────────────────────────────────────
// BE: POST /api/Auth/logout (Bearer Token required)
// Vô hiệu hóa refreshToken phía server → xóa local SecureStore
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    // Gọi server để vô hiệu hóa refreshToken (bảo mật)
    await api.post('/api/Auth/logout');
  } catch {
    // Bỏ qua lỗi network khi logout — vẫn xóa token local
  } finally {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
  }
});

// ─────────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    // Khôi phục token từ SecureStore khi app khởi động
    restoreToken(state, action: { payload: string }) {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.accessToken;
        // Note: BE login không trả user object — cần gọi thêm /api/Profile nếu cần
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // Register — KHÔNG lưu token, chỉ mark loading done
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s) => { s.loading = false; })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // Logout
      .addCase(logout.fulfilled, (s) => { s.token = null; s.user = null; });
  },
});

export const { clearAuthError, restoreToken } = authSlice.actions;
export default authSlice.reducer;
