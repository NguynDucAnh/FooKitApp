import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Home, Compass, Heart, CalendarDays, User } from 'lucide-react-native';
import { COLORS } from '../constants';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Trang chủ', icon: Home },
  { id: 'discover', label: 'Gói cước', icon: Compass },
  { id: 'favorites', label: 'Yêu thích', icon: Heart },
  { id: 'planner', label: 'Kế hoạch', icon: CalendarDays },
  { id: 'profile', label: 'Tài khoản', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.id)}
            android_ripple={{ color: '#E5F3DA' }}
          >
            <Icon size={23} color={isActive ? COLORS.primary : COLORS.textGray} />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 62,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textGray,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
