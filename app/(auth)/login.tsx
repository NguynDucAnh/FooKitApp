import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import { authApi } from '../../src/services/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tên người dùng và mật khẩu');
    }
    
    setLoading(true);
    try {
      const result = await authApi.login(username, password);
      Alert.alert('Thành công', 'Đăng nhập thành công!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      Alert.alert('Lỗi đăng nhập', errorMessage);
    } finally {
      setLoading(false);
    }
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Chào mừng 👋</Text>
        <Text style={styles.sub}>Đăng nhập để tiếp tục mua sắm</Text>
        <Input label="Tên người dùng" value={username} onChangeText={setUsername} placeholder="tuananh99" autoCapitalize="none" />
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
