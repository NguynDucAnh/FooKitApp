import { View, Pressable, Text, StyleSheet } from 'react-native';

interface BudgetSelectorProps {
  options: { label: string; value: number }[];
  selectedBudget: number | null;
  onSelect: (value: number) => void;
}

export function BudgetSelector({ options, selectedBudget, onSelect }: BudgetSelectorProps) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isSelected = selectedBudget === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.option, isSelected ? styles.optionActive : styles.optionInactive]}
            android_ripple={{ color: '#D1FAE5' }}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    margin: 8,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  optionInactive: {
    backgroundColor: '#FFFFFF'
  },
  optionText: {
    color: '#374151',
    fontWeight: '600'
  },
  optionTextActive: {
    color: '#FFFFFF'
  }
});
