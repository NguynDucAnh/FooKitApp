// src/types/food.ts

export interface AffiliateProduct {
  productId: string;
  productName: string;
  productUrl: string;
  price: number;
  platform: string;
}

export interface Ingredient {
  rawEnglishName: string;
  standardIngredientName: string;
  isMapped: boolean;
  affiliateProduct: AffiliateProduct | null;
}

export interface Dish {
  dishName: string;
  imageUrl: string;
  instructions: string;
  totalCost: number;
  ingredients: Ingredient[];
}

export interface HomepageData {
  isPremiumExpired: boolean;
  breakfast: Dish[];
  lunch: Dish[];
  dinner: Dish[];
}

export interface HomepageResponse {
  success: boolean;
  message: string;
  data: HomepageData;
}

export enum DietType {
  Vegan = 1,
  Keto = 2,
}

export interface SuggestDishesPayload {
  equipment: string;
  diet: DietType;
  budget: number;
}

export interface SuggestDishesResponse {
  success: boolean;
  message: string;
  data: {
    suggestedDishes: Dish[];
  };
}
