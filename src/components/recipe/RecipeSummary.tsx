import { StyleSheet, Text, View } from 'react-native';
import { Clock, DollarSign, Flame } from 'lucide-react-native';
import { Recipe } from '../../data/recipes';

export function RecipeStats({ recipe }: { recipe: Recipe }) {
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statsCard}>
        <Clock size={18} color="#16A34A" />
        <Text style={styles.statsLabel}>Thời gian</Text>
        <Text style={styles.statsValue}>{recipe.time} phút</Text>
      </View>
      <View style={styles.statsCard}>
        <Flame size={18} color="#F59E0B" />
        <Text style={styles.statsLabel}>Calo</Text>
        <Text style={styles.statsValue}>{recipe.calories}</Text>
      </View>
      <View style={styles.statsCard}>
        <DollarSign size={18} color="#16A34A" />
        <Text style={styles.statsLabel}>Chi phí</Text>
        <Text style={styles.statsValue}>{recipe.budget.toLocaleString('vi-VN')} đ</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsEmoji}>👨‍🍳</Text>
        <Text style={styles.statsLabel}>Độ khó</Text>
        <Text style={styles.statsValue}>{recipe.difficulty}</Text>
      </View>
    </View>
  );
}

export function RecipeNutrition({ nutrition }: { nutrition: Recipe['nutrition'] }) {
  const nutrients = [
    ['Chất đạm', nutrition.protein],
    ['Tinh bột', nutrition.carbs],
    ['Chất béo', nutrition.fat],
    ['Chất xơ', nutrition.fiber],
  ] as const;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thông tin dinh dưỡng</Text>
      <View style={styles.nutritionCard}>
        {nutrients.map(([label, value]) => (
          <View key={label} style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>{label}</Text>
            <Text style={styles.nutritionValue}>{value}g</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  statsLabel: {
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statsEmoji: {
    fontSize: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  nutritionCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    padding: 18,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  nutritionLabel: {
    color: '#475569',
  },
  nutritionValue: {
    fontWeight: '700',
    color: '#111827',
  },
});
