import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export interface SectionTitleProps extends ViewProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle, style, ...props }: SectionTitleProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {!!subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  title: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  subtitle: { fontSize: typography.fontSize.sm, marginTop: spacing.xs },
});