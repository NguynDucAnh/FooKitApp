import axiosClient from './axiosClient';
import {
  ApiEnvelope,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PayOSReturnResponse,
} from '../types/subscription';

const BASE_URL = '/api/Payments';

function unwrap<T>(response: { data: ApiEnvelope<T> | T }) {
  const payload = response.data as ApiEnvelope<T>;
  return typeof payload === 'object' && payload !== null && 'data' in payload
    ? payload.data
    : response.data as T;
}

function extractPaymentUrl(value: unknown, depth = 0): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (!value || typeof value !== 'object' || depth > 2) return undefined;

  const record = value as Record<string, unknown>;
  const directKeys = [
    'checkoutUrl',
    'checkout_url',
    'CheckoutUrl',
    'paymentUrl',
    'payment_url',
    'PaymentUrl',
    'paymentURL',
    'url',
    'redirectUrl',
  ];
  for (const key of directKeys) {
    const url = record[key];
    if (typeof url === 'string' && url.trim()) return url.trim();
  }

  return extractPaymentUrl(record.data, depth + 1);
}

export const paymentService = {
  async createPayment(payload: CreatePaymentRequest) {
    const response = await axiosClient.post<ApiEnvelope<CreatePaymentResponse> | CreatePaymentResponse>(
      `${BASE_URL}/create`,
      payload
    );
    const payment = unwrap<CreatePaymentResponse>(response);
    const checkoutUrl = extractPaymentUrl(payment) ?? extractPaymentUrl(response.data);
    return {
      ...payment,
      checkoutUrl,
      paymentUrl: checkoutUrl,
    };
  },

  async verifyPayOSReturn(orderCode: string | number) {
    const response = await axiosClient.get<ApiEnvelope<PayOSReturnResponse> | PayOSReturnResponse>(
      `${BASE_URL}/payos-return`,
      { params: { orderCode } }
    );
    return unwrap<PayOSReturnResponse>(response);
  },
};
