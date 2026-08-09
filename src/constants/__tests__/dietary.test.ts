import {
  findDietaryMappingConflicts,
  findDietaryOption,
  HOME_DIET_OPTIONS,
  PROFILE_DIET_OPTIONS,
} from '../dietary';

describe('dietary mappings', () => {
  it.each([
    ['Home', HOME_DIET_OPTIONS],
    ['Profile', PROFILE_DIET_OPTIONS],
  ] as const)('%s mapping has unique integer values and non-empty labels', (_name, options) => {
    expect(new Set(options.map(option => option.value)).size).toBe(options.length);

    for (const option of options) {
      expect(Number.isInteger(option.value)).toBe(true);
      expect(option.label.trim()).not.toBe('');
    }
  });

  it('does not silently coerce an unknown backend value', () => {
    expect(findDietaryOption(HOME_DIET_OPTIONS, 999)).toBeUndefined();
    expect(findDietaryOption(PROFILE_DIET_OPTIONS, 999)).toBeUndefined();
  });

  it('uses one consistent backend enum mapping across Home and Profile', () => {
    expect(findDietaryMappingConflicts(HOME_DIET_OPTIONS, PROFILE_DIET_OPTIONS)).toEqual([]);
    expect(PROFILE_DIET_OPTIONS).toEqual(
      HOME_DIET_OPTIONS.filter(option => option.value !== 0),
    );
  });
});
