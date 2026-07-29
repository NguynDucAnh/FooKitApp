import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, StyleSheet, View, Text, TextInput, ScrollView, Image, Pressable, ImageBackground } from 'react-native';
import { Bell, Sparkles, Sunrise, Sun, Moon, ChefHat, Crown, LockKeyhole } from 'lucide-react-native';
import { RecipeCard } from './RecipeCard';
import { Recipe } from '../types/recipe';
import { homepageService } from '../services/homepageService';
import { dishService } from '../services/dishService';
import { useFavorites } from '../context/FavoritesContext';
import { useSubscriptionStore } from '../context/SubscriptionContext';
import {
  mapHomepageDishToRecipe,
  mapSuggestedDishToRecipe,
  MealKey,
} from '../mappers/recipeMapper';
import { HOME_DIET_OPTIONS } from '../constants/dietary';

const EQUIPMENT_OPTIONS = [
  { label: 'Lò nướng', value: 'oven' },
  { label: 'Chảo', value: 'pan' },
  { label: 'Nồi', value: 'pot' },
  { label: 'Nồi chiên', value: 'air_fryer' },
  { label: 'Máy xay', value: 'blender' },
];

const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: 'bữa sáng',
  lunch: 'bữa trưa',
  dinner: 'bữa tối',
};

interface HomeScreenProps {
  onRecipeClick: (recipe: Recipe) => void;
  onUpgradePremium: () => void;
}

