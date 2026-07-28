import { getJwtPayload, getRolesFromJwt, hasAdminRole, isJwtExpired } from '../jwt';

function createUnsignedJwt(payload: Record<string, unknown>) {
  const encode = (value: object) => Buffer
    .from(JSON.stringify(value), 'utf8')
    .toString('base64url');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.`;
}

describe('JWT utilities', () => {
  test('decodes a valid base64url payload without using a real token', () => {
    const token = createUnsignedJwt({ sub: 'user-1', name: 'Nguyễn An', exp: 2_000 });

    expect(getJwtPayload(token)).toEqual({
      sub: 'user-1',
      name: 'Nguyễn An',
      exp: 2_000,
    });
  });

  test.each([
    [undefined],
    [''],
    ['header-only'],
    ['header.@@@.signature'],
    [`header.${Buffer.from('not-json').toString('base64url')}.signature`],
  ])('returns null for a missing or malformed token %#', (token) => {
    expect(getJwtPayload(token)).toBeNull();
  });

  test('treats missing or non-numeric exp as expired', () => {
    expect(isJwtExpired(createUnsignedJwt({ sub: 'user-1' }), 1_000)).toBe(true);
    expect(isJwtExpired(createUnsignedJwt({ exp: '2000' }), 1_000)).toBe(true);
  });

  test('handles expiration and a safety clock-skew window', () => {
    const token = createUnsignedJwt({ exp: 1_100 });

    expect(isJwtExpired(token, 1_000)).toBe(false);
    expect(isJwtExpired(token, 1_000, 100)).toBe(true);
    expect(isJwtExpired(createUnsignedJwt({ exp: 999 }), 1_000)).toBe(true);
  });

  test('normalizes admin role claim variants', () => {
    const schemaClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const token = createUnsignedJwt({
      role: 'User',
      Roles: ['Editor'],
      [schemaClaim]: 'Admin,Auditor',
    });

    expect(getRolesFromJwt(token)).toEqual(['User', 'Editor', 'Admin', 'Auditor']);
    expect(hasAdminRole(getRolesFromJwt(token))).toBe(true);
    expect(hasAdminRole('ADMIN')).toBe(true);
    expect(hasAdminRole(['User'])).toBe(false);
  });
});
