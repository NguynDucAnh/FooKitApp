export type SubscriptionPlanName = 'Free' | 'Premium' | string;

export interface MySubscription {
  isPremium: boolean;
  planName: SubscriptionPlanName;
  status?: 'Active' | 'Cancelled' | 'Expired' | string;
  expiresAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionPlan {
  planName: SubscriptionPlanName;
  price: number;
  description?: string;
  features?: string[];
  recommended?: boolean;
}

export type PaymentStatus = 'Success' | 'Pending' | 'Failed' | 'Refunded' | string;

export interface PaymentHistoryItem {
  id?: string;
  invoiceId?: string;
  status: PaymentStatus;
  amount: number;
  paymentDate?: string;
  createdAt?: string;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}
