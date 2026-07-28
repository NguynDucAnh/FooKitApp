import {
  getArrayField,
  getBooleanField,
  getNumberField,
  getStringField,
  unwrapApiResponse,
} from '../apiNormalize';

describe('apiNormalize', () => {
  test('unwraps an API envelope and preserves a direct payload', () => {
    expect(unwrapApiResponse({ data: { data: { id: 'dish-1' } } })).toEqual({ id: 'dish-1' });
    expect(unwrapApiResponse({ data: { id: 'dish-2' } })).toEqual({ id: 'dish-2' });
  });

  test('reads the first non-empty string across casing variants', () => {
    const source = { name: '   ', FullName: 'Nguyễn An', full_name: 'ignored' };
    expect(getStringField(source, ['name', 'FullName', 'full_name'])).toBe('Nguyễn An');
    expect(getStringField(null, ['name'])).toBeUndefined();
    expect(getStringField({ name: 42 }, ['name'])).toBeUndefined();
  });

  test.each([
    [{ active: true }, true],
    [{ active: ' TRUE ' }, true],
    [{ active: 'false' }, false],
    [{ active: 1 }, true],
    [{ active: 0 }, false],
    [{ active: 'unknown' }, undefined],
    [null, undefined],
  ])('normalizes boolean value %#', (source, expected) => {
    expect(getBooleanField(source, ['active'])).toBe(expected);
  });

  test.each([
    [{ amount: 0 }, 0],
    [{ amount: 12.5 }, 12.5],
    [{ amount: ' 42 ' }, 42],
    [{ amount: '' }, undefined],
    [{ amount: Number.POSITIVE_INFINITY }, undefined],
    [{ amount: 'not-a-number' }, undefined],
    [undefined, undefined],
  ])('normalizes finite number value %#', (source, expected) => {
    expect(getNumberField(source, ['amount'])).toBe(expected);
  });

  test('reads arrays without treating null or objects as arrays', () => {
    expect(getArrayField<number>({ Items: [0, 1] }, ['items', 'Items'])).toEqual([0, 1]);
    expect(getArrayField({ items: null }, ['items'])).toBeUndefined();
    expect(getArrayField({ items: {} }, ['items'])).toBeUndefined();
    expect(getArrayField(undefined, ['items'])).toBeUndefined();
  });
});
