import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { CreditCard, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '../../constants';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import { usePlans } from '../../hooks/usePlans';
import { useSubscription } from '../../hooks/useSubscription';
import { paymentService } from '../../services/paymentService';
import { SubscriptionPlan } from '../../types/subscription';
import { getHttpsUrl } from '../../utils/externalUrl';
import CancelSubscriptionModal from './CancelSubscriptionModal';
import CurrentPlanCard from './CurrentPlanCard';
import PaymentHistoryTable from './PaymentHistoryTable';
import PricingCard from './PricingCard';

function getPlanId(plan: SubscriptionPlan) {
  return plan.id ?? plan.planId;
}

export default function SubscriptionDashboard() {
  const { subscription, loading, error, refreshSubscription, cancelSubscription } = useSubscription();
  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = usePlans();
  const paymentHistory = usePaymentHistory();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  async function refreshPaymentState() {
    await Promise.all([
      refreshSubscription({ force: true }),
      paymentHistory.refetch(),
    ]);
  }

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

  async function handleSelectPlan(plan: SubscriptionPlan) {
    if (plan.planName.toLowerCase() === subscription?.planName?.toLowerCase()) return;

    if (plan.price <= 0) {
      Alert.alert('Gói miễn phí', 'Tài khoản của bạn hiện có thể dùng gói miễn phí mà không cần thanh toán.');
      return;
    }

    const planId = getPlanId(plan);
    if (!planId) {
      Alert.alert(
        'Chưa thể thanh toán',
        'Thông tin thanh toán của gói chưa đầy đủ. Hãy tải lại bảng giá và thử lại.'
      );
      return;
    }

    setPayingPlanId(planId);
    try {
      const payment = await paymentService.createPayment({ planId });

      const checkoutUrl = getHttpsUrl(payment.checkoutUrl);
      if (!checkoutUrl) {
        throw new Error(
          'Cổng thanh toán chưa cung cấp liên kết HTTPS an toàn. Vui lòng thử lại sau.',
        );
      }

      const result = await WebBrowser.openAuthSessionAsync(
        checkoutUrl,
        Linking.createURL('payment/result')
      );

      await refreshPaymentState();

      if (result.type === 'cancel' || result.type === 'dismiss') {
        Alert.alert(
          'Đã đóng cổng thanh toán',
          'Nếu bạn đã thanh toán thành công, hệ thống sẽ tự kích hoạt Premium sau khi PayOS gửi webhook xác nhận.'
        );
        return;
      }

      Alert.alert('Đang cập nhật thanh toán', 'Fookit đã tải lại trạng thái gói và lịch sử thanh toán của bạn.');
    } catch (err) {
      Alert.alert('Không thể tạo thanh toán PayOS', err instanceof Error ? err.message : 'Vui lòng thử lại sau.');
    } finally {
      setPayingPlanId(null);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.eyebrow}>Thành viên Premium</Text>
          <View style={styles.sandboxBadge}>
            <CreditCard size={14} color={COLORS.accent} />
            <Text style={styles.sandboxText}>PayOS</Text>
          </View>
        </View>
        <Text style={styles.title}>Quản lý gói của bạn</Text>
        <Text style={styles.subtitle}>
          Theo dõi trạng thái Premium, nâng cấp qua PayOS và kiểm tra lịch sử thanh toán trong một nơi.
        </Text>
      </View>

      <View style={styles.paymentInfo}>
        <ShieldCheck size={18} color={COLORS.primary} />
        <Text style={styles.paymentInfoText}>
          Bạn sẽ rời FooKitApp để thanh toán trên cổng PayOS bảo mật. Gói Premium chỉ được cập nhật sau khi hệ thống xác nhận giao dịch.
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Không thể tải gói hiện tại</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => void refreshSubscription()}
            accessibilityRole="button"
            accessibilityLabel="Thử tải lại gói hiện tại"
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      <CurrentPlanCard
        subscription={subscription}
        loading={loading}
        onUpgrade={() => Alert.alert('Nâng cấp Premium', 'Chọn gói Premium bên dưới để thanh toán qua PayOS.')}
        onCancel={() => setCancelModalVisible(true)}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bảng giá</Text>
        <Text style={styles.sectionSub}>Chọn gói phù hợp và thanh toán an toàn qua PayOS.</Text>
      </View>

      {plansError && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Đang hiển thị gói dự phòng. {plansError}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => void refetchPlans()}
            accessibilityRole="button"
            accessibilityLabel="Tải lại bảng giá"
          >
            <Text style={styles.retryText}>Tải lại</Text>
          </Pressable>
        </View>
      )}

      {plansLoading ? (
        <View style={styles.planSkeleton}>
          <Text style={styles.loadingText}>Đang tải bảng giá...</Text>
        </View>
      ) : (
        plans.map(plan => {
          const planId = getPlanId(plan);
          return (
            <PricingCard
              key={planId ?? plan.planName}
              plan={plan}
              currentPlanName={subscription?.planName}
              loading={!!planId && payingPlanId === planId}
              onSelect={handleSelectPlan}
            />
          );
        })
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
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 24 },
  hero: { backgroundColor: COLORS.primaryDark, borderRadius: 8, padding: 20, marginBottom: 12 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  eyebrow: { color: '#FFE0B8', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  sandboxBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.white, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  sandboxText: { color: COLORS.accent, fontSize: 12, fontWeight: '800' },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: '#E8F4DF', fontSize: 14, lineHeight: 21 },
  paymentInfo: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.white, borderRadius: 8, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  paymentInfoText: { flex: 1, color: COLORS.textGray, lineHeight: 20 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 14, marginBottom: 14 },
  errorTitle: { color: '#991B1B', fontWeight: '800', marginBottom: 4 },
  errorText: { color: '#991B1B', lineHeight: 20 },
  retryButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginTop: 4 },
  retryText: { color: COLORS.primary, fontWeight: '800' },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  sectionSub: { color: COLORS.textGray, marginTop: 4 },
  notice: { backgroundColor: '#FFFBEB', borderRadius: 8, padding: 12, marginBottom: 12 },
  noticeText: { color: '#92400E', lineHeight: 19 },
  planSkeleton: { backgroundColor: COLORS.white, borderRadius: 8, padding: 18, marginBottom: 12 },
  loadingText: { color: COLORS.textGray },
  compareCard: { backgroundColor: COLORS.white, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  compareTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  compareRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  compareFeature: { flex: 1, color: COLORS.text },
  compareValue: { color: COLORS.primary, fontWeight: '800' },
});
