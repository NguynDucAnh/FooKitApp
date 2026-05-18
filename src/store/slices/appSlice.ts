import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  isOnboardingDone: boolean;
  isLoading: boolean;
  notification: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null;
}

const initialState: AppState = {
  theme: 'system',
  language: 'en',
  isOnboardingDone: false,
  isLoading: false,
  notification: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<AppState['theme']>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setOnboardingDone: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingDone = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    showNotification: (state, action: PayloadAction<AppState['notification']>) => {
      state.notification = action.payload;
    },
    hideNotification: state => {
      state.notification = null;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setOnboardingDone,
  setGlobalLoading,
  showNotification,
  hideNotification,
} = appSlice.actions;
export default appSlice.reducer;
