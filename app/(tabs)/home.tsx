import { useState } from 'react';
import { HomeScreen } from '../../src/components/HomeScreen';
import { RecipeDetailScreen } from '../../src/components/RecipeDetailScreen';
import { BottomNav } from '../../src/components/BottomNav';
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
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentView('home');
    }
  };

  return (
    <div className="size-full bg-white overflow-auto">
      {currentView === 'home' && activeTab === 'home' && (
        <HomeScreen onRecipeClick={handleRecipeClick} />
      )}

      {currentView === 'detail' && selectedRecipe && (
        <RecipeDetailScreen recipe={selectedRecipe} onBack={handleBackToHome} />
      )}

      {activeTab === 'discover' && (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24 px-6 pt-12">
          <h1 className="text-3xl font-bold mb-4">Discover</h1>
          <p className="text-gray-600">Explore new recipes and cooking techniques...</p>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white pb-24 px-6 pt-12">
          <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
          <p className="text-gray-600">Your saved recipes appear here...</p>
        </div>
      )}

      {activeTab === 'planner' && (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24 px-6 pt-12">
          <h1 className="text-3xl font-bold mb-4">Meal Planner</h1>
          <p className="text-gray-600">Plan your weekly meals...</p>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24 px-6 pt-12">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-green-300 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold">John Doe</h1>
            <p className="text-gray-600">Home Chef</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-gray-600">Recipes Cooked</p>
              <p className="text-2xl font-bold text-green-500">42</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-gray-600">Favorite Cuisine</p>
              <p className="text-2xl font-bold text-green-500">Asian Food</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}