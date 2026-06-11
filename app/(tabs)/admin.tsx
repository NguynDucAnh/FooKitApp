import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Activity, ArrowLeft, Crown, Edit3, ShieldOff, Trash2, Users, Wallet } from 'lucide-react-native';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { COLORS } from '../../src/constants';
import { adminService } from '../../src/services/adminService';
import { AdminOverview, AdminSubscriptionPlan, AdminUser, ApiUsageItem } from '../../src/types/admin';
import { getAuthErrorMessage } from '../../src/utils/authErrors';
import { useAuth } from '../../src/hooks/useAuth';

type AdminTab = 'overview' | 'users' | 'plans' | 'usage';

const PAGE_SIZE = 8;

const emptyUserForm = {
  username: '',
  email: '',
  fullName: '',
  password: '',
};

const emptyPlanForm = {
  id: '',
  planName: '',
  price: '79000',
  currency: 'VND',
  durationInDays: '30',
  features: '',
  isActive: true,
};

function formatMoney(value?: number) {
  return `${(value ?? 0).toLocaleString('vi-VN')} đ`;
}

function parseFeatures(value: string) {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export default function AdminDashboardScreen() {
  const { currentUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [usage, setUsage] = useState<ApiUsageItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [plansTotal, setPlansTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [plansPage, setPlansPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [planSearch, setPlanSearch] = useState('');
  const [planActiveFilter, setPlanActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [usageStartDate, setUsageStartDate] = useState('');
  const [usageEndDate, setUsageEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [premiumDays, setPremiumDays] = useState('30');
  const [premiumReason, setPremiumReason] = useState('Tặng quà event');
  const [planForm, setPlanForm] = useState(emptyPlanForm);

  const userTotalPages = Math.max(1, Math.ceil(usersTotal / PAGE_SIZE));
  const planTotalPages = Math.max(1, Math.ceil(plansTotal / PAGE_SIZE));

  const safeUsage = Array.isArray(usage) ? usage : [];

  const usageTotals = useMemo(() => safeUsage.reduce(
    (acc, item) => ({
      total: acc.total + item.totalRequests,
      success: acc.success + item.successfulRequests,
      failed: acc.failed + item.failedRequests,
    }),
    { total: 0, success: 0, failed: 0 }
  ), [safeUsage]);

  async function loadOverview() {
    setLoading(true);
    try {
      setOverview(await adminService.getOverview());
    } catch (error) {
      Alert.alert('Không thể tải tổng quan', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(page = usersPage) {
    setLoading(true);
    try {
      const result = await adminService.getUsers({ page, size: PAGE_SIZE, search: userSearch.trim() || undefined });
      setUsers(result.items);
      setUsersTotal(result.totalCount);
      setUsersPage(page);
      return result;
    } catch (error) {
      Alert.alert('Không thể tải người dùng', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadPlans(page = plansPage) {
    setLoading(true);
    try {
      const result = await adminService.getPlans({
        page,
        size: PAGE_SIZE,
        search: planSearch.trim() || undefined,
        isActive: planActiveFilter === 'all' ? undefined : planActiveFilter === 'active',
      });
      setPlans(result.items);
      setPlansTotal(result.totalCount);
      setPlansPage(page);
    } catch (error) {
      Alert.alert('Không thể tải gói cước', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadUsage() {
    setLoading(true);
    try {
      setUsage(await adminService.getApiUsage({
        start_date: usageStartDate.trim() || undefined,
        end_date: usageEndDate.trim() || undefined,
      }));
    } catch (error) {
      Alert.alert('Không thể tải thống kê API', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUser?.isAdmin) return;

    loadOverview();
    loadUsers(1);
    loadPlans(1);
    loadUsage();
  }, [currentUser?.isAdmin]);

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.forbidden}>
          <Text style={styles.forbiddenTitle}>Đang kiểm tra quyền</Text>
          <Text style={styles.forbiddenText}>Fookit đang xác thực vai trò quản trị của tài khoản.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser?.isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.forbidden}>
          <Text style={styles.forbiddenTitle}>Không có quyền quản trị</Text>
          <Text style={styles.forbiddenText}>Tài khoản hiện tại không có role Admin để truy cập bảng quản trị.</Text>
          <Button title="Quay lại" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  async function handleCreateUser() {
    if (!userForm.username || !userForm.email || !userForm.fullName || !userForm.password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đủ username, email, họ tên và mật khẩu.');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.createUser(userForm);
      setUserForm(emptyUserForm);
      await loadUsers(1);
      Alert.alert('Đã tạo người dùng', 'Tài khoản mới đã được tạo thành công.');
    } catch (error) {
      Alert.alert('Không thể tạo người dùng', getAuthErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleGrantPremium(user: AdminUser) {
    if (!user.id) {
      Alert.alert('Thiếu mã người dùng', 'Không tìm thấy userId trong dữ liệu trả về từ API.');
      return;
    }

    const daysToGrant = Number(premiumDays);
    if (!daysToGrant || daysToGrant <= 0) {
      Alert.alert('Số ngày không hợp lệ', 'Vui lòng nhập số ngày Premium lớn hơn 0.');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.grantPremium(user.id, { daysToGrant, reason: premiumReason.trim() || 'Admin cấp gói' });
      await loadUsers(usersPage);
      Alert.alert('Đã cấp Premium', `${user.username} đã được cấp ${daysToGrant} ngày Premium.`);
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 404) {
        Alert.alert(
          'Không tìm thấy người dùng',
          `API grant-premium trả 404 cho userId: ${user.id}\nUsername: ${user.username}\nVui lòng kiểm tra BE có tìm user theo đúng id này không.`
        );
        return;
      }
      Alert.alert('Không thể cấp Premium', getAuthErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleBan(user: AdminUser) {
    if (!user.id) {
      Alert.alert('Thiếu mã người dùng', 'Không tìm thấy userId trong dữ liệu trả về từ API.');
      return;
    }

    const nextIsActive = !user.isActive;
    setActionLoading(true);
    try {
      await adminService.toggleBan(user.id, { isActive: nextIsActive });
      setUsers(current => current.map(item => item.id === user.id ? { ...item, isActive: nextIsActive } : item));

      const refreshedUsers = await loadUsers(usersPage);
      if (!refreshedUsers) return;

      const refreshedUser = refreshedUsers?.items.find(item => item.id === user.id);
      const didChange = refreshedUser ? refreshedUser.isActive === nextIsActive : false;

      if (!didChange) {
        Alert.alert(
          nextIsActive ? 'BE chưa bỏ cấm tài khoản' : 'BE chưa cấm tài khoản',
          `${user.username} đã gọi API thành công nhưng dữ liệu tải lại vẫn là ${refreshedUser?.isActive ? 'Active' : 'Inactive'}. Vui lòng kiểm tra xử lý toggle-ban ở backend.`
        );
        return;
      }

      Alert.alert(
        nextIsActive ? 'Đã bỏ cấm tài khoản' : 'Đã cấm tài khoản',
        `${user.username} hiện ${nextIsActive ? 'có thể đăng nhập và sử dụng ứng dụng' : 'đã bị tạm khóa khỏi hệ thống'}.`
      );
    } catch (error) {
      Alert.alert('Không thể đổi trạng thái', getAuthErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  function startEditPlan(plan: AdminSubscriptionPlan) {
    if (!plan.id) {
      Alert.alert('Thiếu mã gói', 'Không tìm thấy id của gói cước trong dữ liệu trả về từ API.');
      return;
    }

    setPlanForm({
      id: plan.id,
      planName: plan.planName,
      price: String(plan.price),
      currency: plan.currency,
      durationInDays: String(plan.durationInDays),
      features: plan.features.join(', '),
      isActive: plan.isActive,
    });
  }

  async function handleSavePlan() {
    if (!planForm.planName || !planForm.price || !planForm.durationInDays) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên gói, giá và thời hạn.');
      return;
    }

    const payload = {
      planName: planForm.planName.trim(),
      price: Number(planForm.price),
      currency: planForm.currency.trim() || 'VND',
      durationInDays: Number(planForm.durationInDays),
      features: parseFeatures(planForm.features),
    };

    if (!payload.price || !payload.durationInDays) {
      Alert.alert('Dữ liệu không hợp lệ', 'Giá và số ngày phải là số lớn hơn 0.');
      return;
    }

    setActionLoading(true);
    try {
      if (planForm.id) {
        await adminService.updatePlan(planForm.id, { ...payload, isActive: planForm.isActive });
      } else {
        await adminService.createPlan(payload);
      }
      setPlanForm(emptyPlanForm);
      await loadPlans(1);
      Alert.alert('Đã lưu gói cước', 'Thông tin gói cước đã được cập nhật.');
    } catch (error) {
      Alert.alert('Không thể lưu gói cước', getAuthErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePlan(plan: AdminSubscriptionPlan) {
    Alert.alert('Xóa mềm gói cước', `Chuyển gói ${plan.planName} sang ngưng hoạt động?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa mềm',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await adminService.deletePlan(plan.id);
            await loadPlans(plansPage);
            Alert.alert('Đã xóa mềm gói cước', `${plan.planName} đã được chuyển sang trạng thái ngưng hoạt động.`);
          } catch (error) {
            Alert.alert('Không thể xóa gói', getAuthErrorMessage(error));
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'users', label: 'Người dùng' },
    { id: 'plans', label: 'Gói cước' },
    { id: 'usage', label: 'API' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Fookit Admin</Text>
            <Text style={styles.title}>Bảng điều khiển</Text>
            <Text style={styles.subtitle}>Quản lý người dùng, doanh thu, API và gói thuê bao.</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {tabs.map(tab => (
            <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => setActiveTab(tab.id)}>
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>}

        {activeTab === 'overview' && (
          <View>
            <View style={styles.metricsGrid}>
              <Metric icon={Users} label="Người dùng" value={(overview?.totalUsers ?? 0).toLocaleString('vi-VN')} />
              <Metric icon={Crown} label="Premium" value={(overview?.totalPremiumUsers ?? 0).toLocaleString('vi-VN')} />
              <Metric icon={Wallet} label="User mới hôm nay" value={(overview?.newUsersToday ?? 0).toLocaleString('vi-VN')} />
              <Metric icon={Activity} label="Món tạo hôm nay" value={(overview?.totalSuggestionsGenerated ?? 0).toLocaleString('vi-VN')} />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sức khỏe hệ thống</Text>
              <Text style={styles.cardSub}>Worker: {overview?.isWorkerRunning ? 'Đang chạy' : 'Không hoạt động'}</Text>
              <Text style={styles.cardSub}>Affiliate links active: {(overview?.totalActiveAffiliateLinks ?? 0).toLocaleString('vi-VN')}</Text>
              <Text style={styles.cardSub}>Sync gần nhất: {overview?.lastAffiliateSync ? new Date(overview.lastAffiliateSync).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}</Text>
              <Text style={styles.cardSub}>Cập nhật: {overview?.timestamp ? new Date(overview.timestamp).toLocaleString('vi-VN') : 'Vừa tải'}</Text>
            </View>
            <Button title="Tải lại tổng quan" onPress={loadOverview} outline />
          </View>
        )}

        {activeTab === 'users' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tìm kiếm người dùng</Text>
              <Input label="Từ khóa" value={userSearch} onChangeText={setUserSearch} placeholder="Username, email, họ tên..." autoCapitalize="none" />
              <Button title="Tìm kiếm" onPress={() => loadUsers(1)} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tạo người dùng</Text>
              <Input label="Username" value={userForm.username} onChangeText={username => setUserForm(current => ({ ...current, username }))} placeholder="newuser123" autoCapitalize="none" />
              <Input label="Email" value={userForm.email} onChangeText={email => setUserForm(current => ({ ...current, email }))} placeholder="newuser@gmail.com" autoCapitalize="none" keyboardType="email-address" />
              <Input label="Họ tên" value={userForm.fullName} onChangeText={fullName => setUserForm(current => ({ ...current, fullName }))} placeholder="New User Name" />
              <Input label="Mật khẩu" value={userForm.password} onChangeText={password => setUserForm(current => ({ ...current, password }))} placeholder="Password123" secureTextEntry />
              <Button title="Tạo tài khoản" onPress={handleCreateUser} loading={actionLoading} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cấp Premium nhanh</Text>
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Input label="Số ngày" value={premiumDays} onChangeText={setPremiumDays} keyboardType="number-pad" />
                </View>
                <View style={styles.formCol}>
                  <Input label="Lý do" value={premiumReason} onChangeText={setPremiumReason} />
                </View>
              </View>
            </View>

            <Text style={styles.listTitle}>Danh sách người dùng ({usersTotal})</Text>
            {users.map(user => (
              <View key={user.id || user.username} style={styles.userCard}>
                <View style={styles.cardTop}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{user.fullName || user.username}</Text>
                    <Text style={styles.cardSub}>{user.username} - {user.email}</Text>
                  </View>
                  <StatusPill active={user.isActive} />
                </View>
                <Text style={styles.cardMeta}>{user.isPremium ? 'Premium' : 'Free'}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.smallAction} onPress={() => handleGrantPremium(user)}>
                    <Crown size={16} color={COLORS.primary} />
                    <Text style={styles.smallActionText}>Cấp Premium</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallAction} onPress={() => handleToggleBan(user)}>
                    <ShieldOff size={16} color={user.isActive ? COLORS.error : COLORS.primary} />
                    <Text style={[styles.smallActionText, user.isActive && styles.dangerText]}>{user.isActive ? 'Cấm' : 'Bỏ cấm'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Pager page={usersPage} totalPages={userTotalPages} onPrev={() => loadUsers(Math.max(1, usersPage - 1))} onNext={() => loadUsers(Math.min(userTotalPages, usersPage + 1))} />
          </View>
        )}

        {activeTab === 'plans' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{planForm.id ? 'Cập nhật gói cước' : 'Thêm gói cước'}</Text>
              <Input label="Tên gói" value={planForm.planName} onChangeText={planName => setPlanForm(current => ({ ...current, planName }))} placeholder="Premium Plus" />
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Input label="Giá" value={planForm.price} onChangeText={price => setPlanForm(current => ({ ...current, price }))} keyboardType="numeric" />
                </View>
                <View style={styles.formCol}>
                  <Input label="Số ngày" value={planForm.durationInDays} onChangeText={durationInDays => setPlanForm(current => ({ ...current, durationInDays }))} keyboardType="number-pad" />
                </View>
              </View>
              <Input label="Tiền tệ" value={planForm.currency} onChangeText={currency => setPlanForm(current => ({ ...current, currency }))} />
              <Input label="Tính năng" value={planForm.features} onChangeText={features => setPlanForm(current => ({ ...current, features }))} placeholder="Gợi ý không giới hạn, Không quảng cáo" multiline />
              {planForm.id && (
                <TouchableOpacity style={styles.toggleLine} onPress={() => setPlanForm(current => ({ ...current, isActive: !current.isActive }))}>
                  <Text style={styles.toggleText}>{planForm.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}</Text>
                </TouchableOpacity>
              )}
              <Button title={planForm.id ? 'Lưu thay đổi' : 'Tạo gói'} onPress={handleSavePlan} loading={actionLoading} />
              {planForm.id && <Button title="Hủy chỉnh sửa" onPress={() => setPlanForm(emptyPlanForm)} outline style={styles.mt10} />}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lọc gói cước</Text>
              <Input label="Tìm kiếm" value={planSearch} onChangeText={setPlanSearch} placeholder="Premium..." />
              <View style={styles.filterRow}>
                {(['all', 'active', 'inactive'] as const).map(item => (
                  <TouchableOpacity key={item} style={[styles.filterChip, planActiveFilter === item && styles.filterChipActive]} onPress={() => setPlanActiveFilter(item)}>
                    <Text style={[styles.filterText, planActiveFilter === item && styles.filterTextActive]}>{item === 'all' ? 'Tất cả' : item === 'active' ? 'Active' : 'Inactive'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Áp dụng lọc" onPress={() => loadPlans(1)} outline />
            </View>

            <Text style={styles.listTitle}>Danh sách gói ({plansTotal})</Text>
            {plans.map(plan => (
              <View key={plan.id || plan.planName} style={styles.userCard}>
                <View style={styles.cardTop}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{plan.planName}</Text>
                    <Text style={styles.cardSub}>{formatMoney(plan.price)} / {plan.durationInDays} ngày</Text>
                  </View>
                  <StatusPill active={plan.isActive} />
                </View>
                <Text style={styles.cardMeta}>{plan.features.join(' - ') || 'Chưa có mô tả tính năng'}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.smallAction} onPress={() => startEditPlan(plan)}>
                    <Edit3 size={16} color={COLORS.primary} />
                    <Text style={styles.smallActionText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallAction} onPress={() => handleDeletePlan(plan)}>
                    <Trash2 size={16} color={COLORS.error} />
                    <Text style={[styles.smallActionText, styles.dangerText]}>Xóa mềm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Pager page={plansPage} totalPages={planTotalPages} onPrev={() => loadPlans(Math.max(1, plansPage - 1))} onNext={() => loadPlans(Math.min(planTotalPages, plansPage + 1))} />
          </View>
        )}

        {activeTab === 'usage' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoảng thời gian</Text>
              <Input label="Từ ngày" value={usageStartDate} onChangeText={setUsageStartDate} placeholder="2026-06-01T00:00:00Z" autoCapitalize="none" />
              <Input label="Đến ngày" value={usageEndDate} onChangeText={setUsageEndDate} placeholder="2026-06-10T23:59:59Z" autoCapitalize="none" />
              <Button title="Tải thống kê API" onPress={loadUsage} />
            </View>
            <View style={styles.metricsGrid}>
              <Metric icon={Activity} label="Requests" value={usageTotals.total.toLocaleString('vi-VN')} />
              <Metric icon={ShieldOff} label="Failed" value={usageTotals.failed.toLocaleString('vi-VN')} />
            </View>
            {safeUsage.map(item => (
              <View key={item.date} style={styles.usageRow}>
                <Text style={styles.cardTitle}>{new Date(item.date).toLocaleDateString('vi-VN')}</Text>
                <Text style={styles.cardSub}>Tổng: {item.totalRequests} - Thành công: {item.successfulRequests} - Lỗi: {item.failedRequests}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<any>; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Icon size={20} color={COLORS.primary} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <View style={[styles.statusPill, active ? styles.statusActive : styles.statusInactive]}>
      <Text style={[styles.statusText, active ? styles.statusTextActive : styles.statusTextInactive]}>{active ? 'Active' : 'Inactive'}</Text>
    </View>
  );
}

function Pager({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={styles.pager}>
      <Button title="Trước" onPress={onPrev} disabled={page <= 1} outline style={styles.pagerBtn} />
      <Text style={styles.pagerText}>{page}/{totalPages}</Text>
      <Button title="Sau" onPress={onNext} disabled={page >= totalPages} outline style={styles.pagerBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 32 },
  header: { backgroundColor: COLORS.primaryDark, borderRadius: 8, padding: 18, marginBottom: 14, flexDirection: 'row', gap: 12 },
  backButton: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  eyebrow: { color: '#FFE0B8', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#E8F4DF', fontSize: 13, lineHeight: 19, marginTop: 6 },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: { flex: 1, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textGray, fontSize: 12, fontWeight: '800' },
  tabTextActive: { color: COLORS.white },
  loadingText: { color: COLORS.textGray, marginBottom: 10 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  metric: { width: '48%', backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  metricValue: { color: COLORS.text, fontSize: 22, fontWeight: '900', marginTop: 10 },
  metricLabel: { color: COLORS.textGray, fontSize: 12, marginTop: 3 },
  section: { backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 14 },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900', marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 10 },
  formCol: { flex: 1 },
  listTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900', marginBottom: 10 },
  userCard: { backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  flex: { flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  cardSub: { color: COLORS.textGray, fontSize: 12, lineHeight: 18, marginTop: 3 },
  cardMeta: { color: COLORS.textGray, marginTop: 10, lineHeight: 19 },
  statusPill: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  statusActive: { backgroundColor: COLORS.surface },
  statusInactive: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 12, fontWeight: '900' },
  statusTextActive: { color: COLORS.primary },
  statusTextInactive: { color: COLORS.error },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  smallAction: { flexDirection: 'row', gap: 6, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  smallActionText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
  dangerText: { color: COLORS.error },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8, marginBottom: 16 },
  pagerBtn: { minWidth: 92, paddingVertical: 10 },
  pagerText: { color: COLORS.text, fontWeight: '900' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textGray, fontWeight: '800', fontSize: 12 },
  filterTextActive: { color: COLORS.white },
  toggleLine: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 12, marginBottom: 12 },
  toggleText: { color: COLORS.primary, fontWeight: '900', textAlign: 'center' },
  mt10: { marginTop: 10 },
  usageRow: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, marginBottom: 10 },
  forbidden: { flex: 1, padding: 24, justifyContent: 'center' },
  forbiddenTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  forbiddenText: { color: COLORS.textGray, fontSize: 14, lineHeight: 20, marginBottom: 18 },
});
