import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { register } from '../../src/store/slices/authSlice';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(s => s.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    if (!name || !email || !password) return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ');
    if (password.length < 6) return Alert.alert('Lỗi', 'Mật khẩu ít nhất 6 ký tự');
    const result = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(result)) router.replace('/(tabs)/home');
    else Alert.alert('Thất bại', String(result.payload ?? 'Vui lòng thử lại'));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.sub}>Tham gia mua sắm cùng chúng tôi</Text>
        <Input label="Họ và tên" value={name} onChangeText={setName} placeholder="Nguyễn Văn A" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Tối thiểu 6 ký tự" secureTextEntry />
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
