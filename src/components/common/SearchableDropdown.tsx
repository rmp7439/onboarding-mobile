import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { colors, spacing, radius, typography } from '../../theme';

export interface SearchableDropdownProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const SearchableDropdown = forwardRef<any, SearchableDropdownProps>(
  ({ label, value, onSelect, options, placeholder = "Select...", error, disabled, required }, ref) => {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {label}
        </Text>

        <Dropdown
          ref={ref}
          style={[
            styles.dropdown,
            disabled && styles.disabledDropdown,
            !!error && styles.errorDropdown,
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          data={options}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={placeholder}
          searchPlaceholder="Search..."
          value={value}
          onChange={item => {
            onSelect(item.value);
          }}
          disable={disabled}
        />
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  disabledDropdown: { 
    backgroundColor: colors.background,
  },
  errorDropdown: { 
    borderColor: colors.error 
  },
  placeholderStyle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  selectedTextStyle: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: typography.fontSize.md,
    borderRadius: radius.md,
    borderColor: colors.border,
    color: colors.text,
  },
  itemTextStyle: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});