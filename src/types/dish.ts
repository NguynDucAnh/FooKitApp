export interface SuggestDishesRequest {
  equipment: string;
  diet: number;
  budget: number;
}

export interface SuggestDishesResponse {
  suggestedDishes?: SuggestedDishResult[];
}

export interface SuggestedDishResult {
  dishName: string;
  imageUrl: string;
  instructions: string;
  totalCost: number;
  ingredients: SuggestedIngredient[];
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
