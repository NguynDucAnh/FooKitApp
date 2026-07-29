import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_REDIRECT_URI, GOOGLE_WEB_CLIENT_ID } from '../constants';
import { getJwtPayload } from '../utils/jwt';

WebBrowser.maybeCompleteAuthSession();

async function createRandomValue() {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function getParamsFromUrl(url: string) {
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const hash = url.split('#')[1] ?? '';
  return new URLSearchParams(query || hash);
}

export function assertGoogleClientConfigured() {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Chưa cấu hình EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID cho ứng dụng.');
  }
  if (!GOOGLE_REDIRECT_URI) {
    throw new Error('Chưa cấu hình EXPO_PUBLIC_GOOGLE_REDIRECT_URI cho ứng dụng.');
  }
}

export async function startGoogleAuthSessionAsync() {
  assertGoogleClientConfigured();

  const [state, nonce] = await Promise.all([createRandomValue(), createRandomValue()]);
  const returnUrl = AuthSession.getDefaultReturnUrl();

  const googleParams = new URLSearchParams({
    client_id: GOOGLE_WEB_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'id_token',
    scope: 'openid profile email',
    state,
    nonce,
    prompt: 'select_account',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${googleParams.toString()}`;
  const startUrl = `${GOOGLE_REDIRECT_URI}/start?${new URLSearchParams({
    authUrl,
    returnUrl,
  }).toString()}`;

  const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);

  if (result.type !== 'success') {
    return null;
  }

  const params = getParamsFromUrl(result.url);
  const returnedState = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (error) {
    throw new Error(errorDescription ?? error);
  }

  if (!returnedState || returnedState !== state) {
    throw new Error('Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.');
  }

  const idToken = params.get('id_token');

  if (!idToken) {
    throw new Error('Google không trả về idToken.');
  }

  if (getJwtPayload(idToken)?.nonce !== nonce) {
    throw new Error('Phản hồi Google không khớp phiên đăng nhập. Vui lòng thử lại.');
  }

  return idToken;
}

export function getGoogleSignInErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể đăng nhập bằng Google.';
}
