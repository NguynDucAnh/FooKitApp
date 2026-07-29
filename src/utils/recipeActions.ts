import type { Recipe } from '../types/recipe';

type ShareableRecipe = Pick<Recipe, 'name' | 'time' | 'budget' | 'instructions'>;

export function buildRecipeShareMessage(recipe: ShareableRecipe): string {
  const details: string[] = [`${recipe.name} - gợi ý từ FooKit`];

  if (typeof recipe.time === 'number') {
    details.push(`Thời gian: ${recipe.time} phút`);
  }

  if (typeof recipe.budget === 'number') {
    details.push(`Chi phí dự kiến: ${recipe.budget.toLocaleString('vi-VN')} đ`);
  }

  if (recipe.instructions.length > 0) {
    const instructionPreview = recipe.instructions
      .slice(0, 3)
      .map((instruction, index) => `${index + 1}. ${instruction}`)
      .join('\n');
    details.push(`Các bước chính:\n${instructionPreview}`);
  }

  return details.join('\n\n');
}
