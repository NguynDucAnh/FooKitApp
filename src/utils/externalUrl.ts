import { Linking } from 'react-native';

export interface ExternalUrlOpener {
  canOpenURL: (url: string) => Promise<boolean>;
  openURL: (url: string) => Promise<unknown>;
}

export function getHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const candidate = value.trim();
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
}

export async function openExternalHttpsUrl(
  value: unknown,
  opener: ExternalUrlOpener = Linking,
) {
  const url = getHttpsUrl(value);
  if (!url) {
    throw new Error('Liên kết không hợp lệ hoặc không sử dụng kết nối HTTPS.');
  }

  const supported = await opener.canOpenURL(url);
  if (!supported) {
    throw new Error('Thiết bị không hỗ trợ mở liên kết này.');
  }

  await opener.openURL(url);
  return url;
}
