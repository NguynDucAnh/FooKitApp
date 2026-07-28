import { CalendarDays, Heart, Sparkles, Wallet } from 'lucide-react-native';
import { AuthUser } from '../../types/auth';

export const EMPTY_PROFILE_USER: AuthUser = {
  username: '',
  name: 'Người dùng',
  fullName: 'Người dùng',
  email: '',
  phone: '',
  address: '',
  avatarUrl: '',
  cookingGoal: '',
  dietaryPreference: '',
  allergies: '',
  favoriteCuisine: '',
  weeklyBudget: '',
};

export const PROFILE_QUICK_LINKS = [
  { icon: Sparkles, label: 'Gợi ý món ăn', description: 'Tìm công thức phù hợp khẩu vị và ngân sách.', tab: 'home' },
  { icon: Wallet, label: 'Gói Premium', description: 'Quản lý gói ẩm thực và lịch sử thanh toán.', tab: 'discover' },
  { icon: Heart, label: 'Món yêu thích', description: 'Xem lại các công thức đã lưu.', tab: 'favorites' },
  { icon: CalendarDays, label: 'Kế hoạch bữa ăn', description: 'Sắp xếp thực đơn theo tuần.', tab: 'planner' },
];

export const PROFILE_DIET_OPTIONS = [
  { id: 1, label: 'Cân bằng' },
  { id: 2, label: 'Ăn chay' },
  { id: 3, label: 'Thuần chay' },
  { id: 4, label: 'Ít carb' },
  { id: 5, label: 'Giàu đạm' },
  { id: 6, label: 'Keto' },
];

export function parseCommaSeparatedList(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function formatProfileBudget(value: number) {
  return value > 0 ? value.toLocaleString('vi-VN') : '';
}

export function parseProfileBudget(value: string) {
  const normalized = value.replace(/[^\d]/g, '');
  return normalized ? Number(normalized) : 0;
}
