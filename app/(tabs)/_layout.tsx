import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../src/constants';
import { useAppSelector } from '../../src/store';

export default function TabsLayout() {
  const count = useAppSelector(s => s.cart.items.reduce((n, i) => n + i.quantity, 0));
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.primary, tabBarInactiveTintColor: COLORS.textGray, headerShown: false }}>
      <Tabs.Screen name="home"    options={{ title: 'Trang chủ', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }} />
      <Tabs.Screen name="cart"    options={{ title: 'Giỏ hàng',  tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛒</Text>, tabBarBadge: count > 0 ? count : undefined }} />
      <Tabs.Screen name="orders"  options={{ title: 'Đơn hàng',  tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📦</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Tài khoản', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tabs>
  );
}
