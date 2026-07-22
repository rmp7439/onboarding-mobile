import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Screen, Card, SectionTitle, Button } from "../../src/components";
import { colors, spacing, typography, radius } from "../../src/theme";
import { api } from "../../src/api/apiClient";
import { lightImpact } from "../../src/utils/haptics";
import { useOnboarding } from "../../src/context/OnboardingContext";
import { startEditingApplication } from "../../src/utils/editHelper";

export default function EditApplicationsScreen() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyApplications();
      // Client-side filtering for actionable applications
      const actionable = data.filter((app: any) =>
        ["RETURNED_FOR_CORRECTION", "REJECTED"].includes(
          app.status.toUpperCase(),
        ),
      );
      setApplications(actionable);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [fetchApplications]),
  );

  const handleContinueEditing = async (id: string) => {
    if (loadingId) return;
    lightImpact();
    setLoadingId(id);

    try {
      // Fetch full profile data required for the onboarding context
      const profile = await api.getEmployeeProfile(id);
      startEditingApplication(profile, updateData, router);
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Could not load employee details. Please try again.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    return status.toUpperCase() === "REJECTED"
      ? { bg: "#FEE2E2", text: colors.error, label: "REJECTED" }
      : { bg: "#FEF3C7", text: colors.warning, label: "RETURNED" };
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    const date = new Date(item.uploadedAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Fallback reason if backend getMyApplications doesn't return full remarks
    const reason =
      item.correctionRemark ||
      item.rejectReason ||
      "Action required. Please review the application.";

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.nameText}>
            {item.firstName} {item.surname}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.reasonContainer}>
          <Text style={styles.reasonText} numberOfLines={2}>
            {reason}
          </Text>
        </View>

        <Text style={styles.dateText}>Created On: {date}</Text>

        <Button
          title="Continue Editing"
          loading={loadingId === item.id}
          disabled={loadingId !== null}
          onPress={() => handleContinueEditing(item.id)}
          style={styles.editButton}
        />
      </Card>
    );
  };

  return (
    <Screen style={styles.container} scrollable={false}>
      <SectionTitle
        title="Edit Applications"
        subtitle="Applications requiring your attention"
        style={styles.header}
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No applications require corrections at this time.
            </Text>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: spacing.md },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingBottom: spacing.xl, gap: spacing.md },
  card: { padding: spacing.md },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  nameText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  reasonContainer: {
    backgroundColor: "#F9FAFB",
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    color: colors.border,
    marginBottom: spacing.md,
  },
  editButton: { width: "100%" },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});