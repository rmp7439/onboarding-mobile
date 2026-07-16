import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen, Card, SectionTitle, Button } from "../../src/components";
import { colors, spacing, typography, radius } from "../../src/theme";
import { api } from "../../src/api/apiClient";

export default function ReportEmployeeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getReportEmployeeDetail(id);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load report profile.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (isLoading && !profile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Back to Results" onPress={() => router.back()} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.headerRow}>
        <Button title="Back" variant="outline" onPress={() => router.back()} style={styles.backButton} />
        <SectionTitle title="Employee Report Details" style={styles.header} />
      </View>

      <Card style={styles.identityCard}>
        <View style={styles.photoContainer}>
          {profile.selfieUrl ? (
            <Image source={{ uri: profile.selfieUrl }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                {profile.firstName?.charAt(0)}{profile.surname?.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.nameText}>{profile.firstName} {profile.surname}</Text>
        <Text style={styles.codeText}>{profile.employeeCode || "Pending Assignment"}</Text>
      </Card>

      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Father / Husband Name</Text>
          <Text style={styles.detailValue}>{profile.husbandName || profile.fatherName || "N/A"}</Text>
        </View>
        <View style={styles.divider} />
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mobile Number</Text>
          <Text style={styles.detailValue}>+91 {profile.mobile}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Joining Date</Text>
          <Text style={styles.detailValue}>{formatDate(profile.joiningDate)}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Registration Date</Text>
          <Text style={styles.detailValue}>{formatDate(profile.uploadedAt)}</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md
  },
  backButton: { height: 40, paddingHorizontal: spacing.md },
  header: { marginBottom: 0 },
  
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
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
});