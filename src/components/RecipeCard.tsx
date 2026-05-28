import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { Clock, Flame, Heart, ChevronRight } from 'lucide-react-native';
import { Recipe } from '../data/recipes';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteToggle?: (id: string) => void;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onFavoriteToggle, onClick }: RecipeCardProps) {
  return (
    <Pressable style={styles.card} onPress={onClick} android_ripple={{ color: '#F3F4F6' }}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        <Pressable
          style={styles.favoriteButton}
          onPress={() => onFavoriteToggle?.(recipe.id)}
          android_ripple={{ color: '#E5E7EB' }}
        >
          <Heart size={18} color={recipe.isFavorite ? '#DC2626' : '#4B5563'} />
        </Pressable>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {recipe.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color="#4B5563" />
            <Text style={styles.metaText}>{recipe.time} phút</Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={14} color="#4B5563" />
            <Text style={styles.metaText}>{recipe.calories} calo</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.metaText}>{recipe.rating}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.priceText}>{recipe.budget.toLocaleString('vi-VN')} đ</Text>
          <View style={styles.chevronButton}>
            <ChevronRight size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 5,
    marginBottom: 16
  },
  imageWrapper: {
    position: 'relative'
  },
  image: {
    width: '100%',
    height: 180
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  difficultyBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  difficultyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  cardContent: {
    padding: 16
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  metaText: {
    color: '#4B5563',
    fontSize: 12,
    marginLeft: 6
  },
  ratingStar: {
    color: '#F59E0B',
    fontSize: 12,
    marginRight: 4
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981'
  },
  chevronButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
