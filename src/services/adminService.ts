import axiosClient from './axiosClient';
import { ApiEnvelope } from '../types/subscription';
import {
  AdminOverview,
  AdminAffiliateLink,
  AdminSubscriptionPlan,
  AdminUser,
  ApiUsageItem,
  CreateAffiliateLinkRequest,
  CreateAdminUserRequest,
  CreatedAdminUser,
  CreateSubscriptionPlanRequest,
  GetAffiliateLinksParams,
  GetAdminPlansParams,
  GetApiUsageParams,
  GetUsersParams,
  GrantPremiumRequest,
  PaginatedResult,
  SyncAffiliateLinksRequest,
  ToggleAffiliateLinkRequest,
  ToggleBanRequest,
  UpdateAffiliateLinkRequest,
  UpdateSubscriptionPlanRequest,
} from '../types/admin';
import {
  getArrayField,
  getBooleanField,
  getNumberField,
  getStringField,
  unwrapApiResponse,
} from '../utils/apiNormalize';

function normalizePlan(plan: AdminSubscriptionPlan): AdminSubscriptionPlan {
  return {
    ...plan,
    id: getStringField(plan, ['id', 'Id', 'ID', 'planId', 'PlanId', 'subscriptionPlanId', 'SubscriptionPlanId']) ?? plan.id,
  };
}

function normalizePlansResult(result: PaginatedResult<AdminSubscriptionPlan>) {
  const items = getArrayField<AdminSubscriptionPlan>(result, ['items', 'Items', 'data', 'Data']) ?? [];
  return {
    ...result,
    totalCount: getNumberField(result, ['totalCount', 'TotalCount', 'total_count']) ?? items.length,
    items: items.map(normalizePlan),
  };
}

function normalizeUser(user: AdminUser): AdminUser {
  const subscriptionStatus = user.subscriptionStatus ?? user.subscription_status ?? null;
  const isPremium = getBooleanField(user, ['isPremium', 'IsPremium', 'is_premium'])
    ?? getBooleanField(subscriptionStatus, ['isPremium', 'is_premium'])
    ?? false;

  return {
    ...user,
    id: getStringField(user, [
      'id',
      'Id',
      'ID',
      'userId',
      'UserId',
      'userID',
      'UserID',
      'user_id',
      'accountId',
      'AccountId',
      'applicationUserId',
      'ApplicationUserId',
      'identityUserId',
      'IdentityUserId',
      'aspNetUserId',
      'AspNetUserId',
    ]) ?? user.id,
    fullName: getStringField(user, ['fullName', 'FullName', 'full_name']) ?? user.fullName ?? null,
    email: getStringField(user, ['email', 'Email']) ?? user.email ?? null,
    isActive: getBooleanField(user, ['isActive', 'IsActive', 'is_active']) ?? false,
    isPremium,
    subscriptionStatus: subscriptionStatus ? {
      ...subscriptionStatus,
      isPremium: getBooleanField(subscriptionStatus, ['isPremium', 'is_premium']) ?? isPremium,
      planName: getStringField(subscriptionStatus, ['planName', 'plan_name']),
      endDate: getStringField(subscriptionStatus, ['endDate', 'end_date']),
    } : null,
    createdAt: getStringField(user, ['createdAt', 'created_at']),
    avatarUrl: getStringField(user, ['avatarUrl', 'avatar_url']) ?? null,
  };
}

function normalizeUsersResult(result: PaginatedResult<AdminUser>) {
  const items = getArrayField<AdminUser>(result, ['items', 'Items', 'data', 'Data']) ?? [];
  return {
    ...result,
    totalCount: getNumberField(result, ['totalCount', 'TotalCount', 'total_count']) ?? items.length,
    items: items.map(normalizeUser),
  };
}

function normalizeAffiliateLink(link: AdminAffiliateLink): AdminAffiliateLink {
  return {
    ...link,
    id: getStringField(link, ['id', 'Id', 'ID']) ?? link.id,
    ingredientId: getStringField(link, ['ingredientId', 'IngredientId', 'ingredient_id', 'standardIngredientId', 'StandardIngredientId']) ?? link.ingredientId,
    productName: getStringField(link, ['productName', 'ProductName']) ?? link.productName,
    productUrl: getStringField(link, ['productUrl', 'ProductUrl']) ?? link.productUrl,
    price: getNumberField(link, ['price', 'Price', 'currentPriceAmount', 'CurrentPriceAmount']) ?? link.price ?? 0,
    currentPriceAmount: getNumberField(link, ['currentPriceAmount', 'CurrentPriceAmount', 'price', 'Price']) ?? link.currentPriceAmount,
    currentPriceCurrency: getStringField(link, ['currentPriceCurrency', 'CurrentPriceCurrency']) ?? link.currentPriceCurrency ?? 'VND',
    platform: getStringField(link, ['platform', 'Platform']) ?? link.platform,
    isActive: getBooleanField(link, ['isActive', 'IsActive', 'is_active']) ?? false,
  };
}

function normalizeAffiliateLinksResult(result: PaginatedResult<AdminAffiliateLink>) {
  const items = getArrayField<AdminAffiliateLink>(result, ['items', 'Items', 'data', 'Data']) ?? [];
  return {
    ...result,
    totalCount: getNumberField(result, ['totalCount', 'TotalCount', 'total_count']) ?? items.length,
    items: items.map(normalizeAffiliateLink),
  };
}

