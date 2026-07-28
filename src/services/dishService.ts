import axiosClient from './axiosClient';
import { ApiEnvelope } from '../types/subscription';
import { DishRecipeResponse, SuggestDishesRequest, SuggestDishesResponse } from '../types/dish';
import { unwrapApiResponse } from '../utils/apiNormalize';

export const dishService = {
  async suggestDishes(payload: SuggestDishesRequest) {
    const response = await axiosClient.post<ApiEnvelope<SuggestDishesResponse> | SuggestDishesResponse>(
      '/api/Dishes/suggest',
      payload
    );
    const data = unwrapApiResponse<SuggestDishesResponse>(response);

    return {
      suggestedDishes: Array.isArray(data?.suggestedDishes) ? data.suggestedDishes : [],
    };
  },

  async getDishRecipe(dishCacheId: string) {
    const response = await axiosClient.get<ApiEnvelope<DishRecipeResponse> | DishRecipeResponse>(
      `/api/Dishes/${dishCacheId}/recipe`
    );
    return unwrapApiResponse<DishRecipeResponse>(response);
  },
};
