import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, SectionTitle, Button } from "../../src/components";
import { colors, spacing, typography } from "../../src/theme";
import { api } from "../../src/api/apiClient";
import { lightImpact } from "../../src/utils/haptics";
import { Session } from "../../src/utils/Session";

interface Unit {
  id: string;
  name: string;
}

interface ProfileData {
  id: string;
  userId: string; // <-- Added to capture the new login credential
  name: string;
  mobile: string;
  role: string;
  units: Unit[];
}

export default function MyProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMyProfile();
      
      if (!data) {
        setError("Profile unavailable.");
        return;
      }
      
      setProfile(data);
    } catch (err: any) {
      const msg = err.message || "";
      
      if (msg === "401_UNAUTHORIZED" || msg.includes("Invalid or expired token") || msg.includes("Authentication required")) {
        await Session.clearEmployeeSession();
        router.replace("/login");
      } 
      else if (msg === "404_NOT_FOUND" || msg.toLowerCase().includes("not found")) {
        setError("Profile unavailable.");
      } 
      else {
        setError(msg || "Failed to load profile.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    lightImpact();
    await Session.clearEmployeeSession();
    router.replace("/login");
  };

  if (isLoading) {
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
        
        {error !== "Profile unavailable." && (
          <Button
            title="Retry"
            onPress={fetchProfile}
            style={styles.retryButton}
          />
        )}
        
        <Button
          title="Back to Dashboard"
          variant="outline"
          onPress={() => router.back()}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionTitle title="My Profile" style={styles.header} />

        <Card style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>User ID</Text>
            <Text style={styles.detailValue}>{profile.userId}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{profile.name}</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mobile Number</Text>
            <Text style={styles.detailValue}>+91 {profile.mobile}</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>
              {profile.role === 'USER' ? 'Supervisor' : profile.role}
            </Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.unitsSection}>
            <Text style={styles.detailLabel}>Assigned Units</Text>
            {profile.units && profile.units.length > 0 ? (
              <View style={styles.unitList}>
                {profile.units.map(unit => (
                  <Text key={unit.id} style={styles.unitItem}>• {unit.name}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyUnitText}>No Units Assigned</Text>
            )}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xl },
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
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
  card: { padding: spacing.lg, marginBottom: spacing.xl },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
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
  divider: { height: 1, backgroundColor: colors.border, opacity: 0.3, marginVertical: spacing.xs },
  unitsSection: {
    paddingVertical: spacing.sm,
  },
  unitList: {
    marginTop: spacing.sm,
    paddingLeft: spacing.xs,
  },
  unitItem: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  emptyUnitText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  logoutButton: {
    borderColor: colors.error,
  }
});