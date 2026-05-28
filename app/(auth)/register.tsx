import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import { authApi } from '../../src/services/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả thông tin');
    }
    
    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
    }
    
    if (password.length < 6) {
      return Alert.alert('Lỗi', 'Mật khẩu ít nhất 6 ký tự');
    }
    
    setLoading(true);
    try {
      await authApi.register(username, password, confirmPassword);
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      Alert.alert('Lỗi đăng ký', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.sub}>Tham gia mua sắm cùng chúng tôi</Text>
        <Input label="Tên người dùng" value={username} onChangeText={setUsername} placeholder="example_user" autoCapitalize="none" />
        <Input label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Tối thiểu 6 ký tự" secureTextEntry />
        <Input label="Xác nhận mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Nhập lại mật khẩu" secureTextEntry />
        <Button title="Đăng ký" onPress={handleRegister} loading={loading} style={styles.btn} />
        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>Đã có tài khoản? <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Đăng nhập</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textGray, marginBottom: 32 },
  btn: { marginTop: 8 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: COLORS.textGray },
});
