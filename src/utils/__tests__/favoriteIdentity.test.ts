import { getFavoriteIdentity, getFavoritesStorageKey } from '../favoriteIdentity';

describe('favorite identity', () => {
  it('prefers the backend dish cache identity over a list-specific id', () => {
    expect(getFavoriteIdentity({
      id: 'list-item-1',
      dishCacheId: ' dish-cache-1 ',
    })).toBe('dish-cache-1');
  });

  it('falls back to the normalized recipe id when no dish cache identity exists', () => {
    expect(getFavoriteIdentity({ id: ' recipe-1 ' })).toBe('recipe-1');
  });

  it('creates a user-scoped storage key from a stable user id', () => {
    expect(getFavoritesStorageKey({
      id: 'user/id 1',
      username: 'ignored-user',
    })).toBe('@fookit/favorite-recipes/v2/user%2Fid%201');
  });

  it('uses a normalized username only when the user id is unavailable', () => {
    expect(getFavoritesStorageKey({
      username: ' Test_User ',
    })).toBe('@fookit/favorite-recipes/v2/test_user');
    expect(getFavoritesStorageKey(null)).toBeNull();
  });
});
