import React, { ReactNode, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading]);

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
