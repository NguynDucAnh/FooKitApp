import axiosClient from './axiosClient';
import { ApiEnvelope } from '../types/subscription';
import { DishRecipeResponse, SuggestDishesRequest, SuggestDishesResponse } from '../types/dish';

function unwrap<T>(response: { data: ApiEnvelope<T> | T }) {
  const payload = response.data as ApiEnvelope<T>;
  return typeof payload === 'object' && payload !== null && 'data' in payload
    ? payload.data
    : response.data as T;
}

export const dishService = {
  async suggestDishes(payload: SuggestDishesRequest) {
    const response = await axiosClient.post<ApiEnvelope<SuggestDishesResponse> | SuggestDishesResponse>(
      '/api/Dishes/suggest',
      payload
    );
    const data = unwrap<SuggestDishesResponse>(response);

    return {
      suggestedDishes: Array.isArray(data?.suggestedDishes) ? data.suggestedDishes : [],
    };
  },

  async getDishRecipe(dishCacheId: string) {
    const response = await axiosClient.get<ApiEnvelope<DishRecipeResponse> | DishRecipeResponse>(
      `/api/Dishes/${dishCacheId}/recipe`
    );
    return unwrap<DishRecipeResponse>(response);
  },
};
