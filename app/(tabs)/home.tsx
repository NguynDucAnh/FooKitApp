import { useState } from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { HomeScreen } from '../../src/components/HomeScreen';
import { RecipeDetailScreen } from '../../src/components/RecipeDetailScreen';
import { BottomNav } from '../../src/components/BottomNav';
import SubscriptionDashboard from '../../src/components/subscription/SubscriptionDashboard';
import { Recipe } from '../../src/data/recipes';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'detail'>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('detail');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedRecipe(null);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'profile') {
      router.push('/(tabs)/profile');
      return;
    }

    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentView('home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {currentView === 'home' && activeTab === 'home' && (
          <HomeScreen onRecipeClick={handleRecipeClick} />
        )}

        {currentView === 'detail' && selectedRecipe && (
          <RecipeDetailScreen recipe={selectedRecipe} onBack={handleBackToHome} />
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
            <View style={styles.profileStatCard}>
              <Text style={styles.profileStatLabel}>Công thức đã nấu</Text>
              <Text style={styles.profileStatValue}>42</Text>
            </View>
            <View style={styles.profileStatCard}>
              <Text style={styles.profileStatLabel}>Ẩm thực yêu thích</Text>
              <Text style={styles.profileStatValue}>Món Á</Text>
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
    backgroundColor: '#FFFFFF'
  },
  screen: {
    flex: 1,
    paddingBottom: 90
  },
  placeholderContent: {
    padding: 24,
    paddingBottom: 140
  },
  placeholderTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    color: '#064E3B'
  },
  placeholderText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569'
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827'
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#6B7280'
  },
  profileStatCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16
  },
  profileStatLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6
  },
  profileStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981'
  }
});
