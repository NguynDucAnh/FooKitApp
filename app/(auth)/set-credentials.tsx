import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { COLORS } from '../../src/constants';
import { useAuth } from '../../src/hooks/useAuth';
import { getAuthErrorMessage } from '../../src/utils/authErrors';

export default function SetCredentialsScreen() {
  const { currentUser, loading: authLoading, setCredentials } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const canSetCredentials = !!currentUser?.isGoogleAccount && !currentUser?.hasCredentials;

  useEffect(() => {
    if (authLoading || canSetCredentials) return;

    Alert.alert(
      'Không khả dụng',
      'Chức năng này chỉ dành cho tài khoản đăng nhập bằng Google chưa thiết lập tên đăng nhập và mật khẩu.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }]
    );
  }, [authLoading, canSetCredentials]);

  async function handleSubmit() {
    if (!canSetCredentials) {
      Alert.alert('Không khả dụng', 'Chỉ tài khoản đăng nhập bằng Google mới có thể thiết lập tài khoản nội bộ.');
      return;
    }

    if (!username.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập.');
    if (password.length < 6) return Alert.alert('Lỗi', 'Mật khẩu tối thiểu 6 ký tự.');
    if (password !== confirmPassword) return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');

    setLoading(true);
    try {
      await setCredentials({ username: username.trim(), password, confirmPassword });
      Alert.alert('Thành công', 'Đã thiết lập tài khoản đăng nhập.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/profile') },
      ]);
    } catch (error) {
      Alert.alert('Không thể cập nhật', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Thiết lập đăng nhập</Text>
        <Text style={styles.sub}>Tạo tên đăng nhập và mật khẩu riêng cho tài khoản Google.</Text>
        <Input label="Tên đăng nhập" value={username} onChangeText={setUsername} placeholder="Tạo tên đăng nhập" autoCapitalize="none" />
        <Input label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" secureTextEntry />
        <Input label="Xác nhận mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Nhập lại mật khẩu để xác nhận" secureTextEntry />
        <Button title="Lưu thông tin" onPress={handleSubmit} loading={loading || authLoading} style={styles.btn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textGray, marginBottom: 32 },
  btn: { marginTop: 8 },
});
