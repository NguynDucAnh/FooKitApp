import axiosClient from './axiosClient';
import {
  ApiEnvelope,
  CreatePaymentRequest,
  CreatePaymentResponse,
  VNPayReturnResponse,
} from '../types/subscription';

const BASE_URL = '/api/Payments';

function unwrap<T>(response: { data: ApiEnvelope<T> | T }) {
  const payload = response.data as ApiEnvelope<T>;
  return typeof payload === 'object' && payload !== null && 'data' in payload
    ? payload.data
    : response.data as T;
}

export const paymentService = {
  async createPayment(payload: CreatePaymentRequest) {
    const response = await axiosClient.post<ApiEnvelope<CreatePaymentResponse> | CreatePaymentResponse>(
      `${BASE_URL}/create`,
      payload
    );
    const payment = unwrap<CreatePaymentResponse>(response);
    return {
      ...payment,
      paymentUrl: payment.paymentUrl?.trim(),
    };
  },

  async verifyVNPayReturn(queryString: string) {
    const response = await axiosClient.get<ApiEnvelope<VNPayReturnResponse> | VNPayReturnResponse>(
      `${BASE_URL}/vnpay-return?${queryString}`
    );
    return unwrap<VNPayReturnResponse>(response);
  },
};
