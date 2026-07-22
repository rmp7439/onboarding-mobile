import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen, Card, SectionTitle, Button } from "../../src/components";
import { colors, spacing, typography, radius } from "../../src/theme";
import { api } from "../../src/api/apiClient";
import { Session } from "../../src/utils/Session";
import {
  lightImpact,
  success,
  error as errorHaptic,
} from "../../src/utils/haptics";

export default function PasswordScreen() {
  // Renamed component internally
  const router = useRouter();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCorrect = password.length >= 6; // Validates password length instead of 6-digit OTP

  const handleVerify = async () => {
    if (!isCorrect || isLoading) return;

    lightImpact();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.userLogin(mobile || "9876543210", password);
      await Session.saveEmployeeSession({
        employeeId: data.user.id, // Safely mapped to maintain Session.ts backward compatibility
        mobile: data.user.mobile,
        token: data.token,
      });
      success();
      router.replace("/(onboarding)/home");
    } catch (err: unknown) {
      errorHaptic();
      const message =
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <SectionTitle title="Enter Password" style={styles.header} />
        <Card style={styles.card}>
          <TextInput
            style={[styles.input, !!errorMsg && styles.inputError]}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor={colors.textSecondary}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            editable={!isLoading}
          />
          {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </Card>
      </View>
      <View style={styles.footer}>
        <Button
          title="Sign In"
          onPress={handleVerify}
          disabled={!isCorrect || isLoading}
          loading={isLoading}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: { marginVertical: spacing.xl },
  card: { padding: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.error, backgroundColor: "#FFFAFA" },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.md,
    textAlign: "center",
    fontWeight: typography.fontWeight.medium,
  },
  footer: { paddingVertical: spacing.md, marginTop: spacing.md },
  button: { width: "100%" },
});