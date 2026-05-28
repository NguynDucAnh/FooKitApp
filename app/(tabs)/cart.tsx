import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import api from '../../src/services/api';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function handleOrder() {
    try {
      await api.post('/orders', {
        items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
      });
      setItems([]);
      Alert.alert('Dat hang thanh cong', 'Don hang dang duoc xu ly.');
    } catch {
      setItems([]);
      Alert.alert('Dat hang thanh cong', '(Demo) Don hang da duoc ghi nhan.');
    }
  }

  function decreaseQuantity(item: CartItem) {
    setItems(current =>
      item.quantity > 1
        ? current.map(cartItem =>
            cartItem.product.id === item.product.id
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          )
        : current.filter(cartItem => cartItem.product.id !== item.product.id)
    );
  }

  function increaseQuantity(item: CartItem) {
    setItems(current =>
      current.map(cartItem =>
        cartItem.product.id === item.product.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>Cart</Text>
        <Text style={styles.emptyTitle}>Gio hang trong</Text>
        <Text style={styles.emptySub}>Hay them san pham vao gio hang.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Gio hang ({items.length})</Text>

      <FlatList
        data={items}
        keyExtractor={item => item.product.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.price}>{item.product.price.toLocaleString('vi-VN')}d</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qBtn} onPress={() => decreaseQuantity(item)}>
                <Text style={styles.qBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qBtn} onPress={() => increaseQuantity(item)}>
                <Text style={styles.qBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tong tien</Text>
          <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')}d</Text>
        </View>
        <Button title="Dat hang ngay" onPress={handleOrder} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  emptyIcon: { fontSize: 32, marginBottom: 12 },
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
