import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../src/constants';

const MENU = [
  { icon: '[]', label: 'Don hang cua toi', path: '/(tabs)/orders' },
  { icon: '->', label: 'Dia chi giao hang', path: null },
  { icon: '!', label: 'Thong bao', path: null },
  { icon: '?', label: 'Tro giup va ho tro', path: null },
];

export default function ProfileScreen() {
  async function handleLogout() {
    Alert.alert('Dang xuat', 'Ban co chac muon dang xuat?', [
      { text: 'Huy', style: 'cancel' },
      {
        text: 'Dang xuat',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>?</Text>
        </View>
        <Text style={styles.name}>Nguoi dung</Text>
        <Text style={styles.email}>Da dang nhap</Text>
      </View>

      {MENU.map(item => (
        <TouchableOpacity
          key={item.label}
          style={styles.menuRow}
          onPress={() => item.path ? router.push(item.path as never) : null}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Text style={styles.menuArrow}>{'>'}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Dang xuat</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  headerBox: { alignItems: 'center', padding: 32, backgroundColor: COLORS.white, marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 34, fontWeight: '700', color: COLORS.white },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textGray, marginTop: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, marginBottom: 1 },
  menuIcon: { fontSize: 16, marginRight: 14, width: 24, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  menuArrow: { fontSize: 22, color: COLORS.textGray },
  logoutBtn: { margin: 20, padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.error, alignItems: 'center' },
  logoutText: { color: COLORS.error, fontSize: 15, fontWeight: '600' },
});
