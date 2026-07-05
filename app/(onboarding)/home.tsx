import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, SectionTitle } from '../../src/components';
import { colors, spacing, typography, radius } from '../../src/theme';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const animationController = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    // Smooth layout expansion/collapse natively pushes content down
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const nextState = !isExpanded;
    setIsExpanded(nextState);

    // Rotate chevron and fade content
    Animated.timing(animationController, {
      toValue: nextState ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const chevronRotateInterpolate = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const contentOpacity = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  interface MenuItemProps {
    icon: string;
    label: string;
    onPress: () => void;
    isDestructive?: boolean;
  }

  const MenuItem = ({ icon, label, onPress, isDestructive }: MenuItemProps) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
    >
      <Text style={styles.menuItemIcon}>{icon}</Text>
      <Text style={[styles.menuItemLabel, isDestructive && styles.destructiveText]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Screen style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.greetingText}>Welcome Back</Text>
      </View>

      {/* Operations Accordion */}
      <Card style={styles.accordionCard}>
        <Pressable 
          style={styles.accordionHeader} 
          onPress={toggleAccordion}
          android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
        >
          <Text style={styles.accordionTitle}>Operations</Text>
          <Animated.View style={{ transform: [{ rotate: chevronRotateInterpolate }] }}>
            <Text style={styles.accordionChevron}>▼</Text>
          </Animated.View>
        </Pressable>

        {isExpanded && (
          <Animated.View style={[styles.accordionContent, { opacity: contentOpacity }]}>
            <View style={styles.divider} />
            <MenuItem 
              icon="📝" 
              label="Register New Employee" 
              onPress={() => router.push('/(onboarding)/new-guard/aadhaar-upload')} 
            />
            <MenuItem 
              icon="👥" 
              label="View Employees" 
              onPress={() => console.log('View Employees tapped')} 
            />
            <MenuItem 
              icon="⏳" 
              label="Pending Verification" 
              onPress={() => console.log('Pending Verification tapped')} 
            />
            <MenuItem 
              icon="👤" 
              label="Profile" 
              onPress={() => router.push('/(onboarding)/profile')} 
            />
            <MenuItem 
              icon="🚪" 
              label="Logout" 
              onPress={() => console.log('Logout tapped')} 
              isDestructive
            />
          </Animated.View>
        )}
      </Card>

      {/* Statistics */}
      <SectionTitle title="Overview" style={styles.sectionHeader} />
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>12</Text>
            <Text style={styles.statLabel}>Today's</Text>
            <Text style={styles.statLabel}>Registrations</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>3</Text>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statLabel}>Verification</Text>
          </Card>
        </View>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>8</Text>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statLabel}>Today</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.error }]}>1</Text>
            <Text style={styles.statLabel}>Rejected</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  greetingText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roleText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  
  // Accordion Styles
  accordionCard: {
    padding: 0, 
    marginBottom: spacing['2xl'], // 24dp spacing before Overview
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    minHeight: 56, // Accessible touch target
  },
  accordionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  accordionChevron: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
  },
  accordionContent: {
    backgroundColor: colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 56, // 56dp touch target for enterprise apps
  },
  menuItemPressed: {
    backgroundColor: colors.background,
  },
  menuItemIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  destructiveText: {
    color: colors.error,
  },

  // Overview Section
  sectionHeader: {
    marginBottom: spacing.md,
  },
  statsContainer: {
    flex: 1,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});