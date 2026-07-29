import React from 'react';
import { Image, ImageBackground, Pressable, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { Recipe } from '../../types/recipe';
import { useFavorites } from '../../context/FavoritesContext';
import { useSubscriptionStore } from '../../context/SubscriptionContext';
import { homepageService } from '../../services/homepageService';
import { HomeScreen } from '../HomeScreen';
import { RecipeCard } from '../RecipeCard';
import { RecipeDetailScreen } from '../RecipeDetailScreen';

jest.mock('../../context/FavoritesContext', () => ({
  useFavorites: jest.fn(),
}));

jest.mock('../../context/SubscriptionContext', () => ({
  useSubscriptionStore: jest.fn(),
}));

jest.mock('../../services/homepageService', () => ({
  homepageService: {
    getSuggestions: jest.fn(),
  },
}));

jest.mock('../../services/dishService', () => ({
  dishService: {
    getDishRecipe: jest.fn(),
    suggestDishes: jest.fn(),
  },
}));

const mockedUseFavorites = useFavorites as jest.MockedFunction<typeof useFavorites>;
const mockedUseSubscriptionStore = useSubscriptionStore as jest.MockedFunction<
  typeof useSubscriptionStore
>;
const mockedGetSuggestions = homepageService.getSuggestions as jest.MockedFunction<
  typeof homepageService.getSuggestions
>;

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe-1',
    name: 'Món thử',
    image: null,
    rating: null,
    reviewCount: null,
    time: null,
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

function hasExactText(renderer: TestRenderer.ReactTestRenderer, expected: string) {
  return renderer.root
    .findAllByType(Text)
    .some(node => node.props.children === expected);
}

describe('recipe presentation data integrity', () => {
  beforeEach(() => {
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      isFavorite: jest.fn(() => false),
      toggleFavorite: jest.fn(),
    });
    mockedUseSubscriptionStore.mockReturnValue({
      subscription: null,
      isPremium: false,
      loading: false,
      error: null,
      refreshSubscription: jest.fn(),
      setSubscription: jest.fn(),
    });
  });

  it('renders an explicit image fallback on a recipe card', () => {
    const renderer = TestRenderer.create(
      <RecipeCard recipe={createRecipe()} />,
    );

    expect(renderer.root.findAllByType(Image)).toHaveLength(0);
    expect(hasExactText(renderer, 'Chưa có ảnh món ăn')).toBe(true);

    renderer.unmount();
  });

  it('keeps the nested favorite action separate from opening the recipe card', () => {
    const onClick = jest.fn();
    const onFavoriteToggle = jest.fn();
    const stopPropagation = jest.fn();
    const recipe = createRecipe({ name: 'Canh rau', isFavorite: true });
    const renderer = TestRenderer.create(
      <RecipeCard
        recipe={recipe}
        onClick={onClick}
        onFavoriteToggle={onFavoriteToggle}
      />,
    );
    const favoriteButton = renderer.root.findAllByType(Pressable).find(
      node => node.props.accessibilityLabel === 'Bỏ món Canh rau khỏi danh sách yêu thích',
    );

    expect(favoriteButton).toBeDefined();
    expect(favoriteButton!.props.accessibilityRole).toBe('button');
    expect(favoriteButton!.props.accessibilityState).toEqual({ selected: true });

    act(() => {
      favoriteButton!.props.onPress({ stopPropagation });
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onFavoriteToggle).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('renders an explicit image fallback on recipe detail', () => {
    const renderer = TestRenderer.create(
      <RecipeDetailScreen recipe={createRecipe()} onBack={jest.fn()} />,
    );

    expect(renderer.root.findAllByType(ImageBackground)).toHaveLength(0);
    expect(hasExactText(renderer, 'Chưa có ảnh món ăn')).toBe(true);

    renderer.unmount();
  });

  it('does not inject sample recipes when homepage suggestions fail', async () => {
    mockedGetSuggestions.mockRejectedValue(new Error('network unavailable'));
    let renderer: TestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = TestRenderer.create(
        <HomeScreen onRecipeClick={jest.fn()} onUpgradePremium={jest.fn()} />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(renderer!.root.findAllByType(RecipeCard)).toHaveLength(0);
    expect(hasExactText(renderer!, 'Thực đơn đang được cập nhật')).toBe(true);
    expect(mockedGetSuggestions).toHaveBeenCalledTimes(1);

    renderer!.unmount();
  });
});
