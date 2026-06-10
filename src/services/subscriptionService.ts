import axiosClient from './axiosClient';
import {
  ApiEnvelope,
  MySubscription,
  PaymentHistoryItem,
  SubscriptionPlan,
} from '../types/subscription';

const BASE_URL = '/api/Subscriptions';

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

function normalizePlan(plan: SubscriptionPlan) {
  return {
    ...plan,
    id: getStringField(plan, ['id', 'Id', 'ID', 'planId', 'PlanId', 'planID', 'subscriptionPlanId', 'SubscriptionPlanId']) ?? plan.id,
    planId: getStringField(plan, ['planId', 'PlanId', 'planID', 'id', 'Id', 'ID', 'subscriptionPlanId', 'SubscriptionPlanId']) ?? plan.planId,
  };
}

export const subscriptionService = {
  async getMySubscription() {
    const response = await axiosClient.get<ApiEnvelope<MySubscription>>(`${BASE_URL}/my-subscription`);
    return unwrap<MySubscription>(response);
  },

  async getPlans() {
    const response = await axiosClient.get<ApiEnvelope<SubscriptionPlan[]>>(`${BASE_URL}/plans`);
    return unwrap<SubscriptionPlan[]>(response).map(normalizePlan);
  },

  async getPaymentHistory() {
    const response = await axiosClient.get<ApiEnvelope<PaymentHistoryItem[]>>(`${BASE_URL}/payment-history`);
    return unwrap<PaymentHistoryItem[]>(response);
  },

  async cancelSubscription() {
    const response = await axiosClient.post<ApiEnvelope<null>>(`${BASE_URL}/cancel`, {});
    return response.data;
  },
};
