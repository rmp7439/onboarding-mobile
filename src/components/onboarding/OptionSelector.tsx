import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

interface OptionSelectorProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (val: string) => void;
  required?: boolean;
}

export function OptionSelector({ label, options, selectedValue, onSelect, required }: OptionSelectorProps) {
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>
        {label}
      </Text>
      <View style={styles.optionsWrapper}>
        {options.map((opt) => {
          const isActive = selectedValue === opt;
          return (
            <TouchableOpacity
              key={opt}
              activeOpacity={0.7}
              style={[styles.optionPill, isActive && styles.optionPillActive]}
              onPress={() => onSelect(opt)}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorContainer: { marginBottom: spacing.md },
  selectorLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  optionsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionPill: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 70,
    alignItems: 'center',
  },
  optionPillActive: {
    backgroundColor: '#E6F4FE',
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});