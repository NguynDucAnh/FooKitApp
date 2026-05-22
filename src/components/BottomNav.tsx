import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Home, Compass, Heart, CalendarDays, User } from 'lucide-react-native';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'planner', label: 'Planner', icon: CalendarDays },
  { id: 'profile', label: 'Profile', icon: User }
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
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onTabChange(tab.id)}
            android_ripple={{ color: '#D1FAE5' }}
          >
            <Icon size={24} color={isActive ? '#10B981' : '#6B7280'} />
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
    elevation: 8
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#6B7280'
  },
  tabLabelActive: {
    color: '#10B981',
    fontWeight: '700'
  },
  tabButtonActive: {
    opacity: 1
  }
});
