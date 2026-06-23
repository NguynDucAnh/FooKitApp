export interface Recipe {
  id: string;
  dishCacheId?: string;
  name: string;
  image: string;
  rating: number;
  time: number;
  calories: number;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
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
  rawEnglishName?: string;
  isMapped?: boolean;
  affiliateProduct?: {
    productName: string;
    productUrl: string;
    price: number;
  } | null;
}

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Cánh gà chiên giòn bằng nồi chiên không dầu',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&h=600&fit=crop',
    rating: 4.8,
    time: 25,
    calories: 320,
    difficulty: 'Dễ',
    category: ['Bữa tối', 'Đồ ăn nhanh'],
    budget: 80000,
    tools: ['Nồi chiên không dầu'],
    isFavorite: false,
    ingredients: [
      { name: 'Cánh gà', amount: '900g' },
      { name: 'Bột nở', amount: '2 muỗng canh' },
      { name: 'Muối', amount: '1 muỗng cà phê' },
      { name: 'Tiêu', amount: '1 muỗng cà phê' },
      { name: 'Bột tỏi', amount: '1 muỗng cà phê' },
      { name: 'Bột ớt paprika', amount: '1 muỗng cà phê' },
      { name: 'Tương ớt', amount: 'tùy khẩu vị' }
    ],
    instructions: [
      'Thấm khô cánh gà bằng khăn giấy.',
      'Trộn bột nở, muối, tiêu, bột tỏi và paprika trong tô.',
      'Áo đều cánh gà với hỗn hợp gia vị.',
      'Làm nóng nồi chiên không dầu ở 190°C.',
      'Xếp cánh gà vào giỏ thành một lớp.',
      'Nấu 12 phút, lật mặt rồi nấu thêm 12 phút.',
      'Trộn với tương ớt nếu thích và dùng khi còn nóng.'
    ],
    nutrition: { protein: 28, carbs: 2, fat: 22, fiber: 0 }
  },
  {
    id: '2',
    name: 'Bánh mì bơ trứng chần',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
    rating: 4.6,
    time: 10,
    calories: 280,
    difficulty: 'Dễ',
    category: ['Bữa sáng', 'Lành mạnh'],
    budget: 50000,
    tools: ['Chảo', 'Nồi'],
    isFavorite: true,
    ingredients: [
      { name: 'Lát bánh mì', amount: '2 lát' },
      { name: 'Bơ', amount: '1 quả chín' },
      { name: 'Trứng', amount: '2 quả' },
      { name: 'Nước cốt chanh', amount: '1 muỗng cà phê' },
      { name: 'Muối', amount: 'tùy khẩu vị' },
      { name: 'Ớt khô', amount: '1 nhúm' },
      { name: 'Dầu ô liu', amount: '1 muỗng canh' }
    ],
    instructions: [
      'Nướng bánh mì đến khi vàng giòn.',
      'Nghiền bơ với nước cốt chanh, muối và tiêu.',
      'Đun nước trong nồi đến khi sôi lăn tăn.',
      'Đập trứng vào chén nhỏ.',
      'Tạo xoáy nhẹ trong nước rồi thả trứng vào.',
      'Chần 3-4 phút đến khi lòng trắng đông lại.',
      'Phết bơ lên bánh mì, đặt trứng chần lên trên.',
      'Rắc ớt khô và thưởng thức.'
    ],
    nutrition: { protein: 12, carbs: 24, fat: 18, fiber: 7 }
  },
  {
    id: '3',
    name: 'Cơm cá hồi teriyaki',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    rating: 4.9,
    time: 30,
    calories: 520,
    difficulty: 'Trung bình',
    category: ['Bữa trưa', 'Bữa tối', 'Lành mạnh', 'Món Á'],
    budget: 150000,
    tools: ['Chảo', 'Nồi cơm điện'],
    isFavorite: true,
    ingredients: [
      { name: 'Phi lê cá hồi', amount: '2 miếng, mỗi miếng 170g' },
      { name: 'Gạo thơm', amount: '1 chén' },
      { name: 'Sốt teriyaki', amount: '1/4 chén' },
      { name: 'Bông cải xanh', amount: '1 chén' },
      { name: 'Mè rang', amount: '1 muỗng canh' },
      { name: 'Hành lá', amount: '2 nhánh, cắt nhỏ' },
      { name: 'Nước tương', amount: '2 muỗng canh' }
    ],
    instructions: [
      'Nấu cơm bằng nồi cơm điện theo hướng dẫn.',
      'Ướp cá hồi với muối và tiêu.',
      'Làm nóng chảo với dầu ở lửa vừa lớn.',
      'Áp chảo mặt da cá hồi 4-5 phút.',
      'Lật mặt và nấu thêm 3-4 phút.',
      'Phết sốt teriyaki trong phút cuối.',
      'Hấp bông cải xanh khoảng 5 phút.',
      'Xếp cơm, cá hồi và bông cải vào tô.',
      'Rưới thêm teriyaki, nước tương, mè rang và hành lá.'
    ],
    nutrition: { protein: 42, carbs: 48, fat: 16, fiber: 3 }
  },
  {
    id: '4',
    name: 'Bánh chocolate nhân chảy',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&h=600&fit=crop',
    rating: 4.7,
    time: 20,
    calories: 480,
    difficulty: 'Trung bình',
    category: ['Tráng miệng'],
    budget: 60000,
    tools: ['Lò nướng'],
    isFavorite: false,
    ingredients: [
      { name: 'Chocolate đen', amount: '110g' },
      { name: 'Bơ lạt', amount: '1/2 chén' },
      { name: 'Trứng', amount: '2 quả' },
      { name: 'Lòng đỏ trứng', amount: '2 cái' },
      { name: 'Đường', amount: '1/4 chén' },
      { name: 'Bột mì', amount: '2 muỗng canh' },
      { name: 'Chiết xuất vani', amount: '1 muỗng cà phê' }
    ],
    instructions: [
      'Làm nóng lò ở 220°C.',
      'Phết bơ và phủ bột mỏng vào 4 khuôn ramekin.',
      'Đun chảy chocolate và bơ trong lò vi sóng.',
      'Đánh trứng, lòng đỏ và đường đến khi hỗn hợp đặc lại.',
      'Trộn hỗn hợp chocolate vào.',
      'Nhẹ tay trộn bột mì và vani.',
      'Chia bột vào các khuôn.',
      'Nướng 12-14 phút đến khi viền bánh se lại.',
      'Để nguội 1 phút rồi úp ra đĩa.'
    ],
    nutrition: { protein: 8, carbs: 42, fat: 32, fiber: 2 }
  },
  {
    id: '5',
    name: 'Tô rau củ ngũ cốc',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    rating: 4.5,
    time: 25,
    calories: 380,
    difficulty: 'Dễ',
    category: ['Bữa trưa', 'Lành mạnh', 'Thuần chay'],
    budget: 70000,
    tools: ['Lò nướng', 'Nồi'],
    isFavorite: false,
    ingredients: [
      { name: 'Hạt quinoa', amount: '1 chén' },
      { name: 'Khoai lang', amount: '1 củ lớn, cắt khối' },
      { name: 'Đậu gà', amount: '1 lon' },
      { name: 'Cải xoăn', amount: '2 chén' },
      { name: 'Bơ', amount: '1 quả' },
      { name: 'Sốt tahini', amount: '3 muỗng canh' },
      { name: 'Nước cốt chanh', amount: '2 muỗng canh' }
    ],
    instructions: [
      'Làm nóng lò ở 200°C.',
      'Nấu quinoa theo hướng dẫn trên bao bì.',
      'Trộn khoai lang với dầu ô liu, muối và tiêu.',
      'Nướng khoai lang trong 25 phút.',
      'Rửa đậu gà, nêm gia vị rồi nướng cùng khoai.',
      'Bóp nhẹ cải xoăn với một ít dầu ô liu.',
      'Pha sốt tahini với nước cốt chanh và nước lọc.',
      'Xếp quinoa, rau củ nướng, cải xoăn và bơ vào tô.',
      'Rưới sốt tahini lên trên.'
    ],
    nutrition: { protein: 14, carbs: 58, fat: 16, fiber: 12 }
  },
  {
    id: '6',
    name: 'Burger bò truyền thống',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    rating: 4.8,
    time: 20,
    calories: 650,
    difficulty: 'Dễ',
    category: ['Bữa trưa', 'Bữa tối', 'Đồ ăn nhanh'],
    budget: 100000,
    tools: ['Vỉ nướng', 'Chảo'],
    isFavorite: true,
    ingredients: [
      { name: 'Thịt bò xay', amount: '450g, tỷ lệ 80/20' },
      { name: 'Bánh burger', amount: '4 cái' },
      { name: 'Phô mai lát', amount: '4 lát' },
      { name: 'Xà lách', amount: '4 lá' },
      { name: 'Cà chua', amount: '1 quả lớn, cắt lát' },
      { name: 'Hành tây', amount: '1 củ, cắt lát' },
      { name: 'Dưa leo muối', amount: '8 lát' },
      { name: 'Sốt đặc biệt', amount: '1/4 chén' }
    ],
    instructions: [
      'Chia thịt bò thành 4 phần bằng nhau và nặn thành miếng.',
      'Ấn nhẹ một lõm nhỏ ở giữa mỗi miếng thịt.',
      'Nêm nhiều muối và tiêu.',
      'Làm nóng vỉ nướng hoặc chảo ở lửa lớn.',
      'Nướng mỗi mặt 3-4 phút để thịt chín vừa.',
      'Thêm phô mai vào phút cuối.',
      'Nướng sơ mặt bánh.',
      'Xếp burger với sốt, xà lách, cà chua, hành tây và dưa leo muối.'
    ],
    nutrition: { protein: 32, carbs: 38, fat: 42, fiber: 2 }
  },
  {
    id: '7',
    name: 'Tô sinh tố việt quất',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
    rating: 4.4,
    time: 10,
    calories: 320,
    difficulty: 'Dễ',
    category: ['Bữa sáng', 'Lành mạnh', 'Thuần chay'],
    budget: 60000,
    tools: ['Máy xay'],
    isFavorite: false,
    ingredients: [
      { name: 'Việt quất đông lạnh', amount: '2 chén' },
      { name: 'Chuối đông lạnh', amount: '1 quả' },
      { name: 'Sữa hạnh nhân', amount: '1/2 chén' },
      { name: 'Granola', amount: '1/4 chén' },
      { name: 'Quả mọng tươi', amount: '1/2 chén' },
      { name: 'Hạt chia', amount: '1 muỗng canh' },
      { name: 'Mật ong', amount: '1 muỗng canh' }
    ],
    instructions: [
      'Cho việt quất đông lạnh, chuối và sữa hạnh nhân vào máy xay.',
      'Xay đến khi mịn và sánh.',
      'Đổ ra tô.',
      'Thêm granola, quả mọng tươi và hạt chia.',
      'Rưới mật ong lên trên.',
      'Dùng ngay khi còn lạnh.'
    ],
    nutrition: { protein: 8, carbs: 62, fat: 8, fiber: 10 }
  },
  {
    id: '8',
    name: 'Mì Pad Thái',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
    rating: 4.9,
    time: 35,
    calories: 540,
    difficulty: 'Trung bình',
    category: ['Bữa tối', 'Món Á'],
    budget: 120000,
    tools: ['Chảo', 'Nồi'],
    isFavorite: true,
    ingredients: [
      { name: 'Bánh phở khô', amount: '225g' },
      { name: 'Tôm', amount: '225g' },
      { name: 'Trứng', amount: '2 quả' },
      { name: 'Giá đỗ', amount: '1 chén' },
      { name: 'Đậu phộng', amount: '1/4 chén, giã nhỏ' },
      { name: 'Sốt me', amount: '3 muỗng canh' },
      { name: 'Nước mắm', amount: '3 muỗng canh' },
      { name: 'Hành lá', amount: '3 nhánh, cắt nhỏ' }
    ],
    instructions: [
      'Ngâm bánh phở trong nước ấm 30 phút.',
      'Trộn sốt me, nước mắm và đường để làm sốt.',
      'Làm nóng dầu trong chảo lớn.',
      'Xào tôm đến khi chuyển hồng rồi để riêng.',
      'Đánh tơi trứng rồi để riêng.',
      'Để ráo bánh phở và xào trong cùng chảo.',
      'Thêm sốt và đảo đều.',
      'Cho tôm, trứng và giá đỗ vào.',
      'Rắc đậu phộng và hành lá lên trên.'
    ],
    nutrition: { protein: 24, carbs: 68, fat: 18, fiber: 4 }
  }
];

export const categories = [
  'Tất cả',
  'Bữa sáng',
  'Bữa trưa',
  'Bữa tối',
  'Lành mạnh',
  'Thuần chay',
  'Tráng miệng',
  'Món Á',
  'Đồ ăn nhanh'
];

export const budgetOptions = [
  { label: 'Dưới 50.000 đ', value: 50000 },
  { label: '50.000 - 100.000 đ', value: 100000 },
  { label: '100.000 - 200.000 đ', value: 200000 },
  { label: 'Món cao cấp', value: 500000 }
];

export const cookingTools = [
  { name: 'Nồi chiên không dầu', icon: '🍳' },
  { name: 'Lò nướng', icon: '🔥' },
  { name: 'Chảo', icon: '🍳' },
  { name: 'Nồi', icon: '🥘' },
  { name: 'Vỉ nướng', icon: '🔥' },
  { name: 'Nồi cơm điện', icon: '🍚' },
  { name: 'Máy xay', icon: '🥤' }
];

export const timeFilters = [
  { label: 'Dưới 15 phút', value: 15 },
  { label: '15 - 30 phút', value: 30 },
  { label: '30 - 60 phút', value: 60 },
  { label: 'Nấu lâu', value: 120 }
];
