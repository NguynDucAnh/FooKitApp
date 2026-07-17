import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MySubscription } from '../types/subscription';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from '../hooks/useAuth';

interface SubscriptionContextValue {
  subscription: MySubscription | null;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  setSubscription: (subscription: MySubscription | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);
const PREMIUM_STATUS_KEY = 'premiumStatus';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { accessToken, loading: authLoading } = useAuth();
  const [subscription, setSubscriptionState] = useState<MySubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSubscription = useCallback((nextSubscription: MySubscription | null) => {
    setSubscriptionState(nextSubscription);
    AsyncStorage.setItem(PREMIUM_STATUS_KEY, JSON.stringify({
      isPremium: !!nextSubscription?.isPremium,
      planName: nextSubscription?.planName ?? 'Free',
    })).catch(() => undefined);
  }, []);

  const refreshSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionService.getMySubscription();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin gói hiện tại.');
    } finally {
      setLoading(false);
    }
  }, [setSubscription]);

  useEffect(() => {
    if (authLoading) return;

    if (!accessToken) {
      setSubscriptionState(null);
      AsyncStorage.removeItem(PREMIUM_STATUS_KEY).catch(() => undefined);
      return;
    }

    let cancelled = false;
    async function hydrateAndRefreshPremiumStatus() {
      const rawStatus = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
      if (rawStatus && !cancelled) {
        try {
          const parsedStatus = JSON.parse(rawStatus);
          setSubscriptionState({
            isPremium: !!parsedStatus.isPremium,
            planName: parsedStatus.planName ?? 'Free',
          });
        } catch {
          await AsyncStorage.removeItem(PREMIUM_STATUS_KEY);
        }
      }

      if (!cancelled) await refreshSubscription();
    }

    hydrateAndRefreshPremiumStatus();
    return () => { cancelled = true; };
  }, [accessToken, authLoading, refreshSubscription]);

  const value = useMemo<SubscriptionContextValue>(() => ({
    subscription,
    isPremium: !!subscription?.isPremium,
    loading,
    error,
    refreshSubscription,
    setSubscription,
  }), [error, loading, refreshSubscription, setSubscription, subscription]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscriptionStore() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionStore must be used inside SubscriptionProvider');
  }
  return context;
}
