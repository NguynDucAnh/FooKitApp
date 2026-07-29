import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheck, CircleX, Clock3 } from 'lucide-react-native';
import { COLORS } from '../../src/constants';
import { paymentService } from '../../src/services/paymentService';

type PaymentState = 'loading' | 'success' | 'failed';

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{ orderCode?: string; cancel?: string; status?: string }>();
  const [state, setState] = useState<PaymentState>('loading');
  const [message, setMessage] = useState('Đang xác minh giao dịch...');

  useEffect(() => {
    const orderCode = Array.isArray(params.orderCode) ? params.orderCode[0] : params.orderCode;
    const wasCancelled = String(Array.isArray(params.cancel) ? params.cancel[0] : params.cancel).toLowerCase() === 'true';

    if (!orderCode) {
      setState('failed');
      setMessage('Không tìm thấy mã đơn hàng để xác minh giao dịch.');
      return;
    }

    if (wasCancelled) {
      setState('failed');
      setMessage('Bạn đã hủy thanh toán. Gói hiện tại của bạn không thay đổi.');
      return;
    }

    async function verifyPayment() {
      try {
        const result = await paymentService.verifyPayOSReturn(orderCode);
        setState(result.success ? 'success' : 'failed');
        setMessage(result.message || (result.success
          ? 'Thanh toán thành công. Gói Premium đang được kích hoạt.'
          : 'Thanh toán chưa thành công.'));
      } catch {
        setState('failed');
        setMessage('Không thể xác minh giao dịch với máy chủ. Vui lòng thử lại sau.');
      }
    }

    verifyPayment();
  }, [params.cancel, params.orderCode]);

  const Icon = state === 'loading' ? Clock3 : state === 'success' ? CircleCheck : CircleX;
  const iconColor = state === 'success' ? COLORS.primary : state === 'failed' ? COLORS.error : COLORS.accent;
  const title = state === 'loading' ? 'Đang xử lý' : state === 'success' ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          {state === 'loading' ? <ActivityIndicator color={COLORS.primary} /> : <Icon size={44} color={iconColor} />}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message} accessibilityLiveRegion="polite">{message}</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace({ pathname: '/(tabs)/home', params: { tab: 'discover' } })}
          accessibilityRole="button"
          accessibilityLabel="Về gói Premium"
          accessibilityHint="Mở màn hình quản lý gói Premium"
        >
          <Text style={styles.buttonText}>Về gói Premium</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  iconBox: { width: 88, height: 88, borderRadius: 8, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  message: { color: COLORS.textGray, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12, maxWidth: 340 },
  button: { minHeight: 44, backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 22, paddingVertical: 14, marginTop: 28, justifyContent: 'center' },
  buttonText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
