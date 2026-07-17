import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { SubscriptionProvider } from '../src/context/SubscriptionContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <FavoritesProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </FavoritesProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
