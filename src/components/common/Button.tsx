import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {Colors, Spacing, BorderRadius} from '@theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  // Variants
  primary: {backgroundColor: Colors.primary},
  secondary: {backgroundColor: Colors.secondary},
  outline: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary},
  ghost: {backgroundColor: 'transparent'},
  danger: {backgroundColor: Colors.error},
  // Sizes
  sm: {paddingHorizontal: Spacing[3], paddingVertical: Spacing[2]},
  md: {paddingHorizontal: Spacing[6], paddingVertical: Spacing[3]},
  lg: {paddingHorizontal: Spacing[8], paddingVertical: Spacing[4]},
  // States
  disabled: {opacity: 0.5},
  fullWidth: {width: '100%'},
  // Text
  text: {fontWeight: '600'},
  text_primary: {color: Colors.white},
  text_secondary: {color: Colors.white},
  text_outline: {color: Colors.primary},
  text_ghost: {color: Colors.primary},
  text_danger: {color: Colors.white},
  text_sm: {fontSize: 12},
  text_md: {fontSize: 14},
  text_lg: {fontSize: 16},
});
