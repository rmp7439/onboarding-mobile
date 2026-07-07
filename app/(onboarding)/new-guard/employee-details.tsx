import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen, SectionTitle, Button } from "../../../src/components";
import { ProgressIndicator } from "../../../src/components/onboarding/ProgressIndicator";
import { EmploymentPersonalStep } from "../../../src/components/onboarding/steps/EmploymentPersonalStep";
import { IdentityStep } from "../../../src/components/onboarding/steps/IdentityStep";
import { AddressBankStep } from "../../../src/components/onboarding/steps/AddressBankStep";
import { EmergencyContactStep } from "../../../src/components/onboarding/steps/EmergencyContactStep";
import { useOnboarding } from "../../../src/context/OnboardingContext";
import { useEmployeeForm } from "../../../src/hooks/useEmployeeForm";
import { colors, spacing } from "../../../src/theme";
import { EmployeeFormData } from "../../../src/types/EmployeeForm";

const TOTAL_STEPS = 4;

const STEP_TITLES = [
  "Employment & Personal Details",
  "Identity Details",
  "Address & Bank Details",
  "Emergency Contacts",
];

export default function EmployeeDetailsScreen() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const { formData, updateField } = useEmployeeForm();

  // Layout measurements for the smooth horizontal slide
  const { width } = useWindowDimensions();
  // Screen component applies spacing.md (16px) padding to all sides, so we subtract 32px
  const stepWidth = width - spacing.md * 2;

  const [currentStep, setCurrentStep] = useState(1);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Memoized Validation
  const isStepValid = useCallback((step: number, data: EmployeeFormData) => {
    switch (step) {
      case 1:
        return (
          data.dateOfJoining.length === 10 &&
          data.unitSite.length > 0 &&
          data.firstName.length > 0 &&
          data.surname.length > 0 &&
          data.fatherName.length > 0 &&
          data.gender.length > 0 &&
          data.dateOfBirth.length === 10 &&
          data.mobileNumber.length === 10 &&
          data.bloodGroup.length > 0
        );
      case 2:
        return (
          data.aadhaarNumber.length === 12 &&
          data.panNumber.length === 10 &&
          data.uanNumber.length === 12 &&
          data.esicNumber.length === 17
        );
      case 3:
        return (
          data.permanentAddress.length > 0 &&
          data.currentAddress.length > 0 &&
          data.city.length > 0 &&
          data.state.length > 0 &&
          data.pinCode.length === 6 &&
          data.bankName.length > 0 &&
          data.accountNumber.length === 16 &&
          data.ifscCode.length === 11 &&
          data.branch.length > 0 &&
          data.micrCode.length === 9
        );
      case 4:
        return (
          data.em1Name.length > 0 &&
          data.em1Relation.length > 0 &&
          data.em1Mobile.length === 10
        );
      default:
        return false;
    }
  }, []);

  const isCurrentStepValid = useMemo(
    () => isStepValid(currentStep, formData),
    [currentStep, formData, isStepValid],
  );

  const handleNextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      const next = currentStep + 1;
      setCurrentStep(next);
      // Hardware-accelerated sliding animation
      Animated.timing(slideAnim, {
        toValue: -(next - 1) * stepWidth,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      handleFinalSubmit();
    }
  }, [currentStep, stepWidth, slideAnim]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      Animated.timing(slideAnim, {
        toValue: -(prev - 1) * stepWidth,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, stepWidth, slideAnim]);

  const handleFinalSubmit = () => {
    updateData({
      employment: {
        joiningDate: formData.dateOfJoining,
        unit: formData.unitSite,
      },
      personal: {
        firstName: formData.firstName,
        surname: formData.surname,
        fatherName: formData.fatherName,
        husbandName: formData.husbandName,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        mobile: formData.mobileNumber,
        bloodGroup: formData.bloodGroup,
      },
      identity: {
        aadhaar: formData.aadhaarNumber,
        pan: formData.panNumber,
        uan: formData.uanNumber,
        esic: formData.esicNumber,
      },
      address: {
        permanent: formData.permanentAddress,
        current: formData.currentAddress,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
      },
      bank: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifscCode,
        branch: formData.branch,
        micr: formData.micrCode,
      },
      emergencyContact: {
        name: formData.em1Name,
        relation: formData.em1Relation,
        mobile: formData.em1Mobile,
      },
    });
    router.push("/(onboarding)/new-guard/capture-photo");
  };

  return (
    <Screen scrollable={false} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle
          title="Employee Registration"
          subtitle={`Step ${currentStep} of ${TOTAL_STEPS}`}
          style={styles.mainHeader}
        />

        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* 
          Performance Optimization: 
          All steps are pre-mounted side-by-side in a horizontal row.
          This eliminates JS thread blocking, mounting delays, and blank screens. 
        */}
        <View style={styles.sliderWrapper}>
          <Animated.View
            style={[
              styles.stepsContainer,
              {
                width: stepWidth * TOTAL_STEPS,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={{ width: stepWidth }}>
              <EmploymentPersonalStep
                formData={formData}
                updateField={updateField}
                currentYear={currentYear}
              />
            </View>
            <View style={{ width: stepWidth }}>
              <IdentityStep formData={formData} updateField={updateField} />
            </View>
            <View style={{ width: stepWidth }}>
              <AddressBankStep formData={formData} updateField={updateField} />
            </View>
            <View style={{ width: stepWidth }}>
              <EmergencyContactStep
                formData={formData}
                updateField={updateField}
              />
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <Button
            title="Back"
            variant="outline"
            onPress={handlePrevStep}
            style={[styles.actionBtn, styles.backBtn]}
          />
        )}
        <Button
          title="Continue"
          onPress={handleNextStep}
          disabled={!isCurrentStepValid}
          style={styles.actionBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  mainHeader: { marginBottom: spacing.xs },
  sliderWrapper: {
    flex: 1,
    overflow: "hidden", // Prevents off-screen steps from bleeding outside the wrapper bounds
  },
  stepsContainer: {
    flexDirection: "row",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: { flex: 1 },
  backBtn: { flex: 0.5 },
});