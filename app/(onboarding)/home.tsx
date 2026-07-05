import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Animated 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, SectionTitle } from '../../src/components';
import { colors, spacing, typography } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [isOperationsExpanded, setIsOperationsExpanded] = useState(true);
  const animation = useRef(new Animated.Value(1)).current;

  const toggleOperations = () => {
    const toValue = isOperationsExpanded ? 0 : 1;
    setIsOperationsExpanded(!isOperationsExpanded);
    Animated.timing(animation, {
      toValue,
      duration: 250,
      useNativeDriver: false, // Height animation cannot use native driver
    }).start();
  };

  // Two menu items, each 64px high -> 128px total height
  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 128], 
  });

  const iconRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleRegisterNewEmployee = () => {
    router.push('/(onboarding)/new-guard/aadhaar-upload');
  };

  const handleLogout = () => {
    // Navigate back to the login screen for the demo
    router.replace('/login');
  };

  return (
    <Screen style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SectionTitle 
          title="Dashboard" 
          subtitle="Overview and Operations"
          style={styles.header}
        />

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Total Employees</Text>
          </Card>
          <Card style={[styles.statCard, styles.statCardSecondary]}>
            <Text style={[styles.statValue, styles.statValueSecondary]}>3</Text>
            <Text style={styles.statLabelSecondary}>Pending Verification</Text>
          </Card>
        </View>

        {/* Operations Accordion */}
        <Card style={styles.accordionCard}>
          <Pressable 
            style={styles.accordionHeader} 
            onPress={toggleOperations}
          >
            <Text style={styles.accordionTitle}>Operations</Text>
            <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
              <Text style={styles.accordionIcon}>▼</Text>
            </Animated.View>
          </Pressable>

          <Animated.View style={[styles.accordionContent, { height: contentHeight, opacity: animation }]}>
            <Pressable 
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed
              ]}
              onPress={handleRegisterNewEmployee}
            >
              <Text style={styles.menuItemIcon}>📝</Text>
              <Text style={styles.menuItemText}>Register New Employee</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </Pressable>
          </Animated.View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl, // Reduced whitespace
  },
  header: {
    marginBottom: spacing.lg, // Reduced whitespace
  },
  
  // Statistics Styles
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg, // Reduced whitespace
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statCardSecondary: {
    borderColor: '#E8F8EE',
    backgroundColor: '#F0FDF4',
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statValueSecondary: {
    color: colors.success,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  statLabelSecondary: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  // Accordion Styles
  accordionCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  accordionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  accordionIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  accordionContent: {
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64, // Fixed height to match Animated interpolation
  },
  menuItemPressed: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  menuItemIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.md,
  },
  menuItemText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  logoutText: {
    color: colors.error, // Styled as a destructive action
  },
});