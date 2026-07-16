export const lightColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  white: '#FFFFFF',
  black: '#000000',
};

export const darkColors = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000', // Pure black for OLED efficiency
  surface: '#1C1C1E',    // Elevated surface color
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#EBEBF599',
  border: '#38383A',
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  white: '#FFFFFF',
  black: '#000000',
};

// Default export acts as fallback for any untouched statically imported files
export const colors = lightColors; 

export type ThemeColors = typeof lightColors;