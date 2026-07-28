import { Linking, StyleSheet, View, Text, ScrollView, ImageBackground, Pressable } from 'react-native';
import { ArrowLeft, Star, Heart, BookmarkPlus, Share2 } from 'lucide-react-native';
import { Recipe } from '../data/recipes';
import { useFavorites } from '../context/FavoritesContext';
import { RecipeNutrition, RecipeStats } from './recipe/RecipeSummary';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
  loadingRemoteDetail?: boolean;
  remoteDetailError?: string;
}

export function RecipeDetailScreen({ recipe, onBack, loadingRemoteDetail = false, remoteDetailError = '' }: RecipeDetailScreenProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <ImageBackground source={{ uri: recipe.image }} style={styles.heroImage}>
        <View style={styles.heroOverlay} />
        <Pressable style={styles.backButton} onPress={onBack} android_ripple={{ color: '#E5E7EB' }}>
          <ArrowLeft size={20} color="#111827" />
        </Pressable>
        <View style={styles.heroActions}>
          <Pressable style={[styles.iconButton, styles.heroActionButton]} onPress={() => toggleFavorite(recipe)} android_ripple={{ color: '#E5E7EB' }}>
            <Heart size={20} color={favorited ? '#DC2626' : '#111827'} fill={favorited ? '#DC2626' : 'transparent'} />
          </Pressable>
          <Pressable style={styles.iconButton} android_ripple={{ color: '#E5E7EB' }}>
            <Share2 size={20} color="#111827" />
          </Pressable>
        </View>
        <View style={styles.heroFooter}>
          <View style={styles.categoriesRow}>
            {recipe.category.slice(0, 2).map((cat, index) => (
              <View key={cat} style={[styles.categoryBadge, index > 0 && styles.categoryBadgeSpacing]}>
                <Text style={styles.categoryBadgeText}>{cat}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.recipeTitle}>{recipe.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={18} color="#F59E0B" />
            <Text style={styles.ratingText}>{recipe.rating}</Text>
            <Text style={styles.ratingSubtext}>(128 đánh giá)</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.body}>
        {loadingRemoteDetail && (
          <View style={styles.remoteDetailNotice}>
            <Text style={styles.remoteDetailNoticeText}>Đang tải công thức chi tiết...</Text>
          </View>
        )}
        {!!remoteDetailError && <Text style={styles.remoteDetailError}>{remoteDetailError}</Text>}
        <RecipeStats recipe={recipe} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dụng cụ cần có</Text>
          <View style={styles.wrapRow}>
            {recipe.tools.map((tool) => (
              <View key={tool} style={styles.tag}>
                <Text style={styles.tagText}>{tool}</Text>
              </View>
            ))}
          </View>
        </View>

        <RecipeNutrition nutrition={recipe.nutrition} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nguyên liệu</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientIndex}>
                <Text style={styles.ingredientIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.ingredientTextWrap}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                {!!ingredient.amount && <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>}
                {!!ingredient.rawIngredientName && ingredient.rawIngredientName.toLocaleLowerCase('vi') !== ingredient.name.toLocaleLowerCase('vi') && (
                  <Text style={styles.rawIngredientText}>Tên nguyên liệu ban đầu: {ingredient.rawIngredientName}</Text>
                )}
                <View style={styles.ingredientStatusRow}>
                  {ingredient.isMatched && <View style={styles.matchedBadge}><Text style={styles.matchedBadgeText}>Đã chuẩn hóa</Text></View>}
                  {ingredient.isPriced && typeof ingredient.estimatedPrice === 'number' && !ingredient.affiliateProduct && (
                    <Text style={styles.estimatedPrice}>Giá dự kiến: {ingredient.estimatedPrice.toLocaleString('vi-VN')} đ</Text>
                  )}
                </View>
                {ingredient.affiliateProduct && (
                  <Pressable style={styles.affiliateBox} onPress={() => Linking.openURL(ingredient.affiliateProduct!.productUrl)}>
                    <Text style={styles.affiliateLabel}>Mua gợi ý</Text>
                    <Text style={styles.affiliateName}>{ingredient.affiliateProduct.productName}</Text>
                    <Text style={styles.affiliatePrice}>{ingredient.affiliateProduct.price.toLocaleString('vi-VN')} đ</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cách thực hiện</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.instructionIndex}>
                <Text style={styles.instructionIndexText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomBar}>
          <Pressable style={[styles.actionButton, styles.actionButtonMargin]} android_ripple={{ color: '#D1FAE5' }}>
            <Text style={styles.actionButtonText}>Bắt đầu nấu</Text>
          </Pressable>
          <Pressable style={styles.iconButton} android_ripple={{ color: '#E5E7EB' }}>
            <BookmarkPlus size={20} color="#111827" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  contentContainer: {
    paddingBottom: 140
  },
  heroImage: {
    width: '100%',
    height: 260,
    justifyContent: 'space-between'
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)'
  },
  backButton: {
    margin: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroActions: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row'
  },
  heroActionButton: {
    marginRight: 10
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroFooter: {
    margin: 20
  },
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  categoryBadge: {
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999
  },
  categoryBadgeSpacing: {
    marginLeft: 8
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  recipeTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  ratingSubtext: {
    marginLeft: 6,
    color: 'rgba(255,255,255,0.85)'
  },
  body: {
    padding: 20
  },
  remoteDetailNotice: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  remoteDetailNoticeText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '700',
  },
  remoteDetailError: {
    color: '#B45309',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12
  },
  statsLabel: {
    color: '#475569',
    marginTop: 8,
    marginBottom: 4
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  statsEmoji: {
    fontSize: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10
  },
  tagText: {
    color: '#374151',
    fontWeight: '600'
  },
  nutritionCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    padding: 18
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5'
  },
  nutritionLabel: {
    color: '#475569'
  },
  nutritionValue: {
    fontWeight: '700',
    color: '#111827'
  },
  ingredientRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12
  },
  ingredientIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  ingredientIndexText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  ingredientTextWrap: {
    flex: 1
  },
  ingredientName: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  ingredientAmount: {
    color: '#6B7280'
  },
  rawIngredientText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },
  ingredientStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 7,
  },
  matchedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 8,
  },
  matchedBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  estimatedPrice: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  affiliateBox: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  affiliateLabel: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3
  },
  affiliateName: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700'
  },
  affiliatePrice: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  instructionIndex: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  instructionIndexText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  instructionText: {
    flex: 1,
    color: '#374151',
    lineHeight: 22
  },
  bottomBar: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 30
  },
  actionButtonMargin: {
    marginRight: 12
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700'
  }
});
