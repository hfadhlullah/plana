/**
 * Slotify Design System - Color Tokens
 * "Vintage Paper" aesthetic
 */
export const Colors = {
  light: {
    background: '#F5F1E6',
    foreground: '#4A3F35',
    card: '#FFFCF5',
    cardForeground: '#4A3F35',
    primary: '#A67C52',
    primaryForeground: '#FFFFFF',
    secondary: '#E2D8C3',
    secondaryForeground: '#5C4D3F',
    muted: '#ECE5D8',
    mutedForeground: '#7D6B56',
    accent: '#D4C8AA',
    accentForeground: '#4A3F35',
    destructive: '#B54A35',
    destructiveForeground: '#FFFFFF',
    border: '#DBD0BA',
    input: '#DBD0BA',
    ring: '#A67C52',
  },
  dark: {
    background: '#2D2621',
    foreground: '#ECE5D8',
    card: '#3A322C',
    cardForeground: '#ECE5D8',
    primary: '#C0A080',
    primaryForeground: '#2D2621',
    secondary: '#4A4039',
    secondaryForeground: '#ECE5D8',
    muted: '#312B26',
    mutedForeground: '#C5BCAC',
    accent: '#59493E',
    accentForeground: '#ECE5D8',
    destructive: '#B54A35',
    destructiveForeground: '#FFFFFF',
    border: '#4A4039',
    input: '#4A4039',
    ring: '#C0A080',
  },
};

export type ThemeColors = typeof Colors.light;