export function HomeScreen({ onRecipeClick, onUpgradePremium }: HomeScreenProps) {
  const [suggestEquipment, setSuggestEquipment] = useState('oven');
  const [suggestDiet, setSuggestDiet] = useState(0);
  const [suggestBudget, setSuggestBudget] = useState('100000');
  const [suggestedDishes, setSuggestedDishes] = useState<Recipe[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');
  const [lockedDietLabel, setLockedDietLabel] = useState('');
  const [suggestions, setSuggestions] = useState<{ breakfast: Recipe[]; lunch: Recipe[]; dinner: Recipe[] }>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [isPremiumExpired, setIsPremiumExpired] = useState(false);
  const suggestionsRequestId = useRef(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isPremium } = useSubscriptionStore();

  async function loadSuggestions() {
    const requestId = ++suggestionsRequestId.current;
    setSuggestionsLoading(true);
    setSuggestionsError('');
    try {
      const result = await homepageService.getSuggestions();
      if (requestId !== suggestionsRequestId.current) return;

      const failedMeals = new Set<MealKey>(result.failedMeals);
      setIsPremiumExpired(result.isPremiumExpired);
      setSuggestions(current => ({
        breakfast: failedMeals.has('breakfast')
          ? current.breakfast
          : result.breakfast.map((dish, index) => mapHomepageDishToRecipe(dish, 'breakfast', index)),
        lunch: failedMeals.has('lunch')
          ? current.lunch
          : result.lunch.map((dish, index) => mapHomepageDishToRecipe(dish, 'lunch', index)),
        dinner: failedMeals.has('dinner')
          ? current.dinner
          : result.dinner.map((dish, index) => mapHomepageDishToRecipe(dish, 'dinner', index)),
      }));

      if (result.failedMeals.length > 0) {
        const failedLabels = result.failedMeals.map(meal => MEAL_LABELS[meal]).join(', ');
        setSuggestionsError(`Không thể cập nhật ${failedLabels}. Dữ liệu đã tải trước đó, nếu có, vẫn được giữ lại. Kéo xuống để thử lại.`);
      }
    } catch {
      if (requestId !== suggestionsRequestId.current) return;

      setSuggestionsError('Không thể tải thực đơn hôm nay. Dữ liệu đã tải trước đó, nếu có, vẫn được giữ lại. Kéo xuống để thử lại.');
    } finally {
      if (requestId === suggestionsRequestId.current) {
        setSuggestionsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadSuggestions();
    return () => {
      suggestionsRequestId.current += 1;
    };
  }, []);

  async function handleSuggestDishes() {
    if (suggestDiet !== 0 && !isPremium) {
      const selectedDiet = HOME_DIET_OPTIONS.find(option => option.value === suggestDiet);
      setLockedDietLabel(selectedDiet?.label ?? 'chế độ ăn nâng cao');
      return;
    }

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
        ? 'Chế độ ăn này dành cho thành viên Premium. Bạn có thể xem các gói phù hợp để tiếp tục.'
        : 'Không thể tạo gợi ý món ăn lúc này. Vui lòng thử lại.';
      setSuggestError(message);
      if (status === 403) {
        const selectedDiet = HOME_DIET_OPTIONS.find(option => option.value === suggestDiet);
        setLockedDietLabel(selectedDiet?.label ?? 'chế độ ăn nâng cao');
      } else {
        Alert.alert('Không thể gợi ý món ăn', message);
      }
    } finally {
      setSuggestLoading(false);
    }
  }

  function handleNotificationsPress() {
    Alert.alert(
      'Thông báo đang được hoàn thiện',
      'FooKit sẽ hiển thị cập nhật dành cho bạn khi tính năng này sẵn sàng. Hiện tại bạn vẫn có thể khám phá và lưu các món ăn yêu thích.',
    );
  }

  const suggestedRecipes = [...suggestions.breakfast, ...suggestions.lunch, ...suggestions.dinner];
  const featuredRecipe = suggestedRecipes[0];
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
          <Pressable
            style={styles.iconButton}
            onPress={handleNotificationsPress}
            android_ripple={{ color: '#D1FAE5' }}
            accessibilityRole="button"
            accessibilityLabel="Thông báo"
            accessibilityHint="Xem trạng thái tính năng thông báo"
          >
            <Bell color="#FFFFFF" size={20} />
          </Pressable>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' }}
            style={styles.avatar}
          />
        </View>
      </View>

      {featuredRecipe ? (
        featuredRecipe.image ? (
          <ImageBackground
            source={{ uri: featuredRecipe.image }}
            style={styles.featuredCard}
            imageStyle={styles.featuredImage}
          >
            <View style={styles.featuredOverlay} />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredLabel}>Công thức hôm nay</Text>
              <Text style={styles.featuredTitle}>{featuredRecipe.name}</Text>
              <Pressable style={styles.primaryButton} onPress={() => onRecipeClick(featuredRecipe)} android_ripple={{ color: '#D1FAE5' }}>
                <Text style={styles.primaryButtonText}>Nấu ngay</Text>
              </Pressable>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.featuredCard, styles.featuredPlaceholder]}>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredLabel}>Công thức hôm nay</Text>
              <Text style={styles.featuredTitle}>{featuredRecipe.name}</Text>
              <Text style={styles.featuredEmptyText}>Chưa có ảnh món ăn</Text>
              <Pressable style={styles.primaryButton} onPress={() => onRecipeClick(featuredRecipe)} android_ripple={{ color: '#D1FAE5' }}>
                <Text style={styles.primaryButtonText}>Xem công thức</Text>
              </Pressable>
            </View>
          </View>
        )
      ) : (
        <View style={[styles.featuredCard, styles.featuredPlaceholder]}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredLabel}>Công thức hôm nay</Text>
            <Text style={styles.featuredEmptyTitle}>Thực đơn đang được cập nhật</Text>
            <Text style={styles.featuredEmptyText}>Chưa có món để hiển thị lúc này.</Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => void loadSuggestions()}
              disabled={suggestionsLoading}
              accessibilityRole="button"
              accessibilityLabel="Thử tải lại thực đơn hôm nay"
              accessibilityState={{ busy: suggestionsLoading, disabled: suggestionsLoading }}
            >
              <Text style={styles.primaryButtonText}>
                {suggestionsLoading ? 'Đang tải...' : 'Thử tải lại'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

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
                        recipe={{ ...recipe, isFavorite: isFavorite(recipe) }}
                        onFavoriteToggle={() => void toggleFavorite(recipe)}
                        onClick={() => onRecipeClick({ ...recipe, isFavorite: isFavorite(recipe) })}
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
              <Text style={styles.suggestSubtitle}>Fookit sẽ tối ưu món theo thiết bị, chế độ ăn và ngân sách.</Text>
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
            {HOME_DIET_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                style={[styles.optionChip, suggestDiet === option.value && styles.optionChipActive]}
                onPress={() => {
                  if (option.value !== 0 && !isPremium) {
                    setLockedDietLabel(option.label);
                    return;
                  }
                  setSuggestDiet(option.value);
                  setLockedDietLabel('');
                  setSuggestError('');
                }}
              >
                <Text style={[styles.optionChipText, suggestDiet === option.value && styles.optionChipTextActive]}>{option.label}</Text>
                {option.value !== 0 && !isPremium && <LockKeyhole size={12} color="#B45309" />}
              </Pressable>
            ))}
          </View>

          {!!lockedDietLabel && !isPremium && (
            <View style={styles.premiumPrompt}>
              <View style={styles.premiumPromptIcon}><Crown size={22} color="#B45309" /></View>
              <View style={styles.premiumPromptContent}>
                <Text style={styles.premiumPromptTitle}>{lockedDietLabel} là lựa chọn Premium</Text>
                <Text style={styles.premiumPromptText}>Nâng cấp để nhận gợi ý món ăn đúng chế độ, khẩu vị và mục tiêu dinh dưỡng của bạn.</Text>
                <View style={styles.premiumPromptActions}>
                  <Pressable style={styles.upgradeButton} onPress={onUpgradePremium}><Text style={styles.upgradeButtonText}>Xem gói Premium</Text></Pressable>
                  <Pressable style={styles.laterButton} onPress={() => setLockedDietLabel('')}><Text style={styles.laterButtonText}>Để sau</Text></Pressable>
                </View>
              </View>
            </View>
          )}

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
                  recipe={{ ...recipe, isFavorite: isFavorite(recipe) }}
                  onFavoriteToggle={() => void toggleFavorite(recipe)}
                  onClick={() => onRecipeClick({ ...recipe, isFavorite: isFavorite(recipe) })}
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
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
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
  featuredPlaceholder: {
    backgroundColor: '#166534'
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
  featuredEmptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6
  },
  featuredEmptyText: {
    color: '#D1FAE5',
    fontSize: 13,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  premiumPrompt: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    padding: 16,
    marginTop: 2,
    marginBottom: 18,
  },
  premiumPromptIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumPromptContent: { flex: 1 },
  premiumPromptTitle: { color: '#92400E', fontSize: 15, fontWeight: '800', marginBottom: 5 },
  premiumPromptText: { color: '#78350F', fontSize: 13, lineHeight: 19 },
  premiumPromptActions: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  upgradeButton: { backgroundColor: '#F59E0B', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10 },
  upgradeButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  laterButton: { paddingHorizontal: 8, paddingVertical: 10 },
  laterButtonText: { color: '#92400E', fontSize: 12, fontWeight: '700' },
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
