import React, { memo } from "react";
import { View } from "react-native";
import { Input, DateInput } from "../../index";
import { FormSection } from "../FormSection";
import { GenderSelector } from "../GenderSelector";
import { BloodGroupSelector } from "../BloodGroupSelector";
import { MIN_JOINING_YEAR, MIN_BIRTH_YEAR } from "../../../constants/App";
import { EmployeeFormData } from "../../../types/EmployeeForm";
import { isValidNameInput } from "../../../utils/inputFilters";
import { formatMobile } from "../../../utils/formatters";

interface StepProps {
  formData: EmployeeFormData;
  updateField: (field: keyof EmployeeFormData, value: string) => void;
  currentYear: number;
}

export const EmploymentPersonalStep = memo(function EmploymentPersonalStep({
  formData,
  updateField,
  currentYear,
}: StepProps) {
  return (
    <View>
      <FormSection title="Employment Details">
        <DateInput
          label="Date of Joining"
          value={formData.dateOfJoining}
          onChange={(val) => updateField("dateOfJoining", val)}
          minYear={MIN_JOINING_YEAR}
          maxYear={currentYear}
        />
        <Input
          label="Unit / Site"
          value={formData.unitSite}
          onChangeText={(text) => updateField("unitSite", text)}
          placeholder="Enter unit or site"
        />
      </FormSection>

      <FormSection title="Personal Details">
        <Input
          label="First Name"
          value={formData.firstName}
          onChangeText={(text) => {
            if (isValidNameInput(text)) updateField("firstName", text);
          }}
        />
        <Input
          label="Surname"
          value={formData.surname}
          onChangeText={(text) => {
            if (isValidNameInput(text)) updateField("surname", text);
          }}
        />
        <Input
          label="Father's Name"
          value={formData.fatherName}
          onChangeText={(text) => {
            if (isValidNameInput(text)) updateField("fatherName", text);
          }}
        />

        <GenderSelector
          value={formData.gender}
          onChange={(val) => updateField("gender", val)}
        />

        <Input
          label="Husband's Name (Optional)"
          value={formData.husbandName}
          onChangeText={(text) => {
            if (isValidNameInput(text)) updateField("husbandName", text);
          }}
          editable={formData.gender === "Female"}
        />

        <DateInput
          label="Date of Birth"
          value={formData.dateOfBirth}
          onChange={(val) => updateField("dateOfBirth", val)}
          minYear={MIN_BIRTH_YEAR}
          maxYear={currentYear}
        />

        <Input
          label="Mobile Number"
          value={formData.mobileNumber}
          onChangeText={(text) =>
            updateField("mobileNumber", formatMobile(text))
          }
          keyboardType="number-pad"
          maxLength={10}
        />
        <BloodGroupSelector
          value={formData.bloodGroup}
          onChange={(val) => updateField("bloodGroup", val)}
        />
      </FormSection>
    </View>
  );
});