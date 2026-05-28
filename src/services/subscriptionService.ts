import axiosClient from './axiosClient';
import {
  ApiEnvelope,
  MySubscription,
  PaymentHistoryItem,
  SubscriptionPlan,
} from '../types/subscription';

const BASE_URL = '/api/Subscription';

function unwrap<T>(response: { data: ApiEnvelope<T> | T }) {
  const payload = response.data as ApiEnvelope<T>;
  return typeof payload === 'object' && payload !== null && 'data' in payload
    ? payload.data
    : response.data as T;
}

export const subscriptionService = {
  async getMySubscription() {
    const response = await axiosClient.get<ApiEnvelope<MySubscription>>(`${BASE_URL}/my-subscription`);
    return unwrap<MySubscription>(response);
  },

  async getPlans() {
    const response = await axiosClient.get<ApiEnvelope<SubscriptionPlan[]>>(`${BASE_URL}/plans`);
    return unwrap<SubscriptionPlan[]>(response);
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
