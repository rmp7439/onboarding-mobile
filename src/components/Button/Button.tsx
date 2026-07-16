import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, TouchableOpacityProps } from 'react-native';
import { spacing, radius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading = false, disabled = false, style, ...props }: ButtonProps) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isOutline) return 'transparent';
    if (isDisabled) return colors.border;
    if (variant === 'secondary') return colors.secondary;
    return colors.primary;
  };

  const getTextColor = () => {
    if (isDisabled && isOutline) return colors.border;
    if (isOutline) return colors.primary;
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        isOutline && { borderWidth: 1, borderColor: isDisabled ? colors.border : colors.primary },
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg, flexDirection: 'row' },
  text: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
});