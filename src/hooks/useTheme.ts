import {useColorScheme} from 'react-native';
import {useAppSelector} from './useRedux';
import {Theme, Colors} from '@theme';

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const themePreference = useAppSelector(state => state.app.theme);

  const isDark =
    themePreference === 'dark' || (themePreference === 'system' && systemScheme === 'dark');

  return {
    isDark,
    colors: isDark ? Theme.dark : Theme.light,
    palette: Colors,
  };
};
