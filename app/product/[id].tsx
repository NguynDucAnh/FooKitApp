import React, { useEffect, useState } from 'react';
import { Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import { MOCK_PRODUCTS, Product } from '../../src/constants/mockData';
import api from '../../src/services/api';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data?.data ?? res.data))
      .catch(() => setProduct(MOCK_PRODUCTS.find(item => item.id === id) ?? MOCK_PRODUCTS[0]))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  if (!product) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}d</Text>
        <Text style={styles.stock}>Con lai: {product.stock} san pham</Text>
        <Text style={styles.descTitle}>Mo ta san pham</Text>
        <Text style={styles.desc}>{product.description}</Text>
      </ScrollView>

      <SafeAreaView style={styles.footer}>
        <Button title="Quay lai" onPress={() => router.back()} outline style={styles.btnBack} />
        <Button title="Them vao gio" onPress={() => router.back()} style={styles.btnAdd} />
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  image: { width: '100%', height: 300 },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text, margin: 20, marginBottom: 8 },
  price: { fontSize: 26, fontWeight: '700', color: COLORS.primary, marginHorizontal: 20, marginBottom: 4 },
  stock: { fontSize: 13, color: COLORS.textGray, marginHorizontal: 20, marginBottom: 16 },
  descTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginHorizontal: 20, marginBottom: 8 },
  desc: { fontSize: 14, color: COLORS.textGray, lineHeight: 22, marginHorizontal: 20, marginBottom: 20 },
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
  btnBack: { flex: 1 },
  btnAdd: { flex: 2 },
});
