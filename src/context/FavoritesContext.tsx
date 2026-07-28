import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Recipe } from '../data/recipes';
import { useAuth } from '../hooks/useAuth';

const LEGACY_STORAGE_KEY = '@fookit/favorite-recipes';

function parseStoredFavorites(value: string | null) {
  if (!value) return [];

  try {
    const stored = JSON.parse(value);
    return Array.isArray(stored) ? stored as Recipe[] : [];
  } catch {
    return [];
  }
}

interface FavoritesContextValue {
  favorites: Recipe[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (recipe: Recipe) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [storageOwner, setStorageOwner] = useState<string | null>(null);
  const userIdentity = currentUser?.id ?? currentUser?.username;
  const storageKey = userIdentity
    ? `@fookit/users/${encodeURIComponent(userIdentity)}/favorite-recipes`
    : null;

  useEffect(() => {
    let cancelled = false;
    setStorageOwner(null);
    setFavorites([]);

    if (!storageKey) return () => {
      cancelled = true;
    };

    async function loadFavorites() {
      const [userValue, legacyValue] = await AsyncStorage.multiGet([
        storageKey!,
        LEGACY_STORAGE_KEY,
      ]);
      if (cancelled) return;

      const hasUserValue = userValue[1] !== null;
      const nextFavorites = parseStoredFavorites(hasUserValue ? userValue[1] : legacyValue[1]);

      if (!hasUserValue && legacyValue[1] !== null) {
        await AsyncStorage.setItem(storageKey!, JSON.stringify(nextFavorites));
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        if (cancelled) return;
      }

      setFavorites(nextFavorites);
      setStorageOwner(storageKey);
    }

    loadFavorites().catch(() => {
      if (!cancelled) setStorageOwner(storageKey);
    });

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || storageOwner !== storageKey) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(favorites)).catch(() => undefined);
  }, [favorites, storageKey, storageOwner]);

  const value = useMemo<FavoritesContextValue>(() => ({
    favorites,
    isFavorite: id => favorites.some(recipe => recipe.id === id),
    toggleFavorite: recipe => setFavorites(current => {
      if (current.some(item => item.id === recipe.id)) {
        return current.filter(item => item.id !== recipe.id);
      }
      return [{ ...recipe, isFavorite: true }, ...current];
    }),
  }), [favorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
}
