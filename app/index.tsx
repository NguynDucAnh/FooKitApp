import { Redirect } from 'expo-router';
import LoadingScreen from '../src/components/LoadingScreen';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/(auth)/login'} />;
}
