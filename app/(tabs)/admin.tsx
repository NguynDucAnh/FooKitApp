import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Activity, ArrowLeft, Crown, Edit3, Link as LinkIcon, ShieldOff, Trash2, Users, Wallet } from 'lucide-react-native';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { COLORS } from '../../src/constants';
import { adminService } from '../../src/services/adminService';
import { AdminAffiliateLink, AdminOverview, AdminSubscriptionPlan, AdminUser, ApiUsageItem } from '../../src/types/admin';
import { getAuthErrorMessage } from '../../src/utils/authErrors';
import {
  ADMIN_COPY,
  getBanMismatchMessage,
  getBanMismatchTitle,
  getGrantPremiumNotFoundMessage,
} from '../../src/utils/userFacingCopy';
import { useAuth } from '../../src/hooks/useAuth';
import {
  type AdminDataSection,
  useAdminSectionLoading,
} from '../../src/features/admin/useAdminSectionLoading';

type AdminTab = AdminDataSection;

const PAGE_SIZE = 8;
const LOADING_LABELS: Record<AdminTab, string> = {
  overview: 'Đang tải tổng quan...',
  users: 'Đang tải danh sách người dùng...',
  plans: 'Đang tải danh sách gói cước...',
  affiliate: 'Đang tải liên kết tiếp thị...',
  usage: 'Đang tải số liệu sử dụng...',
};

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

