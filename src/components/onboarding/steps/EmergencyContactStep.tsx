import React, { memo } from 'react';
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

export const EmergencyContactStep = memo(function EmergencyContactStep({ formData, updateField }: StepProps) {
  return (
    <View>
      <FormSection title="Emergency Contact">
        <Input 
          label="Name" 
          value={formData.em1Name} 
          onChangeText={(text) => { 
            // Rejects numbers, symbols, and special characters instantly
            updateField('em1Name', text); 
          }} 
        />
        <Input 
          label="Relation" 
          value={formData.em1Relation} 
          onChangeText={(text) => { 
            // Ensures only alphabetic characters and spaces are allowed
            updateField('em1Relation', text); 
          }} 
        />
        <Input 
          label="Mobile Number" 
          value={formData.em1Mobile} 
          onChangeText={(text) => updateField('em1Mobile', formatMobile(text))} 
          keyboardType="number-pad" 
          maxLength={10} 
        />
      </FormSection>
    </View>
  );
});