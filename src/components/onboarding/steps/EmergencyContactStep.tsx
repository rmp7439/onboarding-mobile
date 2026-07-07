import React from 'react';
import { View } from 'react-native';
import { Input } from '../../index';
import { FormSection } from '../FormSection';
import { EmployeeFormData } from '../../../types/EmployeeForm';
import { isValidNameInput } from '../../../utils/inputFilters';
import { formatMobile } from '../../../utils/formatters';

interface StepProps {
  formData: EmployeeFormData;
  updateField: (field: keyof EmployeeFormData, value: string) => void;
}

export function EmergencyContactStep({ formData, updateField }: StepProps) {
  return (
    <View>
      <FormSection title="Emergency Contact 1">
        <Input label="Name" value={formData.em1Name} onChangeText={(text) => { if (isValidNameInput(text)) updateField('em1Name', text); }} />
        <Input label="Relation" value={formData.em1Relation} onChangeText={(text) => { if (isValidNameInput(text)) updateField('em1Relation', text); }} />
        <Input label="Mobile Number" value={formData.em1Mobile} onChangeText={(text) => updateField('em1Mobile', formatMobile(text))} keyboardType="number-pad" maxLength={10} />
      </FormSection>

      <FormSection title="Emergency Contact 2">
        <Input label="Name" value={formData.em2Name} onChangeText={(text) => { if (isValidNameInput(text)) updateField('em2Name', text); }} />
        <Input label="Relation" value={formData.em2Relation} onChangeText={(text) => { if (isValidNameInput(text)) updateField('em2Relation', text); }} />
        <Input label="Mobile Number" value={formData.em2Mobile} onChangeText={(text) => updateField('em2Mobile', formatMobile(text))} keyboardType="number-pad" maxLength={10} />
      </FormSection>
    </View>
  );
}