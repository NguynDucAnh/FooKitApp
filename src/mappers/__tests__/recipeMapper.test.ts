import { Recipe } from '../../types/recipe';
import { SuggestedDishResult } from '../../types/dish';
import {
  applyRecipeDetail,
  mapHomepageDishToRecipe,
  mapSuggestedDishToRecipe,
} from '../recipeMapper';

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe-1',
    dishCacheId: 'cache-1',
    name: 'Món thử',
    image: 'https://example.test/dish.jpg',
    description: null,
    rating: null,
    reviewCount: null,
    time: null,
    servings: null,
    calories: null,
    difficulty: null,
    category: [],
    budget: null,
    tools: [],
    isFavorite: false,
    ingredients: [],
    instructions: [],
    nutrition: null,
    ...overrides,
  };
}

function createSuggestedDish(
  overrides: Partial<SuggestedDishResult> = {},
): SuggestedDishResult {
  return {
    dishName: 'Canh rau',
    imageUrl: '',
    instructions: '',
    totalCost: 0,
    ingredients: [],
    ...overrides,
  };
}

describe('recipeMapper', () => {
  describe('mapHomepageDishToRecipe', () => {
    it('preserves valid zero values instead of replacing them with defaults', () => {
      const recipe = mapHomepageDishToRecipe({
        dishCacheId: 'cache-zero',
        name: 'Món không năng lượng',
        rating: 0,
        reviewCount: 0,
        time: 0,
        calories: 0,
        budget: 0,
        nutrition: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      }, 'breakfast', 0);

      expect(recipe).toMatchObject({
        id: 'cache-zero',
        dishCacheId: 'cache-zero',
        rating: 0,
        reviewCount: 0,
        time: 0,
        calories: 0,
        budget: 0,
        nutrition: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      });
    });

    it('represents omitted domain data explicitly instead of fabricating values', () => {
      const recipe = mapHomepageDishToRecipe({
        dishCacheId: 'cache-missing',
        name: 'Món thiếu dữ liệu',
      }, 'lunch', 0);

      expect(recipe).toMatchObject({
        image: null,
        rating: null,
        reviewCount: null,
        time: null,
        calories: null,
        difficulty: null,
        budget: null,
        tools: [],
        ingredients: [],
        instructions: [],
        nutrition: null,
      });
    });

    it('uses a stable backend identity regardless of list order', () => {
      const dish = { dishCacheId: 'stable-cache-id', name: 'Món ổn định' };

      expect(mapHomepageDishToRecipe(dish, 'dinner', 0).id)
        .toBe(mapHomepageDishToRecipe(dish, 'dinner', 9).id);
    });

    it('prefers dishCacheId over a generic dish record id', () => {
      const recipe = mapHomepageDishToRecipe({
        id: 'dish-record-id',
        dishCacheId: 'stable-cache-id',
        name: 'Món ổn định',
      }, 'dinner', 0);

      expect(recipe.id).toBe('stable-cache-id');
    });
  });

  describe('mapSuggestedDishToRecipe', () => {
    it('does not invent rating, time, calories, difficulty, nutrition, or price', () => {
      const recipe = mapSuggestedDishToRecipe(createSuggestedDish({
        dishCacheId: 'suggest-cache',
        ingredients: [{
          rawEnglishName: 'spinach',
          standardIngredientName: 'Rau chân vịt',
          isMapped: true,
          affiliateProduct: {
            productName: 'Rau chân vịt',
            productUrl: 'https://example.test/product',
          },
        }],
      }), 0);

      expect(recipe).toMatchObject({
        id: 'suggest-cache',
        image: null,
        rating: null,
        reviewCount: null,
        time: null,
        calories: null,
        difficulty: null,
        nutrition: null,
      });
      expect(recipe.ingredients[0].affiliateProduct?.price).toBeNull();
    });

    it('preserves an explicit zero total cost', () => {
      expect(mapSuggestedDishToRecipe(createSuggestedDish({ totalCost: 0 }), 0).budget)
        .toBe(0);
    });
  });

  describe('applyRecipeDetail', () => {
    it('maps the extended recipe detail fields returned by BE', () => {
      const recipe = applyRecipeDetail(createRecipe(), {
        description: 'Món cuốn thanh mát.',
        cookingTimeMinutes: 30,
        servings: 2,
        calories: 350,
        difficulty: 'Dễ',
        categories: ['Món Việt'],
        tools: ['Nồi', 'Dao'],
        nutrition: { protein: 25, carbs: 40, fat: 12, fiber: 5 },
        ingredients: [{
          rawIngredientName: '200g thịt ba chỉ',
          standardIngredientName: 'Thịt lợn',
          quantity: 200,
          unit: 'g',
        }],
      });

      expect(recipe).toMatchObject({
        description: 'Món cuốn thanh mát.',
        time: 30,
        servings: 2,
        calories: 350,
        difficulty: 'Dễ',
        category: ['Món Việt'],
        tools: ['Nồi', 'Dao'],
        nutrition: { protein: 25, carbs: 40, fat: 12, fiber: 5 },
      });
      expect(recipe.ingredients[0]).toMatchObject({ amount: '200 g', quantity: 200, unit: 'g' });
    });

    it('uses the raw ingredient name when BE marks the standard name as unmatched', () => {
      const recipe = applyRecipeDetail(createRecipe(), {
        ingredients: [{
          rawIngredientName: '1 teaspoon of chili powder',
          standardIngredientName: 'Khác',
          quantity: 0,
          unit: 'none',
          isMatched: false,
          isPriced: false,
          estimatedPrice: 0,
        }],
      });

      expect(recipe.ingredients[0]).toMatchObject({
        name: '1 teaspoon of chili powder',
        amount: undefined,
        estimatedPrice: 0,
      });
    });

    it('preserves an explicit zero total from the detail response', () => {
      const recipe = applyRecipeDetail(createRecipe({ budget: 99_000 }), {
        totalCost: 0,
      });

      expect(recipe.budget).toBe(0);
    });

    it('uses the ingredient total only when totalCost is absent', () => {
      const recipe = applyRecipeDetail(createRecipe({ budget: 99_000 }), {
        ingredients: [
          { estimatedPrice: '12000' },
          { estimatedPrice: 8_000 },
          { estimatedPrice: null },
        ],
      });

      expect(recipe.budget).toBe(20_000);
    });

    it('keeps prior values when detail fields are omitted', () => {
      const original = createRecipe({
        budget: null,
        ingredients: [{ name: 'Cà chua' }],
        instructions: ['Rửa sạch'],
      });

      expect(applyRecipeDetail(original, {})).toMatchObject({
        budget: null,
        ingredients: original.ingredients,
        instructions: original.instructions,
      });
    });
  });
});
