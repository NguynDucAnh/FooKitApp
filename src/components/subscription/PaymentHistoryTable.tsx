import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants';
import { PaymentHistoryItem } from '../../types/subscription';
import LoadingSkeleton from './LoadingSkeleton';
import { PaymentStatusBadge } from './SubscriptionBadges';

interface Props {
  items: PaymentHistoryItem[];
  loading: boolean;
  error: string | null;
  sortKey: 'date' | 'amount' | 'status';
  onSortChange: (key: 'date' | 'amount' | 'status') => void;
  onRetry: () => void;
}

export default function PaymentHistoryTable({ items, loading, error, sortKey, onSortChange, onRetry }: Props) {
  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Lịch sử thanh toán</Text>
        <LoadingSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Lịch sử thanh toán</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử thanh toán</Text>
      </View>

      <View style={styles.sortRow}>
        {(['date', 'amount', 'status'] as const).map(key => (
          <TouchableOpacity
            key={key}
            style={[styles.sortChip, sortKey === key && styles.sortChipActive]}
            onPress={() => onSortChange(key)}
          >
            <Text style={[styles.sortText, sortKey === key && styles.sortTextActive]}>
              {key === 'date' ? 'Ngày' : key === 'amount' ? 'Số tiền' : 'Trạng thái'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Chưa có thanh toán</Text>
          <Text style={styles.emptyText}>Các hóa đơn Premium sẽ xuất hiện tại đây.</Text>
        </View>
      ) : (
        <View style={styles.rows}>
          {items.map((item, index) => {
            const date = item.paymentDate ?? item.createdAt;
            return (
              <View key={item.id ?? item.invoiceId ?? `${item.status}-${index}`} style={styles.row}>
                <View style={styles.rowTop}>
                  <View>
                    <Text style={styles.invoice}>{item.invoiceId ?? `Hóa đơn #${index + 1}`}</Text>
                    <Text style={styles.date}>{date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa có ngày'}</Text>
                  </View>
                  <Text style={styles.amount}>{item.amount.toLocaleString('vi-VN')}đ</Text>
                </View>
                <PaymentStatusBadge status={item.status} />
              </View>
            );
          })}
        </View>
      )}
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
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sortChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#F3F4F6',
  },
  sortChipActive: {
    backgroundColor: COLORS.primary,
  },
  sortText: {
    color: COLORS.textGray,
    fontSize: 12,
    fontWeight: '700',
  },
  sortTextActive: {
    color: COLORS.white,
  },
  empty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptyText: {
    color: COLORS.textGray,
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 12,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  rows: {
    gap: 10,
  },
  row: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  invoice: {
    color: COLORS.text,
    fontWeight: '800',
  },
  date: {
    color: COLORS.textGray,
    fontSize: 12,
    marginTop: 4,
  },
  amount: {
    color: COLORS.text,
    fontWeight: '800',
  },
});
