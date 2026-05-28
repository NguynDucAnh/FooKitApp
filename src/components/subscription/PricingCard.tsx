import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../Button';
import { COLORS } from '../../constants';
import { SubscriptionPlan } from '../../types/subscription';

interface Props {
  plan: SubscriptionPlan;
  currentPlanName?: string;
  onSelect: (plan: SubscriptionPlan) => void;
}

const DEFAULT_FEATURES: Record<string, string[]> = {
  Free: ['Công thức cơ bản', 'Lưu món yêu thích', 'Lịch bữa ăn thủ công'],
  Premium: ['Gợi ý thông minh', 'Bộ sưu tập không giới hạn', 'Ưu tiên tính năng mới', 'Theo dõi nâng cao'],
};

function getPlanLabel(planName: string) {
  return planName.toLowerCase() === 'free' ? 'Miễn phí' : planName;
}

export default function PricingCard({ plan, currentPlanName, onSelect }: Props) {
  const isCurrent = currentPlanName?.toLowerCase() === plan.planName.toLowerCase();
  const isPremium = plan.planName.toLowerCase() === 'premium' || !!plan.recommended;
  const features = plan.features?.length ? plan.features : DEFAULT_FEATURES[plan.planName] ?? DEFAULT_FEATURES.Free;

  return (
    <View style={[styles.card, isPremium && styles.recommendedCard]}>
      {isPremium && <Text style={styles.recommended}>Khuyên dùng</Text>}
      <Text style={styles.name}>{getPlanLabel(plan.planName)}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{plan.price.toLocaleString('vi-VN')} đ</Text>
        <Text style={styles.period}>/tháng</Text>
      </View>
      <Text style={styles.description}>{plan.description ?? 'Gói linh hoạt cho nhu cầu hằng ngày.'}</Text>

      <View style={styles.features}>
        {features.map(feature => (
          <Text key={feature} style={styles.feature}>✓ {feature}</Text>
        ))}
      </View>

      <Button
        title={isCurrent ? 'Gói hiện tại' : plan.price === 0 ? 'Bắt đầu miễn phí' : 'Nâng cấp'}
        onPress={() => onSelect(plan)}
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
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  recommendedCard: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  recommended: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    color: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
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
    gap: 8,
    marginTop: 16,
  },
  feature: {
    color: COLORS.text,
    fontSize: 14,
  },
  button: {
    marginTop: 18,
  },
});
