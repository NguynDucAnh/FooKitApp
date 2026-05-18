import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainTabParamList} from '@types';
import {HomeScreen} from '@screens/Home';
import {ProfileScreen} from '@screens/Profile';
import {SettingsScreen} from '@screens/Settings';
import {Colors} from '@theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.gray500,
      tabBarStyle: {borderTopWidth: 1, borderTopColor: Colors.border},
      headerShown: false,
    }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);
