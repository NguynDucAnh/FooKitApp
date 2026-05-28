import { useCallback } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useSubscriptionStore } from '../context/SubscriptionContext';

export function useSubscription() {
  const store = useSubscriptionStore();

  const cancelSubscription = useCallback(async () => {
    await subscriptionService.cancelSubscription();
    await store.refreshSubscription();
  }, [store]);

  return {
    ...store,
    cancelSubscription,
  };
}
