export const Colors = {
  // Brand
  primary: '#6C63FF',
  primaryDark: '#4B44CC',
  primaryLight: '#9D97FF',
  secondary: '#FF6584',
  secondaryDark: '#CC3F5F',
  secondaryLight: '#FF96AA',
  accent: '#43E97B',

  // Neutral
  black: '#000000',
  white: '#FFFFFF',
  gray100: '#F7F7F7',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Background
  background: '#FFFFFF',
  backgroundDark: '#121212',
  surface: '#F5F5F5',
  surfaceDark: '#1E1E1E',

  // Text
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',

  // Border
  border: '#E0E0E0',
  borderDark: '#333333',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.5)',
};

export type ColorKey = keyof typeof Colors;
