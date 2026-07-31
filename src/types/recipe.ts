export interface Recipe {
  id: string;
  dishCacheId?: string;
  name: string;
  image?: string | null;
  description?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  time?: number | null;
  servings?: number | null;
  calories?: number | null;
  difficulty?: 'Dễ' | 'Trung bình' | 'Khó' | null;
  category: string[];
  budget?: number | null;
  tools: string[];
  isFavorite: boolean;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition?: {
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    fiber?: number | null;
  } | null;
}

export interface Ingredient {
  name: string;
  amount?: string;
  quantity?: number | string | null;
  unit?: string | null;
  rawIngredientName?: string;
  standardIngredientId?: string | null;
  isMatched?: boolean;
  isPriced?: boolean;
  estimatedPrice?: number | null;
  rawEnglishName?: string;
  isMapped?: boolean;
  affiliateProduct?: {
    productName: string;
    productUrl: string;
    price?: number | null;
  } | null;
}
