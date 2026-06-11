import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  CalendarDays,
  Camera,
  ChefHat,
  Heart,
  LogOut,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wallet,
} from 'lucide-react-native';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { BottomNav } from '../../src/components/BottomNav';
import { COLORS } from '../../src/constants';
import { useAuth } from '../../src/hooks/useAuth';
import { getGoogleSignInErrorMessage, startGoogleAuthSessionAsync } from '../../src/services/googleAuth';
import { AuthUser } from '../../src/types/auth';
import { getAuthErrorMessage } from '../../src/utils/authErrors';

const brandLogo = require('../../img/logo fookit 2.jpg');

const EMPTY_USER: AuthUser = {
  username: '',
  name: 'Người dùng',
  fullName: 'Người dùng',
  email: '',
  phone: '',
  address: '',
  avatarUrl: '',
  cookingGoal: '',
  dietaryPreference: '',
  allergies: '',
  favoriteCuisine: '',
  weeklyBudget: '',
};

const QUICK_LINKS = [
  { icon: Sparkles, label: 'Gợi ý món ăn', description: 'Tìm công thức phù hợp khẩu vị và ngân sách.', tab: 'home' },
  { icon: Wallet, label: 'Gói Premium', description: 'Quản lý gói ẩm thực và lịch sử thanh toán.', tab: 'discover' },
  { icon: Heart, label: 'Món yêu thích', description: 'Xem lại các công thức đã lưu.', tab: 'favorites' },
  { icon: CalendarDays, label: 'Kế hoạch bữa ăn', description: 'Sắp xếp thực đơn theo tuần.', tab: 'planner' },
];

