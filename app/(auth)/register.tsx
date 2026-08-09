import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AuthBrandLayout from '../../src/components/auth/AuthBrandLayout';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import { useAuth } from '../../src/hooks/useAuth';
import { getAuthErrorMessage } from '../../src/utils/authErrors';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username.trim() || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả thông tin.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
    }

    if (password.length < 6) {
      return Alert.alert('Lỗi', 'Mật khẩu cần ít nhất 6 ký tự.');
    }

    setLoading(true);
    try {
      const isAuthenticated = await register({ username, password, confirmPassword });
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.', [
        {
          text: 'ĐĂNG NHẬP',
          onPress: () => router.replace(
            isAuthenticated ? '/(tabs)/home' : '/(auth)/login',
          ),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi đăng ký', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AuthBrandLayout
        title="Tạo tài khoản"
        subtitle="Bắt đầu hành trình ăn ngon hơn, quản lý chi phí bữa ăn thông minh hơn cùng fookit."
      >
        <Input
          label="Tên người dùng"
          value={username}
          onChangeText={setUsername}
          placeholder="Tạo tên người dùng"
          autoCapitalize="none"
        />
        <Input
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
          secureTextEntry
        />
        <Input
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Nhập lại mật khẩu để xác nhận"
          secureTextEntry
        />

        <Button title="Đăng ký" onPress={handleRegister} loading={loading} style={styles.btn} />

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.link}
          accessibilityRole="button"
          accessibilityLabel="Quay lại đăng nhập"
        >
          <Text style={styles.linkText}>
            Đã có tài khoản? <Text style={styles.linkStrong}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </AuthBrandLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  btn: { marginTop: 8 },
  link: { minHeight: 44, marginTop: 24, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontSize: 14, color: COLORS.textGray },
  linkStrong: { color: COLORS.primary, fontWeight: '700' },
});
