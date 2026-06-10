import axiosClient from './axiosClient';
import { ApiEnvelope } from '../types/subscription';
import {
  AdminOverview,
  AdminSubscriptionPlan,
  AdminUser,
  ApiUsageItem,
  CreateAdminUserRequest,
  CreatedAdminUser,
  CreateSubscriptionPlanRequest,
  GetAdminPlansParams,
  GetApiUsageParams,
  GetUsersParams,
  GrantPremiumRequest,
  PaginatedResult,
  ToggleBanRequest,
  UpdateSubscriptionPlanRequest,
} from '../types/admin';

function unwrap<T>(response: { data: ApiEnvelope<T> | T }) {
  const payload = response.data as ApiEnvelope<T>;
  return typeof payload === 'object' && payload !== null && 'data' in payload
    ? payload.data
    : response.data as T;
}

function getStringField(source: unknown, keys: string[]) {
  if (!source || typeof source !== 'object') return undefined;

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  return undefined;
}

function getBooleanField(source: unknown, keys: string[]) {
  if (!source || typeof source !== 'object') return undefined;

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }
  }

  return undefined;
}

function getNumberField(source: unknown, keys: string[]) {
  if (!source || typeof source !== 'object') return undefined;

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }

  return undefined;
}

function getArrayField<T>(source: unknown, keys: string[]) {
  if (!source || typeof source !== 'object') return undefined;

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value as T[];
  }

  return undefined;
}

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
  return {
    ...user,
    id: getStringField(user, ['id', 'Id', 'ID', 'userId', 'UserId', 'user_id']) ?? user.id,
    fullName: getStringField(user, ['fullName', 'FullName', 'full_name']) ?? user.fullName,
    isActive: getBooleanField(user, ['isActive', 'IsActive', 'is_active']) ?? false,
    isPremium: getBooleanField(user, ['isPremium', 'IsPremium', 'is_premium']) ?? false,
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

export const adminService = {
  async getOverview() {
    const response = await axiosClient.get<ApiEnvelope<AdminOverview> | AdminOverview>('/api/Admin/overview');
    const payload = unwrap<AdminOverview>(response);

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
    const payload = unwrap<ApiUsageItem[] | { items?: ApiUsageItem[] }>(response);
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.items)) return payload.items;
    return [];
  },

  async getUsers(params: GetUsersParams) {
    const response = await axiosClient.get<ApiEnvelope<PaginatedResult<AdminUser>> | PaginatedResult<AdminUser>>('/api/Admin/users', { params });
    return normalizeUsersResult(unwrap<PaginatedResult<AdminUser>>(response));
  },

  async grantPremium(userId: string, payload: GrantPremiumRequest) {
    const response = await axiosClient.put<ApiEnvelope<null> | null>(`/api/Admin/users/${userId}/grant-premium`, payload);
    return response.data;
  },

  async toggleBan(userId: string, payload: ToggleBanRequest) {
    const response = await axiosClient.put<ApiEnvelope<null> | null>(`/api/Admin/users/${userId}/toggle-ban`, payload);
    return response.data;
  },

  async createUser(payload: CreateAdminUserRequest) {
    const response = await axiosClient.post<ApiEnvelope<CreatedAdminUser> | CreatedAdminUser>('/api/Admin/users', payload);
    return unwrap<CreatedAdminUser>(response);
  },

  async getPlans(params: GetAdminPlansParams) {
    const response = await axiosClient.get<ApiEnvelope<PaginatedResult<AdminSubscriptionPlan>> | PaginatedResult<AdminSubscriptionPlan>>(
      '/api/Subscriptions/admin/plans',
      { params }
    );
    return normalizePlansResult(unwrap<PaginatedResult<AdminSubscriptionPlan>>(response));
  },

  async createPlan(payload: CreateSubscriptionPlanRequest) {
    const response = await axiosClient.post<ApiEnvelope<AdminSubscriptionPlan> | AdminSubscriptionPlan>('/api/Subscriptions/admin/plans', payload);
    return normalizePlan(unwrap<AdminSubscriptionPlan>(response));
  },

  async updatePlan(id: string, payload: UpdateSubscriptionPlanRequest) {
    try {
      const response = await axiosClient.put<ApiEnvelope<AdminSubscriptionPlan> | AdminSubscriptionPlan>(`/api/Subscriptions/admin/plans/${id}`, payload);
      return normalizePlan(unwrap<AdminSubscriptionPlan>(response));
    } catch (error: any) {
      if (error?.response?.status !== 404) throw error;

      const response = await axiosClient.put<ApiEnvelope<AdminSubscriptionPlan> | AdminSubscriptionPlan>(`/api/Admin/subscription-plans/${id}`, payload);
      return normalizePlan(unwrap<AdminSubscriptionPlan>(response));
    }
  },

  async deletePlan(id: string) {
    const response = await axiosClient.delete<ApiEnvelope<null> | null>(`/api/Subscriptions/admin/plans/${id}`);
    return response.data;
  },
};
