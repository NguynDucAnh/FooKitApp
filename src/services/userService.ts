import axiosClient from './axiosClient';
import {
  ApiEnvelope,
} from '../types/subscription';
import {
  ChangePasswordRequest,
  DietaryProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types/auth';
import { getStringField, unwrapApiResponse } from '../utils/apiNormalize';

const BASE_URL = '/api/Users';

function normalizeProfile(profile: UpdateProfileResponse): UpdateProfileResponse {
  return {
    ...profile,
    id: getStringField(profile, ['id', 'Id', 'userId', 'user_id']) ?? profile.id,
    username: getStringField(profile, ['username', 'userName', 'UserName']) ?? profile.username,
    email: getStringField(profile, ['email', 'Email']) ?? profile.email,
    fullName: getStringField(profile, ['fullName', 'FullName', 'full_name', 'name']) ?? profile.fullName,
    avatarUrl: getStringField(profile, ['avatarUrl', 'AvatarUrl', 'avatar_url']) ?? profile.avatarUrl,
  };
}

function getFileName(uri: string) {
  const name = uri.split('/').pop()?.split('?')[0];
  return name && name.includes('.') ? name : `avatar-${Date.now()}.jpg`;
}

function getMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'heic') return 'image/heic';
  return 'image/jpeg';
}

export const userService = {
  async updateProfile(payload: UpdateProfileRequest) {
    const formData = new FormData();
    formData.append('FullName', payload.fullName);

    if (payload.avatarUri && !payload.avatarUri.startsWith('http')) {
      const fileName = getFileName(payload.avatarUri);
      formData.append('AvatarFile', {
        uri: payload.avatarUri,
        name: fileName,
        type: getMimeType(fileName),
      } as any);
    }

    const response = await axiosClient.put<ApiEnvelope<UpdateProfileResponse> | UpdateProfileResponse>(
      `${BASE_URL}/profile`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: [data => data],
      }
    );
    return normalizeProfile(unwrapApiResponse<UpdateProfileResponse>(response));
  },

  async changePassword(payload: ChangePasswordRequest) {
    const response = await axiosClient.put<ApiEnvelope<null> | null>(`${BASE_URL}/password`, payload);
    return response.data;
  },

  async getDietaryProfile() {
    const response = await axiosClient.get<ApiEnvelope<DietaryProfile> | DietaryProfile>(`${BASE_URL}/me/dietary-profile`);
    const payload = unwrapApiResponse<DietaryProfile>(response);
    return {
      diets: Array.isArray(payload?.diets) ? payload.diets : [],
      allergies: Array.isArray(payload?.allergies) ? payload.allergies : [],
      favoriteCuisines: Array.isArray(payload?.favoriteCuisines) ? payload.favoriteCuisines : [],
      weeklyBudget: typeof payload?.weeklyBudget === 'number' ? payload.weeklyBudget : 0,
    };
  },

  async updateDietaryProfile(payload: DietaryProfile) {
    const response = await axiosClient.put<ApiEnvelope<null> | null>(`${BASE_URL}/me/dietary-profile`, {
      diets: payload.diets,
      allergies: payload.allergies,
      favoriteCuisines: payload.favoriteCuisines,
      weeklyBudget: payload.weeklyBudget,
    });
    return response.data;
  },
};
