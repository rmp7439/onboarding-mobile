import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Button } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/theme';
import { useOnboarding } from '../../../src/context/OnboardingContext';

export default function ReviewDetailsScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  
  // Capture the initial data on mount to track which fields the user edits
  const [initialData] = useState(() => ({ ...data }));

  const handleChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const handleContinue = () => {
    router.push('/(onboarding)/new-guard/capture-photo');
  };

  const handleReupload = () => {
    router.back();
  };

  const renderField = (
    label: string, 
    fieldKey: keyof typeof data, 
    multiline = false, 
    keyboardType = 'default', 
    maxLength?: number
  ) => {
    const currentValue = data[fieldKey] as string;
    const initialValue = initialData[fieldKey] as string;
    const isEdited = currentValue !== initialValue;

    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.badge, isEdited ? styles.badgeEdited : styles.badgeVerified]}>
            <Text style={[styles.badgeText, isEdited ? styles.badgeTextEdited : styles.badgeTextVerified]}>
              {isEdited ? '✎ Edited' : '✓ Verified'}
            </Text>
          </View>
        </View>
        <TextInput
          style={[
            styles.input, 
            multiline && styles.multilineInput,
            isEdited && styles.inputEdited
          ]}
          value={currentValue}
          onChangeText={(text) => handleChange(fieldKey, text)}
          multiline={multiline}
          keyboardType={keyboardType as any}
          maxLength={maxLength}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    );
  };

  return (
    <Screen scrollable={false} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>OCR Completed Successfully</Text>
          <Text style={styles.successSubtitle}>Please verify the extracted details below.</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Personal Details</Text>
          <View style={styles.divider} />

          {renderField('Full Name', 'fullName')}
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderField('Date of Birth', 'dateOfBirth')}
            </View>
            <View style={styles.halfWidth}>
              {renderField('Gender', 'gender')}
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Document Details</Text>
          <View style={styles.divider} />

          {renderField('Document Number', 'aadhaarNumber')}
          {renderField('Complete Address', 'address', true)}

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderField('City', 'city')}
            </View>
            <View style={styles.halfWidth}>
              {renderField('State', 'state')}
            </View>
          </View>

          {renderField('PIN Code', 'pinCode', false, 'numeric', 6)}
        </Card>
      </ScrollView>

      {/* Sticky Footer keeps buttons above the keyboard natively */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.fullButton}
        />
        <Button
          title="Re-upload Document"
          variant="outline"
          onPress={handleReupload}
          style={[styles.fullButton, styles.secondaryButton]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  successHeader: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successIconText: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  successTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeVerified: {
    backgroundColor: '#E8F8EE', 
  },
  badgeEdited: {
    backgroundColor: '#FFF3E0', 
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  badgeTextVerified: {
    color: colors.success,
  },
  badgeTextEdited: {
    color: colors.warning,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  inputEdited: {
    borderColor: colors.warning,
    backgroundColor: '#FFFAED', // Very subtle warm background to indicate modification
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: spacing.md 
  },
  halfWidth: { 
    flex: 1 
  },
  footer: { 
    paddingTop: spacing.md, 
    paddingBottom: spacing.lg,
    backgroundColor: colors.background, // Ensures smooth visual cutoff during scroll
  },
  fullButton: { 
    width: '100%' 
  },
  secondaryButton: {
    marginTop: spacing.md,
  }
});