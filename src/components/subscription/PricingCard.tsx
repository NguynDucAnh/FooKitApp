import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, CreditCard } from 'lucide-react-native';
import Button from '../Button';
import { COLORS } from '../../constants';
import { SubscriptionPlan } from '../../types/subscription';

interface Props {
  plan: SubscriptionPlan;
  currentPlanName?: string;
  loading?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

const DEFAULT_FEATURES: Record<string, string[]> = {
  Free: ['Công thức cơ bản', 'Lưu món yêu thích', 'Lịch bữa ăn thủ công'],
  Premium: ['Gợi ý thông minh', 'Bộ sưu tập không giới hạn', 'Ưu tiên tính năng mới', 'Theo dõi nâng cao'],
};

function getPlanLabel(planName: string) {
  return planName.toLowerCase() === 'free' ? 'Miễn phí' : planName;
}

export default function PricingCard({ plan, currentPlanName, loading, onSelect }: Props) {
  const isCurrent = currentPlanName?.toLowerCase() === plan.planName.toLowerCase();
  const isPremium = plan.planName.toLowerCase() === 'premium' || !!plan.recommended;
  const features = plan.features?.length ? plan.features : DEFAULT_FEATURES[plan.planName] ?? DEFAULT_FEATURES.Free;
  const isPaid = plan.price > 0;
  const currency = plan.currency ?? 'VND';
  const periodLabel = plan.durationInDays ? `/${plan.durationInDays} ngày` : '/tháng';

  return (
    <View style={[styles.card, isPremium && styles.recommendedCard]}>
      <View style={styles.topRow}>
        <View>
          {isPremium && <Text style={styles.recommended}>Khuyên dùng</Text>}
          <Text style={styles.name}>{getPlanLabel(plan.planName)}</Text>
        </View>
        {isPaid && (
          <View style={styles.paymentBadge}>
            <CreditCard size={15} color={COLORS.accent} />
            <Text style={styles.paymentBadgeText}>VNPay</Text>
          </View>
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{plan.price.toLocaleString('vi-VN')} {currency === 'VND' ? 'đ' : currency}</Text>
        <Text style={styles.period}>{periodLabel}</Text>
      </View>
      <Text style={styles.description}>{plan.description ?? 'Gói linh hoạt cho nhu cầu hằng ngày.'}</Text>

      <View style={styles.features}>
        {features.map(feature => (
          <View key={feature} style={styles.featureRow}>
            <CheckCircle2 size={16} color={COLORS.primary} />
            <Text style={styles.feature}>{feature}</Text>
          </View>
        ))}
      </View>

      <Button
        title={isCurrent ? 'Gói hiện tại' : isPaid ? 'Thanh toán VNPay' : 'Bắt đầu miễn phí'}
        onPress={() => onSelect(plan)}
        loading={loading}
        disabled={isCurrent}
        outline={!isPremium}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  recommendedCard: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommended: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7FBF2',
    color: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B8',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  paymentBadgeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  price: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: '800',
  },
  period: {
    color: COLORS.textGray,
    marginBottom: 4,
    marginLeft: 4,
  },
  description: {
    color: COLORS.textGray,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  features: {
    gap: 9,
    marginTop: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feature: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  button: {
    marginTop: 18,
  },
});
