import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { SubscriptionProvider } from '../src/context/SubscriptionContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
