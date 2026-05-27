// app/_layout.tsx
// Root layout: bọc Redux Provider + StatusBar
// ✅ Fix Issue #1: thêm isReady state — chỉ render children SAU KHI token đã được
//    restore xong từ SecureStore. Tránh race condition khiến index.tsx redirect
//    về login ngay khi app mở dù user đã đăng nhập trước đó.

import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { restoreToken } from '../src/store/slices/authSlice';

function AppInitializer({ children }: { children: React.ReactNode }) {
  // isReady = false → hiển thị màn hình trắng (safe)
  // isReady = true  → render app bình thường
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Đọc accessToken từ SecureStore — đây là bước async duy nhất
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          // Khôi phục vào Redux state TRƯỚC KHI render bất kỳ màn hình nào
          store.dispatch(restoreToken(token));
        }
      } catch {
        // Bỏ qua lỗi đọc SecureStore — xử lý như chưa đăng nhập
      } finally {
        // Dù có token hay không → đánh dấu đã sẵn sàng
        setIsReady(true);
      }
    })();
  }, []);

  // Chưa restore xong → render view trống, không điều hướng gì cả
  if (!isReady) {
    return <View style={{ flex: 1 }} />;
  }

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

