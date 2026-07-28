import { Recipe } from '../data/recipes';
import { SuggestedDishResult, DishRecipeResponse } from '../types/dish';
import { SuggestedDish } from '../types/homepage';

export type MealKey = 'breakfast' | 'lunch' | 'dinner';

const MEAL_IMAGES: Record<MealKey, string> = {
  breakfast: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
};

const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: 'Bữa sáng',
  lunch: 'Bữa trưa',
  dinner: 'Bữa tối',
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number') return null;
  return Number.isFinite(value) ? value : null;
}

function toMoney(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function toCategories(
  value: SuggestedDish['category'] | SuggestedDish['categories'],
  fallback: string[],
): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return fallback;
}

function normalizeDifficulty(value?: string): Recipe['difficulty'] {
  if (value === 'Trung bình' || value === 'Khó' || value === 'Dễ') return value;
  const normalized = value?.toLowerCase();
  if (normalized?.includes('hard') || normalized?.includes('khó')) return 'Khó';
  if (normalized?.includes('medium') || normalized?.includes('trung')) return 'Trung bình';
  if (normalized?.includes('easy') || normalized?.includes('dễ')) return 'Dễ';
  return null;
}

function normalizeInstructions(value: SuggestedDish['instructions']): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return [];

  const text = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return [];

  return text
    .split(/(?:\.\s+|\n+)/)
    .map(item => item.trim())
    .filter(Boolean);
}

function stableFallbackId(prefix: string, name: string): string {
  return `${prefix}-${name.trim().toLocaleLowerCase('vi').replace(/\s+/g, '-')}`;
}

export function mapHomepageDishToRecipe(
  dish: SuggestedDish,
  meal: MealKey,
  index: number,
): Recipe {
  const mealLabel = MEAL_LABELS[meal];
  const name = dish.name || dish.dishName || dish.title || `${mealLabel} gợi ý ${index + 1}`;
  const dishCacheId = dish.dishCacheId || dish.dish_cache_id || dish.DishCacheId;
  const cost = dish.budget ?? dish.estimatedCost ?? dish.totalCost ?? dish.price;

  return {
    id: dish.id || dishCacheId || stableFallbackId(meal, name),
    dishCacheId,
    name,
    image: dish.image || dish.imageUrl || dish.thumbnailUrl || MEAL_IMAGES[meal],
    rating: toFiniteNumber(dish.rating),
    reviewCount: toFiniteNumber(dish.reviewCount),
    time: toFiniteNumber(dish.time ?? dish.cookingTime ?? dish.cookingTimeMinutes),
    calories: toFiniteNumber(dish.calories ?? dish.kcal),
    difficulty: normalizeDifficulty(dish.difficulty),
    category: toCategories(dish.categories || dish.category, [mealLabel]),
    budget: toMoney(cost),
    tools: Array.isArray(dish.tools) ? dish.tools.filter(Boolean) : [],
    isFavorite: false,
    ingredients: Array.isArray(dish.ingredients)
      ? dish.ingredients.map(item => typeof item === 'string'
        ? { name: item }
        : { name: item.name?.trim() || 'Nguyên liệu', amount: item.amount?.trim() || undefined })
      : [],
    instructions: normalizeInstructions(dish.instructions),
    nutrition: dish.nutrition
      ? {
        protein: toFiniteNumber(dish.nutrition.protein),
        carbs: toFiniteNumber(dish.nutrition.carbs),
        fat: toFiniteNumber(dish.nutrition.fat),
        fiber: toFiniteNumber(dish.nutrition.fiber),
      }
      : null,
  };
}

export function mapSuggestedDishToRecipe(
  dish: SuggestedDishResult,
  index: number,
): Recipe {
  const name = dish.dishName || `Món gợi ý ${index + 1}`;
  const dishCacheId = dish.dishCacheId || dish.dish_cache_id || dish.DishCacheId;

  return {
    id: dishCacheId || stableFallbackId('suggest', name),
    dishCacheId,
    name,
    image: dish.imageUrl || MEAL_IMAGES.dinner,
    rating: null,
    reviewCount: null,
    time: null,
    calories: null,
    difficulty: null,
    category: ['Gợi ý tối ưu'],
    budget: toMoney(dish.totalCost),
    tools: [],
    isFavorite: false,
    ingredients: Array.isArray(dish.ingredients)
      ? dish.ingredients.map(ingredient => ({
        name: ingredient.standardIngredientName || ingredient.rawEnglishName || 'Nguyên liệu',
        rawEnglishName: ingredient.rawEnglishName || undefined,
        isMapped: ingredient.isMapped,
        affiliateProduct: ingredient.affiliateProduct
          ? {
            productName: ingredient.affiliateProduct.productName,
            productUrl: ingredient.affiliateProduct.productUrl,
            price: toMoney(
              ingredient.affiliateProduct.price
              ?? ingredient.affiliateProduct.currentPriceAmount,
            ),
          }
          : null,
      }))
      : [],
    instructions: normalizeInstructions(dish.instructions),
    nutrition: null,
  };
}

export function applyRecipeDetail(recipe: Recipe, detail: DishRecipeResponse): Recipe {
  const pricedIngredients = Array.isArray(detail.ingredients)
    ? detail.ingredients
      .map(ingredient => toMoney(ingredient.estimatedPrice))
      .filter((price): price is number => price !== null)
    : [];
  const ingredientTotal = pricedIngredients.length
    ? pricedIngredients.reduce((sum, price) => sum + price, 0)
    : null;
  const detailTotal = toMoney(detail.totalCost);

  return {
    ...recipe,
    dishCacheId: detail.dishCacheId || recipe.dishCacheId,
    name: detail.dishName || recipe.name,
    image: detail.imageUrl || recipe.image,
    budget: detailTotal ?? ingredientTotal ?? recipe.budget,
    ingredients: Array.isArray(detail.ingredients) && detail.ingredients.length
      ? detail.ingredients.map(ingredient => ({
        name: ingredient.standardIngredientName?.trim()
          || ingredient.rawIngredientName?.trim()
          || 'Nguyên liệu',
        rawIngredientName: ingredient.rawIngredientName?.trim() || undefined,
        standardIngredientId: ingredient.standardIngredientId,
        isMatched: !!ingredient.isMatched,
        isPriced: !!ingredient.isPriced,
        estimatedPrice: toMoney(ingredient.estimatedPrice),
        isMapped: ingredient.isMatched,
        affiliateProduct: ingredient.affiliateUrl
          ? {
            productName: ingredient.standardIngredientName?.trim()
              || ingredient.rawIngredientName?.trim()
              || 'Sản phẩm gợi ý',
            productUrl: ingredient.affiliateUrl,
            price: toMoney(ingredient.estimatedPrice),
          }
          : null,
      }))
      : recipe.ingredients,
    instructions: Array.isArray(detail.cookingSteps) && detail.cookingSteps.length
      ? detail.cookingSteps
      : recipe.instructions,
  };
}
