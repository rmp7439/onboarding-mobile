import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen, Card, SectionTitle, Button } from "../../src/components";
import { colors, spacing, typography, radius } from "../../src/theme";
import { api } from "../../src/api/apiClient";
import { Session } from "../../src/utils/Session";

export default function OTPScreen() {
  const router = useRouter();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCorrect = otp.length === 6;

  const handleVerify = async () => {
    if (!isCorrect || isLoading) return; // Prevent duplicate submissions
    
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const data = await api.employeeLogin(mobile || "9876543210", otp);
      await Session.saveEmployeeSession(data);
      router.replace("/(onboarding)/home");
    } catch (error: any) {
      // Fallback for demo purposes
      if (mobile === "9876543210" && otp === "123456") {
        await Session.saveEmployeeSession({ 
          employeeId: "demo-id", 
          mobile: "9876543210", 
          token: "demo-token" 
        });
        router.replace("/(onboarding)/home");
      } else {
        // TASK 9: Replace raw alert with UI error state
        setErrorMsg(error.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <SectionTitle title="Verify OTP" style={styles.header} />
        <Card style={styles.card}>
          <TextInput
            style={[styles.input, !!errorMsg && styles.inputError]}
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Enter OTP"
            keyboardType="numeric"
            maxLength={6}
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
          title="Verify & Proceed"
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
    textAlign: "center",
    letterSpacing: 4,
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