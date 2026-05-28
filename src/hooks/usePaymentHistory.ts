import { useCallback, useEffect, useMemo, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { PaymentHistoryItem } from '../types/subscription';

type SortKey = 'date' | 'amount' | 'status';

export function usePaymentHistory() {
  const [items, setItems] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('date');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await subscriptionService.getPaymentHistory());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử thanh toán.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortKey === 'amount') return b.amount - a.amount;
      if (sortKey === 'status') return a.status.localeCompare(b.status);

      const dateA = new Date(a.paymentDate ?? a.createdAt ?? 0).getTime();
      const dateB = new Date(b.paymentDate ?? b.createdAt ?? 0).getTime();
      return dateB - dateA;
    });
  }, [items, sortKey]);

  return { items: sortedItems, loading, error, sortKey, setSortKey, refetch };
}
