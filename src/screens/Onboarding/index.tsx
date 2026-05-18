import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useAppDispatch} from '@hooks';
import {setOnboardingDone} from '@store/slices/appSlice';
import {Button} from '@components/common';
import {Colors, Spacing} from '@theme';

export const OnboardingScreen = () => {
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MyMobileApp</Text>
      <Text style={styles.subtitle}>Your amazing app starts here.</Text>
      <Button title="Get Started" onPress={() => dispatch(setOnboardingDone(true))} fullWidth />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: Spacing[8],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing[12],
    opacity: 0.85,
  },
});
