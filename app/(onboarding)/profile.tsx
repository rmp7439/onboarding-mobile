import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { api } from "../../src/api/apiClient";
import { Button, Card, Screen, SectionTitle } from "../../src/components";
import { colors, radius, spacing, typography } from "../../src/theme";
import { RecentEmployeeStore } from "../../src/utils/RecentEmployeeStore";
import { lightImpact } from "../../src/utils/haptics";
import { useOnboarding } from "../../src/context/OnboardingContext";
import { formatDateForForm } from "../../src/utils/dataMappers";
import { startEditingApplication } from "../../src/utils/editHelper";

interface EmployeeProfile {
  id: string;
  firstName: string;
  surname: string;
  fatherName?: string;
  husbandName?: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth?: string;
  joiningDate: string;
  mobile: string;
  employeeCode: string | null;
  status: string;
  rejectReason: string | null;
  correctionRemark?: string | null;
  unit?: string | null;
  selfieUrl: string | null;
  selfieFilename?: string | null;
  aadhaar?: string;
  pan?: string;
  uan?: string;
  esic?: string;
  permanentAddress?: string;
  currentAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  micr?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  documents?: { id: string; type: string; originalFilename: string }[];
  uploadedAt?: string;
  updatedAt?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { id: paramId } = useLocalSearchParams<{ id?: string }>();
  const { updateData } = useOnboarding();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchProfile = useCallback(
    async (isBackground: boolean = false) => {
      try {
        if (!isBackground) {
          setIsLoading(true);
          setError(null);
          setIsEmpty(false);
        }

        const targetId = paramId || (await RecentEmployeeStore.getId());

        if (!targetId) {
          if (!isBackground) {
            setIsEmpty(true);
            setIsLoading(false);
          }
          return;
        }

        const data = await api.getEmployeeProfile(targetId);

        setProfile((prevProfile) => {
          if (!prevProfile) return data;
          const hasMeaningfulChange =
            prevProfile.status !== data.status ||
            prevProfile.employeeCode !== data.employeeCode ||
            prevProfile.rejectReason !== data.rejectReason ||
            prevProfile.correctionRemark !== data.correctionRemark ||
            prevProfile.updatedAt !== data.updatedAt;

          if (hasMeaningfulChange) {
            return {
              ...data,
              selfieUrl: prevProfile.selfieUrl,
            };
          }
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
    },
    [paramId],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const executeBackgroundPoll = async () => {
        if (!isActive) return;
        await fetchProfile(true);
        if (isActive) timeoutId = setTimeout(executeBackgroundPoll, 5000);
      };

      const startLifecycle = async () => {
        await fetchProfile(false);
        if (isActive) timeoutId = setTimeout(executeBackgroundPoll, 5000);
      };

      startLifecycle();

      return () => {
        isActive = false;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [fetchProfile]),
  );

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return { bg: "#DCFCE7", text: colors.success, label: "APPROVED" };
      case "REJECTED":
        return { bg: "#FEE2E2", text: colors.error, label: "REJECTED" };
      case "RETURNED_FOR_CORRECTION":
        return {
          bg: "#FEF3C7",
          text: colors.warning,
          label: "Returned for Correction",
        };
      case "PENDING":
      default:
        return { bg: "#FEF3C7", text: colors.warning, label: "PENDING" };
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditResubmit = () => {
    if (!profile) return;
    lightImpact();
    startEditingApplication(profile, updateData, router);
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
            onPress={() => router.back()}
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
          onPress={() => router.back()}
          style={styles.retryButton}
        />
      </View>
    );
  }

  const badgeStyle = getStatusBadgeStyle(profile.status);
  const isReturned = profile.status.toUpperCase() === "RETURNED_FOR_CORRECTION";
  const isRejected = profile.status.toUpperCase() === "REJECTED";

  // Requirement: Display Continue Editing button ONLY for RETURNED_FOR_CORRECTION or REJECTED
  const canEdit = isReturned || isRejected;

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
            {badgeStyle.label}
          </Text>
        </View>
      </Card>

      {isReturned && profile.correctionRemark ? (
        <Card style={[styles.detailsCard, styles.returnedCard]}>
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>
              Reason : {profile.correctionRemark}
            </Text>
          </View>
        </Card>
      ) : profile.status.toUpperCase() === "REJECTED" &&
        profile.rejectReason ? (
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
            {formatDateForForm(profile.joiningDate)}
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

      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created On</Text>
          <Text style={styles.detailValue}>
            {profile.uploadedAt ? formatDate(profile.uploadedAt) : "N/A"}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Updated</Text>
          <Text style={styles.detailValue}>
            {profile.updatedAt ? formatDate(profile.updatedAt) : "N/A"}
          </Text>
        </View>
      </Card>

      <View style={styles.footer}>
        {canEdit && (
          <Button
            title="Continue Editing"
            onPress={handleEditResubmit}
            style={styles.primaryButton}
          />
        )}
        <Button
          title="Back"
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
  returnedCard: {
    borderColor: colors.warning,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
  },
  returnedTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#D97706",
    marginBottom: spacing.xs,
  },
  returnedBody: {
    fontSize: typography.fontSize.md,
    color: "#B45309",
    marginBottom: spacing.md,
  },
  reasonContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
  },
  reasonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: "#D97706",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: typography.fontSize.md,
    color: "#92400E",
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
  primaryButton: { marginBottom: spacing.md },
});