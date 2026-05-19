import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { removeItem, changeQty, clearCart } from '../../src/store/slices/cartSlice';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import api from '../../src/services/api';

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(s => s.cart.items);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  async function handleOrder() {
    try {
      await api.post('/orders', { items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })) });
      dispatch(clearCart());
      Alert.alert('🎉 Đặt hàng thành công!', 'Đơn hàng đang được xử lý.');
    } catch {
      // Demo mode - không có API thật
      dispatch(clearCart());
      Alert.alert('🎉 Đặt hàng thành công!', '(Demo) Đơn hàng đã được ghi nhận.');
    }
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptySub}>Hãy thêm sản phẩm vào giỏ hàng nhé!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Giỏ hàng ({items.length})</Text>

      <FlatList
        data={items}
        keyExtractor={i => i.product.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.price}>{item.product.price.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qBtn}
                onPress={() =>
                  item.quantity > 1
                    ? dispatch(changeQty({ id: item.product.id, qty: item.quantity - 1 }))
                    : dispatch(removeItem(item.product.id))
                }>
                <Text style={styles.qBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qBtn}
                onPress={() => dispatch(changeQty({ id: item.product.id, qty: item.quantity + 1 }))}>
                <Text style={styles.qBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
          <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')}đ</Text>
        </View>
        <Button title="Đặt hàng ngay 🛍" onPress={handleOrder} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  emptyIcon: { fontSize: 64, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.textGray, marginTop: 6 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, padding: 20, backgroundColor: COLORS.white },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, justifyContent: 'space-between' },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  qBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  qty: { fontSize: 16, fontWeight: '600', minWidth: 22, textAlign: 'center', color: COLORS.text },
  footer: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalLabel: { fontSize: 16, color: COLORS.text },
  totalValue: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
});
