import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Button } from '../../../src/components';
import { colors, spacing, typography, radius } from '../../../src/theme';
import { useOnboarding } from '../../../src/context/OnboardingContext';
import { VALIDATION } from '../../../src/constants/Validation';
import { OCR_MOCK_CONFIDENCE } from '../../../src/constants/OCR';
import { validateAadhaar, validatePinCode } from '../../../src/utils/validation';

const TRACKED_FIELDS = [
  'fullName', 
  'dateOfBirth', 
  'gender', 
  'aadhaarNumber', 
  'address', 
  'city', 
  'state', 
  'pinCode'
] as const;

export default function ReviewDetailsScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  
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

  const { editedCount, verifiedCount } = useMemo(() => {
    let edited = 0;
    TRACKED_FIELDS.forEach(key => {
      if (data[key] !== initialData[key]) {
        edited++;
      }
    });
    return {
      editedCount: edited,
      verifiedCount: TRACKED_FIELDS.length - edited
    };
  }, [data, initialData]);

  const isFormValid = 
    data.fullName && 
    data.dateOfBirth && 
    data.gender && 
    data.address && 
    data.city && 
    data.state && 
    validateAadhaar(data.aadhaarNumber || '') && 
    validatePinCode(data.pinCode || '');

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
          {isEdited && (
            <View style={styles.badgeEdited}>
              <Text style={styles.badgeTextEdited}>Edited</Text>
            </View>
          )}
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
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Compact Enterprise Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Review Extracted Details</Text>
            <Text style={styles.headerSubtitle}>
              Please verify the extracted information before continuing.
            </Text>
          </View>

          {/* Consolidated OCR Confidence & Metrics Card */}
          <Card style={styles.confidenceCard}>
            <View style={styles.confidenceHeader}>
              <View>
                <Text style={styles.confidenceTitle}>OCR Confidence</Text>
                <Text style={styles.confidenceSubtitle}>
                  {verifiedCount} verified • {editedCount > 0 ? <Text style={styles.editedText}>{editedCount} edited</Text> : '0 edited'}
                </Text>
              </View>
              <Text style={styles.confidenceValue}>{OCR_MOCK_CONFIDENCE}%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${OCR_MOCK_CONFIDENCE}%` }]} />
            </View>
          </Card>

          {/* Form Cards */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Personal Details</Text>
            </View>

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
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Document Details</Text>
            </View>

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

            {renderField('PIN Code', 'pinCode', false, 'numeric', VALIDATION.PIN_CODE_MAX_LENGTH)}
          </Card>
        </ScrollView>

        {/* Fixed Footer */}
        <View style={styles.footer}>
          <Button
            title="Confirm & Continue"
            onPress={handleContinue}
            disabled={!isFormValid}
            style={styles.fullButton}
          />
          <Button
            title="Re-upload Document"
            variant="outline"
            onPress={handleReupload}
            style={[styles.fullButton, styles.secondaryButton]}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  keyboardAvoid: { 
    flex: 1,
  },
  scrollView: { 
    flex: 1,
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingTop: spacing.md, 
    paddingBottom: spacing.xl,
  },

  // Compact Header
  headerContainer: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Confidence Card
  confidenceCard: { 
    padding: spacing.lg, 
    marginBottom: spacing.lg, 
    backgroundColor: colors.surface, 
    borderWidth: 1, 
    borderColor: '#E8F8EE', 
    shadowColor: colors.success, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 2,
  },
  confidenceHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.md,
  },
  confidenceTitle: { 
    fontSize: typography.fontSize.md, 
    fontWeight: typography.fontWeight.bold, 
    color: colors.text,
  },
  confidenceSubtitle: { 
    fontSize: typography.fontSize.sm, 
    color: colors.textSecondary, 
    marginTop: 2,
  },
  editedText: {
    color: colors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  confidenceValue: { 
    fontSize: typography.fontSize['2xl'], 
    fontWeight: typography.fontWeight.bold, 
    color: colors.success,
  },
  progressBarBackground: { 
    height: 6, 
    backgroundColor: '#E8F8EE', 
    borderRadius: radius.full, 
    overflow: 'hidden',
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: colors.success, 
    borderRadius: radius.full,
  },

  // Form Cards
  card: { 
    padding: spacing.lg, 
    marginBottom: spacing.lg, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.05)', 
    shadowColor: colors.text, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 1,
  },
  cardHeader: { 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    paddingBottom: spacing.sm, 
    marginBottom: spacing.lg,
  },
  cardTitle: { 
    fontSize: typography.fontSize.md, 
    fontWeight: typography.fontWeight.bold, 
    color: colors.primary,
  },

  // Inputs & Badges
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
  badgeEdited: { 
    backgroundColor: '#FFFBEB', 
    borderWidth: 1, 
    borderColor: '#FEF3C7',
    paddingHorizontal: spacing.sm, 
    paddingVertical: 2, 
    borderRadius: radius.sm,
  },
  badgeTextEdited: { 
    fontSize: 10, 
    fontWeight: typography.fontWeight.bold, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
    color: '#B45309',
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: radius.md, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.md, 
    fontSize: typography.fontSize.md, 
    color: colors.text, 
    backgroundColor: colors.surface, 
    minHeight: 48,
  },
  inputEdited: { 
    borderColor: colors.warning, 
    backgroundColor: '#FFFAED', 
    borderWidth: 1.5,
  },
  multilineInput: { 
    minHeight: 88, 
    textAlignVertical: 'top', 
    paddingTop: spacing.md,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: spacing.md,
  },
  halfWidth: { 
    flex: 1,
  },

  // Footer
  footer: { 
    paddingTop: spacing.md, 
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg, 
    backgroundColor: colors.background, 
    borderTopWidth: 1, 
    borderTopColor: colors.border,
  },
  fullButton: { 
    width: '100%',
  },
  secondaryButton: { 
    marginTop: spacing.md,
  }
});