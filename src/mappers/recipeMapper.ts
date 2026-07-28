import { Recipe } from '../data/recipes';
import { DishRecipeResponse, SuggestedDishResult } from '../types/dish';
import { SuggestedDish } from '../types/homepage';

type MealKey = 'breakfast' | 'lunch' | 'dinner';

const MEAL_IMAGES = {
  breakfast: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
};

function toArray(value: SuggestedDish['category'] | SuggestedDish['categories'], fallback: string[]) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return fallback;
}

function normalizeIngredients(value: SuggestedDish['ingredients']) {
  if (!Array.isArray(value) || value.length === 0) {
    return [{ name: 'Nguyên liệu', amount: 'BE chưa cung cấp chi tiết' }];
  }

  return value.map(item => {
    if (typeof item === 'string') return { name: item, amount: 'vừa đủ' };
    return {
      name: item.name || 'Nguyên liệu',
      amount: item.amount || 'vừa đủ',
    };
  });
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeInstructions(value: SuggestedDish['instructions']) {
  if (Array.isArray(value) && value.length) return value.filter(Boolean);

  if (typeof value === 'string') {
    const text = stripHtml(value);
    if (text) {
      return text
        .split(/(?:\.\s+|\n+)/)
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  return [
    'BE chưa cung cấp hướng dẫn chi tiết cho món này.',
    'Bạn có thể mở công thức nguồn hoặc thử lại khi dữ liệu được đồng bộ đầy đủ hơn.',
  ];
}

function normalizeDifficulty(value?: string): Recipe['difficulty'] {
  if (value === 'Trung bình' || value === 'Khó' || value === 'Dễ') return value;
  const normalized = value?.toLowerCase();
  if (normalized?.includes('hard') || normalized?.includes('khó')) return 'Khó';
  if (normalized?.includes('medium') || normalized?.includes('trung')) return 'Trung bình';
  return 'Dễ';
}

function getBudget(dish: SuggestedDish) {
  const cost = dish.budget ?? dish.estimatedCost ?? dish.totalCost ?? dish.price;
  return typeof cost === 'number' && cost > 0 ? cost : 0;
}

function toMoney(value: number | string | null | undefined) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function mapHomepageDishToRecipe(dish: SuggestedDish, meal: MealKey, index: number): Recipe {
  const mealLabel = meal === 'breakfast' ? 'Bữa sáng' : meal === 'lunch' ? 'Bữa trưa' : 'Bữa tối';
  const name = dish.name || dish.dishName || dish.title || `${mealLabel} gợi ý ${index + 1}`;

  return {
    id: dish.id || `${meal}-${index}-${name}`,
    dishCacheId: dish.dishCacheId || dish.dish_cache_id || dish.DishCacheId,
    name,
    image: dish.image || dish.imageUrl || dish.thumbnailUrl || MEAL_IMAGES[meal],
    rating: dish.rating || 4.8,
    time: dish.time || dish.cookingTime || dish.cookingTimeMinutes || 25,
    calories: dish.calories || dish.kcal || 420,
    difficulty: normalizeDifficulty(dish.difficulty),
    category: toArray(dish.categories || dish.category, [mealLabel]),
    budget: getBudget(dish),
    tools: Array.isArray(dish.tools) && dish.tools.length ? dish.tools : ['Bếp gia đình'],
    isFavorite: false,
    ingredients: normalizeIngredients(dish.ingredients),
    instructions: normalizeInstructions(dish.instructions),
    nutrition: {
      protein: dish.nutrition?.protein || 20,
      carbs: dish.nutrition?.carbs || 45,
      fat: dish.nutrition?.fat || 14,
      fiber: dish.nutrition?.fiber || 6,
    },
  };
}

export function mapSuggestedDishToRecipe(dish: SuggestedDishResult, index: number): Recipe {
  return {
    id: `suggest-${index}-${dish.dishName}`,
    dishCacheId: dish.dishCacheId || dish.dish_cache_id || dish.DishCacheId,
    name: dish.dishName || `Món gợi ý ${index + 1}`,
    image: dish.imageUrl || MEAL_IMAGES.dinner,
    rating: 4.8,
    time: 25,
    calories: 420,
    difficulty: 'Dễ',
    category: ['Gợi ý tối ưu'],
    budget: typeof dish.totalCost === 'number' ? dish.totalCost : 0,
    tools: ['Theo thiết bị đã chọn'],
    isFavorite: false,
    ingredients: Array.isArray(dish.ingredients) && dish.ingredients.length
      ? dish.ingredients.map(ingredient => ({
        name: ingredient.standardIngredientName || ingredient.rawEnglishName || 'Nguyên liệu',
        amount: ingredient.rawEnglishName || 'vừa đủ',
        rawEnglishName: ingredient.rawEnglishName,
        isMapped: ingredient.isMapped,
        affiliateProduct: ingredient.affiliateProduct
          ? {
            productName: ingredient.affiliateProduct.productName,
            productUrl: ingredient.affiliateProduct.productUrl,
            price: ingredient.affiliateProduct.price ?? ingredient.affiliateProduct.currentPriceAmount ?? 0,
          }
          : null,
      }))
      : [{ name: 'Nguyên liệu', amount: 'BE chưa cung cấp chi tiết' }],
    instructions: normalizeInstructions(dish.instructions),
    nutrition: {
      protein: 20,
      carbs: 45,
      fat: 14,
      fiber: 6,
    },
  };
}

export function applyRecipeDetail(recipe: Recipe, detail: DishRecipeResponse): Recipe {
  const ingredientTotal = Array.isArray(detail.ingredients)
    ? detail.ingredients.reduce((sum, ingredient) => sum + (toMoney(ingredient.estimatedPrice) ?? 0), 0)
    : 0;
  const detailTotal = toMoney(detail.totalCost);
  const resolvedBudget = detailTotal !== null && detailTotal > 0
    ? detailTotal
    : ingredientTotal > 0
      ? ingredientTotal
      : recipe.budget;

  return {
    ...recipe,
    dishCacheId: detail.dishCacheId || recipe.dishCacheId,
    name: detail.dishName || recipe.name,
    image: detail.imageUrl || recipe.image,
    budget: resolvedBudget,
    ingredients: Array.isArray(detail.ingredients) && detail.ingredients.length
      ? detail.ingredients.map(ingredient => ({
        name: ingredient.standardIngredientName?.trim() || ingredient.rawIngredientName?.trim() || 'Nguyên liệu',
        rawIngredientName: ingredient.rawIngredientName?.trim() || undefined,
        standardIngredientId: ingredient.standardIngredientId,
        isMatched: !!ingredient.isMatched,
        isPriced: !!ingredient.isPriced,
        estimatedPrice: toMoney(ingredient.estimatedPrice),
        isMapped: ingredient.isMatched,
        affiliateProduct: ingredient.affiliateUrl ? {
          productName: ingredient.standardIngredientName?.trim() || ingredient.rawIngredientName?.trim() || 'Sản phẩm gợi ý',
          productUrl: ingredient.affiliateUrl,
          price: toMoney(ingredient.estimatedPrice) ?? 0,
        } : null,
      }))
      : recipe.ingredients,
    instructions: Array.isArray(detail.cookingSteps) && detail.cookingSteps.length
      ? detail.cookingSteps
      : recipe.instructions,
  };
}
