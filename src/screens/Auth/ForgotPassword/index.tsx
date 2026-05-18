import React from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {Button, Input} from '@components/common';
import {Colors, Spacing} from '@theme';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = React.useState('');

  const handleSubmit = () => {
    Alert.alert('Email Sent', 'Check your inbox for reset instructions');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>Enter your email and we&apos;ll send reset instructions.</Text>
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" />
      <Button title="Send Reset Link" onPress={handleSubmit} fullWidth />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: Spacing[6], justifyContent: 'center'},
  title: {fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[1]},
  subtitle: {fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing[8]},
});
