import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  outline?: boolean;
  style?: ViewStyle;
}

export default function Button({ title, onPress, loading, disabled, outline, style }: Props) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[styles.btn, outline ? styles.outline : styles.filled, isDisabled && styles.dim, style]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
    >
      {loading
        ? <ActivityIndicator color={outline ? COLORS.primary : COLORS.white} />
        : <Text style={[styles.label, outline && styles.labelOutline]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 44, padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  filled: { backgroundColor: COLORS.primary },
  outline: { borderWidth: 1.5, borderColor: COLORS.primary },
  dim: { opacity: 0.5 },
  label: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  labelOutline: { color: COLORS.primary },
});