const emptyAffiliateForm = {
  id: '',
  standardIngredientId: '',
  productName: '',
  productUrl: '',
  currentPriceAmount: '',
  currentPriceCurrency: 'VND',
  platform: 'Shopee',
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
  const [affiliateLinks, setAffiliateLinks] = useState<AdminAffiliateLink[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [plansTotal, setPlansTotal] = useState(0);
  const [affiliateTotal, setAffiliateTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [plansPage, setPlansPage] = useState(1);
  const [affiliatePage, setAffiliatePage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [planSearch, setPlanSearch] = useState('');
  const [planActiveFilter, setPlanActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [affiliateActiveFilter, setAffiliateActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [affiliateIngredientId, setAffiliateIngredientId] = useState('');
  const [syncIngredientId, setSyncIngredientId] = useState('');
  const [forceSyncAll, setForceSyncAll] = useState(false);
  const [usageStartDate, setUsageStartDate] = useState('');
  const [usageEndDate, setUsageEndDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [premiumPlanId, setPremiumPlanId] = useState('');
  const [premiumReason, setPremiumReason] = useState('Tặng quà event');
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [affiliateForm, setAffiliateForm] = useState(emptyAffiliateForm);
  const { loadingBySection, runWithSectionLoading } = useAdminSectionLoading();

  const userTotalPages = Math.max(1, Math.ceil(usersTotal / PAGE_SIZE));
  const planTotalPages = Math.max(1, Math.ceil(plansTotal / PAGE_SIZE));
  const affiliateTotalPages = Math.max(1, Math.ceil(affiliateTotal / PAGE_SIZE));

  const safeUsage = useMemo(() => Array.isArray(usage) ? usage : [], [usage]);

  const usageTotals = useMemo(() => safeUsage.reduce(
    (acc, item) => ({
      total: acc.total + item.totalRequests,
      success: acc.success + item.successfulRequests,
      failed: acc.failed + item.failedRequests,
    }),
    { total: 0, success: 0, failed: 0 }
  ), [safeUsage]);
  const premiumPlanOptions = useMemo(() => plans.filter(plan => plan.isActive), [plans]);
  const selectedPremiumPlan = useMemo(
    () => premiumPlanOptions.find(plan => plan.id === premiumPlanId),
    [premiumPlanId, premiumPlanOptions]
  );

  async function loadOverview() {
    return runWithSectionLoading('overview', async () => {
      try {
        setOverview(await adminService.getOverview());
      } catch (error) {
        Alert.alert('Không thể tải tổng quan', getAuthErrorMessage(error));
      }
    });
  }

  async function loadUsers(page = usersPage) {
    return runWithSectionLoading('users', async () => {
      try {
        const result = await adminService.getUsers({ page, size: PAGE_SIZE, search: userSearch.trim() || undefined });
        setUsers(result.items);
        setUsersTotal(result.totalCount);
        setUsersPage(page);
        return result;
      } catch (error) {
        Alert.alert('Không thể tải người dùng', getAuthErrorMessage(error));
      }
    });
  }

  async function loadPlans(page = plansPage) {
    return runWithSectionLoading('plans', async () => {
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
      }
    });
  }

  async function loadAffiliateLinks(page = affiliatePage) {
    return runWithSectionLoading('affiliate', async () => {
      try {
        const result = await adminService.getAffiliateLinks({
          page,
          size: PAGE_SIZE,
          is_active: affiliateActiveFilter === 'all' ? undefined : affiliateActiveFilter === 'active',
          ingredient_id: affiliateIngredientId.trim() || undefined,
        });
        setAffiliateLinks(result.items);
        setAffiliateTotal(result.totalCount);
        setAffiliatePage(page);
      } catch (error) {
        Alert.alert('Không thể tải liên kết tiếp thị', getAuthErrorMessage(error));
      }
    });
  }

  async function loadUsage() {
    return runWithSectionLoading('usage', async () => {
      try {
        setUsage(await adminService.getApiUsage({
          start_date: usageStartDate.trim() || undefined,
          end_date: usageEndDate.trim() || undefined,
        }));
      } catch (error) {
        Alert.alert('Không thể tải số liệu sử dụng', getAuthErrorMessage(error));
      }
    });
  }

  useEffect(() => {
    if (!currentUser?.isAdmin) return;

    loadOverview();
    loadUsers(1);
    loadPlans(1);
    loadAffiliateLinks(1);
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
          <Text style={styles.forbiddenText}>Tài khoản hiện tại không có quyền truy cập bảng quản trị.</Text>
          <Button title="Quay lại" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  async function handleCreateUser() {
    if (!userForm.username || !userForm.email || !userForm.fullName || !userForm.password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đủ tên đăng nhập, email, họ tên và mật khẩu.');
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
      Alert.alert(ADMIN_COPY.missingUserTitle, ADMIN_COPY.missingUserMessage);
      return;
    }

    const planId = premiumPlanId.trim();
    if (!planId) {
      Alert.alert('Thiếu gói Premium', 'Vui lòng nhập mã gói Premium muốn cấp cho người dùng.');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.grantPremium(user.id, { plan_id: planId, reason: premiumReason.trim() || null });
      await loadUsers(usersPage);
      Alert.alert('Đã cấp Premium', `${user.username || user.email || user.id} đã được cấp gói Premium.`);
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 404) {
        Alert.alert(
          'Không thể cấp Premium',
          getGrantPremiumNotFoundMessage(user.username || user.email || 'này')
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
      Alert.alert(ADMIN_COPY.missingUserTitle, ADMIN_COPY.missingUserMessage);
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
          getBanMismatchTitle(nextIsActive),
          getBanMismatchMessage(user.username || user.email || 'tài khoản này')
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
      Alert.alert(ADMIN_COPY.missingPlanTitle, ADMIN_COPY.missingPlanMessage);
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
    Alert.alert('Ngừng gói cước', `Chuyển gói ${plan.planName} sang ngưng hoạt động?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Ngừng gói',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await adminService.deletePlan(plan.id);
            await loadPlans(plansPage);
            Alert.alert('Đã ngừng gói cước', `${plan.planName} đã được chuyển sang trạng thái ngưng hoạt động.`);
          } catch (error) {
            Alert.alert('Không thể xóa gói', getAuthErrorMessage(error));
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }

  function startEditAffiliate(link: AdminAffiliateLink) {
    if (!link.id) {
      Alert.alert(ADMIN_COPY.missingAffiliateTitle, ADMIN_COPY.missingAffiliateMessage);
      return;
    }

    setAffiliateForm({
      id: link.id,
      standardIngredientId: link.ingredientId,
      productName: link.productName,
      productUrl: link.productUrl,
      currentPriceAmount: String(link.currentPriceAmount ?? link.price ?? 0),
      currentPriceCurrency: link.currentPriceCurrency ?? 'VND',
      platform: link.platform,
      isActive: link.isActive,
    });
  }

  async function handleSaveAffiliate() {
    if (!affiliateForm.productName || !affiliateForm.productUrl || !affiliateForm.currentPriceAmount || (!affiliateForm.id && !affiliateForm.standardIngredientId)) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đủ nguyên liệu, tên sản phẩm, URL và giá.');
      return;
    }

    const price = Number(affiliateForm.currentPriceAmount);
    if (!price || price <= 0) {
      Alert.alert('Giá không hợp lệ', 'Giá liên kết tiếp thị phải lớn hơn 0.');
      return;
    }

    setActionLoading(true);
    try {
      if (affiliateForm.id) {
        await adminService.updateAffiliateLink(affiliateForm.id, {
          productName: affiliateForm.productName.trim(),
          productUrl: affiliateForm.productUrl.trim(),
          currentPriceAmount: price,
          currentPriceCurrency: affiliateForm.currentPriceCurrency.trim() || 'VND',
          platform: affiliateForm.platform.trim() || 'Shopee',
          isActive: affiliateForm.isActive,
        });
      } else {
        await adminService.createAffiliateLink({
          standardIngredientId: affiliateForm.standardIngredientId.trim(),
          productName: affiliateForm.productName.trim(),
          productUrl: affiliateForm.productUrl.trim(),
          currentPriceAmount: price,
          currentPriceCurrency: affiliateForm.currentPriceCurrency.trim() || 'VND',
          platform: affiliateForm.platform.trim() || 'Shopee',
        });
      }
      setAffiliateForm(emptyAffiliateForm);
      await loadAffiliateLinks(1);
      Alert.alert('Đã lưu liên kết tiếp thị', 'Thông tin liên kết tiếp thị đã được cập nhật.');
    } catch (error) {
      Alert.alert('Không thể lưu liên kết tiếp thị', getAuthErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleAffiliate(link: AdminAffiliateLink) {
    const nextIsActive = !link.isActive;
    setActionLoading(true);
    try {
      await adminService.toggleAffiliateLink(link.id, { isActive: nextIsActive });
      await loadAffiliateLinks(affiliatePage);
      Alert.alert(nextIsActive ? 'Đã bật liên kết' : 'Đã tắt liên kết', `${link.productName} hiện ${nextIsActive ? 'đang hoạt động' : 'đã tạm tắt'}.`);
    } catch (error) {
      Alert.alert('Không thể đổi trạng thái liên kết', getAuthErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSyncAffiliateLinks() {
    setActionLoading(true);
    try {
      await adminService.syncAffiliateLinks({
        forceSyncAll,
        targetIngredientId: syncIngredientId.trim() || undefined,
      });
      Alert.alert('Đã bắt đầu đồng bộ', 'Yêu cầu đồng bộ liên kết tiếp thị đã được tiếp nhận.');
    } catch (error) {
      Alert.alert('Không thể đồng bộ liên kết tiếp thị', getAuthErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'users', label: 'Người dùng' },
    { id: 'plans', label: 'Gói cước' },
    { id: 'affiliate', label: 'Liên kết' },
    { id: 'usage', label: 'Mức sử dụng' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            accessibilityHint="Trở về màn hình trước"
          >
            <ArrowLeft size={20} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Fookit Admin</Text>
            <Text style={styles.title}>Bảng điều khiển</Text>
            <Text style={styles.subtitle}>Quản lý người dùng, doanh thu, mức sử dụng và gói thuê bao.</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: activeTab === tab.id }}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loadingBySection[activeTab] && (
          <Text
            style={styles.loadingText}
            accessibilityRole="progressbar"
            accessibilityLiveRegion="polite"
          >
            {LOADING_LABELS[activeTab]}
          </Text>
        )}

        {activeTab === 'overview' && (
          <View>
            <View style={styles.metricsGrid}>
              <Metric icon={Users} label="Người dùng" value={(overview?.totalUsers ?? 0).toLocaleString('vi-VN')} />
              <Metric icon={Crown} label="Premium" value={(overview?.totalPremiumUsers ?? 0).toLocaleString('vi-VN')} />
              <Metric icon={Wallet} label="Người dùng mới hôm nay" value={(overview?.newUsersToday ?? 0).toLocaleString('vi-VN')} />
              <Metric icon={Activity} label="Món tạo hôm nay" value={(overview?.totalSuggestionsGenerated ?? 0).toLocaleString('vi-VN')} />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sức khỏe hệ thống</Text>
              <Text style={styles.cardSub}>Tiến trình nền: {overview?.isWorkerRunning ? 'Đang chạy' : 'Không hoạt động'}</Text>
              <Text style={styles.cardSub}>Liên kết đang hoạt động: {(overview?.totalActiveAffiliateLinks ?? 0).toLocaleString('vi-VN')}</Text>
              <Text style={styles.cardSub}>Đồng bộ gần nhất: {overview?.lastAffiliateSync ? new Date(overview.lastAffiliateSync).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}</Text>
              <Text style={styles.cardSub}>Cập nhật: {overview?.timestamp ? new Date(overview.timestamp).toLocaleString('vi-VN') : 'Vừa tải'}</Text>
            </View>
            <Button title="Tải lại tổng quan" onPress={loadOverview} loading={loadingBySection.overview} outline />
          </View>
        )}

        {activeTab === 'users' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tìm kiếm người dùng</Text>
              <Input label="Từ khóa" value={userSearch} onChangeText={setUserSearch} placeholder="Tên đăng nhập, email, họ tên..." autoCapitalize="none" />
              <Button title="Tìm kiếm" onPress={() => loadUsers(1)} loading={loadingBySection.users} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tạo người dùng</Text>
              <Input label="Tên đăng nhập" value={userForm.username} onChangeText={username => setUserForm(current => ({ ...current, username }))} placeholder="nguoidung123" autoCapitalize="none" />
              <Input label="Email" value={userForm.email} onChangeText={email => setUserForm(current => ({ ...current, email }))} placeholder="newuser@gmail.com" autoCapitalize="none" keyboardType="email-address" />
              <Input label="Họ tên" value={userForm.fullName} onChangeText={fullName => setUserForm(current => ({ ...current, fullName }))} placeholder="Nguyễn Văn A" />
              <Input label="Mật khẩu" value={userForm.password} onChangeText={password => setUserForm(current => ({ ...current, password }))} placeholder="Password123" secureTextEntry />
              <Button title="Tạo tài khoản" onPress={handleCreateUser} loading={actionLoading} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cấp Premium nhanh</Text>
              <Text style={styles.cardSub}>Chọn gói Premium muốn cấp, sau đó bấm Cấp Premium trên người dùng cần cấp.</Text>
              <View style={styles.planOptionWrap}>
                {premiumPlanOptions.length > 0 ? premiumPlanOptions.map(plan => {
                  const selected = premiumPlanId === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[styles.planOption, selected && styles.planOptionActive]}
                      onPress={() => setPremiumPlanId(plan.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Chọn gói ${plan.planName}`}
                      accessibilityState={{ selected }}
                    >
                      <Text style={[styles.planOptionTitle, selected && styles.planOptionTitleActive]}>{plan.planName}</Text>
                      <Text style={[styles.planOptionMeta, selected && styles.planOptionMetaActive]}>{formatMoney(plan.price)} / {plan.durationInDays} ngày</Text>
                    </TouchableOpacity>
                  );
                }) : (
                  <Text style={styles.cardSub}>Chưa tải được gói đang hoạt động. Vui lòng sang mục Gói cước hoặc tải lại danh sách gói.</Text>
                )}
              </View>
              {selectedPremiumPlan && <Text style={styles.cardSub}>Đang chọn: {selectedPremiumPlan.planName} - Mã: {selectedPremiumPlan.id}</Text>}
              <Input label="Lý do" value={premiumReason} onChangeText={setPremiumReason} />
            </View>

            <Text style={styles.listTitle}>Danh sách người dùng ({usersTotal})</Text>
            {users.map(user => (
              <View key={user.id || user.username} style={styles.userCard}>
                <View style={styles.cardTop}>
                  {user.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.userAvatar} />
                  ) : (
                    <View style={styles.userAvatarFallback}>
                      <Text style={styles.userAvatarText}>{(user.fullName || user.username || user.email || '?').slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{user.fullName || user.username || user.email || 'Chưa có tên'}</Text>
                    <Text style={styles.cardSub}>@{user.username || 'chưa có tên đăng nhập'} - {user.email || 'chưa có email'}</Text>
                    <Text style={styles.cardSub}>Mã tài khoản: {user.id}</Text>
                  </View>
                  <StatusPill active={user.isActive} />
                </View>
                <Text style={styles.cardMeta}>
                  {user.isPremium
                    ? `Premium${user.subscriptionStatus?.planName ? ` - ${user.subscriptionStatus.planName}` : ''}${user.subscriptionStatus?.endDate ? ` - hết hạn ${new Date(user.subscriptionStatus.endDate).toLocaleDateString('vi-VN')}` : ''}`
                    : 'Miễn phí'}
                </Text>
                <Text style={styles.cardSub}>Ngày tạo: {user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.smallAction}
                    onPress={() => handleGrantPremium(user)}
                    accessibilityRole="button"
                    accessibilityLabel={`Cấp Premium cho ${user.fullName || user.username || user.email || 'tài khoản này'}`}
                  >
                    <Crown size={16} color={COLORS.primary} />
                    <Text style={styles.smallActionText}>Cấp Premium</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallAction}
                    onPress={() => handleToggleBan(user)}
                    accessibilityRole="button"
                    accessibilityLabel={`${user.isActive ? 'Cấm' : 'Bỏ cấm'} ${user.fullName || user.username || user.email || 'tài khoản này'}`}
                  >
                    <ShieldOff size={16} color={user.isActive ? COLORS.error : COLORS.primary} />
                    <Text style={[styles.smallActionText, user.isActive && styles.dangerText]}>{user.isActive ? 'Cấm' : 'Bỏ cấm'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Pager page={usersPage} totalPages={userTotalPages} loading={loadingBySection.users} onPrev={() => loadUsers(Math.max(1, usersPage - 1))} onNext={() => loadUsers(Math.min(userTotalPages, usersPage + 1))} />
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
                <TouchableOpacity
                  style={styles.toggleLine}
                  onPress={() => setPlanForm(current => ({ ...current, isActive: !current.isActive }))}
                  accessibilityRole="switch"
                  accessibilityLabel="Trạng thái hoạt động của gói"
                  accessibilityState={{ checked: planForm.isActive }}
                >
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
                  <TouchableOpacity
                    key={item}
                    style={[styles.filterChip, planActiveFilter === item && styles.filterChipActive]}
                    onPress={() => setPlanActiveFilter(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item === 'all' ? 'Tất cả' : item === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    accessibilityState={{ selected: planActiveFilter === item }}
                  >
                    <Text style={[styles.filterText, planActiveFilter === item && styles.filterTextActive]}>{item === 'all' ? 'Tất cả' : item === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Áp dụng lọc" onPress={() => loadPlans(1)} loading={loadingBySection.plans} outline />
            </View>

            <Text style={styles.listTitle}>Danh sách gói ({plansTotal})</Text>
            {plans.map(plan => (
              <View key={plan.id || plan.planName} style={styles.userCard}>
                <View style={styles.cardTop}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{plan.planName}</Text>
                    <Text style={styles.cardSub}>{formatMoney(plan.price)} / {plan.durationInDays} ngày</Text>
                    <Text style={styles.cardSub}>Mã gói: {plan.id}</Text>
                  </View>
                  <StatusPill active={plan.isActive} />
                </View>
                <Text style={styles.cardMeta}>{plan.features.join(' - ') || 'Chưa có mô tả tính năng'}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.smallAction}
                    onPress={() => startEditPlan(plan)}
                    accessibilityRole="button"
                    accessibilityLabel={`Sửa gói ${plan.planName}`}
                  >
                    <Edit3 size={16} color={COLORS.primary} />
                    <Text style={styles.smallActionText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallAction}
                    onPress={() => handleDeletePlan(plan)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ngừng gói ${plan.planName}`}
                  >
                    <Trash2 size={16} color={COLORS.error} />
                    <Text style={[styles.smallActionText, styles.dangerText]}>Ngừng gói</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Pager page={plansPage} totalPages={planTotalPages} loading={loadingBySection.plans} onPrev={() => loadPlans(Math.max(1, plansPage - 1))} onNext={() => loadPlans(Math.min(planTotalPages, plansPage + 1))} />
          </View>
        )}

        {activeTab === 'affiliate' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{affiliateForm.id ? 'Cập nhật liên kết tiếp thị' : 'Thêm liên kết tiếp thị'}</Text>
              {!affiliateForm.id && (
                <Input label="Mã nguyên liệu chuẩn" value={affiliateForm.standardIngredientId} onChangeText={standardIngredientId => setAffiliateForm(current => ({ ...current, standardIngredientId }))} placeholder="b3fc-2c963f66afa6" autoCapitalize="none" />
              )}
              <Input label="Tên sản phẩm" value={affiliateForm.productName} onChangeText={productName => setAffiliateForm(current => ({ ...current, productName }))} placeholder="Dầu Oliu Extra Virgin" />
              <Input label="URL sản phẩm" value={affiliateForm.productUrl} onChangeText={productUrl => setAffiliateForm(current => ({ ...current, productUrl }))} placeholder="https://shopee.vn/..." autoCapitalize="none" />
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Input label="Giá" value={affiliateForm.currentPriceAmount} onChangeText={currentPriceAmount => setAffiliateForm(current => ({ ...current, currentPriceAmount }))} keyboardType="numeric" />
                </View>
                <View style={styles.formCol}>
                  <Input label="Tiền tệ" value={affiliateForm.currentPriceCurrency} onChangeText={currentPriceCurrency => setAffiliateForm(current => ({ ...current, currentPriceCurrency }))} />
                </View>
              </View>
              <Input label="Nền tảng" value={affiliateForm.platform} onChangeText={platform => setAffiliateForm(current => ({ ...current, platform }))} placeholder="Shopee" />
              {affiliateForm.id && (
                <TouchableOpacity
                  style={styles.toggleLine}
                  onPress={() => setAffiliateForm(current => ({ ...current, isActive: !current.isActive }))}
                  accessibilityRole="switch"
                  accessibilityLabel="Trạng thái liên kết tiếp thị"
                  accessibilityState={{ checked: affiliateForm.isActive }}
                >
                  <Text style={styles.toggleText}>{affiliateForm.isActive ? 'Đang hoạt động' : 'Đang tắt'}</Text>
                </TouchableOpacity>
              )}
              <Button title={affiliateForm.id ? 'Lưu liên kết' : 'Tạo liên kết'} onPress={handleSaveAffiliate} loading={actionLoading} />
              {affiliateForm.id && <Button title="Hủy chỉnh sửa" onPress={() => setAffiliateForm(emptyAffiliateForm)} outline style={styles.mt10} />}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đồng bộ liên kết tiếp thị</Text>
              <Input label="Mã nguyên liệu cần đồng bộ" value={syncIngredientId} onChangeText={setSyncIngredientId} placeholder="Để trống nếu không cần chỉ định" autoCapitalize="none" />
              <TouchableOpacity
                style={styles.toggleLine}
                onPress={() => setForceSyncAll(current => !current)}
                accessibilityRole="switch"
                accessibilityLabel="Đồng bộ lại toàn bộ liên kết"
                accessibilityState={{ checked: forceSyncAll }}
              >
                <Text style={styles.toggleText}>{forceSyncAll ? 'Đồng bộ lại toàn bộ: Bật' : 'Đồng bộ lại toàn bộ: Tắt'}</Text>
              </TouchableOpacity>
              <Button title="Bắt đầu đồng bộ" onPress={handleSyncAffiliateLinks} loading={actionLoading} outline />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lọc liên kết tiếp thị</Text>
              <Input label="Mã nguyên liệu" value={affiliateIngredientId} onChangeText={setAffiliateIngredientId} placeholder="Nhập mã nguyên liệu" autoCapitalize="none" />
              <View style={styles.filterRow}>
                {(['all', 'active', 'inactive'] as const).map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.filterChip, affiliateActiveFilter === item && styles.filterChipActive]}
                    onPress={() => setAffiliateActiveFilter(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item === 'all' ? 'Tất cả' : item === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    accessibilityState={{ selected: affiliateActiveFilter === item }}
                  >
                    <Text style={[styles.filterText, affiliateActiveFilter === item && styles.filterTextActive]}>{item === 'all' ? 'Tất cả' : item === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Áp dụng lọc" onPress={() => loadAffiliateLinks(1)} loading={loadingBySection.affiliate} outline />
            </View>

            <Text style={styles.listTitle}>Liên kết tiếp thị ({affiliateTotal})</Text>
            {affiliateLinks.map(link => (
              <View key={link.id || link.productUrl} style={styles.userCard}>
                <View style={styles.cardTop}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{link.productName}</Text>
                    <Text style={styles.cardSub}>{link.platform} - {formatMoney(link.price || link.currentPriceAmount)} - Mã nguyên liệu: {link.ingredientId}</Text>
                    <Text style={styles.cardSub} numberOfLines={1}>{link.productUrl}</Text>
                  </View>
                  <StatusPill active={link.isActive} />
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.smallAction}
                    onPress={() => startEditAffiliate(link)}
                    accessibilityRole="button"
                    accessibilityLabel={`Sửa liên kết ${link.productName}`}
                  >
                    <Edit3 size={16} color={COLORS.primary} />
                    <Text style={styles.smallActionText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallAction}
                    onPress={() => handleToggleAffiliate(link)}
                    accessibilityRole="button"
                    accessibilityLabel={`${link.isActive ? 'Tắt' : 'Bật'} liên kết ${link.productName}`}
                  >
                    <LinkIcon size={16} color={link.isActive ? COLORS.error : COLORS.primary} />
                    <Text style={[styles.smallActionText, link.isActive && styles.dangerText]}>{link.isActive ? 'Tắt' : 'Bật'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Pager page={affiliatePage} totalPages={affiliateTotalPages} loading={loadingBySection.affiliate} onPrev={() => loadAffiliateLinks(Math.max(1, affiliatePage - 1))} onNext={() => loadAffiliateLinks(Math.min(affiliateTotalPages, affiliatePage + 1))} />
          </View>
        )}

        {activeTab === 'usage' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoảng thời gian</Text>
              <Input label="Từ ngày" value={usageStartDate} onChangeText={setUsageStartDate} placeholder="2026-06-01T00:00:00Z" autoCapitalize="none" />
              <Input label="Đến ngày" value={usageEndDate} onChangeText={setUsageEndDate} placeholder="2026-06-10T23:59:59Z" autoCapitalize="none" />
              <Button title="Tải số liệu sử dụng" onPress={loadUsage} loading={loadingBySection.usage} />
            </View>
            <View style={styles.metricsGrid}>
              <Metric icon={Activity} label="Yêu cầu" value={usageTotals.total.toLocaleString('vi-VN')} />
              <Metric icon={ShieldOff} label="Không thành công" value={usageTotals.failed.toLocaleString('vi-VN')} />
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
      <Text style={[styles.statusText, active ? styles.statusTextActive : styles.statusTextInactive]}>{active ? 'Đang hoạt động' : 'Ngưng hoạt động'}</Text>
    </View>
  );
}

function Pager({ page, totalPages, loading, onPrev, onNext }: { page: number; totalPages: number; loading: boolean; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={styles.pager}>
      <Button title="Trước" onPress={onPrev} disabled={loading || page <= 1} outline style={styles.pagerBtn} />
      <Text style={styles.pagerText}>{page}/{totalPages}</Text>
      <Button title="Sau" onPress={onNext} disabled={loading || page >= totalPages} outline style={styles.pagerBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 32 },
  header: { backgroundColor: COLORS.primaryDark, borderRadius: 8, padding: 18, marginBottom: 14, flexDirection: 'row', gap: 12 },
  backButton: { width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  eyebrow: { color: '#FFE0B8', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#E8F4DF', fontSize: 13, lineHeight: 19, marginTop: 6 },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
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
  userAvatar: { width: 42, height: 42, borderRadius: 8, backgroundColor: COLORS.surface },
  userAvatarFallback: { width: 42, height: 42, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: COLORS.primary, fontSize: 16, fontWeight: '900' },
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
  smallAction: { minHeight: 44, flexDirection: 'row', gap: 6, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  smallActionText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
  dangerText: { color: COLORS.error },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8, marginBottom: 16 },
  pagerBtn: { minWidth: 92, paddingVertical: 10 },
  pagerText: { color: COLORS.text, fontWeight: '900' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { flex: 1, minHeight: 44, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textGray, fontWeight: '800', fontSize: 12 },
  filterTextActive: { color: COLORS.white },
  planOptionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 12 },
  planOption: { minWidth: '47%', minHeight: 44, flexGrow: 1, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, borderRadius: 8, padding: 10 },
  planOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  planOptionTitle: { color: COLORS.text, fontSize: 13, fontWeight: '900' },
  planOptionTitleActive: { color: COLORS.white },
  planOptionMeta: { color: COLORS.textGray, fontSize: 11, marginTop: 4, fontWeight: '700' },
  planOptionMetaActive: { color: COLORS.white },
  toggleLine: { minHeight: 44, backgroundColor: COLORS.surface, borderRadius: 8, padding: 12, marginBottom: 12, justifyContent: 'center' },
  toggleText: { color: COLORS.primary, fontWeight: '900', textAlign: 'center' },
  mt10: { marginTop: 10 },
  usageRow: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, marginBottom: 10 },
  forbidden: { flex: 1, padding: 24, justifyContent: 'center' },
  forbiddenTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  forbiddenText: { color: COLORS.textGray, fontSize: 14, lineHeight: 20, marginBottom: 18 },
});
