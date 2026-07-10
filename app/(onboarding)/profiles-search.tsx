import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Input, Card, SectionTitle } from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/theme';
import { api } from '../../src/api/apiClient';

export default function ProfilesSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.searchEmployees(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED': return colors.success;
      case 'REJECTED': return colors.error;
      case 'PENDING':
      default: return colors.warning;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      onPress={() => router.push({ pathname: '/(onboarding)/profile', params: { id: item.id } })}
    >
      <Card style={styles.resultCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.nameText}>{item.firstName} {item.surname}</Text>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        </View>
        <Text style={styles.codeText}>{item.employeeCode || "Pending Assignment"}</Text>
        <Text style={styles.mobileText}>+91 {item.mobile}</Text>
      </Card>
    </Pressable>
  );

  return (
    <Screen style={styles.container} scrollable={false}>
      <Input
        label="Search"
        placeholder="Name, Code, Mobile, or Aadhaar"
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              query.trim().length > 0 ? (
                <Text style={styles.emptyText}>No employees found matching "{query}"</Text>
              ) : (
                <Text style={styles.emptyText}>Start typing to search for employees.</Text>
              )
            }
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: spacing.md },
  listContainer: { flex: 1, marginTop: spacing.md },
  loader: { marginTop: spacing.xl },
  flatListContent: { paddingBottom: spacing.xl, gap: spacing.md },
  resultCard: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  nameText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  codeText: { fontSize: typography.fontSize.md, color: colors.primary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs },
  mobileText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, fontSize: typography.fontSize.md },
});