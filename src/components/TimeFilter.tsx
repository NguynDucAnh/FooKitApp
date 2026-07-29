import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';

interface TimeFilterProps {
  filters: { label: string; value: number }[];
  selectedTime: number | null;
  onSelect: (value: number) => void;
}

export function TimeFilter({ filters, selectedTime, onSelect }: TimeFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {filters.map((filter) => {
        const isSelected = selectedTime === filter.value;
        return (
          <Pressable
            key={filter.value}
            onPress={() => onSelect(filter.value)}
            style={[styles.filterButton, isSelected ? styles.filterButtonActive : styles.filterButtonInactive]}
            android_ripple={{ color: '#D1FAE5' }}
            accessibilityRole="button"
            accessibilityLabel={filter.label}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 6
  },
  filterButton: {
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    backgroundColor: '#FFFFFF'
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  filterButtonInactive: {
    backgroundColor: '#FFFFFF'
  },
  filterText: {
    color: '#374151',
    fontWeight: '600'
  },
  filterTextActive: {
    color: '#FFFFFF'
  }
});
