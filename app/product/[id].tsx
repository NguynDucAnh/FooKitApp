import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppDispatch } from '../../src/store';
import { addItem } from '../../src/store/slices/cartSlice';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import { MOCK_PRODUCTS } from '../../src/constants/mockData';
import { Product } from '../../src/types';
import api from '../../src/services/api';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data?.data ?? res.data))
      .catch(() => setProduct(MOCK_PRODUCTS.find(p => p.id === id) ?? MOCK_PRODUCTS[0]))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  if (!product)  return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}đ</Text>
          <Text style={styles.stock}>Còn lại: {product.stock} sản phẩm</Text>
          <View style={styles.divider} />
          <Text style={styles.descTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.desc}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        <Button title="← Quay lại" onPress={() => router.back()} outline style={styles.btnBack} />
        <Button
          title="🛒 Thêm vào giỏ"
          onPress={() => { dispatch(addItem(product)); router.back(); }}
          style={styles.btnAdd}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  image: { width: '100%', height: 300 },
  content: { padding: 20 },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  price: { fontSize: 26, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  stock: { fontSize: 13, color: COLORS.textGray },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  descTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  desc: { fontSize: 14, color: COLORS.textGray, lineHeight: 22 },
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
  btnBack: { flex: 1 },
  btnAdd: { flex: 2 },
});
