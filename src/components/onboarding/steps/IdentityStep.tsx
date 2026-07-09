import React from 'react';
import { View } from 'react-native';
import { Input, SegmentedInput } from '../../index';
import { FormSection } from '../FormSection';
import { EmployeeFormData } from '../../../types/EmployeeForm';
import { allowOnlyNumbers } from '../../../utils/inputFilters';

interface StepProps {
  formData: EmployeeFormData;
  updateField: (field: keyof EmployeeFormData, value: string) => void;
}

export function IdentityStep({ formData, updateField }: StepProps) {
  return (
    <View>
      <FormSection title="Identity Details">
        <Input
          label="Aadhaar Number"
          value={formData.aadhaarNumber}
          onChangeText={(text) => updateField('aadhaarNumber', text)}
          maxLength={15}
        />
        
        <SegmentedInput
          label="PAN Number"
          value={formData.panNumber}
          onChange={(val) => updateField('panNumber', val)}
          segments={[
            { length: 5, type: 'alpha' },
            { length: 4, type: 'numeric' },
            { length: 1, type: 'alpha' },
          ]}
        />
        
        <SegmentedInput
          label="UAN Number"
          value={formData.uanNumber}
          onChange={(val) => updateField('uanNumber', val)}
          segments={[
            { length: 4, type: 'numeric' },
            { length: 4, type: 'numeric' },
            { length: 4, type: 'numeric' },
          ]}
        />
        
        <Input 
          label="ESIC Number" 
          value={formData.esicNumber} 
          onChangeText={(text) => updateField('esicNumber', allowOnlyNumbers(text))} 
          keyboardType="numeric" 
          maxLength={17} 
        />
      </FormSection>
    </View>
  );
};