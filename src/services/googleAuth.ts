import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_REDIRECT_URI, GOOGLE_WEB_CLIENT_ID } from '../constants';

WebBrowser.maybeCompleteAuthSession();

function createRandomValue() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function getParamsFromUrl(url: string) {
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const hash = url.split('#')[1] ?? '';
  return new URLSearchParams(query || hash);
}

export function assertGoogleClientConfigured() {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Chưa cấu hình GOOGLE_WEB_CLIENT_ID trong src/constants/index.ts');
  }
  if (!GOOGLE_REDIRECT_URI) {
    throw new Error('Chưa cấu hình GOOGLE_REDIRECT_URI trong src/constants/index.ts');
  }
}

export async function startGoogleAuthSessionAsync() {
  assertGoogleClientConfigured();

  const state = createRandomValue();
  const nonce = createRandomValue();
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

  return idToken;
}

export function getGoogleSignInErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể đăng nhập bằng Google.';
}