export const adminService = {
  async getOverview() {
    const response = await axiosClient.get<ApiEnvelope<AdminOverview> | AdminOverview>('/api/Admin/overview');
    const payload = unwrapApiResponse<AdminOverview>(response);

    return {
      ...payload,
      totalUsers: payload.totalUsers ?? payload.usersMetrics?.totalUsers ?? 0,
      totalPremiumUsers: payload.totalPremiumUsers ?? payload.usersMetrics?.premiumUsers ?? 0,
      totalRevenue: payload.totalRevenue ?? 0,
      totalSuggestionsGenerated: payload.totalSuggestionsGenerated ?? payload.contentMetrics?.mealsGeneratedToday ?? 0,
      newUsersToday: payload.newUsersToday ?? payload.usersMetrics?.newUsersToday ?? 0,
      totalActiveAffiliateLinks: payload.totalActiveAffiliateLinks ?? payload.contentMetrics?.totalActiveAffiliateLinks ?? 0,
      isWorkerRunning: payload.isWorkerRunning ?? payload.systemHealth?.isWorkerRunning,
      lastAffiliateSync: payload.lastAffiliateSync ?? payload.systemHealth?.lastAffiliateSync,
    };
  },

  async getApiUsage(params: GetApiUsageParams) {
    const response = await axiosClient.get<ApiEnvelope<ApiUsageItem[]> | ApiUsageItem[] | { items?: ApiUsageItem[] }>('/api/Admin/api-usage', { params });
    const payload = unwrapApiResponse<ApiUsageItem[] | { items?: ApiUsageItem[] }>(response);
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.items)) return payload.items;
    return [];
  },

  async getUsers(params: GetUsersParams) {
    const response = await axiosClient.get<ApiEnvelope<PaginatedResult<AdminUser>> | PaginatedResult<AdminUser>>('/api/Admin/users', { params });
    return normalizeUsersResult(unwrapApiResponse<PaginatedResult<AdminUser>>(response));
  },

  async grantPremium(userId: string, payload: GrantPremiumRequest) {
    const response = await axiosClient.put<ApiEnvelope<null> | null>(`/api/Admin/users/${userId}/grant-premium`, {
      plan_id: payload.plan_id,
      reason: payload.reason ?? null,
    });
    return response.data;
  },

  async toggleBan(userId: string, payload: ToggleBanRequest) {
    const response = await axiosClient.put<ApiEnvelope<null> | null>(`/api/Admin/users/${userId}/toggle-ban`, payload);
    return response.data;
  },

  async createUser(payload: CreateAdminUserRequest) {
    const response = await axiosClient.post<ApiEnvelope<CreatedAdminUser> | CreatedAdminUser>('/api/Admin/users', payload);
    return unwrapApiResponse<CreatedAdminUser>(response);
  },

  async getPlans(params: GetAdminPlansParams) {
    const response = await axiosClient.get<ApiEnvelope<PaginatedResult<AdminSubscriptionPlan>> | PaginatedResult<AdminSubscriptionPlan>>(
      '/api/Subscriptions/admin/plans',
      { params }
    );
    return normalizePlansResult(unwrapApiResponse<PaginatedResult<AdminSubscriptionPlan>>(response));
  },

  async createPlan(payload: CreateSubscriptionPlanRequest) {
    const response = await axiosClient.post<ApiEnvelope<AdminSubscriptionPlan> | AdminSubscriptionPlan>('/api/Subscriptions/admin/plans', payload);
    return normalizePlan(unwrapApiResponse<AdminSubscriptionPlan>(response));
  },

  async updatePlan(id: string, payload: UpdateSubscriptionPlanRequest) {
    try {
      const response = await axiosClient.put<ApiEnvelope<AdminSubscriptionPlan> | AdminSubscriptionPlan>(`/api/Subscriptions/admin/plans/${id}`, payload);
      return normalizePlan(unwrapApiResponse<AdminSubscriptionPlan>(response));
    } catch (error: any) {
      if (error?.response?.status !== 404) throw error;

      const response = await axiosClient.put<ApiEnvelope<AdminSubscriptionPlan> | AdminSubscriptionPlan>(`/api/Admin/subscription-plans/${id}`, payload);
      return normalizePlan(unwrapApiResponse<AdminSubscriptionPlan>(response));
    }
  },

  async deletePlan(id: string) {
    const response = await axiosClient.delete<ApiEnvelope<null> | null>(`/api/Subscriptions/admin/plans/${id}`);
    return response.data;
  },

  async getAffiliateLinks(params: GetAffiliateLinksParams) {
    const response = await axiosClient.get<ApiEnvelope<PaginatedResult<AdminAffiliateLink>> | PaginatedResult<AdminAffiliateLink>>(
      '/api/AffiliateLinks',
      { params }
    );
    return normalizeAffiliateLinksResult(unwrapApiResponse<PaginatedResult<AdminAffiliateLink>>(response));
  },

  async createAffiliateLink(payload: CreateAffiliateLinkRequest) {
    const response = await axiosClient.post<ApiEnvelope<AdminAffiliateLink> | AdminAffiliateLink>('/api/AffiliateLinks', payload);
    return normalizeAffiliateLink(unwrapApiResponse<AdminAffiliateLink>(response));
  },

  async updateAffiliateLink(id: string, payload: UpdateAffiliateLinkRequest) {
    const response = await axiosClient.put<ApiEnvelope<AdminAffiliateLink> | AdminAffiliateLink>(`/api/AffiliateLinks/${id}`, payload);
    return normalizeAffiliateLink(unwrapApiResponse<AdminAffiliateLink>(response));
  },

  async toggleAffiliateLink(id: string, payload: ToggleAffiliateLinkRequest) {
    const response = await axiosClient.put<ApiEnvelope<null> | null>(`/api/AffiliateLinks/${id}/toggle-status`, payload);
    return response.data;
  },

  async syncAffiliateLinks(payload: SyncAffiliateLinksRequest) {
    const response = await axiosClient.post<ApiEnvelope<null> | null>('/api/AffiliateLinks/sync', payload);
    return response.data;
  },
};
