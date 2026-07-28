import axiosClient from './axiosClient';
import {
  ApiEnvelope,
  MySubscription,
  PaymentHistoryItem,
  SubscriptionPlan,
} from '../types/subscription';
import { getStringField, unwrapApiResponse } from '../utils/apiNormalize';

const BASE_URL = '/api/Subscriptions';

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
    return unwrapApiResponse<MySubscription>(response);
  },

  async getPlans() {
    const response = await axiosClient.get<ApiEnvelope<SubscriptionPlan[]>>(`${BASE_URL}/plans`);
    return unwrapApiResponse<SubscriptionPlan[]>(response).map(normalizePlan);
  },

  async getPaymentHistory() {
    const response = await axiosClient.get<ApiEnvelope<PaymentHistoryItem[]>>(`${BASE_URL}/payment-history`);
    return unwrapApiResponse<PaymentHistoryItem[]>(response);
  },

  async cancelSubscription() {
    const response = await axiosClient.post<ApiEnvelope<null>>(`${BASE_URL}/cancel`, {});
    return response.data;
  },
};
