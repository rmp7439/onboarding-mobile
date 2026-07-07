import React from 'react';
import { View } from 'react-native';
import { Input } from '../../index';
import { FormSection } from '../FormSection';
import { EmployeeFormData } from '../../../types/EmployeeForm';
import { isValidNameInput, isValidAddressInput, allowOnlyNumbers } from '../../../utils/inputFilters';

interface StepProps {
  formData: EmployeeFormData;
  updateField: (field: keyof EmployeeFormData, value: string) => void;
}

export function AddressBankStep({ formData, updateField }: StepProps) {
  return (
    <View>
      <FormSection title="Address">
        <Input 
          label="Permanent Address" 
          value={formData.permanentAddress} 
          onChangeText={(text) => {
            if (isValidAddressInput(text)) updateField('permanentAddress', text);
          }} 
          multiline 
        />
        <Input 
          label="Current Address" 
          value={formData.currentAddress} 
          onChangeText={(text) => {
            if (isValidAddressInput(text)) updateField('currentAddress', text);
          }} 
          multiline 
        />
        <Input 
          label="City" 
          value={formData.city} 
          onChangeText={(text) => { 
            if (isValidNameInput(text)) updateField('city', text); 
          }} 
        />
        <Input 
          label="State" 
          value={formData.state} 
          onChangeText={(text) => { 
            if (isValidNameInput(text)) updateField('state', text); 
          }} 
        />
        <Input 
          label="PIN Code" 
          value={formData.pinCode} 
          onChangeText={(text) => updateField('pinCode', allowOnlyNumbers(text))} 
          keyboardType="numeric" 
          maxLength={6} 
        />
      </FormSection>

      <FormSection title="Bank Details">
        <Input 
          label="Bank Name" 
          value={formData.bankName} 
          onChangeText={(text) => { 
            if (isValidNameInput(text)) updateField('bankName', text); 
          }} 
        />
        <Input 
          label="Account Number" 
          value={formData.accountNumber} 
          onChangeText={(text) => updateField('accountNumber', allowOnlyNumbers(text))} 
          keyboardType="numeric" 
        />
        <Input 
          label="IFSC Code" 
          value={formData.ifscCode} 
          onChangeText={(text) => updateField('ifscCode', text)} 
          autoCapitalize="characters" 
          maxLength={11} 
        />
        <Input 
          label="Branch" 
          value={formData.branch} 
          onChangeText={(text) => {
            if (isValidAddressInput(text)) updateField('branch', text);
          }} 
        />
        <Input 
          label="MICR Code" 
          value={formData.micrCode} 
          onChangeText={(text) => updateField('micrCode', allowOnlyNumbers(text))} 
          keyboardType="numeric" 
          maxLength={9} 
        />
      </FormSection>
    </View>
  );
}