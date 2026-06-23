import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, Text, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { HomeScreen } from '../../src/components/HomeScreen';
import { RecipeDetailScreen } from '../../src/components/RecipeDetailScreen';
import { BottomNav } from '../../src/components/BottomNav';
import SubscriptionDashboard from '../../src/components/subscription/SubscriptionDashboard';
import { Recipe } from '../../src/data/recipes';
import { dishService } from '../../src/services/dishService';
import { DishRecipeResponse } from '../../src/types/dish';

const NAV_TABS = ['home', 'discover', 'favorites', 'planner'];

function applyRecipeDetail(recipe: Recipe, detail: DishRecipeResponse): Recipe {
  return {
    ...recipe,
    dishCacheId: detail.dishCacheId,
    name: detail.dishName || recipe.name,
    image: detail.imageUrl || recipe.image,
    budget: detail.totalCost ?? recipe.budget,
    ingredients: Array.isArray(detail.ingredients) && detail.ingredients.length
      ? detail.ingredients.map(ingredient => ({
        name: ingredient.standardIngredientName || ingredient.rawIngredientName || 'Nguyen lieu',
        amount: ingredient.rawIngredientName || 'vua du',
        isMapped: ingredient.isMatched,
        affiliateProduct: ingredient.affiliateUrl ? {
          productName: ingredient.standardIngredientName || ingredient.rawIngredientName || 'San pham goi y',
          productUrl: ingredient.affiliateUrl,
          price: ingredient.estimatedPrice ?? 0,
        } : null,
      }))
      : recipe.ingredients,
    instructions: Array.isArray(detail.cookingSteps) && detail.cookingSteps.length
      ? detail.cookingSteps
      : recipe.instructions,
  };
}

export default function App() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [currentView, setCurrentView] = useState<'home' | 'detail'>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipeDetail, setLoadingRecipeDetail] = useState(false);
  const [recipeDetailError, setRecipeDetailError] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const nextTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
    if (!nextTab || !NAV_TABS.includes(nextTab)) return;

    setActiveTab(nextTab);
    setCurrentView('home');
    setSelectedRecipe(null);
  }, [params.tab]);

  const handleRecipeClick = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('detail');
    setRecipeDetailError('');

    if (!recipe.dishCacheId) {
      setRecipeDetailError('Món này chưa có dishCacheId từ API gợi ý, nên chưa thể tải công thức đầy đủ.');
      return;
    }

    setLoadingRecipeDetail(true);
    try {
      const detail = await dishService.getDishRecipe(recipe.dishCacheId);
      setSelectedRecipe(current => {
        if (!current || current.dishCacheId !== recipe.dishCacheId) return current;
        return applyRecipeDetail(current, detail);
      });
    } catch (error: any) {
      const status = error?.response?.status;
      setRecipeDetailError(status === 404
        ? 'Công thức này không còn trong cache hoặc dishCacheId không tồn tại. Hãy tải lại gợi ý để nhận món mới.'
        : status === 401
          ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tải công thức.'
          : 'Chưa thể tải công thức chi tiết. Dữ liệu gợi ý ban đầu vẫn đang được hiển thị.');
    } finally {
      setLoadingRecipeDetail(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedRecipe(null);
    setLoadingRecipeDetail(false);
    setRecipeDetailError('');
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'profile') {
      router.push('/(tabs)/profile');
      return;
    }

    setActiveTab(tab);
    setCurrentView('home');
    setSelectedRecipe(null);
    setLoadingRecipeDetail(false);
    setRecipeDetailError('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {currentView === 'home' && activeTab === 'home' && (
          <HomeScreen onRecipeClick={handleRecipeClick} />
        )}

        {currentView === 'detail' && selectedRecipe && (
          <RecipeDetailScreen
            recipe={selectedRecipe}
            onBack={handleBackToHome}
            loadingRemoteDetail={loadingRecipeDetail}
            remoteDetailError={recipeDetailError}
          />
        )}

        {activeTab === 'discover' && (
          <SubscriptionDashboard />
        )}

        {activeTab === 'favorites' && (
          <ScrollView contentContainerStyle={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>Món yêu thích</Text>
            <Text style={styles.placeholderText}>Các công thức bạn đã lưu sẽ xuất hiện tại đây.</Text>
          </ScrollView>
        )}

        {activeTab === 'planner' && (
          <ScrollView contentContainerStyle={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>Lên kế hoạch bữa ăn</Text>
            <Text style={styles.placeholderText}>Sắp xếp thực đơn hằng tuần của bạn tại đây.</Text>
          </ScrollView>
        )}

        {activeTab === 'profile' && (
          <ScrollView contentContainerStyle={styles.placeholderContent}>
            <View style={styles.profileHeader}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }}
                style={styles.profileAvatar}
              />
              <Text style={styles.profileName}>Người dùng</Text>
              <Text style={styles.profileSubtitle}>Đầu bếp tại gia</Text>
            </View>
          </ScrollView>
        )}
      </View>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    paddingBottom: 90,
  },
  placeholderContent: {
    padding: 24,
    paddingBottom: 140,
  },
  placeholderTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    color: '#064E3B',
  },
  placeholderText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
