import { CalendarDays, Search } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface PlannerEmptyStateProps {
  onExplore: () => void;
}

export function PlannerEmptyState({ onExplore }: PlannerEmptyStateProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <CalendarDays size={32} color="#047857" />
      </View>
      <Text style={styles.title}>Kế hoạch bữa ăn</Text>
      <Text style={styles.description}>
        Tính năng lập thực đơn theo tuần đang được hoàn thiện và chưa lưu dữ liệu của bạn.
      </Text>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Bạn vẫn có thể chuẩn bị bữa ăn ngay hôm nay</Text>
        <Text style={styles.noticeText}>
          Khám phá gợi ý món ăn, xem công thức chi tiết và lưu món yêu thích để dùng lại sau.
        </Text>
      </View>
      <Pressable
        style={styles.exploreButton}
        onPress={onExplore}
        android_ripple={{ color: '#A7F3D0' }}
        accessibilityRole="button"
        accessibilityLabel="Khám phá món ăn"
        accessibilityHint="Quay về trang chủ để xem các món ăn được gợi ý"
      >
        <Search size={20} color="#FFFFFF" />
        <Text style={styles.exploreButtonText}>Khám phá món ăn</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 140,
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    marginBottom: 20,
  },
  title: {
    color: '#064E3B',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 420,
  },
  notice: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 20,
    padding: 18,
    marginTop: 24,
  },
  noticeTitle: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  noticeText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
  },
  exploreButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 24,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },
});
