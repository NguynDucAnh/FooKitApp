import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<NavProp>();
  const {register: registerUser, isLoading} = useAuth();

  const {control, handleSubmit, formState: {errors}} = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {name: '', email: '', password: '', confirmPassword: ''},
  });

  const onSubmit = (data: FormData) => {
    registerUser({name: data.name, email: data.email, password: data.password});
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us today</Text>

      {(['name', 'email', 'password', 'confirmPassword'] as const).map(field => (
        <Controller
          key={field}
          control={control}
          name={field}
          render={({field: {onChange, value}}) => (
            <Input
              label={field.charAt(0).toUpperCase() + field.slice(1).replace('P', ' P')}
              value={value}
              onChangeText={onChange}
              error={errors[field]?.message}
              secureTextEntry={field === 'password' || field === 'confirmPassword'}
              keyboardType={field === 'email' ? 'email-address' : 'default'}
              autoCapitalize={field === 'email' ? 'none' : 'words'}
              required
            />
          )}
        />
      ))}

      <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={isLoading} fullWidth />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Button title="Sign In" onPress={() => navigation.navigate('Login')} variant="ghost" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flexGrow: 1, padding: Spacing[6], justifyContent: 'center'},
  title: {fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing[1]},
  subtitle: {fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing[8]},
  footer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing[6]},
  footerText: {fontSize: 14, color: Colors.textSecondary},
});
