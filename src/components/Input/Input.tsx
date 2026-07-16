import React, { forwardRef } from "react";
import { View, Text, TextInput, TextInputProps, StyleSheet } from "react-native";
import { spacing, radius, typography } from "../../theme";
import { useTheme } from "../../context/ThemeContext";

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, required, style, editable = true, multiline, ...props }, ref) => {
    const { colors } = useTheme();
    
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
            multiline && styles.multilineInput,
            !editable && { backgroundColor: colors.background, color: colors.textSecondary },
            !!error && { borderColor: colors.error },
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          editable={editable}
          multiline={multiline}
          {...props}
        />
        {!!error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSize.md, minHeight: 48 },
  multilineInput: { minHeight: 100, textAlignVertical: "top" },
  errorText: { fontSize: typography.fontSize.xs, marginTop: spacing.xs },
});