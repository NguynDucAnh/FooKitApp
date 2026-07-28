import axiosClient from './axiosClient';
import { ApiEnvelope } from '../types/subscription';
import { MealSuggestionsResponse } from '../types/homepage';
import { unwrapApiResponse } from '../utils/apiNormalize';

type MealKey = 'breakfast' | 'lunch' | 'dinner';

async function getMealSuggestions(meal: MealKey) {
  const response = await axiosClient.get<ApiEnvelope<MealSuggestionsResponse> | MealSuggestionsResponse>(
    `/api/Homepage/suggestions/${meal}`
  );
  const payload = unwrapApiResponse<MealSuggestionsResponse>(response);

  return {
    isPremiumExpired: !!payload?.isPremiumExpired,
    dishes: Array.isArray(payload?.dishes) ? payload.dishes : [],
  };
}

export const homepageService = {
  async getSuggestions() {
    const [breakfastResult, lunchResult, dinnerResult] = await Promise.allSettled([
      getMealSuggestions('breakfast'),
      getMealSuggestions('lunch'),
      getMealSuggestions('dinner'),
    ]);
    const breakfast = breakfastResult.status === 'fulfilled' ? breakfastResult.value : null;
    const lunch = lunchResult.status === 'fulfilled' ? lunchResult.value : null;
    const dinner = dinnerResult.status === 'fulfilled' ? dinnerResult.value : null;
    const failedMeals: MealKey[] = [];

    if (!breakfast) failedMeals.push('breakfast');
    if (!lunch) failedMeals.push('lunch');
    if (!dinner) failedMeals.push('dinner');

    return {
      isPremiumExpired: !!(
        breakfast?.isPremiumExpired
        || lunch?.isPremiumExpired
        || dinner?.isPremiumExpired
      ),
      breakfast: breakfast?.dishes ?? [],
      lunch: lunch?.dishes ?? [],
      dinner: dinner?.dishes ?? [],
      failedMeals,
    };
  },

  async clearCache(targetUserId?: string) {
    const response = await axiosClient.post<ApiEnvelope<null> | null>('/api/Homepage/clear-cache', {
      target_user_id: targetUserId?.trim() || null,
    });
    return response.data;
  },
};
