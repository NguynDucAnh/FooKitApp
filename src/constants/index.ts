const DEFAULT_API_URL =
  'https://fookit-be-gpfhhchcceeyhah3.southeastasia-01.azurewebsites.net';
const DEFAULT_GOOGLE_WEB_CLIENT_ID =
  '77582852441-eqf23tvkj9pskj42c0b15pj499imolb5.apps.googleusercontent.com';
const DEFAULT_GOOGLE_REDIRECT_URI = 'https://auth.expo.io/@thuy1412/fookitapp';

function getPublicConfig(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function withoutTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

interface PublicEnvironment {
  apiUrl?: string;
  googleWebClientId?: string;
  googleRedirectUri?: string;
}

export function resolvePublicConfig(environment: PublicEnvironment) {
  return {
    apiUrl: withoutTrailingSlash(getPublicConfig(environment.apiUrl, DEFAULT_API_URL)),
    googleWebClientId: getPublicConfig(
      environment.googleWebClientId,
      DEFAULT_GOOGLE_WEB_CLIENT_ID
    ),
    googleRedirectUri: withoutTrailingSlash(
      getPublicConfig(environment.googleRedirectUri, DEFAULT_GOOGLE_REDIRECT_URI)
    ),
  };
}

const publicConfig = resolvePublicConfig({
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleRedirectUri: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI,
});

export const API_URL = publicConfig.apiUrl;
export const GOOGLE_WEB_CLIENT_ID = publicConfig.googleWebClientId;
export const GOOGLE_REDIRECT_URI = publicConfig.googleRedirectUri;

export const COLORS = {
  primary: '#5CA63A',
  primaryDark: '#255C26',
  accent: '#F68B1E',
  background: '#FFF8E8',
  surface: '#F7FBF2',
  text: '#1F2F1E',
  textGray: '#6F7B68',
  border: '#DDEED0',
  error: '#D84A2B',
  white: '#FFFFFF',
};
