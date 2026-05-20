import { useState, useMemo } from 'react';
import { Search, Bell, Sparkles, ShoppingCart, TrendingUp, Clock, CalendarDays } from 'lucide-react';
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
    new Set(recipes.filter(r => r.isFavorite).map(r => r.id))
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 pt-12 pb-8 rounded-b-[3rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Good Morning! 👋</h1>
            <p className="text-green-100">What would you like to cook today?</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-green-300 rounded-full overflow-hidden border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      </div>

      <div className="px-6 -mt-8">
        <div className="bg-gradient-to-br from-green-400 to-yellow-400 rounded-3xl overflow-hidden shadow-xl mb-8">
          <div className="relative h-48">
            <img
              src={featuredRecipe?.image}
              alt="Featured Recipe"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-6">
              <span className="text-white/90 text-sm font-medium mb-2">🔥 Recipe of the Day</span>
              <h2 className="text-white text-2xl font-bold mb-4">{featuredRecipe?.name}</h2>
              <button className="bg-white text-green-600 px-6 py-3 rounded-full font-bold w-fit hover:bg-green-50 transition-colors">
                Cook Now →
              </button>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold">AI Recipe Suggestion</h2>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-yellow-300 p-6 rounded-2xl text-white">
            <p className="mb-3">Cook with ingredients you already have!</p>
            <button className="bg-white text-green-600 px-5 py-2 rounded-full font-medium text-sm hover:bg-green-50 transition-colors">
              Find Recipes
            </button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Select Your Budget</h2>
          <BudgetSelector
            options={budgetOptions}
            selectedBudget={selectedBudget}
            onSelect={(value) => setSelectedBudget(selectedBudget === value ? null : value)}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Available Cooking Tools</h2>
          <ToolSelector
            tools={cookingTools}
            selectedTools={selectedTools}
            onToggle={handleToolToggle}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Cooking Time</h2>
          <TimeFilter
            filters={timeFilters}
            selectedTime={selectedTime}
            onSelect={(value) => setSelectedTime(selectedTime === value ? null : value)}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                isActive={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold">Trending This Week</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {trendingRecipes.map((recipe) => (
              <div key={recipe.id} className="min-w-[280px]">
                <RecipeCard
                  recipe={{ ...recipe, isFavorite: favoriteRecipes.has(recipe.id) }}
                  onFavoriteToggle={handleFavoriteToggle}
                  onClick={() => onRecipeClick(recipe)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold">Recently Viewed</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {recentlyViewed.map((recipe) => (
              <div key={recipe.id} className="min-w-[280px]">
                <RecipeCard
                  recipe={{ ...recipe, isFavorite: favoriteRecipes.has(recipe.id) }}
                  onFavoriteToggle={handleFavoriteToggle}
                  onClick={() => onRecipeClick(recipe)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-500 text-white p-4 rounded-2xl flex items-center gap-3 hover:bg-green-600 transition-colors">
              <CalendarDays className="w-6 h-6" />
              <span className="font-medium">Meal Planner</span>
            </button>
            <button className="bg-blue-500 text-white p-4 rounded-2xl flex items-center gap-3 hover:bg-blue-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="font-medium">Shopping List</span>
            </button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            {selectedCategory === 'All' ? 'All Recipes' : selectedCategory}
            {' '}
            <span className="text-gray-500 text-base font-normal">({filteredRecipes.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => onRecipeClick(recipe)}
              />
            ))}
          </div>
          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recipes found matching your filters.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your selection above.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
