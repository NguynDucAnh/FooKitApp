import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { Clock, Flame, Heart, ChevronRight, ImageOff } from 'lucide-react-native';
import { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onFavoriteToggle, onClick }: RecipeCardProps) {
  const timeLabel = typeof recipe.time === 'number' ? `${recipe.time} phút` : 'Chưa có dữ liệu';
  const caloriesLabel = typeof recipe.calories === 'number' ? `${recipe.calories} calo` : 'Chưa có dữ liệu';
  const ratingLabel = typeof recipe.rating === 'number' ? recipe.rating.toString() : 'Chưa có đánh giá';
  const budgetLabel = typeof recipe.budget === 'number'
    ? `${recipe.budget.toLocaleString('vi-VN')} đ`
    : 'Chưa có dữ liệu';

  return (
    <Pressable
      style={styles.card}
      onPress={onClick}
      android_ripple={{ color: '#F3F4F6' }}
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết món ${recipe.name}`}
    >
      <View style={styles.imageWrapper}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <ImageOff size={28} color="#64748B" />
            <Text style={styles.imagePlaceholderText}>Chưa có ảnh món ăn</Text>
          </View>
        )}
        <Pressable
          style={styles.favoriteButton}
          onPress={(event: GestureResponderEvent) => {
            event.stopPropagation();
            onFavoriteToggle?.();
          }}
          android_ripple={{ color: '#E5E7EB' }}
          accessibilityRole="button"
          accessibilityLabel={recipe.isFavorite
            ? `Bỏ món ${recipe.name} khỏi danh sách yêu thích`
            : `Lưu món ${recipe.name} vào danh sách yêu thích`}
          accessibilityState={{ selected: recipe.isFavorite }}
        >
          <Heart size={18} color={recipe.isFavorite ? '#DC2626' : '#4B5563'} fill={recipe.isFavorite ? '#DC2626' : 'transparent'} />
        </Pressable>
        {!!recipe.difficulty && (
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {recipe.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color="#4B5563" />
            <Text style={styles.metaText}>{timeLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={14} color="#4B5563" />
            <Text style={styles.metaText}>{caloriesLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.metaText}>{ratingLabel}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.priceText}>{budgetLabel}</Text>
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
  imagePlaceholder: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imagePlaceholderText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
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
