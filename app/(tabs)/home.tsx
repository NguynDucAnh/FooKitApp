import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { addItem } from '../../src/store/slices/cartSlice';
import ProductCard from '../../src/components/ProductCard';
import { COLORS } from '../../src/constants';
import { MOCK_PRODUCTS } from '../../src/constants/mockData';
import { Product } from '../../src/types';
import api from '../../src/services/api';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data?.data ?? res.data))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào, {user?.name ?? 'Bạn'} 👋</Text>
        <Text style={styles.subGreeting}>Hôm nay bạn muốn mua gì?</Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="🔍  Tìm kiếm sản phẩm..."
        placeholderTextColor={COLORS.textGray}
        value={search}
        onChangeText={setSearch}
      />

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
              onAddToCart={() => dispatch(addItem(item))}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy sản phẩm</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { backgroundColor: COLORS.white, padding: 20, paddingBottom: 14 },
  greeting: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subGreeting: { fontSize: 14, color: COLORS.textGray, marginTop: 2 },
  search: {
    margin: 14, padding: 12, backgroundColor: COLORS.white,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    fontSize: 14, color: COLORS.text,
  },
  list: { paddingHorizontal: 14, paddingBottom: 24 },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textGray, fontSize: 14 },
});
