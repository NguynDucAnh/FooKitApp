import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '../hooks/useAuth';
import { Recipe } from '../types/recipe';
import { getFavoriteIdentity, getFavoritesStorageKey } from '../utils/favoriteIdentity';

interface FavoritesContextValue {
  favorites: Recipe[];
  isFavorite: (recipe: Pick<Recipe, 'id' | 'dishCacheId'>) => boolean;
  toggleFavorite: (recipe: Recipe) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

interface FavoritesSnapshot {
  storageKey: string;
  recipes: Recipe[];
}

function parseFavorites(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as Recipe[] : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: PropsWithChildren) {
  const { currentUser, loading: authLoading } = useAuth();
  const storageKey = getFavoritesStorageKey(currentUser);
  const activeStorageKeyRef = useRef(storageKey);
  const mutationPendingRef = useRef(false);
  const [snapshot, setSnapshot] = useState<FavoritesSnapshot | null>(null);
  const [isReady, setIsReady] = useState(false);
  activeStorageKeyRef.current = storageKey;

  useEffect(() => {
    let isActive = true;
    setSnapshot(null);
    setIsReady(false);

    if (authLoading) {
      return () => {
        isActive = false;
      };
    }

    if (!storageKey) {
      setIsReady(true);
      return () => {
        isActive = false;
      };
    }

    void AsyncStorage.getItem(storageKey)
      .then(value => {
        if (isActive && activeStorageKeyRef.current === storageKey) {
          setSnapshot({ storageKey, recipes: parseFavorites(value) });
        }
      })
      .catch(() => {
        if (isActive && activeStorageKeyRef.current === storageKey) {
          setSnapshot({ storageKey, recipes: [] });
        }
      })
      .finally(() => {
        if (isActive && activeStorageKeyRef.current === storageKey) {
          setIsReady(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [authLoading, storageKey]);

  const favorites = useMemo(
    () => snapshot?.storageKey === storageKey ? snapshot.recipes : [],
    [snapshot, storageKey],
  );

  const isFavorite = useCallback(
    (recipe: Pick<Recipe, 'id' | 'dishCacheId'>) => {
      const identity = getFavoriteIdentity(recipe);
      return favorites.some(item => getFavoriteIdentity(item) === identity);
    },
    [favorites],
  );

  const toggleFavorite = useCallback(async (recipe: Recipe) => {
    if (!storageKey || !isReady || mutationPendingRef.current) return;

    const identity = getFavoriteIdentity(recipe);
    const nextFavorites = favorites.some(item => getFavoriteIdentity(item) === identity)
      ? favorites.filter(item => getFavoriteIdentity(item) !== identity)
      : [{ ...recipe, isFavorite: true }, ...favorites];

    mutationPendingRef.current = true;
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(nextFavorites));
      if (activeStorageKeyRef.current === storageKey) {
        setSnapshot({ storageKey, recipes: nextFavorites });
      }
    } catch {
      if (activeStorageKeyRef.current === storageKey) {
        Alert.alert(
          'Không thể cập nhật món yêu thích',
          'Thay đổi chưa được lưu. Vui lòng thử lại.',
        );
      }
    } finally {
      mutationPendingRef.current = false;
    }
  }, [favorites, isReady, storageKey]);

  const value = useMemo<FavoritesContextValue>(() => ({
    favorites,
    isFavorite,
    toggleFavorite,
  }), [favorites, isFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
}
