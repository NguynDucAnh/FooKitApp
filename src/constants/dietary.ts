export interface DietaryOption {
  value: number;
  label: string;
}

// Preserve both currently shipped mappings until Backend/BA confirms DietaryType.
// The OpenAPI snapshot defines the type only as an integer.
export const HOME_DIET_OPTIONS: readonly DietaryOption[] = [
  { label: 'Không giới hạn', value: 0 },
  { label: 'Thuần chay', value: 1 },
  { label: 'Ăn chay', value: 2 },
  { label: 'Keto', value: 3 },
  { label: 'Eat Clean', value: 4 },
  { label: 'Paleo', value: 5 },
  { label: 'Không gluten', value: 6 },
  { label: 'Không sữa', value: 7 },
];

export const PROFILE_DIET_OPTIONS: readonly DietaryOption[] = [
  { value: 1, label: 'Cân bằng' },
  { value: 2, label: 'Ăn chay' },
  { value: 3, label: 'Thuần chay' },
  { value: 4, label: 'Ít carb' },
  { value: 5, label: 'Giàu đạm' },
  { value: 6, label: 'Keto' },
];

export function findDietaryOption(
  options: readonly DietaryOption[],
  value: number,
): DietaryOption | undefined {
  return options.find(option => option.value === value);
}

export function findDietaryMappingConflicts(
  left: readonly DietaryOption[],
  right: readonly DietaryOption[],
): { value: number; leftLabel: string; rightLabel: string }[] {
  return left.flatMap(leftOption => {
    const rightOption = findDietaryOption(right, leftOption.value);
    if (!rightOption || rightOption.label === leftOption.label) return [];
    return [{
      value: leftOption.value,
      leftLabel: leftOption.label,
      rightLabel: rightOption.label,
    }];
  });
}
