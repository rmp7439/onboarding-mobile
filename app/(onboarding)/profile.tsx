import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { api } from "../../src/api/apiClient";
import { Button, Card, Screen, SectionTitle } from "../../src/components";
import { colors, radius, spacing, typography } from "../../src/theme";
import { RecentEmployeeStore } from "../../src/utils/RecentEmployeeStore";
import { lightImpact } from "../../src/utils/haptics";

interface EmployeeProfile {
  id: string;
  firstName: string;
  surname: string;
  employeeCode: string | null;
  status: string;
  rejectReason: string | null;
  mobile: string;
  joiningDate: string;
  gender: string;
  bloodGroup: string;
  selfieUrl: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchProfile = useCallback(async (isBackground: boolean = false) => {
    try {
      if (!isBackground) {
        setIsLoading(true);
        setError(null);
        setIsEmpty(false);
      }

      const recentId = await RecentEmployeeStore.getId();

      if (!recentId) {
        if (!isBackground) {
          setIsEmpty(true);
          setIsLoading(false);
        }
        return;
      }

      const data = await api.getEmployeeProfile(recentId);

      setProfile((prevProfile) => {
        // Accept initial data payload
        if (!prevProfile) return data;

        // Compare ONLY mutable fields. Explicitly exclude selfieUrl because
        // the signed URL signature changes every request.
        const hasMeaningfulChange =
          prevProfile.status !== data.status ||
          prevProfile.employeeCode !== data.employeeCode ||
          prevProfile.rejectReason !== data.rejectReason;

        if (hasMeaningfulChange) {
          return {
            ...data,
            // Preserve the exact string reference of the original URL.
            // This prevents React Native's <Image> prop identity from changing,
            // ensuring the view never flashes or reloads the image data.
            selfieUrl: prevProfile.selfieUrl,
          };
        }

        // Return exact existing reference to completely bypass React reconciliation
        return prevProfile;
      });
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || "Failed to load profile.");
      }
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const executeBackgroundPoll = async () => {
        if (!isActive) return;

        await fetchProfile(true);

        if (isActive) {
          timeoutId = setTimeout(executeBackgroundPoll, 5000);
        }
      };

      const startLifecycle = async () => {
        await fetchProfile(false);

        if (isActive) {
          timeoutId = setTimeout(executeBackgroundPoll, 5000);
        }
      };

      startLifecycle();

      return () => {
        isActive = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [fetchProfile]),
  );

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return { bg: "#DCFCE7", text: colors.success };
      case "REJECTED":
        return { bg: "#FEE2E2", text: colors.error };
      case "PENDING":
      default:
        return { bg: "#FEF3C7", text: colors.warning };
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading && !profile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <Screen style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>
            No employee has been registered yet.
          </Text>
          <Text style={styles.emptySubtitle}>
            Register an employee to view their profile.
          </Text>
          <Button
            title="Back to Dashboard"
            onPress={() => {
              lightImpact();
              router.back();
            }}
            style={styles.retryButton}
          />
        </View>
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Back to Dashboard"
          onPress={() => {
            lightImpact();
            router.back();
          }}
          style={styles.retryButton}
        />
      </View>
    );
  }

  const badgeStyle = getStatusBadgeStyle(profile.status);

  return (
    <Screen style={styles.container}>
      <SectionTitle title="Employee Profile" style={styles.header} />

      <Card style={styles.identityCard}>
        <View style={styles.photoContainer}>
          {profile.selfieUrl ? (
            <Image
              source={{ uri: profile.selfieUrl }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                {profile.firstName.charAt(0)}
                {profile.surname.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.nameText}>
          {profile.firstName} {profile.surname}
        </Text>
        <Text style={styles.codeText}>
          {profile.employeeCode || "Pending Assignment"}
        </Text>

        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
            {profile.status}
          </Text>
        </View>
      </Card>

      {profile.status.toUpperCase() === "REJECTED" && profile.rejectReason ? (
        <Card style={[styles.detailsCard, styles.rejectionCard]}>
          <Text style={styles.rejectionTitle}>Application Rejected</Text>
          <Text style={styles.rejectionBody}>{profile.rejectReason}</Text>
        </Card>
      ) : null}

      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mobile Number</Text>
          <Text style={styles.detailValue}>+91 {profile.mobile}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Joining Date</Text>
          <Text style={styles.detailValue}>
            {formatDate(profile.joiningDate)}
          </Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gender</Text>
          <Text style={styles.detailValue}>{profile.gender}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Blood Group</Text>
          <Text style={styles.detailValue}>{profile.bloodGroup}</Text>
        </View>
      </Card>

      <View style={styles.footer}>
        <Button
          title="Back to Dashboard"
          variant="outline"
          onPress={() => {
            lightImpact();
            router.back();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  errorIcon: { fontSize: 48, marginBottom: spacing.md },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  retryButton: { width: "100%", marginBottom: spacing.md },

  identityCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.surface,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  photo: { width: "100%", height: "100%", borderRadius: radius.full },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: "#E6F4FE",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  nameText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  codeText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  rejectionCard: {
    borderColor: colors.error,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
  },
  rejectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  rejectionBody: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    lineHeight: typography.lineHeight.md,
  },

  detailsCard: { padding: spacing.lg, marginBottom: spacing.xl },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
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
  divider: { height: 1, backgroundColor: colors.border, opacity: 0.3 },
  footer: { paddingBottom: spacing.xl },
});
