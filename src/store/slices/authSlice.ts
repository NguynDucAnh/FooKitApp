import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AuthState, User} from '@types';
import {authApi, LoginPayload, RegisterPayload} from '@services/api/auth.api';
import {storageService} from '@services/storage';
import {STORAGE_KEYS} from '@constants';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, {rejectWithValue}) => {
    try {
      const response = await authApi.login(payload);
      const {token, refreshToken, user} = response.data;
      await storageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
      await storageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await storageService.setObject(STORAGE_KEYS.USER, user);
      return {token, refreshToken, user};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, {rejectWithValue}) => {
    try {
      const response = await authApi.register(payload);
      const {token, refreshToken, user} = response.data;
      await storageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
      await storageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      return {token, refreshToken, user};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    await storageService.remove(STORAGE_KEYS.AUTH_TOKEN);
    await storageService.remove(STORAGE_KEYS.REFRESH_TOKEN);
    await storageService.remove(STORAGE_KEYS.USER);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    resetAuth: () => initialState,
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logout.fulfilled, () => initialState);
  },
});

export const {setUser, clearError, resetAuth} = authSlice.actions;
export default authSlice.reducer;
