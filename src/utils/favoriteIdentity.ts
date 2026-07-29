import type { AuthUser } from '../types/auth';
import type { Recipe } from '../types/recipe';

const FAVORITES_STORAGE_PREFIX = '@fookit/favorite-recipes/v2';

export function getFavoriteIdentity(
  recipe: Pick<Recipe, 'id' | 'dishCacheId'>,
) {
  return recipe.dishCacheId?.trim() || recipe.id.trim();
}

export function getFavoritesStorageKey(
  user: Pick<AuthUser, 'id' | 'username'> | null,
) {
  const identity = user?.id?.trim() || user?.username?.trim().toLocaleLowerCase('en-US');
  return identity
    ? `${FAVORITES_STORAGE_PREFIX}/${encodeURIComponent(identity)}`
    : null;
}
