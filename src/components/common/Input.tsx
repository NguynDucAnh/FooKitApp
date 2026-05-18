import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {Colors, Spacing, BorderRadius} from '@theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  required,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View
        style={[styles.inputContainer, isFocused && styles.focused, !!error && styles.errorBorder]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : null]}
          placeholderTextColor={Colors.gray400}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(v => !v)} style={styles.rightIcon}>
            <Text style={{color: Colors.gray500}}>{isSecure ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        )}
        {!secureTextEntry && rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginBottom: Spacing[4]},
  label: {fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing[1]},
  required: {color: Colors.error},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
  },
  focused: {borderColor: Colors.primary},
  errorBorder: {borderColor: Colors.error},
  input: {
    flex: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputWithLeft: {paddingLeft: Spacing[1]},
  leftIcon: {paddingLeft: Spacing[3]},
  rightIcon: {paddingRight: Spacing[3]},
  error: {fontSize: 12, color: Colors.error, marginTop: Spacing[1]},
  hint: {fontSize: 12, color: Colors.textSecondary, marginTop: Spacing[1]},
});
