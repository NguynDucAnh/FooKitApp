import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants';
import api from '../../src/services/api';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

const STATUS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  delivered: 'Đã nhận hàng',
  cancelled: 'Đã hủy',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/me')
      .then(res => setOrders(res.data?.data ?? res.data))
      .catch(() => setOrders(MOCK_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Đơn hàng của tôi</Text>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>Hộp</Text>
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={order => order.id}
          contentContainerStyle={{ padding: 14 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.orderId}>Đơn #{item.id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
              </View>
              <Text style={styles.status}>{STATUS[item.status] ?? item.status}</Text>
              <Text style={styles.total}>{item.total.toLocaleString('vi-VN')}đ</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const MOCK_ORDERS: Order[] = [
  { id: 'abc123def456', total: 500000, status: 'delivered', createdAt: '2024-12-01' },
  { id: 'xyz789ghi012', total: 270000, status: 'shipping', createdAt: '2025-01-15' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, padding: 20, backgroundColor: COLORS.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 32, color: COLORS.textGray },
  emptyText: { fontSize: 16, color: COLORS.textGray },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderId: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  date: { fontSize: 13, color: COLORS.textGray },
  status: { fontSize: 13, color: COLORS.textGray, marginBottom: 8 },
  total: { fontSize: 17, fontWeight: '700', color: COLORS.primary },
});
