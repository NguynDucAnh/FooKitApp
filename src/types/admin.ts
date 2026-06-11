export interface AdminOverview {
  timestamp?: string;
  totalUsers: number;
  totalPremiumUsers: number;
  totalRevenue: number;
  totalSuggestionsGenerated: number;
  newUsersToday?: number;
  totalActiveAffiliateLinks?: number;
  isWorkerRunning?: boolean;
  lastAffiliateSync?: string | null;
  usersMetrics?: {
    totalUsers: number;
    premiumUsers: number;
    newUsersToday: number;
  };
  contentMetrics?: {
    mealsGeneratedToday: number;
    totalActiveAffiliateLinks: number;
  };
  systemHealth?: {
    isWorkerRunning: boolean;
    lastAffiliateSync: string | null;
  };
}

export interface ApiUsageItem {
  date: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

export interface AdminUser {
  id: string;
  Id?: string;
  userId?: string;
  UserId?: string;
  userID?: string;
  UserID?: string;
  user_id?: string;
  accountId?: string;
  AccountId?: string;
  applicationUserId?: string;
  ApplicationUserId?: string;
  identityUserId?: string;
  IdentityUserId?: string;
  aspNetUserId?: string;
  AspNetUserId?: string;
  username: string;
  email: string;
  fullName?: string;
  isPremium: boolean;
  is_premium?: boolean;
  isActive: boolean;
  is_active?: boolean;
}

export interface CreatedAdminUser {
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  is_active: boolean;
  subscription_status: string | null;
  created_at: string;
  avatar_url: string | null;
}

export interface AdminSubscriptionPlan {
  id: string;
  Id?: string;
  planId?: string;
  PlanId?: string;
  subscriptionPlanId?: string;
  SubscriptionPlanId?: string;
  planName: string;
  price: number;
  currency: string;
  durationInDays: number;
  features: string[];
  isActive: boolean;
}

export interface PaginatedResult<T> {
  totalCount: number;
  items: T[];
}

export interface GetUsersParams {
  page: number;
  size: number;
  search?: string;
}

export interface GetAdminPlansParams {
  page: number;
  size: number;
  search?: string;
  isActive?: boolean;
}

export interface GetApiUsageParams {
  start_date?: string;
  end_date?: string;
}

export interface GrantPremiumRequest {
  daysToGrant: number;
  reason: string;
}

export interface ToggleBanRequest {
  isActive: boolean;
}

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface CreateSubscriptionPlanRequest {
  planName: string;
  price: number;
  currency: string;
  durationInDays: number;
  features: string[];
}

export interface UpdateSubscriptionPlanRequest extends CreateSubscriptionPlanRequest {
  isActive: boolean;
}
