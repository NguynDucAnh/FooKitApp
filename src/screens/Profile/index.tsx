import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Spacing} from '@theme';

export const ProfileScreen = () => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Profile</Text>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background, padding: Spacing[6]},
  title: {fontSize: 24, fontWeight: '700', color: Colors.textPrimary},
});
