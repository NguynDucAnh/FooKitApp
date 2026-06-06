import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import AuthBrandLayout from '../../src/components/auth/AuthBrandLayout';
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
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AuthBrandLayout
        title="Chào mừng trở lại"
        subtitle="Đăng nhập để tiếp tục gợi ý món ngon theo ngân sách và nhu cầu của bạn."
      >
        <Input
          label="Tên đăng nhập hoặc email"
          value={username}
          onChangeText={setUsername}
          placeholder="tuananh99"
          autoCapitalize="none"
        />
        <Input
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          placeholder="Password123"
          secureTextEntry
        />

        <Button title="Đăng nhập" onPress={handleLogin} loading={loading} style={styles.btn} />

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.divider} />
        </View>

        <Button
          title="Đăng nhập bằng Google"
          onPress={handleGoogleLogin}
          loading={googleLoading}
          outline
          style={styles.googleBtn}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
          <Text style={styles.linkText}>
            Chưa có tài khoản? <Text style={styles.linkStrong}>Đăng ký ngay</Text>
          </Text>
        </TouchableOpacity>
      </AuthBrandLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  btn: { marginTop: 8 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textGray, fontSize: 13 },
  googleBtn: { backgroundColor: COLORS.white },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: COLORS.textGray },
  linkStrong: { color: COLORS.primary, fontWeight: '700' },
});
