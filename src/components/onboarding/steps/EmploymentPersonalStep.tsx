import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, ActivityIndicator, Text } from "react-native";
import { Input, DateInput, SearchableDropdown } from "../../index";
import { FormSection } from "../FormSection";
import { GenderSelector } from "../GenderSelector";
import { BloodGroupSelector } from "../BloodGroupSelector";
import { OptionSelector } from "../OptionSelector";
import { api } from "@/src/api/apiClient";
import { MIN_JOINING_YEAR, MIN_BIRTH_YEAR } from "../../../constants/App";
import { EmployeeFormData } from "../../../types/EmployeeForm";
import { isValidNameInput } from "../../../utils/inputFilters";
import { formatMobile } from "../../../utils/formatters";
import { colors, spacing, typography } from "../../../theme";
import { EDUCATION_OPTIONS } from '../../../constants/Education';
import { MARITAL_STATUS_OPTIONS } from '../../../constants/MaritalStatus';
import { useOnboarding } from "../../../context/OnboardingContext";

interface StepProps {
  formData: EmployeeFormData;
  updateField: (field: keyof EmployeeFormData, value: string) => void;
  currentYear: number;
  errors: Partial<Record<keyof EmployeeFormData, string>>;
}

export function EmploymentPersonalStep({
  formData,
  updateField,
  currentYear,
  errors,
}: StepProps) {
  const { data, updateData } = useOnboarding();
  const reqFields = data.unitConfig.requiredFields;
  const isReq = (f: string) => reqFields.includes(f);

  const firstNameRef = useRef<TextInput>(null);
  const surnameRef = useRef<TextInput>(null);
  const fatherNameRef = useRef<TextInput>(null);
  const husbandNameRef = useRef<TextInput>(null);
  const mobileNumberRef = useRef<TextInput>(null);

  const [units, setUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  useEffect(() => {
    Promise.all([api.getUnits(), api.getMyUnits()])
      .then(([allUnits, myUnits]) => {
        const assignedUnits = allUnits.filter((u: any) => myUnits.includes(u.name));
        setUnits(assignedUnits);
        
        if (formData.unitSite) {
          const matched = assignedUnits.find((u: any) => u.name === formData.unitSite);
          if (matched) {
            updateData({ unitConfig: { requiredFields: matched.requiredFields || [] } });
          }
        }
      })
      .catch((err) => {
         console.error(err);
         setUnits([{ name: "Demo Unit A", requiredFields: [] }, { name: "Demo Unit B", requiredFields: [] }]);
      })
      .finally(() => setLoadingUnits(false));
  }, []);

  const handleUnitSelect = (val: string) => {
    updateField("unitSite", val);
    const selected = units.find((u) => u.name === val);
    if (selected) {
      updateData({ unitConfig: { requiredFields: selected.requiredFields || [] } });
    }
  };

  return (
    <View>
      <FormSection title="Employment Details">
        <DateInput
          label="Date of Joining"
          value={formData.dateOfJoining}
          error={errors.dateOfJoining}
          onChange={(val) => updateField("dateOfJoining", val)}
          minYear={MIN_JOINING_YEAR}
          maxYear={currentYear}
          required
        />
        
        <View style={{ marginBottom: spacing.md }}>
          {loadingUnits ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
          ) : units.length > 0 ? (
            <OptionSelector
              label="Unit / Site"
              options={units.map((u) => u.name)}
              selectedValue={formData.unitSite}
              onSelect={handleUnitSelect}
              required
            />
          ) : (
            <Text style={{ color: colors.error, fontSize: typography.fontSize.sm }}>
              No units assigned. Contact Admin.
            </Text>
          )}
          {!!errors.unitSite && (
            <Text style={{ color: colors.error, fontSize: typography.fontSize.xs, marginTop: -spacing.sm }}>
              {errors.unitSite}
            </Text>
          )}
        </View>
      </FormSection>

      <FormSection title="Personal Details">
        <Input
          ref={firstNameRef}
          label="First Name"
          value={formData.firstName}
          error={errors.firstName}
          onChangeText={(text) => { if (isValidNameInput(text)) updateField("firstName", text); }}
          returnKeyType="next"
          onSubmitEditing={() => surnameRef.current?.focus()}
          submitBehavior="submit"
          required
        />
        <Input
          ref={surnameRef}
          label="Surname"
          value={formData.surname}
          error={errors.surname}
          onChangeText={(text) => { if (isValidNameInput(text)) updateField("surname", text); }}
          returnKeyType="next"
          onSubmitEditing={() => fatherNameRef.current?.focus()}
          submitBehavior="submit"
          required
        />
        <Input
          ref={fatherNameRef}
          label="Father's Name"
          value={formData.fatherName}
          error={errors.fatherName}
          onChangeText={(text) => { if (isValidNameInput(text)) updateField("fatherName", text); }}
          returnKeyType="done"
          required
        />

        <GenderSelector
          value={formData.gender}
          onChange={(val) => updateField("gender", val)}
          required={isReq('gender')}
        />
        {errors.gender && <Input label="" value="" error={errors.gender} editable={false} style={{display: 'none'}} />}

        <Input
          ref={husbandNameRef}
          label="Husband's Name"
          value={formData.husbandName}
          error={errors.husbandName}
          onChangeText={(text) => { if (isValidNameInput(text)) updateField("husbandName", text); }}
          editable={formData.gender === "Female"}
          returnKeyType="next"
          onSubmitEditing={() => mobileNumberRef.current?.focus()}
          submitBehavior="submit"
        />

        <DateInput
          label="Date of Birth"
          value={formData.dateOfBirth}
          error={errors.dateOfBirth}
          onChange={(val) => updateField("dateOfBirth", val)}
          minYear={MIN_BIRTH_YEAR}
          maxYear={currentYear}
          required
        />

        <Input
          ref={mobileNumberRef}
          label="Mobile Number"
          value={formData.mobileNumber}
          error={errors.mobileNumber}
          onChangeText={(text) => updateField("mobileNumber", formatMobile(text)) }
          keyboardType="number-pad"
          maxLength={10}
          returnKeyType="done"
          required
        />
        
        <BloodGroupSelector
          value={formData.bloodGroup}
          onChange={(val) => updateField("bloodGroup", val)}
          required
        />
        {errors.bloodGroup && <Input label="" value="" error={errors.bloodGroup} editable={false} style={{display: 'none'}} />}

        <SearchableDropdown
          label="Marital Status"
          value={formData.maritalStatus}
          error={errors.maritalStatus}
          options={MARITAL_STATUS_OPTIONS}
          onSelect={(val) => updateField("maritalStatus", val)}
          required={isReq('maritalStatus')}
        />

        <SearchableDropdown
          label="Highest Education"
          value={formData.highestEducation}
          error={errors.highestEducation}
          options={EDUCATION_OPTIONS}
          onSelect={(val) => updateField("highestEducation", val)}
          required={isReq('education')}
        />
      </FormSection>
    </View>
  );
}