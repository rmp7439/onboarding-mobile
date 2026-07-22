import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Screen, Card, SectionTitle } from "../../src/components";
import { colors, spacing, typography, radius } from "../../src/theme";
import { api } from "../../src/api/apiClient";
import { lightImpact } from "../../src/utils/haptics";

export default function MyApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [fetchApplications])
  );

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED": return { bg: "#DCFCE7", text: colors.success };
      case "REJECTED": return { bg: "#FEE2E2", text: colors.error };
      case "RETURNED_FOR_CORRECTION": return { bg: "#FEF3C7", text: colors.warning };
      default: return { bg: "#E6F4FE", text: colors.primary };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    const date = new Date(item.uploadedAt).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

    return (
      <Pressable 
        onPress={() => {
          lightImpact();
          router.push({ pathname: "/(onboarding)/profile", params: { id: item.id } });
        }}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.nameText}>{item.firstName} {item.surname}</Text>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {item.status.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.detailText}>Code: {item.employeeCode || "Pending Assignment"}</Text>
          <Text style={styles.detailText}>Mobile: +91 {item.mobile}</Text>
          <Text style={styles.dateText}>Created: {date}</Text>
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen style={styles.container} scrollable={false}>
      <SectionTitle title="My Applications" subtitle="Employees in your assigned units" style={styles.header} />
      
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
            <Text style={styles.emptyText}>No applications found in your unit.</Text>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: spacing.md },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: spacing.xl, gap: spacing.md },
  card: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  nameText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text, flex: 1 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm, marginLeft: spacing.sm },
  badgeText: { fontSize: 10, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase' },
  detailText: { fontSize: typography.fontSize.md, color: colors.textSecondary, marginBottom: 2 },
  dateText: { fontSize: typography.fontSize.sm, color: colors.border, marginTop: spacing.xs },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl },
});