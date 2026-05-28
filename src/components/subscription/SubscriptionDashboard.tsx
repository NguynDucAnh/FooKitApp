import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import { usePlans } from '../../hooks/usePlans';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionPlan } from '../../types/subscription';
import CancelSubscriptionModal from './CancelSubscriptionModal';
import CurrentPlanCard from './CurrentPlanCard';
import PaymentHistoryTable from './PaymentHistoryTable';
import PricingCard from './PricingCard';

function getPlanLabel(planName: string) {
  return planName.toLowerCase() === 'free' ? 'miễn phí' : planName;
}

export default function SubscriptionDashboard() {
  const { subscription, loading, error, refreshSubscription, cancelSubscription } = useSubscription();
  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = usePlans();
  const paymentHistory = usePaymentHistory();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  async function handleCancelSubscription() {
    setCancelling(true);
    try {
      await cancelSubscription();
      setCancelModalVisible(false);
      Alert.alert('Đã hủy gia hạn', 'Bạn vẫn giữ quyền Premium tới hết chu kỳ thanh toán hiện tại.');
    } catch (err) {
      Alert.alert('Không thể hủy gói', err instanceof Error ? err.message : 'Vui lòng thử lại sau.');
    } finally {
      setCancelling(false);
    }
  }

  function handleSelectPlan(plan: SubscriptionPlan) {
    if (plan.planName.toLowerCase() === subscription?.planName?.toLowerCase()) return;
    Alert.alert('Thanh toán', `Luồng thanh toán cho gói ${getPlanLabel(plan.planName)} sẽ được kết nối sau.`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Thành viên Premium</Text>
        <Text style={styles.title}>Quản lý gói của bạn</Text>
        <Text style={styles.subtitle}>
          Theo dõi trạng thái Premium, nâng cấp gói và kiểm tra lịch sử thanh toán trong một nơi.
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Không thể tải gói hiện tại</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={refreshSubscription}>Thử lại</Text>
        </View>
      )}

      <CurrentPlanCard
        subscription={subscription}
        loading={loading}
        onUpgrade={() => Alert.alert('Nâng cấp Premium', 'Chọn gói Premium bên dưới để tiếp tục.')}
        onCancel={() => setCancelModalVisible(true)}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bảng giá</Text>
        <Text style={styles.sectionSub}>Sẵn sàng cho thanh toán theo tháng hoặc năm.</Text>
      </View>

      {plansError && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Đang hiển thị gói dự phòng. {plansError}</Text>
          <Text style={styles.retryText} onPress={refetchPlans}>Tải lại</Text>
        </View>
      )}

      {plansLoading ? (
        <View style={styles.planSkeleton}>
          <Text style={styles.loadingText}>Đang tải bảng giá...</Text>
        </View>
      ) : (
        plans.map(plan => (
          <PricingCard
            key={plan.planName}
            plan={plan}
            currentPlanName={subscription?.planName}
            onSelect={handleSelectPlan}
          />
        ))
      )}

      <View style={styles.compareCard}>
        <Text style={styles.compareTitle}>So sánh nhanh</Text>
        <View style={styles.compareRow}>
          <Text style={styles.compareFeature}>Công thức cơ bản</Text>
          <Text style={styles.compareValue}>Miễn phí/Premium</Text>
        </View>
        <View style={styles.compareRow}>
          <Text style={styles.compareFeature}>Gợi ý nâng cao</Text>
          <Text style={styles.compareValue}>Premium</Text>
        </View>
        <View style={styles.compareRow}>
          <Text style={styles.compareFeature}>Ưu tiên tính năng mới</Text>
          <Text style={styles.compareValue}>Premium</Text>
        </View>
      </View>

      <PaymentHistoryTable
        items={paymentHistory.items}
        loading={paymentHistory.loading}
        error={paymentHistory.error}
        sortKey={paymentHistory.sortKey}
        onSortChange={paymentHistory.setSortKey}
        onRetry={paymentHistory.refetch}
      />

      <CancelSubscriptionModal
        visible={cancelModalVisible}
        loading={cancelling}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleCancelSubscription}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 18, paddingBottom: 24 },
  hero: { backgroundColor: '#111827', borderRadius: 20, padding: 20, marginBottom: 16 },
  eyebrow: { color: '#FBBF24', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: '#D1D5DB', fontSize: 14, lineHeight: 21 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, marginBottom: 14 },
  errorTitle: { color: '#991B1B', fontWeight: '800', marginBottom: 4 },
  errorText: { color: '#991B1B', lineHeight: 20 },
  retryText: { color: COLORS.primary, fontWeight: '800', marginTop: 8 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  sectionSub: { color: COLORS.textGray, marginTop: 4 },
  notice: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 12 },
  noticeText: { color: '#92400E', lineHeight: 19 },
  planSkeleton: { backgroundColor: COLORS.white, borderRadius: 16, padding: 18, marginBottom: 12 },
  loadingText: { color: COLORS.textGray },
  compareCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  compareTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  compareRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  compareFeature: { flex: 1, color: COLORS.text },
  compareValue: { color: COLORS.primary, fontWeight: '800' },
});
