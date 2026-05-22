import { Pressable, Text, StyleSheet } from 'react-native';

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryChip({ label, isActive, onClick }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onClick}
      style={[styles.chip, isActive && styles.activeChip]}
      android_ripple={{ color: '#D1FAE5' }}
    >
      <Text style={[styles.chipLabel, isActive && styles.activeChipLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    marginBottom: 10
  },
  activeChip: {
    backgroundColor: '#10B981'
  },
  chipLabel: {
    color: '#374151',
    fontWeight: '600'
  },
  activeChipLabel: {
    color: '#FFFFFF'
  }
});
