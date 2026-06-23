import axiosClient from './axiosClient';
import { ApiEnvelope } from '../types/subscription';
import { MealSuggestionsResponse } from '../types/homepage';

function unwrap<T>(response: { data: ApiEnvelope<T> | T }) {
  const payload = response.data as ApiEnvelope<T>;
  return typeof payload === 'object' && payload !== null && 'data' in payload
    ? payload.data
    : response.data as T;
}

async function getMealSuggestions(meal: 'breakfast' | 'lunch' | 'dinner') {
  const response = await axiosClient.get<ApiEnvelope<MealSuggestionsResponse> | MealSuggestionsResponse>(
    `/api/Homepage/suggestions/${meal}`
  );
  const payload = unwrap<MealSuggestionsResponse>(response);

  return {
    isPremiumExpired: !!payload?.isPremiumExpired,
    dishes: Array.isArray(payload?.dishes) ? payload.dishes : [],
  };
}

export const homepageService = {
  async getSuggestions() {
    const [breakfast, lunch, dinner] = await Promise.all([
      getMealSuggestions('breakfast'),
      getMealSuggestions('lunch'),
      getMealSuggestions('dinner'),
    ]);

    return {
      isPremiumExpired: breakfast.isPremiumExpired || lunch.isPremiumExpired || dinner.isPremiumExpired,
      breakfast: breakfast.dishes,
      lunch: lunch.dishes,
      dinner: dinner.dishes,
    };
  },

  async clearCache(targetUserId?: string) {
    const response = await axiosClient.post<ApiEnvelope<null> | null>('/api/Homepage/clear-cache', {
      targetUserId: targetUserId?.trim() || null,
    });
    return response.data;
  },
};
