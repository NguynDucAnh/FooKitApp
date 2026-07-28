function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

  try {
    const binary = typeof globalThis.atob === 'function'
      ? globalThis.atob(padded)
      : decodeBase64ToBinary(padded);

    return decodeURIComponent(binary
      .split('')
      .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
    );
  } catch {
    return null;
  }
}

function decodeBase64ToBinary(value: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const char of value) {
    if (char === '=') break;

    const index = chars.indexOf(char);
    if (index < 0) continue;

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

export function getJwtPayload(token?: string | null): Record<string, unknown> | null {
  if (!token) return null;

  const payload = token.split('.')[1];
  if (!payload) return null;

  const decoded = decodeBase64Url(payload);
  if (!decoded) return null;

  try {
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRolesFromJwt(token?: string | null) {
  const payload = getJwtPayload(token);
  if (!payload) return [];

  const roleClaims = [
    payload.role,
    payload.roles,
    payload.Role,
    payload.Roles,
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'],
  ];

  return roleClaims.flatMap(claim => {
    if (Array.isArray(claim)) return claim;
    if (typeof claim === 'string') return claim.split(',');
    return [];
  }).map(role => String(role).trim()).filter(Boolean);
}

export function isJwtExpired(token?: string | null, clockSkewSeconds = 30) {
  const payload = getJwtPayload(token);
  const expiresAt = payload?.exp;

  if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return expiresAt <= nowInSeconds + clockSkewSeconds;
}

export function hasAdminRole(roles?: string[] | string | null) {
  const values = Array.isArray(roles) ? roles : roles ? [roles] : [];
  return values.some(role => role.toLowerCase() === 'admin');
}
