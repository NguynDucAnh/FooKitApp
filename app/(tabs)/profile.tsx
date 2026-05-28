import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { BottomNav } from '../../src/components/BottomNav';
import { COLORS } from '../../src/constants';
import { useAuth } from '../../src/hooks/useAuth';
import { getGoogleSignInErrorMessage, startGoogleAuthSessionAsync } from '../../src/services/googleAuth';
import { AuthUser } from '../../src/types/auth';

const EMPTY_USER: AuthUser = {
  username: '',
  name: 'Người dùng',
  email: '',
  phone: '',
  address: '',
};

const MENU = [
  { icon: '[]', label: 'Đơn hàng của tôi', path: '/(tabs)/orders' },
  { icon: '->', label: 'Địa chỉ giao hàng', path: null },
  { icon: '!', label: 'Thông báo', path: null },
  { icon: '?', label: 'Trợ giúp và hỗ trợ', path: null },
];

export default function ProfileScreen() {
  const { currentUser, linkGoogle, logout, updateLocalUser } = useAuth();
  const [form, setForm] = useState<AuthUser>(currentUser ?? EMPTY_USER);
  const [saving, setSaving] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  useEffect(() => {
    setForm(currentUser ?? EMPTY_USER);
  }, [currentUser]);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const nextUser: AuthUser = {
        ...form,
        username: form.username.trim(),
        name: form.name.trim() || form.username.trim() || 'Người dùng',
        email: form.email.trim(),
        phone: form.phone?.trim(),
        address: form.address?.trim(),
      };

      await updateLocalUser(nextUser);
      setForm(nextUser);
      Alert.alert('Đã cập nhật', 'Thông tin tài khoản đã được lưu trên máy.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  }

  async function handleLinkGoogle() {
    setLinkingGoogle(true);
    try {
      const idToken = await startGoogleAuthSessionAsync();
      if (!idToken) return;

      await linkGoogle({ idToken });
      Alert.alert('Thành công', 'Đã liên kết tài khoản Google.');
    } catch (error) {
      Alert.alert('Không thể liên kết Google', getGoogleSignInErrorMessage(error));
    } finally {
      setLinkingGoogle(false);
    }
  }

  function handleBottomTabChange(tab: string) {
    if (tab === 'home') {
      router.push('/(tabs)/home');
      return;
    }

    if (tab === 'profile') return;

    Alert.alert('Đang phát triển', 'Màn hình này sẽ được kết nối sau.');
  }

  const user = currentUser ?? EMPTY_USER;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{(user.name || user.username || '?').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.name || user.username || 'Người dùng'}</Text>
          <Text style={styles.email}>{user.username ? `@${user.username}` : 'Đã đăng nhập'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <Input label="Tên hiển thị" value={form.name} onChangeText={name => setForm(current => ({ ...current, name }))} placeholder="Nguyễn Tuấn Anh" />
          <Input label="Tên đăng nhập" value={form.username} onChangeText={username => setForm(current => ({ ...current, username }))} placeholder="tuananh99" autoCapitalize="none" />
          <Input label="Email" value={form.email} onChangeText={email => setForm(current => ({ ...current, email }))} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Số điện thoại" value={form.phone} onChangeText={phone => setForm(current => ({ ...current, phone }))} placeholder="090..." keyboardType="phone-pad" />
          <Input label="Địa chỉ" value={form.address} onChangeText={address => setForm(current => ({ ...current, address }))} placeholder="Địa chỉ giao hàng" />
          <Button title="Cập nhật thông tin" onPress={handleSaveProfile} loading={saving} style={styles.saveBtn} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bảo mật tài khoản</Text>
          <Button title="Thiết lập tên đăng nhập/mật khẩu" onPress={() => router.push('/(auth)/set-credentials')} outline style={styles.securityBtn} />
          <Button title="Liên kết Google" onPress={handleLinkGoogle} loading={linkingGoogle} outline style={styles.securityBtn} />
        </View>

        <View style={styles.section}>
          {MENU.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              onPress={() => item.path ? router.push(item.path as never) : null}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>{'>'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav activeTab="profile" onTabChange={handleBottomTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { paddingBottom: 120 },
  headerBox: { alignItems: 'center', padding: 32, backgroundColor: COLORS.white, marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 34, fontWeight: '700', color: COLORS.white },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textGray, marginTop: 4 },
  section: { backgroundColor: COLORS.white, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  saveBtn: { marginTop: 8 },
  securityBtn: { marginBottom: 10 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { fontSize: 16, marginRight: 14, width: 24, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  menuArrow: { fontSize: 22, color: COLORS.textGray },
  logoutBtn: { marginHorizontal: 20, padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.error, alignItems: 'center', backgroundColor: COLORS.white },
  logoutText: { color: COLORS.error, fontSize: 15, fontWeight: '600' },
});
