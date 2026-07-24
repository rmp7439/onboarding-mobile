import React, { useRef } from 'react';
import { View, TextInput } from 'react-native';
import { Input } from '../../index'; 
import { FormSection } from '../FormSection';
import { EmployeeFormData } from '../../../types/EmployeeForm';

interface StepProps {
  formData: EmployeeFormData;
  updateField: (field: keyof EmployeeFormData, value: string) => void;
  onNextStep?: () => void;
  errors: Partial<Record<keyof EmployeeFormData, string>>;
}

export function IdentityStep({ formData, updateField, onNextStep, errors }: StepProps) {
  const panRef = useRef<TextInput>(null);
  const uanRef = useRef<TextInput>(null);
  const esicRef = useRef<TextInput>(null);

  return (
    <View>
      <FormSection title="Identity Details">
        <Input
          label="Aadhaar Number"
          value={formData.aadhaarNumber}
          error={errors.aadhaarNumber}
          onChangeText={(text) => updateField('aadhaarNumber', text)}
          returnKeyType="next"
          onSubmitEditing={() => panRef.current?.focus()}
          submitBehavior="submit"
        />
        
        <Input
          ref={panRef}
          label="PAN Number"
          value={formData.panNumber}
          error={errors.panNumber}
          onChangeText={(text) => updateField('panNumber', text.toUpperCase())}
          autoCapitalize="characters"
          returnKeyType="next"
          onSubmitEditing={() => uanRef.current?.focus()}
          submitBehavior="submit"
        />
        
        <Input
          ref={uanRef}
          label="UAN Number"
          value={formData.uanNumber}
          error={errors.uanNumber}
          onChangeText={(text) => updateField('uanNumber', text)}
          keyboardType="number-pad"
          returnKeyType="next"
          onSubmitEditing={() => esicRef.current?.focus()}
          submitBehavior="submit"
        />
        
        <Input 
          ref={esicRef}
          label="ESIC Number" 
          value={formData.esicNumber}
          error={errors.esicNumber} 
          onChangeText={(text) => updateField('esicNumber', text)} 
          keyboardType="default"
          returnKeyType="done"
          onSubmitEditing={onNextStep}
        />
      </FormSection>
    </View>
  );
}