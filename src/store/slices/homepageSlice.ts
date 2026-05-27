// src/store/slices/homepageSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import foodApi from '../../services/foodApi';
import { HomepageData, HomepageResponse } from '../../types/food';

interface HomepageState {
  data: HomepageData | null;
  loading: boolean;
  error: string | null;
  errorCode: number | null;
}

const initialState: HomepageState = {
  data: null,
  loading: false,
  error: null,
  errorCode: null,
};

export const loadHomepage = createAsyncThunk(
  'homepage/load',
  async (_, { rejectWithValue }) => {
    try {
      const res = await foodApi.get<HomepageResponse>('/api/Homepage/suggestions');
      return res.data.data;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.message ?? 'Không thể tải thực đơn';
      return rejectWithValue({ message, code: status });
    }
  }
);

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    clearHomepage(state) {
      state.data = null;
      state.error = null;
      state.errorCode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHomepage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(loadHomepage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadHomepage.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; code: number };
        state.error = payload?.message ?? 'Lỗi không xác định';
        state.errorCode = payload?.code ?? 500;
      });
  },
});

export const { clearHomepage } = homepageSlice.actions;
export default homepageSlice.reducer;
