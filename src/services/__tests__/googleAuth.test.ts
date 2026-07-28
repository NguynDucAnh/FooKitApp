import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { startGoogleAuthSessionAsync } from '../googleAuth';

jest.mock('expo-auth-session', () => ({
  getDefaultReturnUrl: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(),
}));

jest.mock('../../constants', () => ({
  GOOGLE_REDIRECT_URI: 'https://auth.example.test',
  GOOGLE_WEB_CLIENT_ID: 'google-client-id',
}));

const mockedGetDefaultReturnUrl = AuthSession.getDefaultReturnUrl as jest.MockedFunction<
  typeof AuthSession.getDefaultReturnUrl
>;
const mockedGetRandomBytes = Crypto.getRandomBytesAsync as jest.MockedFunction<
  typeof Crypto.getRandomBytesAsync
>;
const mockedOpenAuthSession = WebBrowser.openAuthSessionAsync as jest.MockedFunction<
  typeof WebBrowser.openAuthSessionAsync
>;

function createUnsignedJwt(payload: Record<string, unknown>) {
  const encode = (value: object) => Buffer
    .from(JSON.stringify(value), 'utf8')
    .toString('base64url');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.`;
}

function getOAuthParams(startUrl: string) {
  const startParams = new URL(startUrl).searchParams;
  const authUrl = startParams.get('authUrl');
  if (!authUrl) throw new Error('Missing authUrl in OAuth start URL');
  return new URL(authUrl).searchParams;
}

describe('Google OAuth session validation', () => {
  beforeEach(() => {
    mockedGetDefaultReturnUrl.mockReturnValue('fookitapp://expo-auth-session');
    mockedGetRandomBytes
      .mockResolvedValueOnce(new Uint8Array(32).fill(1))
      .mockResolvedValueOnce(new Uint8Array(32).fill(2));
  });

  it('uses cryptographic state and nonce and accepts only the matching response', async () => {
    mockedOpenAuthSession.mockImplementation(async (startUrl, returnUrl) => {
      const params = getOAuthParams(startUrl);
      const state = params.get('state');
      const nonce = params.get('nonce');
      const idToken = createUnsignedJwt({ nonce });

      return {
        type: 'success',
        url: `${returnUrl}?state=${state}&id_token=${idToken}`,
      };
    });

    const idToken = await startGoogleAuthSessionAsync();

    expect(idToken).toBeTruthy();
    expect(mockedGetRandomBytes).toHaveBeenCalledTimes(2);
    const params = getOAuthParams(mockedOpenAuthSession.mock.calls[0][0]);
    expect(params.get('state')).toHaveLength(64);
    expect(params.get('nonce')).toHaveLength(64);
  });

  it('rejects a response that omits state', async () => {
    mockedOpenAuthSession.mockImplementation(async (startUrl, returnUrl) => {
      const nonce = getOAuthParams(startUrl).get('nonce');
      return {
        type: 'success',
        url: `${returnUrl}?id_token=${createUnsignedJwt({ nonce })}`,
      };
    });

    await expect(startGoogleAuthSessionAsync()).rejects.toThrow('Google');
  });

  it('rejects an ID token with a different nonce', async () => {
    mockedOpenAuthSession.mockImplementation(async (startUrl, returnUrl) => {
      const state = getOAuthParams(startUrl).get('state');
      return {
        type: 'success',
        url: `${returnUrl}?state=${state}&id_token=${createUnsignedJwt({
          nonce: 'different-nonce',
        })}`,
      };
    });

    await expect(startGoogleAuthSessionAsync()).rejects.toThrow('Google');
  });
});
