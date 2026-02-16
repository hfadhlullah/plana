import { Colors, ThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

export function useThemeColors(): ThemeColors {
  const { colorScheme } = useTheme();
  return Colors[colorScheme];
}
