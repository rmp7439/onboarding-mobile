import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, Button } from "../../../src/components";
import { colors, spacing, typography, radius } from "../../../src/theme";
import { useOnboarding } from "../../../src/context/OnboardingContext";

export default function SuccessScreen() {
  const router = useRouter();
  const { resetData } = useOnboarding();

  const handleRegisterAnother = () => {
    // 1. Purge the context state of the employee just registered
    resetData();
    // 2. Start a fresh registration by replacing the success screen in the stack
    router.replace("/(onboarding)/new-guard/employee-details");
  };

  const handleGoToDashboard = () => {
    // 1. Purge the context state
    resetData();
    // 2. Navigate cleanly back to the manager's dashboard
    router.replace("/(onboarding)/home");
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Screen style={styles.container} safeAreaEdges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>
        </View>

        <Text style={styles.title}>Employee Registered Successfully</Text>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Registration ID</Text>
            {/* Note: This is currently hardcoded but preserves existing UI */}
            <Text style={styles.detailValue}>EMP-2026-001</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Registered On</Text>
            <Text style={styles.detailValue}>{currentDate}</Text>
          </View>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          title="Register Another Employee"
          onPress={handleRegisterAnother}
          style={styles.button}
        />
        <Button
          title="Go To Dashboard"
          variant="outline"
          onPress={handleGoToDashboard}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

// ... styles remain completely unchanged ...
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  illustrationContainer: { marginBottom: spacing["3xl"], alignItems: "center" },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconText: {
    color: colors.white,
    fontSize: typography.fontSize["3xl"] * 1.5,
    fontWeight: typography.fontWeight.bold,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing["3xl"],
    lineHeight: typography.lineHeight.md,
    paddingHorizontal: spacing.lg,
  },
  detailsCard: { width: "100%", padding: spacing.lg },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
    marginVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  footer: { paddingVertical: spacing.md, gap: spacing.md },
  button: { width: "100%" },
});