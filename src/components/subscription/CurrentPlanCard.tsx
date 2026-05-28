import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../Button';
import { COLORS } from '../../constants';
import { MySubscription } from '../../types/subscription';
import { PremiumBadge } from './SubscriptionBadges';
import LoadingSkeleton from './LoadingSkeleton';

interface Props {
  subscription: MySubscription | null;
  loading: boolean;
  onUpgrade: () => void;
  onCancel: () => void;
}

function getPlanLabel(planName?: string) {
  return planName?.toLowerCase() === 'free' ? 'Miễn phí' : planName ?? 'Miễn phí';
}

export default function CurrentPlanCard({ subscription, loading, onUpgrade, onCancel }: Props) {
  if (loading) {
    return (
      <View style={styles.card}>
        <LoadingSkeleton />
      </View>
    );
  }

  const isPremium = !!subscription?.isPremium;
  const periodEnd = subscription?.currentPeriodEnd ?? subscription?.expiresAt;

  return (
    <View style={[styles.card, isPremium && styles.premiumCard]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.label, isPremium && styles.premiumMuted]}>Gói hiện tại</Text>
          <Text style={[styles.planName, isPremium && styles.premiumText]}>
            {getPlanLabel(subscription?.planName)}
          </Text>
        </View>
        <PremiumBadge premium={isPremium} />
      </View>

      <Text style={[styles.description, isPremium && styles.premiumMuted]}>
        {isPremium
          ? 'Bạn đang có quyền truy cập Premium. Các tính năng nâng cao đã được mở khóa.'
          : 'Bạn đang dùng gói miễn phí. Nâng cấp để mở khóa trải nghiệm cá nhân hóa.'}
      </Text>

      {periodEnd && (
        <Text style={[styles.period, isPremium && styles.premiumMuted]}>
          Có hiệu lực đến {new Date(periodEnd).toLocaleDateString('vi-VN')}
        </Text>
      )}

      {subscription?.cancelAtPeriodEnd && (
        <Text style={styles.warning}>Gói đã hủy gia hạn tự động. Premium vẫn dùng được tới hết chu kỳ.</Text>
      )}

      <View style={styles.actions}>
        {isPremium ? (
          <Button title="Hủy gia hạn" onPress={onCancel} outline style={styles.actionBtn} />
        ) : (
          <Button title="Nâng cấp Premium" onPress={onUpgrade} style={styles.actionBtn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  premiumCard: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  planName: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 21,
  },
  period: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textGray,
  },
  warning: {
    marginTop: 12,
    color: '#FBBF24',
    fontSize: 13,
    lineHeight: 19,
  },
  premiumText: {
    color: COLORS.white,
  },
  premiumMuted: {
    color: '#D1D5DB',
  },
  actions: {
    marginTop: 18,
  },
  actionBtn: {
    borderColor: COLORS.white,
  },
});
