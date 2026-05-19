import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { login } from '../../src/store/slices/authSlice';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ');
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) router.replace('/(tabs)/home');
    else Alert.alert('Thất bại', String(result.payload ?? 'Vui lòng thử lại'));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Chào mừng 👋</Text>
        <Text style={styles.sub}>Đăng nhập để tiếp tục mua sắm</Text>
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Mật khẩu" secureTextEntry />
        <Button title="Đăng nhập" onPress={handleLogin} loading={loading} style={styles.btn} />
        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
          <Text style={styles.linkText}>Chưa có tài khoản? <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Đăng ký ngay</Text></Text>
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
