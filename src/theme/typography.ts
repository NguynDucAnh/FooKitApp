import {StyleSheet} from 'react-native';

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  light: 'System',
  italic: 'System',
};

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
};

export const LineHeight = {
  xs: 14,
  sm: 18,
  base: 20,
  md: 24,
  lg: 28,
  xl: 30,
  '2xl': 36,
};

export const typography = StyleSheet.create({
  h1: {fontSize: FontSize['4xl'], fontWeight: '700', lineHeight: LineHeight['2xl']},
  h2: {fontSize: FontSize['3xl'], fontWeight: '700', lineHeight: 36},
  h3: {fontSize: FontSize['2xl'], fontWeight: '600', lineHeight: 32},
  h4: {fontSize: FontSize.xl, fontWeight: '600', lineHeight: 28},
  h5: {fontSize: FontSize.lg, fontWeight: '600', lineHeight: 26},
  body1: {fontSize: FontSize.md, fontWeight: '400', lineHeight: LineHeight.md},
  body2: {fontSize: FontSize.base, fontWeight: '400', lineHeight: LineHeight.base},
  caption: {fontSize: FontSize.sm, fontWeight: '400', lineHeight: LineHeight.sm},
  overline: {fontSize: FontSize.xs, fontWeight: '500', letterSpacing: 1.5},
  button: {fontSize: FontSize.base, fontWeight: '600', letterSpacing: 0.5},
  label: {fontSize: FontSize.sm, fontWeight: '500', lineHeight: LineHeight.sm},
});
