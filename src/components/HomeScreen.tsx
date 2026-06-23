import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, StyleSheet, View, Text, TextInput, ScrollView, Image, Pressable, ImageBackground } from 'react-native';
import { Bell, Sparkles, Sunrise, Sun, Moon, ChefHat } from 'lucide-react-native';
import { RecipeCard } from './RecipeCard';
import { recipes, Recipe } from '../data/recipes';
import { homepageService } from '../services/homepageService';
import { dishService } from '../services/dishService';
import { SuggestedDish } from '../types/homepage';
import { SuggestedDishResult } from '../types/dish';

const EQUIPMENT_OPTIONS = [
  { label: 'Lò nướng', value: 'oven' },
  { label: 'Chảo', value: 'pan' },
  { label: 'Nồi', value: 'pot' },
  { label: 'Nồi chiên', value: 'air_fryer' },
  { label: 'Máy xay', value: 'blender' },
];

const DIET_OPTIONS = [
  { label: 'Không giới hạn', value: 0 },
  { label: 'Thuần chay', value: 1 },
  { label: 'Ăn chay', value: 2 },
  { label: 'Keto', value: 3 },
  { label: 'Eat Clean', value: 4 },
  { label: 'Paleo', value: 5 },
  { label: 'Không gluten', value: 6 },
  { label: 'Không sữa', value: 7 },
];

const MEAL_IMAGES = {
  breakfast: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
};

type MealKey = 'breakfast' | 'lunch' | 'dinner';

function toArray(value: SuggestedDish['category'] | SuggestedDish['categories'], fallback: string[]) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return fallback;
}

