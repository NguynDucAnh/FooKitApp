import { Redirect } from 'expo-router';
import { useAppSelector } from '../src/store';

export default function Index() {
  const token = useAppSelector(s => s.auth.token);
  return <Redirect href={token ? '/(tabs)/home' : '/(auth)/login'} />;
}
