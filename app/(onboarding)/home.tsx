import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, SectionTitle } from "../../src/components";
import { spacing, typography } from "../../src/theme";
import { useTheme } from "../../src/context/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  
  const [isOperationsExpanded, setIsOperationsExpanded] = useState(true);
  const animation = useRef(new Animated.Value(1)).current;

  const toggleOperations = () => {
    const toValue = isOperationsExpanded ? 0 : 1;
    setIsOperationsExpanded(!isOperationsExpanded);
    Animated.timing(animation, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 256], // Height increased from 192 to 256 to fit the 4th item
  });

  const iconRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionTitle title="Dashboard" style={styles.header} />

        <Card style={[styles.accordionCard, { borderColor: colors.border }]}>
          <Pressable style={[styles.accordionHeader, { backgroundColor: colors.surface }]} onPress={toggleOperations}>
            <Text style={[styles.accordionTitle, { color: colors.text }]}>Operations</Text>
            <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
              <Text style={[styles.accordionIcon, { color: colors.textSecondary }]}>▼</Text>
            </Animated.View>
          </Pressable>

          <Animated.View style={[{ overflow: "hidden", backgroundColor: colors.background }, { height: contentHeight, opacity: animation }]}>
            <Pressable
              style={({ pressed }) => [styles.menuItem, { borderTopColor: colors.border }, pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}
              onPress={() => router.push("/(onboarding)/new-guard/employee-details")}
            >
              <Text style={styles.menuItemIcon}>📝</Text>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Register New Employee</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, { borderTopColor: colors.border }, pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}
              onPress={() => router.push("/(onboarding)/profile")}
            >
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={[styles.menuItemText, { color: colors.text }]}>View Current Employee Profile</Text>
            </Pressable>
            
            {/* NEW DARK MODE TOGGLE */}
            <Pressable
              style={({ pressed }) => [styles.menuItem, { borderTopColor: colors.border }, pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}
              onPress={toggleTheme}
            >
              <Text style={styles.menuItemIcon}>{isDark ? '☀️' : '🌙'}</Text>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, { borderTopColor: colors.border }, pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, { color: colors.error }]}>Logout</Text>
            </Pressable>
          </Animated.View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingTop: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.lg },
  accordionCard: { padding: 0, overflow: "hidden", borderWidth: 1 },
  accordionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg },
  accordionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  accordionIcon: { fontSize: typography.fontSize.sm },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderTopWidth: 1, height: 64 },
  menuItemIcon: { fontSize: typography.fontSize.lg, marginRight: spacing.md },
  menuItemText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
});