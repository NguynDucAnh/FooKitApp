import { ArrowLeft, Clock, Flame, DollarSign, Star, Heart, BookmarkPlus, Share2 } from 'lucide-react';
import { Recipe } from '../data/recipes';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
}

export function RecipeDetailScreen({ recipe, onBack }: RecipeDetailScreenProps) {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="relative h-80">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <button
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>

        <div className="absolute top-6 right-6 flex gap-3">
          <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors">
            <Heart className={`w-6 h-6 ${recipe.isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-gray-800'}`} />
          </button>
          <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors">
            <Share2 className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex gap-2 mb-3">
            {recipe.category.slice(0, 2).map((cat) => (
              <span key={cat} className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">{recipe.name}</h1>
          <div className="flex items-center gap-1 text-white">
            <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-400" />
            <span className="font-bold">{recipe.rating}</span>
            <span className="text-white/80 ml-1">(128 reviews)</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 p-4 rounded-2xl text-center">
            <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Time</p>
            <p className="font-bold text-gray-800">{recipe.time} min</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-2xl text-center">
            <Flame className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Calories</p>
            <p className="font-bold text-gray-800">{recipe.calories}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-2xl text-center">
            <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Budget</p>
            <p className="font-bold text-gray-800">${recipe.budget}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-2xl text-center">
            <span className="text-2xl mx-auto mb-2 block">👨‍🍳</span>
            <p className="text-sm text-gray-600">Level</p>
            <p className="font-bold text-gray-800">{recipe.difficulty}</p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Required Tools</h2>
          <div className="flex gap-3 flex-wrap">
            {recipe.tools.map((tool) => (
              <div key={tool} className="bg-gray-100 px-4 py-2 rounded-full text-gray-700 font-medium">
                {tool}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Nutrition Facts</h2>
          <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 rounded-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-green-200">
                <span className="text-gray-600">Protein</span>
                <span className="font-bold text-gray-800">{recipe.nutrition.protein}g</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-green-200">
                <span className="text-gray-600">Carbs</span>
                <span className="font-bold text-gray-800">{recipe.nutrition.carbs}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fat</span>
                <span className="font-bold text-gray-800">{recipe.nutrition.fat}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fiber</span>
                <span className="font-bold text-gray-800">{recipe.nutrition.fiber}g</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{ingredient.name}</p>
                  <p className="text-sm text-gray-600">{ingredient.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Instructions</h2>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-400 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-700 leading-relaxed">{instruction}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="fixed bottom-20 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-shadow">
              Start Cooking
            </button>
            <button className="bg-gray-100 text-gray-800 p-4 rounded-2xl hover:bg-gray-200 transition-colors">
              <BookmarkPlus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
