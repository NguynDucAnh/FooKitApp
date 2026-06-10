import axiosClient from './axiosClient';
import {
  ApiEnvelope,
} from '../types/subscription';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types/auth';

const BASE_URL = '/api/Users';

function unwrap<T>(response: { data: ApiEnvelope<T> | T }) {
  const payload = response.data as ApiEnvelope<T>;
  return typeof payload === 'object' && payload !== null && 'data' in payload
    ? payload.data
    : response.data as T;
}

export const userService = {
  async updateProfile(payload: UpdateProfileRequest) {
    const response = await axiosClient.put<ApiEnvelope<UpdateProfileResponse> | UpdateProfileResponse>(
      `${BASE_URL}/profile`,
      payload
    );
    return unwrap<UpdateProfileResponse>(response);
  },

  async changePassword(payload: ChangePasswordRequest) {
    const response = await axiosClient.put<ApiEnvelope<null> | null>(`${BASE_URL}/password`, payload);
    return response.data;
  },
};
