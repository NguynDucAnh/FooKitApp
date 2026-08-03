export interface SuggestDishesRequest {
  equipment: string;
  diet: number;
  budget: number;
}

export interface SuggestDishesResponse {
  suggestedDishes?: SuggestedDishResult[];
}

export interface SuggestedDishResult {
  dishCacheId?: string;
  dish_cache_id?: string;
  DishCacheId?: string;
  dishName: string;
  imageUrl: string;
  instructions: string;
  totalCost: number;
  ingredients: SuggestedIngredient[];
}

export interface DishRecipeIngredient {
  rawIngredientName?: string | null;
  standardIngredientId?: string | null;
  standardIngredientName?: string | null;
  quantity?: number | string | null;
  unit?: string | null;
  isMatched?: boolean;
  isPriced?: boolean;
  affiliateUrl?: string | null;
  estimatedPrice?: number | string | null;
}

export interface DishRecipeResponse {
  dishCacheId?: string;
  dishName?: string;
  imageUrl?: string | null;
  description?: string | null;
  cookingTimeMinutes?: number | null;
  servings?: number | null;
  calories?: number | null;
  difficulty?: string | null;
  categories?: string[] | null;
  tools?: string[] | null;
  nutrition?: {
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    fiber?: number | null;
  } | null;
  cookingSteps?: string[];
  ingredients?: DishRecipeIngredient[];
  totalCost?: number | string | null;
}

export interface SuggestedIngredient {
  rawEnglishName: string;
  standardIngredientName: string;
  isMapped: boolean;
  affiliateProduct?: AffiliateProduct | null;
}

export interface AffiliateProduct {
  productName: string;
  productUrl: string;
  price?: number;
  currentPriceAmount?: number;
  currentPriceCurrency?: string;
  platform?: string;
}
  