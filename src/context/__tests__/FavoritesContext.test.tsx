import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { useAuth } from '../../hooks/useAuth';
import { Recipe } from '../../types/recipe';
import { FavoritesProvider, useFavorites } from '../FavoritesContext';

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockedSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

type FavoritesState = ReturnType<typeof useFavorites>;

let latestState: FavoritesState | null = null;

function FavoritesProbe() {
  const state = useFavorites();

  useEffect(() => {
    latestState = state;
  }, [state]);

  return null;
}

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe-1',
    dishCacheId: 'cache-1',
    name: 'Món thử',
    category: [],
    tools: [],
    isFavorite: false,
    ingredients: [],
    instructions: [],
    ...overrides,
  };
}

function setAuthenticatedUser(id: string, username: string) {
  mockedUseAuth.mockReturnValue({
    accessToken: 'test-access-token',
    currentUser: {
      id,
      username,
      name: username,
      email: `${username}@example.test`,
    },
    isAuthenticated: true,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    googleLogin: jest.fn(),
    logout: jest.fn(),
    setCredentials: jest.fn(),
    linkGoogle: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    updateLocalUser: jest.fn(),
  });
}

async function renderProvider() {
  let renderer: TestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = TestRenderer.create(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  return renderer!;
}

describe('FavoritesProvider ownership and persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    latestState = null;
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads favorites only from the active user storage key', async () => {
    const userAFavorite = createRecipe({ id: 'recipe-a', dishCacheId: 'cache-a' });
    const userBFavorite = createRecipe({ id: 'recipe-b', dishCacheId: 'cache-b' });
    setAuthenticatedUser('user-a', 'alpha');
    mockedGetItem.mockResolvedValueOnce(JSON.stringify([userAFavorite]));

    const renderer = await renderProvider();

    expect(mockedGetItem).toHaveBeenCalledWith('@fookit/favorite-recipes/v2/user-a');
    expect(latestState?.favorites).toEqual([userAFavorite]);

    setAuthenticatedUser('user-b', 'beta');
    mockedGetItem.mockResolvedValueOnce(JSON.stringify([userBFavorite]));

    await act(async () => {
      renderer.update(
        <FavoritesProvider>
          <FavoritesProbe />
        </FavoritesProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockedGetItem).toHaveBeenLastCalledWith('@fookit/favorite-recipes/v2/user-b');
    expect(latestState?.favorites).toEqual([userBFavorite]);

    renderer.unmount();
  });

  it('persists and compares favorites using dishCacheId', async () => {
    setAuthenticatedUser('user-a', 'alpha');
    mockedGetItem.mockResolvedValueOnce(null);
    const renderer = await renderProvider();
    const recipe = createRecipe({ id: 'list-item-a', dishCacheId: 'shared-cache-id' });

    await act(async () => {
      await latestState!.toggleFavorite(recipe);
    });

    expect(mockedSetItem).toHaveBeenCalledWith(
      '@fookit/favorite-recipes/v2/user-a',
      JSON.stringify([{ ...recipe, isFavorite: true }]),
    );
    expect(latestState!.isFavorite({
      id: 'different-list-item',
      dishCacheId: 'shared-cache-id',
    })).toBe(true);

    renderer.unmount();
  });

  it('does not expose an unsaved favorite when persistence fails', async () => {
    setAuthenticatedUser('user-a', 'alpha');
    mockedGetItem.mockResolvedValueOnce(null);
    mockedSetItem.mockRejectedValueOnce(new Error('storage unavailable'));
    const renderer = await renderProvider();
    const recipe = createRecipe();

    await act(async () => {
      await latestState!.toggleFavorite(recipe);
    });

    expect(latestState!.favorites).toEqual([]);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Không thể cập nhật món yêu thích',
      'Thay đổi chưa được lưu. Vui lòng thử lại.',
    );

    renderer.unmount();
  });
});
