export interface HomepageSuggestionsResponse {
  isPremiumExpired?: boolean;
  breakfast?: SuggestedDish[];
  lunch?: SuggestedDish[];
  dinner?: SuggestedDish[];
}

export interface MealSuggestionsResponse {
  isPremiumExpired?: boolean;
  dishes?: SuggestedDish[];
}

export interface SuggestedDish {
  id?: string;
  name?: string;
  dishName?: string;
  title?: string;
  image?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  rating?: number;
  time?: number;
  cookingTime?: number;
  cookingTimeMinutes?: number;
  calories?: number;
  kcal?: number;
  difficulty?: string;
  category?: string[] | string;
  categories?: string[];
  budget?: number;
  estimatedCost?: number;
  totalCost?: number;
  price?: number;
  tools?: string[];
  ingredients?: Array<{ name?: string; amount?: string } | string>;
  instructions?: string[] | string | null;
  nutrition?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}
