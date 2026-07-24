import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "../../theme";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  ref?: React.Ref<TextInput>;
}

export function Input({
  label,
  error,
  required,
  style,
  editable = true,
  multiline,
  secureTextEntry,
  ref,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry !== undefined && secureTextEntry !== false;
  const currentSecureEntry = isPassword ? !showPassword : false;

  return (
    <View style={styles.container}>
      {!!label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            !editable && styles.disabledInput,
            !!error && styles.errorInput,
            isPassword && styles.passwordInput,
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          editable={editable}
          multiline={multiline}
          secureTextEntry={currentSecureEntry}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  passwordInput: {
    paddingRight: spacing.xl + spacing.sm,
  },
  multilineInput: { minHeight: 100, textAlignVertical: "top" },
  disabledInput: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  errorInput: { borderColor: colors.error },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
});