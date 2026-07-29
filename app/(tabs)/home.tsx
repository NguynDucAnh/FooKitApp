import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, Text, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { HomeScreen } from '../../src/components/HomeScreen';
import { RecipeDetailScreen } from '../../src/components/RecipeDetailScreen';
import { BottomNav } from '../../src/components/BottomNav';
import SubscriptionDashboard from '../../src/components/subscription/SubscriptionDashboard';
import { Recipe } from '../../src/types/recipe';
import { dishService } from '../../src/services/dishService';
import { FavoritesScreen } from '../../src/components/FavoritesScreen';
import { applyRecipeDetail } from '../../src/mappers/recipeMapper';
import { RECIPE_DETAIL_COPY } from '../../src/utils/userFacingCopy';
import { PlannerEmptyState } from '../../src/components/PlannerEmptyState';

const NAV_TABS = ['home', 'discover', 'favorites', 'planner'];

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
      setRecipeDetailError(RECIPE_DETAIL_COPY.missingReference);
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
        ? RECIPE_DETAIL_COPY.notFound
        : status === 401
          ? RECIPE_DETAIL_COPY.expiredSession
          : RECIPE_DETAIL_COPY.unavailable);
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
          <HomeScreen onRecipeClick={handleRecipeClick} onUpgradePremium={() => handleTabChange('discover')} />
        )}

        {currentView === 'detail' && selectedRecipe && (
          <RecipeDetailScreen
            recipe={selectedRecipe}
            onBack={handleBackToHome}
            loadingRemoteDetail={loadingRecipeDetail}
            remoteDetailError={recipeDetailError}
          />
        )}

        {currentView === 'home' && activeTab === 'discover' && (
          <SubscriptionDashboard />
        )}

        {currentView === 'home' && activeTab === 'favorites' && (
          <FavoritesScreen onRecipeClick={handleRecipeClick} onExplore={() => handleTabChange('home')} />
        )}

        {currentView === 'home' && activeTab === 'planner' && (
          <PlannerEmptyState onExplore={() => handleTabChange('home')} />
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
