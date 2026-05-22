export interface Recipe {
  id: string;
  name: string;
  image: string;
  rating: number;
  time: number;
  calories: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string[];
  budget: number;
  tools: string[];
  isFavorite: boolean;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface Ingredient {
  name: string;
  amount: string;
}

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Crispy Air Fryer Chicken Wings',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&h=600&fit=crop',
    rating: 4.8,
    time: 25,
    calories: 320,
    difficulty: 'Easy',
    category: ['Dinner', 'Fast Food'],
    budget: 8,
    tools: ['Air Fryer'],
    isFavorite: false,
    ingredients: [
      { name: 'Chicken wings', amount: '2 lbs' },
      { name: 'Baking powder', amount: '2 tbsp' },
      { name: 'Salt', amount: '1 tsp' },
      { name: 'Pepper', amount: '1 tsp' },
      { name: 'Garlic powder', amount: '1 tsp' },
      { name: 'Paprika', amount: '1 tsp' },
      { name: 'Hot sauce', amount: 'to taste' }
    ],
    instructions: [
      'Pat chicken wings dry with paper towels',
      'Mix baking powder, salt, pepper, garlic powder, and paprika in a bowl',
      'Coat wings evenly with the spice mixture',
      'Preheat air fryer to 380°F',
      'Place wings in air fryer basket in a single layer',
      'Cook for 12 minutes, flip, then cook for another 12 minutes',
      'Toss with hot sauce if desired and serve hot'
    ],
    nutrition: { protein: 28, carbs: 2, fat: 22, fiber: 0 }
  },
  {
    id: '2',
    name: 'Avocado Toast with Poached Egg',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
    rating: 4.6,
    time: 10,
    calories: 280,
    difficulty: 'Easy',
    category: ['Breakfast', 'Healthy'],
    budget: 5,
    tools: ['Pan', 'Pot'],
    isFavorite: true,
    ingredients: [
      { name: 'Bread slices', amount: '2' },
      { name: 'Avocado', amount: '1 ripe' },
      { name: 'Eggs', amount: '2' },
      { name: 'Lemon juice', amount: '1 tsp' },
      { name: 'Salt', amount: 'to taste' },
      { name: 'Red pepper flakes', amount: 'pinch' },
      { name: 'Olive oil', amount: '1 tbsp' }
    ],
    instructions: [
      'Toast bread slices until golden brown',
      'Mash avocado with lemon juice, salt, and pepper',
      'Bring a pot of water to a gentle simmer',
      'Crack eggs into small bowls',
      'Create a gentle whirlpool in the water and slide eggs in',
      'Poach for 3-4 minutes until whites are set',
      'Spread avocado on toast, top with poached eggs',
      'Sprinkle with red pepper flakes and enjoy'
    ],
    nutrition: { protein: 12, carbs: 24, fat: 18, fiber: 7 }
  },
  {
    id: '3',
    name: 'Teriyaki Salmon Bowl',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    rating: 4.9,
    time: 30,
    calories: 520,
    difficulty: 'Medium',
    category: ['Lunch', 'Dinner', 'Healthy', 'Asian Food'],
    budget: 15,
    tools: ['Pan', 'Rice Cooker'],
    isFavorite: true,
    ingredients: [
      { name: 'Salmon fillets', amount: '2 (6 oz each)' },
      { name: 'Jasmine rice', amount: '1 cup' },
      { name: 'Teriyaki sauce', amount: '1/4 cup' },
      { name: 'Broccoli florets', amount: '1 cup' },
      { name: 'Sesame seeds', amount: '1 tbsp' },
      { name: 'Green onions', amount: '2, sliced' },
      { name: 'Soy sauce', amount: '2 tbsp' }
    ],
    instructions: [
      'Cook rice in rice cooker according to instructions',
      'Season salmon with salt and pepper',
      'Heat pan over medium-high heat with oil',
      'Cook salmon skin-side down for 4-5 minutes',
      'Flip and cook for another 3-4 minutes',
      'Brush with teriyaki sauce in the last minute',
      'Steam broccoli for 5 minutes',
      'Assemble bowl with rice, salmon, and broccoli',
      'Drizzle with teriyaki and soy sauce, top with sesame seeds and green onions'
    ],
    nutrition: { protein: 42, carbs: 48, fat: 16, fiber: 3 }
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&h=600&fit=crop',
    rating: 4.7,
    time: 20,
    calories: 480,
    difficulty: 'Medium',
    category: ['Dessert'],
    budget: 6,
    tools: ['Oven'],
    isFavorite: false,
    ingredients: [
      { name: 'Dark chocolate', amount: '4 oz' },
      { name: 'Butter', amount: '1/2 cup' },
      { name: 'Eggs', amount: '2' },
      { name: 'Egg yolks', amount: '2' },
      { name: 'Sugar', amount: '1/4 cup' },
      { name: 'Flour', amount: '2 tbsp' },
      { name: 'Vanilla extract', amount: '1 tsp' }
    ],
    instructions: [
      'Preheat oven to 425°F',
      'Butter and flour 4 ramekins',
      'Melt chocolate and butter together in microwave',
      'Whisk eggs, egg yolks, and sugar until thick',
      'Fold in chocolate mixture',
      'Gently fold in flour and vanilla',
      'Divide batter among ramekins',
      'Bake for 12-14 minutes until edges are firm',
      'Let cool for 1 minute, then invert onto plates'
    ],
    nutrition: { protein: 8, carbs: 42, fat: 32, fiber: 2 }
  },
  {
    id: '5',
    name: 'Veggie Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    rating: 4.5,
    time: 25,
    calories: 380,
    difficulty: 'Easy',
    category: ['Lunch', 'Healthy', 'Vegan'],
    budget: 7,
    tools: ['Oven', 'Pot'],
    isFavorite: false,
    ingredients: [
      { name: 'Quinoa', amount: '1 cup' },
      { name: 'Sweet potato', amount: '1 large, cubed' },
      { name: 'Chickpeas', amount: '1 can' },
      { name: 'Kale', amount: '2 cups' },
      { name: 'Avocado', amount: '1' },
      { name: 'Tahini', amount: '3 tbsp' },
      { name: 'Lemon juice', amount: '2 tbsp' }
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Cook quinoa according to package directions',
      'Toss sweet potato cubes with olive oil, salt, and pepper',
      'Roast sweet potato for 25 minutes',
      'Drain and rinse chickpeas, season and roast with sweet potato',
      'Massage kale with a bit of olive oil',
      'Make tahini dressing with tahini, lemon juice, and water',
      'Assemble bowl with quinoa, roasted veggies, kale, and avocado',
      'Drizzle with tahini dressing'
    ],
    nutrition: { protein: 14, carbs: 58, fat: 16, fiber: 12 }
  },
  {
    id: '6',
    name: 'Classic Beef Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    rating: 4.8,
    time: 20,
    calories: 650,
    difficulty: 'Easy',
    category: ['Lunch', 'Dinner', 'Fast Food'],
    budget: 10,
    tools: ['Grill', 'Pan'],
    isFavorite: true,
    ingredients: [
      { name: 'Ground beef', amount: '1 lb (80/20)' },
      { name: 'Burger buns', amount: '4' },
      { name: 'Cheese slices', amount: '4' },
      { name: 'Lettuce', amount: '4 leaves' },
      { name: 'Tomato', amount: '1 large, sliced' },
      { name: 'Onion', amount: '1, sliced' },
      { name: 'Pickles', amount: '8 slices' },
      { name: 'Special sauce', amount: '1/4 cup' }
    ],
    instructions: [
      'Divide beef into 4 equal portions and form patties',
      'Make a small indent in the center of each patty',
      'Season generously with salt and pepper',
      'Heat grill or pan to high heat',
      'Cook patties for 3-4 minutes per side for medium',
      'Add cheese in the last minute of cooking',
      'Toast buns on the grill',
      'Assemble burgers with sauce, lettuce, tomato, onion, and pickles'
    ],
    nutrition: { protein: 32, carbs: 38, fat: 42, fiber: 2 }
  },
  {
    id: '7',
    name: 'Blueberry Smoothie Bowl',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
    rating: 4.4,
    time: 10,
    calories: 320,
    difficulty: 'Easy',
    category: ['Breakfast', 'Healthy', 'Vegan'],
    budget: 6,
    tools: ['Blender'],
    isFavorite: false,
    ingredients: [
      { name: 'Frozen blueberries', amount: '2 cups' },
      { name: 'Banana', amount: '1 frozen' },
      { name: 'Almond milk', amount: '1/2 cup' },
      { name: 'Granola', amount: '1/4 cup' },
      { name: 'Fresh berries', amount: '1/2 cup' },
      { name: 'Chia seeds', amount: '1 tbsp' },
      { name: 'Honey', amount: '1 tbsp' }
    ],
    instructions: [
      'Add frozen blueberries, banana, and almond milk to blender',
      'Blend until smooth and thick',
      'Pour into a bowl',
      'Top with granola, fresh berries, and chia seeds',
      'Drizzle with honey',
      'Serve immediately'
    ],
    nutrition: { protein: 8, carbs: 62, fat: 8, fiber: 10 }
  },
  {
    id: '8',
    name: 'Pad Thai Noodles',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
    rating: 4.9,
    time: 35,
    calories: 540,
    difficulty: 'Medium',
    category: ['Dinner', 'Asian Food'],
    budget: 12,
    tools: ['Pan', 'Pot'],
    isFavorite: true,
    ingredients: [
      { name: 'Rice noodles', amount: '8 oz' },
      { name: 'Shrimp', amount: '1/2 lb' },
      { name: 'Eggs', amount: '2' },
      { name: 'Bean sprouts', amount: '1 cup' },
      { name: 'Peanuts', amount: '1/4 cup, crushed' },
      { name: 'Tamarind paste', amount: '3 tbsp' },
      { name: 'Fish sauce', amount: '3 tbsp' },
      { name: 'Green onions', amount: '3, chopped' }
    ],
    instructions: [
      'Soak rice noodles in warm water for 30 minutes',
      'Mix tamarind paste, fish sauce, and sugar for sauce',
      'Heat oil in wok or large pan',
      'Cook shrimp until pink, set aside',
      'Scramble eggs, set aside',
      'Drain noodles and stir-fry in the same pan',
      'Add sauce and toss to coat',
      'Add shrimp, eggs, and bean sprouts',
      'Top with peanuts and green onions'
    ],
    nutrition: { protein: 24, carbs: 68, fat: 18, fiber: 4 }
  }
];

export const categories = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Healthy',
  'Vegan',
  'Dessert',
  'Asian Food',
  'Fast Food'
];

export const budgetOptions = [
  { label: 'Under $5', value: 5 },
  { label: '$5-10', value: 10 },
  { label: '$10-20', value: 20 },
  { label: 'Premium Meals', value: 100 }
];

export const cookingTools = [
  { name: 'Air Fryer', icon: '🍳' },
  { name: 'Oven', icon: '🔥' },
  { name: 'Pan', icon: '🍳' },
  { name: 'Pot', icon: '🥘' },
  { name: 'Grill', icon: '🔥' },
  { name: 'Rice Cooker', icon: '🍚' },
  { name: 'Blender', icon: '🥤' }
];

export const timeFilters = [
  { label: 'Under 15 mins', value: 15 },
  { label: '15-30 mins', value: 30 },
  { label: '30-60 mins', value: 60 },
  { label: 'Long Cooking', value: 120 }
];
