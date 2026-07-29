import React from 'react';
import { Alert, Image, ImageBackground, Pressable, ScrollView, Share, Text } from 'react-native';
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
    jest.restoreAllMocks();
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

  it('shares only available recipe details through the native share sheet', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({
      action: Share.sharedAction,
    });
    const recipe = createRecipe({
      name: 'Canh rau',
      time: 20,
      budget: 45000,
      instructions: ['Rửa rau', 'Đun nước', 'Nêm gia vị', 'Bày ra bát'],
    });
    const renderer = TestRenderer.create(
      <RecipeDetailScreen recipe={recipe} onBack={jest.fn()} />,
    );
    const shareButton = renderer.root.findAllByType(Pressable).find(
      node => node.props.accessibilityLabel === 'Chia sẻ công thức Canh rau',
    );

    expect(shareButton).toBeDefined();

    await act(async () => {
      shareButton!.props.onPress();
      await Promise.resolve();
    });

    expect(shareSpy).toHaveBeenCalledWith({
      title: 'Canh rau',
      message: [
        'Canh rau - gợi ý từ FooKit',
        'Thời gian: 20 phút',
        'Chi phí dự kiến: 45.000 đ',
        'Các bước chính:\n1. Rửa rau\n2. Đun nước\n3. Nêm gia vị',
      ].join('\n\n'),
    });

    renderer.unmount();
  });

  it('uses the shared favorites state for the bottom bookmark action', () => {
    const toggleFavorite = jest.fn();
    const recipe = createRecipe({ name: 'Canh rau' });
    mockedUseFavorites.mockReturnValue({
      favorites: [recipe],
      isFavorite: jest.fn(() => true),
      toggleFavorite,
    });
    const renderer = TestRenderer.create(
      <RecipeDetailScreen recipe={recipe} onBack={jest.fn()} />,
    );
    const bookmarkButton = renderer.root.findAllByType(Pressable).find(
      node => node.props.accessibilityHint === 'Bỏ lưu công thức này',
    );

    expect(bookmarkButton).toBeDefined();
    expect(bookmarkButton!.props.accessibilityState).toEqual({ selected: true });

    act(() => {
      bookmarkButton!.props.onPress();
    });

    expect(toggleFavorite).toHaveBeenCalledWith(recipe);

    renderer.unmount();
  });

  it('scrolls to the instructions when cooking starts', () => {
    const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(jest.fn());
    const recipe = createRecipe({ instructions: ['Sơ chế', 'Nấu chín'] });
    const renderer = TestRenderer.create(
      <RecipeDetailScreen recipe={recipe} onBack={jest.fn()} />,
    );

    act(() => {
      renderer.root.findByProps({ testID: 'recipe-detail-body' }).props.onLayout({
        nativeEvent: { layout: { y: 260 } },
      });
      renderer.root.findByProps({ testID: 'recipe-instructions' }).props.onLayout({
        nativeEvent: { layout: { y: 420 } },
      });
      renderer.root.findAllByType(Pressable).find(
        node => node.props.accessibilityLabel === 'Bắt đầu nấu',
      )!.props.onPress();
    });

    expect(scrollTo).toHaveBeenCalledWith({ y: 664, animated: true });

    renderer.unmount();
  });

  it('explains when cooking instructions are unavailable', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    const renderer = TestRenderer.create(
      <RecipeDetailScreen recipe={createRecipe()} onBack={jest.fn()} />,
    );
    const startButton = renderer.root.findAllByType(Pressable).find(
      node => node.props.accessibilityLabel === 'Bắt đầu nấu',
    );

    act(() => {
      startButton!.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Chưa có hướng dẫn nấu',
      'Công thức này chưa có các bước thực hiện. Vui lòng thử lại sau.',
    );
    expect(hasExactText(renderer, 'Chưa có hướng dẫn nấu cho món này.')).toBe(true);

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
