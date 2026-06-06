export type SubscriptionPlanName = 'Free' | 'Premium' | string;

export interface MySubscription {
  isPremium: boolean;
  planName: SubscriptionPlanName;
  status?: 'Active' | 'Cancelled' | 'Expired' | string;
  startDate?: string;
  endDate?: string;
  daysRemaining?: number;
  expiresAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionPlan {
  id?: string;
  Id?: string;
  ID?: string;
  planId?: string;
  PlanId?: string;
  planID?: string;
  subscriptionPlanId?: string;
  SubscriptionPlanId?: string;
  planName: SubscriptionPlanName;
  price: number;
  currency?: string;
  durationInDays?: number;
  description?: string;
  features?: string[];
  recommended?: boolean;
}

export type PaymentStatus = 'Success' | 'Pending' | 'Failed' | 'Refunded' | string;

export interface PaymentHistoryItem {
  id?: string;
  invoiceId?: string;
  planName?: string;
  status: PaymentStatus;
  amount: number;
  transactionRef?: string;
  paymentDate?: string;
  createdAt?: string;
  paidAt?: string;
}

export interface CreatePaymentRequest {
  planId: string;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
}

export interface VNPayReturnResponse {
  success: boolean;
  transactionRef?: string;
  message: string;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}
