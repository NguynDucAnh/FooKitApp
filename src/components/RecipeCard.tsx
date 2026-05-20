import { Clock, Flame, Heart, ChevronRight } from 'lucide-react';
import { Recipe } from '../data/recipes';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteToggle?: (id: string) => void;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onFavoriteToggle, onClick }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
      <div className="relative" onClick={onClick}>
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(recipe.id);
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${recipe.isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-gray-600'}`}
          />
        </button>
        <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          {recipe.difficulty}
        </div>
      </div>

      <div className="p-4" onClick={onClick}>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.name}</h3>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.time} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>{recipe.calories} cal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{recipe.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-green-600 font-bold text-lg">${recipe.budget}</span>
          <button className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
