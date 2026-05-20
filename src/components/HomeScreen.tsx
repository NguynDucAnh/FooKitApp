import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Image, Pressable, ImageBackground } from 'react-native';
import { Search, Bell, Sparkles, ShoppingCart, TrendingUp, Clock, CalendarDays } from 'lucide-react-native';
import { RecipeCard } from './RecipeCard';
import { CategoryChip } from './CategoryChip';
import { ToolSelector } from './ToolSelector';
import { BudgetSelector } from './BudgetSelector';
import { TimeFilter } from './TimeFilter';
import { recipes, categories, budgetOptions, cookingTools, timeFilters, Recipe } from '../data/recipes';

interface HomeScreenProps {
  onRecipeClick: (recipe: Recipe) => void;
}

export function HomeScreen({ onRecipeClick }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(
    new Set(recipes.filter((r) => r.isFavorite).map((r) => r.id))
  );

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

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

  const filteredRecipes = useMemo(() => {
    return recipes
      .map((recipe) => ({
        ...recipe,
        isFavorite: favoriteRecipes.has(recipe.id)
      }))
      .filter((recipe) => {
        const matchesCategory = selectedCategory === 'All' || recipe.category.includes(selectedCategory);
        const matchesBudget = !selectedBudget || recipe.budget <= selectedBudget;
        const matchesTools = selectedTools.length === 0 || selectedTools.some((tool) => recipe.tools.includes(tool));
        const matchesTime = !selectedTime || recipe.time <= selectedTime;
        const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesBudget && matchesTools && matchesTime && matchesSearch;
      });
  }, [selectedCategory, selectedBudget, selectedTools, selectedTime, searchQuery, favoriteRecipes]);

  const featuredRecipe = recipes.find((r) => r.id === '3');
  const trendingRecipes = recipes.filter((r) => r.rating >= 4.8);
  const recentlyViewed = recipes.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.heading}>Good Morning! 👋</Text>
          <Text style={styles.subheading}>What would you like to cook today?</Text>
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

      <View style={styles.searchContainer}>
        <Search size={18} color="#9CA3AF" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search recipes or ingredients..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      <ImageBackground
        source={{ uri: featuredRecipe?.image ?? '' }}
        style={styles.featuredCard}
        imageStyle={styles.featuredImage}
      >
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          <Text style={styles.featuredLabel}>🔥 Recipe of the Day</Text>
          <Text style={styles.featuredTitle}>{featuredRecipe?.name}</Text>
          <Pressable style={styles.primaryButton} android_ripple={{ color: '#D1FAE5' }}>
            <Text style={styles.primaryButtonText}>Cook Now →</Text>
          </Pressable>
        </View>
      </ImageBackground>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Sparkles color="#16A34A" size={18} />
          <Text style={styles.sectionTitle}>AI Recipe Suggestion</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>Cook with ingredients you already have!</Text>
          <Pressable style={styles.secondaryButton} android_ripple={{ color: '#D1FAE5' }}>
            <Text style={styles.secondaryButtonText}>Find Recipes</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your Budget</Text>
        <BudgetSelector
          options={budgetOptions}
          selectedBudget={selectedBudget}
          onSelect={(value) => setSelectedBudget(selectedBudget === value ? null : value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Cooking Tools</Text>
        <ToolSelector tools={cookingTools} selectedTools={selectedTools} onToggle={handleToolToggle} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cooking Time</Text>
        <TimeFilter
          filters={timeFilters}
          selectedTime={selectedTime}
          onSelect={(value) => setSelectedTime(selectedTime === value ? null : value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              isActive={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderLarge}>
          <View style={styles.sectionHeaderTitle}>
            <TrendingUp color="#16A34A" size={18} />
            <Text style={[styles.sectionTitle, styles.sectionTitleWithIcon]}>Trending This Week</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {trendingRecipes.map((recipe) => (
            <View key={recipe.id} style={styles.cardWidth}>
              <RecipeCard
                recipe={{ ...recipe, isFavorite: favoriteRecipes.has(recipe.id) }}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => onRecipeClick(recipe)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderLarge}>
          <View style={styles.sectionHeaderTitle}>
            <Clock color="#16A34A" size={18} />
            <Text style={[styles.sectionTitle, styles.sectionTitleWithIcon]}>Recently Viewed</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {recentlyViewed.map((recipe) => (
            <View key={recipe.id} style={styles.cardWidth}>
              <RecipeCard
                recipe={{ ...recipe, isFavorite: favoriteRecipes.has(recipe.id) }}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => onRecipeClick(recipe)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <Pressable style={[styles.quickActionButton, styles.quickActionPrimary]} android_ripple={{ color: '#D1FAE5' }}>
            <CalendarDays color="#FFFFFF" size={20} />
            <Text style={styles.quickActionText}>Meal Planner</Text>
          </Pressable>
          <Pressable style={[styles.quickActionButton, styles.quickActionSecondary]} android_ripple={{ color: '#D1FAE5' }}>
            <ShoppingCart color="#FFFFFF" size={20} />
            <Text style={styles.quickActionText}>Shopping List</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'All' ? 'All Recipes' : selectedCategory} ({filteredRecipes.length})
        </Text>
        <View style={styles.recipesGrid}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onFavoriteToggle={handleFavoriteToggle}
              onClick={() => onRecipeClick(recipe)}
            />
          ))}
        </View>
        {filteredRecipes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No recipes found matching your filters.</Text>
            <Text style={styles.emptyStateSubtitle}>Try adjusting your selection above.</Text>
          </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 0,
    color: '#111827'
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
  card: {
    backgroundColor: '#10B981',
    borderRadius: 24,
    padding: 20
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 14
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'flex-start'
  },
  secondaryButtonText: {
    color: '#065F46',
    fontWeight: '700'
  },
  horizontalScroll: {
    paddingVertical: 4
  },
  recipesGrid: {
    marginTop: 0
  },
  cardWidth: {
    width: 280
  },
  quickActionsRow: {
    flexDirection: 'row'
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 20
  },
  quickActionPrimary: {
    marginRight: 12
  },
  quickActionButtonText: {
    marginLeft: 10
  },
  quickActionSecondary: {
    backgroundColor: '#2563EB'
  },
  quickActionText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  emptyState: {
    marginTop: 20,
    alignItems: 'center'
  },
  emptyStateTitle: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  emptyStateSubtitle: {
    color: '#94A3B8'
  },
  bottomSpacing: {
    height: 100
  }
});
