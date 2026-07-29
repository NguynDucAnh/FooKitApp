import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
const LEGACY_PREMIUM_STATUS_KEY = 'premiumStatus';

interface SubscriptionSnapshot {
  session: object;
  value: MySubscription;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { accessToken, loading: authLoading } = useAuth();
  const session = useMemo(() => ({ authenticated: !!accessToken }), [accessToken]);
  const activeSessionRef = useRef(session);
  const latestRequestRef = useRef(0);
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  activeSessionRef.current = session;

  useEffect(() => {
    AsyncStorage.removeItem(LEGACY_PREMIUM_STATUS_KEY).catch(() => undefined);
  }, []);

  const setSubscription = useCallback((nextSubscription: MySubscription | null) => {
    setSnapshot(nextSubscription ? { session, value: nextSubscription } : null);
  }, [session]);

  const refreshSubscription = useCallback(async () => {
    if (!accessToken) return;

    const requestId = ++latestRequestRef.current;
    const requestSession = session;
    setLoading(true);
    setError(null);

    try {
      const data = await subscriptionService.getMySubscription();
      if (
        activeSessionRef.current === requestSession
        && latestRequestRef.current === requestId
      ) {
        setSnapshot({ session: requestSession, value: data });
      }
    } catch (err) {
      if (
        activeSessionRef.current === requestSession
        && latestRequestRef.current === requestId
      ) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin gói hiện tại.');
      }
    } finally {
      if (
        activeSessionRef.current === requestSession
        && latestRequestRef.current === requestId
      ) {
        setLoading(false);
      }
    }
  }, [accessToken, session]);

  useEffect(() => {
    if (authLoading) return;

    if (!accessToken) {
      latestRequestRef.current += 1;
      setSnapshot(null);
      setLoading(false);
      setError(null);
      return;
    }

    void refreshSubscription();

    return () => {
      latestRequestRef.current += 1;
    };
  }, [accessToken, authLoading, refreshSubscription]);

  const subscription = snapshot?.session === session ? snapshot.value : null;
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
