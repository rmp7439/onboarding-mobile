import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen, Card, SectionTitle, Button, Input } from "../../src/components";
import { colors, spacing, typography } from "../../src/theme";
import { api } from "../../src/api/apiClient";
import { Session } from "../../src/utils/Session";
import {
  lightImpact,
  success,
  error as errorHaptic,
} from "../../src/utils/haptics";

export default function PasswordScreen() {
  const router = useRouter();
  // Read userId from params
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCorrect = password.length >= 6;

  const handleVerify = async () => {
    if (!isCorrect || isLoading) return;

    lightImpact();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Call the API with the new identifier
      const data = await api.userLogin(userId, password);

      // Save the updated session format
      await Session.saveEmployeeSession({
        employeeId: data.user.id,
        userId: data.user.userId,
        token: data.token,
      });

      success();
      router.replace("/(onboarding)/home");
    } catch (err: unknown) {
      errorHaptic();
      setErrorMsg("Invalid User ID or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <SectionTitle title="Enter Password" style={styles.header} />
        <Card style={styles.card}>
          <Input
            label=""
            style={styles.customInput}
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
            error={errorMsg || undefined}
          />
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
  customInput: {
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
  },
  footer: { paddingVertical: spacing.md, marginTop: spacing.md },
  button: { width: "100%" },
});