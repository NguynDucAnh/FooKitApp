// app/_layout.tsx
// Root layout: bọc Redux Provider + StatusBar
// ✅ Thêm: khởi động app → đọc accessToken từ SecureStore → khôi phục vào Redux state
//    Nếu không làm điều này, user sẽ bị redirect về login mỗi lần mở lại app dù đã login rồi

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { restoreToken } from '../src/store/slices/authSlice';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Khôi phục token từ SecureStore khi app khởi động
    (async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        store.dispatch(restoreToken(token));
      }
    })();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </AppInitializer>
    </Provider>
  );
}
