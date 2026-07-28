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

  it('characterizes the unresolved Home/Profile enum conflict', () => {
    expect(findDietaryMappingConflicts(HOME_DIET_OPTIONS, PROFILE_DIET_OPTIONS)).toEqual([
      { value: 1, leftLabel: 'Thuần chay', rightLabel: 'Cân bằng' },
      { value: 3, leftLabel: 'Keto', rightLabel: 'Thuần chay' },
      { value: 4, leftLabel: 'Eat Clean', rightLabel: 'Ít carb' },
      { value: 5, leftLabel: 'Paleo', rightLabel: 'Giàu đạm' },
      { value: 6, leftLabel: 'Không gluten', rightLabel: 'Keto' },
    ]);
  });
});
