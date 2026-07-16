import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { spacing, radius, shadows } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.md, padding: spacing.md, ...shadows.sm },
});