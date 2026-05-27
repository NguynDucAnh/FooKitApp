// app/(auth)/register.tsx
// ✅ Fixed theo API_Documentation.xlsx:
//   - Body: { username, password, confirmPassword }  (không có "name" hay "email")
//   - BE trả data: null — không lưu token, điều hướng về Login để user tự đăng nhập

import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { register } from '../../src/store/slices/authSlice';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { COLORS } from '../../src/constants';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function handleRegister() {
    if (!username.trim() || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
    }
    if (password.length < 6) {
      return Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
    }

    const result = await dispatch(
      register({
        username: username.trim(),
        password,
        confirmPassword,
      }),
    );

    if (register.fulfilled.match(result)) {
      Alert.alert(
        'Đăng ký thành công! 🎉',
        'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
        [{ text: 'Đăng nhập ngay', onPress: () => router.replace('/(auth)/login') }],
      );
    } else {
      Alert.alert('Đăng ký thất bại', String(result.payload ?? 'Vui lòng thử lại'));
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.sub}>Tham gia FooKitApp ngay hôm nay</Text>

        <Input
          label="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          placeholder="Ví dụ: nguyenvana99"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          placeholder="Tối thiểu 6 ký tự"
          secureTextEntry
        />
        <Input
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Nhập lại mật khẩu"
          secureTextEntry
        />

        <Button
          title="Đăng ký"
          onPress={handleRegister}
          loading={loading}
          style={styles.btn}
        />

        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>
            Đã có tài khoản?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
              Đăng nhập
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textGray, marginBottom: 32 },
  btn: { marginTop: 8 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: COLORS.textGray },
});
