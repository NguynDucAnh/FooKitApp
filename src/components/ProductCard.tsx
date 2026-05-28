import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { Product } from '../constants/mockData';

interface Props {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

export default function ProductCard({ product, onPress, onAddToCart }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: product.image }} style={styles.img} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}đ</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddToCart}>
          <Text style={styles.addLabel}>+ Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  img: { width: '100%', height: 160 },
  body: { padding: 12 },
  name: { fontSize: 14, color: COLORS.text, marginBottom: 6 },
  price: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 10 },
  addBtn: { backgroundColor: COLORS.primary, padding: 8, borderRadius: 8, alignItems: 'center' },
  addLabel: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});