function normalizeIngredients(value: SuggestedDish['ingredients']) {
  if (!Array.isArray(value) || value.length === 0) {
    return [{ name: 'Nguyên liệu', amount: 'BE chưa cung cấp chi tiết' }];
  }

  return value.map((item) => {
    if (typeof item === 'string') return { name: item, amount: 'vừa đủ' };
    return {
      name: item.name || 'Nguyên liệu',
      amount: item.amount || 'vừa đủ',
    };
  });
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeInstructions(value: SuggestedDish['instructions']) {
  if (Array.isArray(value) && value.length) return value.filter(Boolean);

  if (typeof value === 'string') {
    const text = stripHtml(value);
    if (text) {
      return text
        .split(/(?:\.\s+|\n+)/)
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  return [
    'BE chưa cung cấp hướng dẫn chi tiết cho món này.',
    'Bạn có thể mở công thức nguồn hoặc thử lại khi dữ liệu được đồng bộ đầy đủ hơn.',
  ];
}

function normalizeDifficulty(value?: string): Recipe['difficulty'] {
  if (value === 'Trung bình' || value === 'Khó' || value === 'Dễ') return value;
  const normalized = value?.toLowerCase();
  if (normalized?.includes('hard') || normalized?.includes('khó')) return 'Khó';
  if (normalized?.includes('medium') || normalized?.includes('trung')) return 'Trung bình';
  return 'Dễ';
}

function getBudget(dish: SuggestedDish) {
  const cost = dish.budget ?? dish.estimatedCost ?? dish.totalCost ?? dish.price;
  return typeof cost === 'number' && cost > 0 ? cost : 0;
}

function mapDishToRecipe(dish: SuggestedDish, meal: MealKey, index: number): Recipe {
  const mealLabel = meal === 'breakfast' ? 'Bữa sáng' : meal === 'lunch' ? 'Bữa trưa' : 'Bữa tối';
  const name = dish.name || dish.dishName || dish.title || `${mealLabel} gợi ý ${index + 1}`;

  return {
    id: dish.id || `${meal}-${index}-${name}`,
    dishCacheId: dish.dishCacheId || dish.dish_cache_id || dish.DishCacheId,
    name,
    image: dish.image || dish.imageUrl || dish.thumbnailUrl || MEAL_IMAGES[meal],
    rating: dish.rating || 4.8,
    time: dish.time || dish.cookingTime || dish.cookingTimeMinutes || 25,
    calories: dish.calories || dish.kcal || 420,
    difficulty: normalizeDifficulty(dish.difficulty),
    category: toArray(dish.categories || dish.category, [mealLabel]),
    budget: getBudget(dish),
    tools: Array.isArray(dish.tools) && dish.tools.length ? dish.tools : ['Bếp gia đình'],
    isFavorite: false,
    ingredients: normalizeIngredients(dish.ingredients),
    instructions: normalizeInstructions(dish.instructions),
    nutrition: {
      protein: dish.nutrition?.protein || 20,
      carbs: dish.nutrition?.carbs || 45,
      fat: dish.nutrition?.fat || 14,
      fiber: dish.nutrition?.fiber || 6,
    },
  };
}

function mapSuggestedDishToRecipe(dish: SuggestedDishResult, index: number): Recipe {
  const instructions = normalizeInstructions(dish.instructions);

  return {
    id: `suggest-${index}-${dish.dishName}`,
    dishCacheId: dish.dishCacheId || dish.dish_cache_id || dish.DishCacheId,
    name: dish.dishName || `Món gợi ý ${index + 1}`,
    image: dish.imageUrl || MEAL_IMAGES.dinner,
    rating: 4.8,
    time: 25,
    calories: 420,
    difficulty: 'Dễ',
    category: ['Gợi ý tối ưu'],
    budget: typeof dish.totalCost === 'number' ? dish.totalCost : 0,
    tools: ['Theo thiết bị đã chọn'],
    isFavorite: false,
    ingredients: Array.isArray(dish.ingredients) && dish.ingredients.length
      ? dish.ingredients.map(ingredient => ({
        name: ingredient.standardIngredientName || ingredient.rawEnglishName || 'Nguyên liệu',
        amount: ingredient.rawEnglishName || 'vừa đủ',
        rawEnglishName: ingredient.rawEnglishName,
        isMapped: ingredient.isMapped,
        affiliateProduct: ingredient.affiliateProduct
          ? {
            productName: ingredient.affiliateProduct.productName,
            productUrl: ingredient.affiliateProduct.productUrl,
            price: ingredient.affiliateProduct.price ?? ingredient.affiliateProduct.currentPriceAmount ?? 0,
          }
          : null,
      }))
      : [{ name: 'Nguyên liệu', amount: 'BE chưa cung cấp chi tiết' }],
    instructions,
    nutrition: {
      protein: 20,
      carbs: 45,
      fat: 14,
      fiber: 6,
    },
  };
}

interface HomeScreenProps {
  onRecipeClick: (recipe: Recipe) => void;
}

export function HomeScreen({ onRecipeClick }: HomeScreenProps) {
  const [suggestEquipment, setSuggestEquipment] = useState('oven');
  const [suggestDiet, setSuggestDiet] = useState(0);
  const [suggestBudget, setSuggestBudget] = useState('100000');
  const [suggestedDishes, setSuggestedDishes] = useState<Recipe[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');
  const [suggestions, setSuggestions] = useState<{ breakfast: Recipe[]; lunch: Recipe[]; dinner: Recipe[] }>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [isPremiumExpired, setIsPremiumExpired] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(
    new Set(recipes.filter((r) => r.isFavorite).map((r) => r.id))
  );

  async function loadSuggestions() {
    setSuggestionsLoading(true);
    setSuggestionsError('');
    try {
      const result = await homepageService.getSuggestions();
      setIsPremiumExpired(result.isPremiumExpired);
      setSuggestions({
        breakfast: result.breakfast.map((dish, index) => mapDishToRecipe(dish, 'breakfast', index)),
        lunch: result.lunch.map((dish, index) => mapDishToRecipe(dish, 'lunch', index)),
        dinner: result.dinner.map((dish, index) => mapDishToRecipe(dish, 'dinner', index)),
      });
    } catch {
      setSuggestionsError('Không thể tải thực đơn hôm nay. Đang hiển thị công thức mẫu để bạn tham khảo.');
      setSuggestions({
        breakfast: recipes.filter(recipe => recipe.category.includes('Bữa sáng')).slice(0, 3),
        lunch: recipes.filter(recipe => recipe.category.includes('Bữa trưa')).slice(0, 3),
        dinner: recipes.filter(recipe => recipe.category.includes('Bữa tối')).slice(0, 3),
      });
    } finally {
      setSuggestionsLoading(false);
    }
  }

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function handleSuggestDishes() {
    const budget = Number(suggestBudget.replace(/[^\d]/g, ''));
    if (!budget || budget <= 0) {
      Alert.alert('Ngân sách không hợp lệ', 'Vui lòng nhập ngân sách lớn hơn 0.');
      return;
    }

    setSuggestLoading(true);
    setSuggestError('');
    try {
      const result = await dishService.suggestDishes({
        equipment: suggestEquipment,
        diet: suggestDiet,
        budget,
      });
      const mappedDishes = result.suggestedDishes.map(mapSuggestedDishToRecipe);
      setSuggestedDishes(mappedDishes);
      if (mappedDishes.length === 0) {
        setSuggestError('Chưa có món phù hợp với thiết bị, chế độ ăn và ngân sách này.');
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const message = status === 403
        ? 'Bạn cần tài khoản Premium để dùng chế độ ăn nâng cao. Hãy chọn Không giới hạn hoặc nâng cấp Premium.'
        : 'Không thể tạo gợi ý món ăn lúc này. Vui lòng thử lại.';
      setSuggestError(message);
      Alert.alert('Không thể gợi ý món ăn', message);
    } finally {
      setSuggestLoading(false);
    }
  }

  const handleFavoriteToggle = (id: string) => {
    setFavoriteRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const suggestedRecipes = [...suggestions.breakfast, ...suggestions.lunch, ...suggestions.dinner];
  const featuredRecipe = suggestedRecipes[0] ?? recipes.find((r) => r.id === '3');
  const mealSections = [
    { key: 'breakfast' as const, title: 'Bữa sáng', subtitle: 'Nhẹ bụng, đủ năng lượng mở đầu ngày mới.', icon: Sunrise, data: suggestions.breakfast },
    { key: 'lunch' as const, title: 'Bữa trưa', subtitle: 'Cân bằng dinh dưỡng để giữ nhịp làm việc.', icon: Sun, data: suggestions.lunch },
    { key: 'dinner' as const, title: 'Bữa tối', subtitle: 'Ấm bụng, gọn gàng và dễ chuẩn bị.', icon: Moon, data: suggestions.dinner },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={suggestionsLoading} onRefresh={loadSuggestions} tintColor="#16A34A" />}
    >
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.heading}>Chào buổi sáng!</Text>
          <Text style={styles.subheading}>Hôm nay bạn muốn nấu món gì?</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton} android_ripple={{ color: '#D1FAE5' }}>
            <Bell color="#FFFFFF" size={20} />
            <View style={styles.notificationDot} />
          </Pressable>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' }}
            style={styles.avatar}
          />
        </View>
      </View>

      <ImageBackground
        source={{ uri: featuredRecipe?.image ?? '' }}
        style={styles.featuredCard}
        imageStyle={styles.featuredImage}
      >
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          <Text style={styles.featuredLabel}>Công thức hôm nay</Text>
          <Text style={styles.featuredTitle}>{featuredRecipe?.name}</Text>
          <Pressable style={styles.primaryButton} onPress={() => featuredRecipe && onRecipeClick(featuredRecipe)} android_ripple={{ color: '#D1FAE5' }}>
            <Text style={styles.primaryButtonText}>Nấu ngay</Text>
          </Pressable>
        </View>
      </ImageBackground>

      <View style={styles.section}>
        <View style={styles.sectionHeaderLarge}>
          <View style={styles.sectionHeaderTitle}>
            <Sparkles color="#16A34A" size={18} />
            <Text style={[styles.sectionTitle, styles.sectionTitleWithIcon]}>Thực đơn gợi ý hôm nay</Text>
          </View>
          {suggestionsLoading && <ActivityIndicator color="#16A34A" />}
        </View>

        {isPremiumExpired && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Premium đã hết hạn</Text>
            <Text style={styles.warningText}>Một số gợi ý nâng cao có thể bị giới hạn. Bạn vẫn có thể xem thực đơn cơ bản hôm nay.</Text>
          </View>
        )}

        {!!suggestionsError && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{suggestionsError}</Text>
          </View>
        )}

        {mealSections.map((section) => {
          const Icon = section.icon;
          return (
            <View key={section.key} style={styles.mealBlock}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleRow}>
                  <View style={styles.mealIconBox}>
                    <Icon color="#16A34A" size={18} />
                  </View>
                  <View style={styles.mealTitleText}>
                    <Text style={styles.mealTitle}>{section.title}</Text>
                    <Text style={styles.mealSubtitle}>{section.subtitle}</Text>
                  </View>
                </View>
              </View>

              {section.data.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                  {section.data.map((recipe) => (
                    <View key={recipe.id} style={styles.cardWidth}>
                      <RecipeCard
                        recipe={{ ...recipe, isFavorite: favoriteRecipes.has(recipe.id) }}
                        onFavoriteToggle={handleFavoriteToggle}
                        onClick={() => onRecipeClick(recipe)}
                      />
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyMealCard}>
                  <Text style={styles.emptyMealText}>Chưa có món cho {section.title.toLowerCase()}.</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Sparkles color="#16A34A" size={18} />
          <Text style={styles.sectionTitle}>Gợi ý món tối ưu chi phí</Text>
        </View>
        <View style={styles.suggestPanel}>
          <View style={styles.suggestHeader}>
            <View style={styles.suggestIconBox}>
              <ChefHat color="#16A34A" size={20} />
            </View>
            <View style={styles.suggestHeaderText}>
              <Text style={styles.suggestTitle}>Chọn điều kiện nấu</Text>
              <Text style={styles.suggestSubtitle}>Fookit sẽ tối ưu món theo thiết bị, diet và ngân sách.</Text>
            </View>
          </View>

          <Text style={styles.filterLabel}>Thiết bị</Text>
          <View style={styles.optionGrid}>
            {EQUIPMENT_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                style={[styles.optionChip, suggestEquipment === option.value && styles.optionChipActive]}
                onPress={() => setSuggestEquipment(option.value)}
              >
                <Text style={[styles.optionChipText, suggestEquipment === option.value && styles.optionChipTextActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Chế độ ăn</Text>
          <View style={styles.optionGrid}>
            {DIET_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                style={[styles.optionChip, suggestDiet === option.value && styles.optionChipActive]}
                onPress={() => setSuggestDiet(option.value)}
              >
                <Text style={[styles.optionChipText, suggestDiet === option.value && styles.optionChipTextActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Ngân sách</Text>
          <View style={styles.budgetInputRow}>
            <TextInput
              value={suggestBudget}
              onChangeText={setSuggestBudget}
              keyboardType="number-pad"
              placeholder="100000"
              placeholderTextColor="#94A3B8"
              style={styles.budgetInput}
            />
            <Text style={styles.currencyText}>VND</Text>
          </View>

          {!!suggestError && <Text style={styles.suggestError}>{suggestError}</Text>}

          <Pressable style={styles.suggestButton} onPress={handleSuggestDishes} disabled={suggestLoading} android_ripple={{ color: '#D1FAE5' }}>
            {suggestLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.suggestButtonText}>Gợi ý món ăn</Text>}
          </Pressable>
        </View>

        {suggestedDishes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {suggestedDishes.map((recipe) => (
              <View key={recipe.id} style={styles.cardWidth}>
                <RecipeCard
                  recipe={{ ...recipe, isFavorite: favoriteRecipes.has(recipe.id) }}
                  onFavoriteToggle={handleFavoriteToggle}
                  onClick={() => onRecipeClick(recipe)}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FEF8'
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 140
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 6
  },
  subheading: {
    fontSize: 16,
    color: '#D1FAE5'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  featuredCard: {
    width: '100%',
    height: 200,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20
  },
  featuredImage: {
    opacity: 0.9
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)'
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20
  },
  featuredLabel: {
    color: '#D1FAE5',
    fontSize: 14,
    marginBottom: 6
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999
  },
  primaryButtonText: {
    color: '#10B981',
    fontWeight: '700'
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionHeaderLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sectionHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitleWithIcon: {
    marginLeft: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  suggestPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14
  },
  suggestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  suggestIconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  suggestHeaderText: {
    flex: 1
  },
  suggestTitle: {
    color: '#064E3B',
    fontSize: 16,
    fontWeight: '800'
  },
  suggestSubtitle: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2
  },
  filterLabel: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14
  },
  optionChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8
  },
  optionChipActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A'
  },
  optionChipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700'
  },
  optionChipTextActive: {
    color: '#FFFFFF'
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    marginBottom: 12
  },
  budgetInput: {
    flex: 1,
    color: '#0F172A',
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: '700'
  },
  currencyText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800'
  },
  suggestError: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10
  },
  suggestButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48
  },
  suggestButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  horizontalScroll: {
    paddingVertical: 4
  },
  cardWidth: {
    width: 280,
    marginRight: 14
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  warningTitle: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  warningText: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18
  },
  infoCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12
  },
  infoText: {
    color: '#047857',
    fontSize: 13,
    lineHeight: 18
  },
  mealBlock: {
    marginBottom: 18
  },
  mealHeader: {
    marginBottom: 10
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mealIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  mealTitleText: {
    flex: 1
  },
  mealTitle: {
    color: '#064E3B',
    fontSize: 16,
    fontWeight: '800'
  },
  mealSubtitle: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2
  },
  emptyMealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  emptyMealText: {
    color: '#64748B',
    fontSize: 13
  },
  bottomSpacing: {
    height: 100
  }
});
