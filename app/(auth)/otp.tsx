import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, SectionTitle, Button } from "../../src/components";
import { colors, spacing, typography, radius } from "../../src/theme";

const DEMO_OTP = "123456";

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState("");

  const isCorrect = otp === DEMO_OTP;
  // Show error only when the user finishes typing 6 digits and it's incorrect
  const showError = otp.length === 6 && !isCorrect;

  const handleVerify = () => {
    if (isCorrect) {
      router.replace("/(onboarding)/home");
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <SectionTitle
          title="Verify OTP"
          style={styles.header}
        />
        <Card style={styles.card}>
          <TextInput
            style={[styles.input, showError && styles.inputError]}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            keyboardType="numeric"
            maxLength={6}
            placeholderTextColor={colors.textSecondary}
          />
          {showError && <Text style={styles.errorText}>Invalid OTP</Text>}
        </Card>
      </View>
      <View style={styles.footer}>
        <Button
          title="Verify & Proceed"
          onPress={handleVerify}
          disabled={!isCorrect}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  content: { flex: 1 },
  header: { marginBottom: spacing.xl, marginTop: spacing.xl },
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
    textAlign: "center",
    letterSpacing: 4,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: "#FFFAFA",
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    textAlign: "center",
    fontWeight: typography.fontWeight.medium,
  },
  footer: { paddingVertical: spacing.md, marginTop: spacing.md },
  button: { width: "100%" },
});