export default function ProfileScreen() {
  const { changePassword, currentUser, linkGoogle, logout, updateLocalUser, updateProfile } = useAuth();
  const [form, setForm] = useState<AuthUser>(currentUser ?? EMPTY_USER);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingFoodProfile, setSavingFoodProfile] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const nextUser = { ...EMPTY_USER, ...(currentUser ?? {}) };
    setForm({
      ...nextUser,
      name: nextUser.fullName ?? nextUser.name,
      fullName: nextUser.fullName ?? nextUser.name,
    });
  }, [currentUser]);

  const avatarSource = useMemo(() => {
    return form.avatarUrl?.trim() ? { uri: form.avatarUrl.trim() } : brandLogo;
  }, [form.avatarUrl]);

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập ảnh', 'Vui lòng cho phép Fookit truy cập thư viện ảnh để chọn ảnh đại diện.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    setForm(current => ({ ...current, avatarUrl: result.assets[0].uri }));
  }

  async function handleSaveAccount() {
    const fullName = (form.fullName ?? form.name).trim();
    if (!fullName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên hiển thị.');
      return;
    }

    setSavingProfile(true);
    try {
      const nextUser = await updateProfile(
        { fullName },
        {
          avatarUrl: form.avatarUrl?.trim(),
          cookingGoal: form.cookingGoal?.trim(),
          dietaryPreference: form.dietaryPreference?.trim(),
          allergies: form.allergies?.trim(),
          favoriteCuisine: form.favoriteCuisine?.trim(),
          weeklyBudget: form.weeklyBudget?.trim(),
          phone: form.phone?.trim(),
          address: form.address?.trim(),
        }
      );
      setForm({ ...EMPTY_USER, ...nextUser });
      Alert.alert('Đã cập nhật', 'Thông tin hồ sơ đã được đồng bộ với tài khoản của bạn.');
    } catch (error) {
      Alert.alert('Không thể cập nhật hồ sơ', getAuthErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveFoodProfile() {
    setSavingFoodProfile(true);
    try {
      const nextUser: AuthUser = {
        ...form,
        name: (form.fullName ?? form.name).trim() || form.username || 'Người dùng',
        fullName: (form.fullName ?? form.name).trim() || form.username || 'Người dùng',
        avatarUrl: form.avatarUrl?.trim(),
        cookingGoal: form.cookingGoal?.trim(),
        dietaryPreference: form.dietaryPreference?.trim(),
        allergies: form.allergies?.trim(),
        favoriteCuisine: form.favoriteCuisine?.trim(),
        weeklyBudget: form.weeklyBudget?.trim(),
      };

      await updateLocalUser(nextUser);
      setForm(nextUser);
      Alert.alert('Đã lưu', 'Hồ sơ ẩm thực đã được lưu trên thiết bị.');
    } finally {
      setSavingFoodProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Mật khẩu không khớp', 'Mật khẩu mới và xác nhận mật khẩu mới chưa giống nhau.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu mới cần ít nhất 6 ký tự.');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmNewPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Đã đổi mật khẩu', 'Bạn có thể dùng mật khẩu mới trong lần đăng nhập tiếp theo.');
    } catch (error) {
      Alert.alert('Không thể đổi mật khẩu', getAuthErrorMessage(error));
    } finally {
      setChangingPassword(false);
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

  function openHomeTab(tab: string) {
    router.push({ pathname: '/(tabs)/home', params: { tab } });
  }

  function handleBottomTabChange(tab: string) {
    if (tab === 'profile') return;
    openHomeTab(tab);
  }

  const displayName = form.fullName || form.name || form.username || 'Người dùng';
  const handle = form.username ? `@${form.username}` : 'Hồ sơ ẩm thực cá nhân';
  const isAdmin = !!currentUser?.isAdmin;
  const canSetGoogleCredentials = !!currentUser?.isGoogleAccount && !currentUser?.hasCredentials;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <Image source={brandLogo} style={styles.brandLogo} />
            <View>
              <Text style={styles.brandName}>fookit</Text>
              <Text style={styles.brandTagline}>Ăn ngon - Tiết kiệm - Sống khỏe</Text>
            </View>
          </View>

          <View style={styles.profileRow}>
            <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
              <Image source={avatarSource} style={styles.avatarImage} />
              <View style={styles.cameraBadge}>
                <Camera size={15} color={COLORS.white} />
              </View>
            </Pressable>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.email}>{handle}</Text>
              <Text style={styles.profileNote}>
                {form.cookingGoal || 'Cá nhân hóa gợi ý món ăn theo khẩu vị, ngân sách và mục tiêu của bạn.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ChefHat size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>{form.favoriteCuisine || 'Chưa chọn'}</Text>
            <Text style={styles.statLabel}>Ẩm thực thích</Text>
          </View>
          <View style={styles.statCard}>
            <Utensils size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>{form.dietaryPreference || 'Linh hoạt'}</Text>
            <Text style={styles.statLabel}>Chế độ ăn</Text>
          </View>
          <View style={styles.statCard}>
            <Wallet size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>{form.weeklyBudget || 'Chưa đặt'}</Text>
            <Text style={styles.statLabel}>Ngân sách</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
          <Input label="Tên hiển thị" value={form.fullName ?? form.name} onChangeText={fullName => setForm(current => ({ ...current, fullName, name: fullName }))} placeholder="Nguyễn Văn A" />
          <Input label="Tên đăng nhập" value={form.username} editable={false} placeholder="tuananh99" autoCapitalize="none" />
          <Input label="Email" value={form.email} editable={false} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Số điện thoại" value={form.phone} onChangeText={phone => setForm(current => ({ ...current, phone }))} placeholder="090..." keyboardType="phone-pad" />
          <Button title="Cập nhật hồ sơ" onPress={handleSaveAccount} loading={savingProfile} style={styles.saveBtn} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hồ sơ ẩm thực</Text>
          <Input label="Mục tiêu ăn uống" value={form.cookingGoal} onChangeText={cookingGoal => setForm(current => ({ ...current, cookingGoal }))} placeholder="Ăn healthy, tiết kiệm, tăng cơ..." />
          <Input label="Chế độ ăn" value={form.dietaryPreference} onChangeText={dietaryPreference => setForm(current => ({ ...current, dietaryPreference }))} placeholder="Eat clean, ít carb, ăn chay..." />
          <Input label="Dị ứng / món cần tránh" value={form.allergies} onChangeText={allergies => setForm(current => ({ ...current, allergies }))} placeholder="Hải sản, đậu phộng, cay..." />
          <Input label="Ẩm thực yêu thích" value={form.favoriteCuisine} onChangeText={favoriteCuisine => setForm(current => ({ ...current, favoriteCuisine }))} placeholder="Món Việt, món Hàn, món Nhật..." />
          <Input label="Ngân sách mỗi tuần" value={form.weeklyBudget} onChangeText={weeklyBudget => setForm(current => ({ ...current, weeklyBudget }))} placeholder="500k/tuần" />
          <Button title="Lưu hồ sơ ẩm thực" onPress={handleSaveFoodProfile} loading={savingFoodProfile} outline style={styles.saveBtn} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện ích fookit</Text>
          {QUICK_LINKS.map(item => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={item.label} style={styles.menuRow} onPress={() => openHomeTab(item.tab)}>
                <View style={styles.menuIconBox}>
                  <Icon size={18} color={COLORS.primary} />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <Text style={styles.menuArrow}>{'>'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bảo mật tài khoản</Text>
          <Input label="Mật khẩu hiện tại" value={currentPassword} onChangeText={setCurrentPassword} placeholder="OldPassword123" secureTextEntry />
          <Input label="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} placeholder="NewPassword123" secureTextEntry />
          <Input label="Xác nhận mật khẩu mới" value={confirmNewPassword} onChangeText={setConfirmNewPassword} placeholder="Nhập lại mật khẩu mới" secureTextEntry />
          <Button title="Đổi mật khẩu" onPress={handleChangePassword} loading={changingPassword} style={styles.securityBtn} />
          {canSetGoogleCredentials && (
            <Button title="Thiết lập tên đăng nhập/mật khẩu" onPress={() => router.push('/(auth)/set-credentials')} outline style={styles.securityBtn} />
          )}
          <Button title="Liên kết Google" onPress={handleLinkGoogle} loading={linkingGoogle} outline style={styles.securityBtn} />
          {isAdmin && <Button title="Bảng quản trị" onPress={() => router.push('/(tabs)/admin')} outline style={styles.securityBtn} />}
          <View style={styles.securityHint}>
            <ShieldCheck size={16} color={COLORS.primary} />
            <Text style={styles.securityHintText}>Tên hiển thị và mật khẩu được đồng bộ với tài khoản. Hồ sơ ẩm thực đang lưu trên thiết bị.</Text>
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
      <BottomNav activeTab="profile" onTabChange={handleBottomTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 120 },
  hero: { backgroundColor: COLORS.primaryDark, borderRadius: 8, padding: 18, marginBottom: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  brandLogo: { width: 42, height: 42, borderRadius: 8, marginRight: 10, borderWidth: 2, borderColor: COLORS.white },
  brandName: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  brandTagline: { color: '#E8F4DF', fontSize: 12, marginTop: 2 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { width: 88, height: 88 },
  avatarImage: { width: 88, height: 88, borderRadius: 8, backgroundColor: COLORS.white },
  cameraBadge: { position: 'absolute', right: -5, bottom: -5, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
  profileInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '900', color: COLORS.white },
  email: { fontSize: 14, color: '#E8F4DF', marginTop: 3 },
  profileNote: { color: '#E8F4DF', fontSize: 13, lineHeight: 19, marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, minHeight: 96, backgroundColor: COLORS.white, borderRadius: 8, padding: 11, borderWidth: 1, borderColor: COLORS.border },
  statValue: { color: COLORS.text, fontSize: 13, fontWeight: '800', marginTop: 8 },
  statLabel: { color: COLORS.textGray, fontSize: 11, marginTop: 3 },
  section: { backgroundColor: COLORS.white, borderRadius: 8, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text, marginBottom: 14 },
  saveBtn: { marginTop: 8 },
  securityBtn: { marginBottom: 10 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  menuIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuTextBox: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  menuDescription: { fontSize: 12, color: COLORS.textGray, marginTop: 3, lineHeight: 17 },
  menuArrow: { fontSize: 22, color: COLORS.textGray, marginLeft: 8 },
  securityHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surface, borderRadius: 8, padding: 10 },
  securityHintText: { flex: 1, color: COLORS.textGray, fontSize: 12, lineHeight: 17 },
  logoutBtn: { flexDirection: 'row', gap: 8, marginHorizontal: 2, padding: 14, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.error, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  logoutText: { color: COLORS.error, fontSize: 15, fontWeight: '800' },
});
