import React from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Button, Input} from '@components/common';
import {useAuth} from '@hooks';
import {AuthStackParamList} from '@types';
import {Colors, Spacing} from '@theme';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<NavProp>();
  const {login, isLoading, error} = useAuth();

  const {control, handleSubmit, formState: {errors}} = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {email: '', password: ''},
  });

  const onSubmit = async (data: FormData) => {
    const result = await login(data);
    if ((result as any).error) {
      Alert.alert('Login Failed', error || 'Please try again');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <Controller
        control={control}
        name="email"
        render={({field: {onChange, value}}) => (
          <Input
            label="Email"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({field: {onChange, value}}) => (
          <Input
            label="Password"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            placeholder="••••••••"
            secureTextEntry
            required
          />
        )}
      />

      <Button
        title="Forgot Password?"
        onPress={() => navigation.navigate('ForgotPassword', {})}
        variant="ghost"
        style={styles.forgotBtn}
      />

      <Button
        title="Sign In"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        fullWidth
        style={styles.loginBtn}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Button title="Sign Up" onPress={() => navigation.navigate('Register')} variant="ghost" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flexGrow: 1, padding: Spacing[6], justifyContent: 'center'},
  title: {fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[1]},
  subtitle: {fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing[8]},
  forgotBtn: {alignSelf: 'flex-end', marginBottom: Spacing[4]},
  loginBtn: {marginTop: Spacing[2]},
  footer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing[6]},
  footerText: {fontSize: 14, color: Colors.textSecondary},
});
