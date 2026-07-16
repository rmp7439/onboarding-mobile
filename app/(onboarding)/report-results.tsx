import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Screen, Card, SectionTitle, Button } from "../../src/components";
import { colors, spacing, typography, radius } from "../../src/theme";
import { api } from "../../src/api/apiClient";

export default function ReportResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getReportResults(params);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch report results.");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.rowCard}>
      <View style={styles.rowHeader}>
        <Text style={styles.nameText}>{item.firstName} {item.surname}</Text>
      </View>
      <View style={styles.rowDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Code</Text>
          <Text style={styles.codeText}>{item.employeeCode || "Pending"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Joining Date</Text>
          <Text style={styles.dateText}>{formatDate(item.joiningDate)}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <Screen style={styles.container} scrollable={false}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.headerContainer}>
        <Button 
          title="Back" 
          variant="outline" 
          onPress={() => router.back()} 
          style={styles.backButton} 
        />
        <SectionTitle title="Report Results" style={styles.title} />
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            <Text style={styles.loadingText}>Fetching employees...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={fetchResults} style={styles.retryButton} />
          </View>
        ) : results.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No employees found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your report filters.</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md
  },
  backButton: { height: 40, paddingHorizontal: spacing.md },
  title: { marginBottom: 0 },
  content: { flex: 1, marginTop: spacing.md },
  
  // States
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loader: { transform: [{ scale: 1.2 }], marginBottom: spacing.md },
  loadingText: { fontSize: typography.fontSize.md, color: colors.textSecondary },
  
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  
  errorIcon: { fontSize: 48, marginBottom: spacing.md },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  retryButton: { width: "100%", maxWidth: 200 },

  // List Styles
  listContent: { paddingBottom: spacing.xl, gap: spacing.md },
  rowCard: { padding: spacing.md },
  rowHeader: { marginBottom: spacing.sm },
  nameText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text
  },
  rowDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  detailItem: { flex: 1 },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2
  },
  codeText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
});