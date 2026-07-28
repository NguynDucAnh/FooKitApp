import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../tokenStorage';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const mockedDeleteSecureItem = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>;
const mockedGetSecureItem = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockedSetSecureItem = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockedMultiGet = AsyncStorage.multiGet as jest.MockedFunction<typeof AsyncStorage.multiGet>;
const mockedMultiRemove = AsyncStorage.multiRemove as jest.MockedFunction<
  typeof AsyncStorage.multiRemove
>;

describe('tokenStorage secure migration', () => {
  beforeEach(() => {
    mockedDeleteSecureItem.mockResolvedValue();
    mockedSetSecureItem.mockResolvedValue();
  });

  it('reads an existing secure token pair without touching legacy storage', async () => {
    mockedGetSecureItem.mockResolvedValue(JSON.stringify({
      accessToken: 'secure-access',
      refreshToken: 'secure-refresh',
    }));

    await expect(Promise.all([getAccessToken(), getRefreshToken()])).resolves.toEqual([
      'secure-access',
      'secure-refresh',
    ]);
    expect(mockedGetSecureItem).toHaveBeenCalledTimes(1);
    expect(mockedMultiGet).not.toHaveBeenCalled();
  });

  it('migrates a complete legacy token pair before removing AsyncStorage copies', async () => {
    mockedGetSecureItem.mockResolvedValue(null);
    mockedMultiGet.mockResolvedValue([
      ['accessToken', 'legacy-access'],
      ['refreshToken', 'legacy-refresh'],
      ['token', null],
    ]);

    await expect(Promise.all([getAccessToken(), getRefreshToken()])).resolves.toEqual([
      'legacy-access',
      'legacy-refresh',
    ]);
    expect(mockedSetSecureItem).toHaveBeenCalledWith(
      'fookit.authTokens.v1',
      JSON.stringify({
        accessToken: 'legacy-access',
        refreshToken: 'legacy-refresh',
      }),
    );
    expect(mockedMultiRemove).toHaveBeenCalledWith([
      'accessToken',
      'refreshToken',
      'token',
    ]);
  });

  it('stores a validated token pair only in SecureStore', async () => {
    await saveTokens({
      accessToken: ' new-access ',
      refreshToken: ' new-refresh ',
    });

    expect(mockedSetSecureItem).toHaveBeenCalledWith(
      'fookit.authTokens.v1',
      JSON.stringify({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      }),
    );
    expect(mockedMultiRemove).toHaveBeenCalledWith([
      'accessToken',
      'refreshToken',
      'token',
    ]);
  });

  it('rejects an incomplete token pair before persistence', async () => {
    await expect(saveTokens({
      accessToken: 'access-only',
      refreshToken: '',
    })).rejects.toThrow();

    expect(mockedSetSecureItem).not.toHaveBeenCalled();
  });

  it('clears secure and legacy token storage together', async () => {
    await clearTokens();

    expect(mockedDeleteSecureItem).toHaveBeenCalledWith('fookit.authTokens.v1');
    expect(mockedMultiRemove).toHaveBeenCalledWith([
      'accessToken',
      'refreshToken',
      'token',
    ]);
  });
});
