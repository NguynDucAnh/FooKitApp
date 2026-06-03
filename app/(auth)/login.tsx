import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import { useAuth } from '../../src/hooks/useAuth';
import { getGoogleSignInErrorMessage, startGoogleAuthSessionAsync } from '../../src/services/googleAuth';
import { getAuthErrorMessage } from '../../src/utils/authErrors';

export default function LoginScreen() {
  const { googleLogin, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      return Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập/email và mật khẩu.');
    }

    setLoading(true);
    try {
      await login({ username, password });
      Alert.alert('Thành công', 'Đăng nhập thành công.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch (error) {
      Alert.alert('Lỗi đăng nhập', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const idToken = await startGoogleAuthSessionAsync();
      if (!idToken) return;

      await googleLogin({ idToken });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Lỗi đăng nhập Google', getGoogleSignInErrorMessage(error));
      router.replace('/(auth)/login');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Chào mừng</Text>
        <Text style={styles.sub}>Đăng nhập để tiếp tục</Text>

        <Input label="Tên đăng nhập hoặc email" value={username} onChangeText={setUsername} placeholder="tuananh99" autoCapitalize="none" />
        <Input label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Password123" secureTextEntry />

        <Button title="Đăng nhập" onPress={handleLogin} loading={loading} style={styles.btn} />

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.divider} />
        </View>

        <Button title="Đăng nhập bằng Google" onPress={handleGoogleLogin} loading={googleLoading} outline style={styles.googleBtn} />

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
          <Text style={styles.linkText}>Chưa có tài khoản? <Text style={styles.linkStrong}>Đăng ký ngay</Text></Text>
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textGray, fontSize: 13 },
  googleBtn: { backgroundColor: COLORS.white },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: COLORS.textGray },
  linkStrong: { color: COLORS.primary, fontWeight: '600' },
});
