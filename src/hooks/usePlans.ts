import { useCallback, useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan } from '../types/subscription';

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    planName: 'Free',
    price: 0,
    description: 'Dành cho người dùng mới bắt đầu.',
    features: ['Xem công thức cơ bản', 'Lưu món yêu thích', 'Lên kế hoạch bữa ăn thủ công'],
  },
  {
    planName: 'Premium',
    price: 79000,
    description: 'Mở khóa trải nghiệm nấu ăn cá nhân hóa.',
    recommended: true,
    features: ['Gợi ý thực đơn nâng cao', 'Lịch sử dinh dưỡng', 'Ưu tiên tính năng mới', 'Không giới hạn bộ sưu tập'],
  },
];

export function usePlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data.length > 0 ? data : FALLBACK_PLANS);
    } catch (err) {
      setPlans(FALLBACK_PLANS);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách gói.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { plans, loading, error, refetch };
}
