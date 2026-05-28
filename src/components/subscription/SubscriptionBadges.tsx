import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaymentStatus } from '../../types/subscription';

export function PremiumBadge({ premium }: { premium: boolean }) {
  return (
    <View style={[styles.badge, premium ? styles.premium : styles.free]}>
      <Text style={[styles.badgeText, premium ? styles.premiumText : styles.freeText]}>
        {premium ? 'Premium' : 'Miễn phí'}
      </Text>
    </View>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const normalized = status.toLowerCase();
  const statusLabel = normalized === 'success'
    ? 'Thành công'
    : normalized === 'pending'
      ? 'Đang xử lý'
      : normalized === 'refunded'
        ? 'Đã hoàn tiền'
        : 'Thất bại';
  const style = normalized === 'success'
    ? styles.success
    : normalized === 'pending'
      ? styles.pending
      : normalized === 'refunded'
        ? styles.refunded
        : styles.failed;

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.statusText}>{statusLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  premium: {
    backgroundColor: '#FEF3C7',
  },
  premiumText: {
    color: '#92400E',
  },
  free: {
    backgroundColor: '#E5E7EB',
  },
  freeText: {
    color: '#374151',
  },
  success: {
    backgroundColor: '#DCFCE7',
  },
  pending: {
    backgroundColor: '#FEF3C7',
  },
  failed: {
    backgroundColor: '#FEE2E2',
  },
  refunded: {
    backgroundColor: '#E0E7FF',
  },
  statusText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
});
