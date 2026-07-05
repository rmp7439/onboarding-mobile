import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, SectionTitle, Button } from "../../src/components";
import { colors, spacing, typography, radius } from "../../src/theme";

const DEMO_PHONE = "9876543210";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const isCorrect = phone === DEMO_PHONE;
  // Show error only when the user finishes typing 10 digits and it's incorrect
  const showError = phone.length === 10 && !isCorrect;

  const handleContinue = () => {
    if (isCorrect) {
      router.push("/otp");
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <SectionTitle
          title="Sign In"
          subtitle="Enter your mobile number to continue"
          style={styles.header}
        />
        <Card style={styles.card}>
          <TextInput
            style={[styles.input, showError && styles.inputError]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Mobile Number"
            keyboardType="numeric"
            maxLength={10}
            placeholderTextColor={colors.textSecondary}
          />
          {showError && (
            <Text style={styles.errorText}>Invalid Phone Number</Text>
          )}
        </Card>
      </View>
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
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
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: "#FFFAFA",
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  footer: { paddingVertical: spacing.md, marginTop: spacing.md },
  button: { width: "100%" },
});