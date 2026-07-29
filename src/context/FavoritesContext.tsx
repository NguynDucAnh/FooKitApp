import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Recipe } from '../types/recipe';

const STORAGE_KEY = '@fookit/favorite-recipes';

interface FavoritesContextValue {
  favorites: Recipe[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (recipe: Recipe) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (!value) return;
        const stored = JSON.parse(value);
        if (Array.isArray(stored)) setFavorites(stored);
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => undefined);
  }, [favorites, isReady]);

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
