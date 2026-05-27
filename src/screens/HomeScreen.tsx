// src/screens/HomeScreen.tsx
// Skill 1 — Tải Thực Đơn Trang Chủ
// Trigger: useEffect khi mount → dispatch loadHomepage()
// Gọi GET /api/Homepage/suggestions kèm Bearer Token (foodApi)
// Render 3 FlatList ngang: Bữa sáng 🌅 / Bữa trưa ☀️ / Bữa tối 🌙

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store';
import { loadHomepage } from '../store/slices/homepageSlice';
import { COLORS } from '../constants';
import { Dish } from '../types/food';

// ─────────────────────────────────────────
// DishCard — card hiển thị trong FlatList ngang
// ─────────────────────────────────────────
function DishCard({ dish }: { dish: Dish }) {
  return (
    <View style={styles.dishCard}>
      {dish.imageUrl ? (
        <Image
          source={{ uri: dish.imageUrl }}
          style={styles.dishImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.dishImage, styles.dishImagePlaceholder]}>
          <Text style={styles.dishImagePlaceholderText}>🍽️</Text>
        </View>
      )}
      <View style={styles.dishInfo}>
        <Text style={styles.dishName} numberOfLines={2}>
          {dish.dishName}
        </Text>
        <Text style={styles.dishCost}>
          💰 {dish.totalCost.toLocaleString('vi-VN')}đ
        </Text>
        <Text style={styles.ingredientCount}>
          🥬 {dish.ingredients.length} nguyên liệu
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// MealSection — tiêu đề + FlatList ngang 1 bữa
// ─────────────────────────────────────────
function MealSection({
  emoji,
  title,
  dishes,
}: {
  emoji: string;
  title: string;
  dishes: Dish[];
}) {
  if (dishes.length === 0) return null;

  return (
    <View style={styles.sectionWrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {emoji} {title}
        </Text>
        <Text style={styles.sectionCount}>{dishes.length} món</Text>
      </View>
      <FlatList
        data={dishes}
        keyExtractor={(item, idx) => `${title}-${idx}`}
        renderItem={({ item }) => <DishCard dish={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
}

// ─────────────────────────────────────────
// HomeScreen — màn hình Skill 1
// ─────────────────────────────────────────
export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { data, loading, error, errorCode } = useAppSelector(
    (s) => s.homepage,
  );

  const fetchHomepage = useCallback(() => {
    dispatch(loadHomepage());
  }, [dispatch]);

  // Tải dữ liệu khi mount
  useEffect(() => {
    fetchHomepage();
  }, [fetchHomepage]);

  // Xử lý lỗi theo AGENT_CONTEXT Section 6
  useEffect(() => {
    if (!error) return;
    if (errorCode === 401) {
      router.replace('/(auth)/login');
    } else if (errorCode === 500) {
      Alert.alert(
        'Hệ thống quá tải',
        'Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.',
      );
    }
    // errorCode 403: Premium modal — sẽ xử lý ở Skill 2
  }, [error, errorCode]);

  // ── Greeting theo giờ ─────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Chào buổi sáng';
    if (hour < 14) return 'Chào buổi trưa';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // ── Loading skeleton ──────────────────
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderBlock greeting={getGreeting()} name={user?.name} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang chuẩn bị thực đơn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Network / Unknown Error ───────────
  if (error && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderBlock greeting={getGreeting()} name={user?.name} />
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorTitle}>Không thể tải thực đơn</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchHomepage}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main Content ──────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchHomepage}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <HeaderBlock greeting={getGreeting()} name={user?.name} />

        {/* Banner Premium hết hạn */}
        {data?.isPremiumExpired && (
          <View style={styles.premiumBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumBannerTitle}>
                ⚠️ Gói Premium đã hết hạn
              </Text>
              <Text style={styles.premiumBannerText}>
                Gia hạn ngay để nhận thực đơn cá nhân hoá mỗi ngày!
              </Text>
            </View>
            <TouchableOpacity style={styles.renewBtn}>
              <Text style={styles.renewText}>Gia hạn →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3 Bữa ăn */}
        {data ? (
          <View style={styles.mealsContainer}>
            <MealSection emoji="🌅" title="Bữa Sáng" dishes={data.breakfast} />
            <MealSection emoji="☀️"  title="Bữa Trưa"  dishes={data.lunch} />
            <MealSection emoji="🌙"  title="Bữa Tối"   dishes={data.dinner} />

            {/* Empty state */}
            {data.breakfast.length === 0 &&
              data.lunch.length === 0 &&
              data.dinner.length === 0 && (
                <View style={styles.centered}>
                  <Text style={styles.errorIcon}>🍽️</Text>
                  <Text style={styles.errorTitle}>Chưa có thực đơn hôm nay</Text>
                  <Text style={styles.errorMsg}>
                    Kéo xuống để tải lại hoặc thử lại sau.
                  </Text>
                </View>
              )}
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-component: Header ─────────────────
function HeaderBlock({
  greeting,
  name,
}: {
  greeting: string;
  name?: string;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>
          {greeting}, {name ?? 'Bạn'} 👋
        </Text>
        <Text style={styles.subGreeting}>Thực đơn của bạn hôm nay</Text>
      </View>
      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },

  // Header
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subGreeting: { fontSize: 13, color: COLORS.textGray, marginTop: 2 },
  dateBadge: {
    backgroundColor: COLORS.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // Premium Banner
  premiumBanner: {
    backgroundColor: COLORS.warningBg,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7B5800',
    marginBottom: 2,
  },
  premiumBannerText: { fontSize: 12, color: '#7B5800', lineHeight: 17 },
  renewBtn: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  renewText: { fontSize: 12, fontWeight: '700', color: COLORS.white },

  // Meals
  mealsContainer: { marginTop: 10 },
  sectionWrapper: { marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  sectionCount: { fontSize: 12, color: COLORS.textGray },
  horizontalList: { paddingHorizontal: 16, gap: 12 },

  // Dish Card
  dishCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dishImage: {
    width: 160,
    height: 110,
    backgroundColor: COLORS.surface,
  },
  dishImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishImagePlaceholderText: {
    fontSize: 36,
  },
  dishInfo: { padding: 10 },
  dishName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  dishCost: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  ingredientCount: {
    fontSize: 11,
    color: COLORS.textGray,
    marginTop: 2,
  },

  // Loading / Error states
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 20,
  },
  loadingText: { marginTop: 16, fontSize: 14, color: COLORS.textGray },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  errorMsg: {
    fontSize: 13,
    color: COLORS.textGray,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
