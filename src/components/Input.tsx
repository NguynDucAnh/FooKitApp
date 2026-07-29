import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '../constants';

interface Props extends TextInputProps { label?: string; error?: string; }

export default function Input({
  label,
  error,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  editable,
  ...rest
}: Props) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, focus && styles.focused, !!error && styles.errBorder]}
        placeholderTextColor={COLORS.textGray}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        editable={editable}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ? `Lỗi: ${error}` : accessibilityHint}
        accessibilityState={{
          ...accessibilityState,
          disabled: Boolean(accessibilityState?.disabled || editable === false),
        }}
        {...rest}
      />
      {error && <Text style={styles.err} accessibilityLiveRegion="polite">{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 5 },
  input: { minHeight: 44, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.white },
  focused: { borderColor: COLORS.primary },
  errBorder: { borderColor: COLORS.error },
  err: { fontSize: 12, color: COLORS.error, marginTop: 3 },
});
