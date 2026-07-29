import React from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { useFavorites } from '../../context/FavoritesContext';
import { useSubscriptionStore } from '../../context/SubscriptionContext';
import { homepageService } from '../../services/homepageService';
import { FavoritesScreen } from '../FavoritesScreen';
import { HomeScreen } from '../HomeScreen';
import Input from '../Input';

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

describe('form and screen accessibility', () => {
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
    mockedGetSuggestions.mockResolvedValue({
      isPremiumExpired: false,
      breakfast: [],
      lunch: [],
      dinner: [],
      failedMeals: [],
    });
  });

  it('connects input labels, errors and disabled state', () => {
    const renderer = TestRenderer.create(
      <Input
        label="Email"
        error="Email không hợp lệ"
        editable={false}
        value=""
      />,
    );
    const input = renderer.root.findByType(TextInput);
    const error = renderer.root.findAllByType(Text).find(
      node => node.props.accessibilityLiveRegion === 'polite',
    );

    expect(input.props.accessibilityLabel).toBe('Email');
    expect(input.props.accessibilityHint).toBe('Lỗi: Email không hợp lệ');
    expect(input.props.accessibilityState).toEqual({ disabled: true });
    expect(StyleSheet.flatten(input.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(error).toBeDefined();

    renderer.unmount();
  });

  it('keeps the Favorites empty-state action semantic and actionable', () => {
    const onExplore = jest.fn();
    const renderer = TestRenderer.create(
      <FavoritesScreen onRecipeClick={jest.fn()} onExplore={onExplore} />,
    );
    const exploreButton = renderer.root.findByProps({
      accessibilityLabel: 'Khám phá món ăn',
    });

    expect(exploreButton.props.accessibilityRole).toBe('button');
    expect(StyleSheet.flatten(exploreButton.props.style).minHeight).toBeGreaterThanOrEqual(44);

    act(() => {
      exploreButton.props.onPress();
    });

    expect(onExplore).toHaveBeenCalledTimes(1);
    renderer.unmount();
  });

  it('announces Home filters, Premium requirements and submit state', async () => {
    const onUpgradePremium = jest.fn();
    let renderer!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <HomeScreen onRecipeClick={jest.fn()} onUpgradePremium={onUpgradePremium} />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const pressables = renderer.root.findAllByType(Pressable);
    const oven = pressables.find(node => node.props.accessibilityLabel === 'Lò nướng');
    const vegan = pressables.find(node => node.props.accessibilityLabel === 'Thuần chay');
    const suggest = pressables.find(node => node.props.accessibilityLabel === 'Gợi ý món ăn');

    expect(oven?.props.accessibilityState).toEqual({ selected: true });
    expect(StyleSheet.flatten(oven?.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(vegan?.props.accessibilityHint).toBe('Yêu cầu gói Premium');
    expect(suggest?.props.accessibilityState).toEqual({ busy: false, disabled: false });

    act(() => {
      vegan?.props.onPress();
    });

    const premiumPrompt = renderer.root.findAllByType(Pressable).find(
      node => node.props.accessibilityLabel === 'Xem gói Premium',
    );
    expect(premiumPrompt?.props.accessibilityRole).toBe('button');

    act(() => {
      premiumPrompt?.props.onPress();
    });

    expect(onUpgradePremium).toHaveBeenCalledTimes(1);
    renderer.unmount();
  });
});
