import { useState, useCallback } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { EmployeeFormData } from '../types/EmployeeForm';

export function useEmployeeForm() {
  const { data } = useOnboarding();

  const [formData, setFormData] = useState<EmployeeFormData>(() => ({
    dateOfJoining: data.employment.joiningDate,
    unitSite: data.employment.unit,
    firstName: data.personal.firstName,
    surname: data.personal.surname,
    fatherName: data.personal.fatherName,
    husbandName: data.personal.husbandName,
    gender: data.personal.gender,
    dateOfBirth: data.personal.dob,
    mobileNumber: data.personal.mobile,
    bloodGroup: data.personal.bloodGroup,
    aadhaarNumber: data.identity.aadhaar,
    panNumber: data.identity.pan,
    uanNumber: data.identity.uan,
    esicNumber: data.identity.esic,
    permanentAddress: data.address.permanent,
    currentAddress: data.address.current,
    city: data.address.city,
    state: data.address.state,
    pinCode: data.address.pinCode,
    bankName: data.bank.bankName,
    accountNumber: data.bank.accountNumber,
    ifscCode: data.bank.ifsc,
    branch: data.bank.branch,
    micrCode: data.bank.micr,
    em1Name: data.emergencyContact.name,
    em1Relation: data.emergencyContact.relation,
    em1Mobile: data.emergencyContact.mobile,
  }));

  const updateField = useCallback((field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => {
      if (prev[field] === value) return prev; // Performance: Bail out if the value hasn't changed

      const newData = { ...prev, [field]: value };
      
      // Enforce strict clearing of Husband's Name if Gender is not Female
      if (field === 'gender' && value !== 'Female') {
        newData.husbandName = '';
      }
      
      return newData;
    });
  }, []);

  const updateNestedField = useCallback((field: keyof EmployeeFormData, nestedKey: string, value: string) => {
    // Scaffolded for deeper scaling later if needed
  }, []);

  const resetForm = useCallback(() => {
    // Reset to context data logic (omitted for brevity, can rebuild from initial state)
  }, []);

  return {
    formData,
    updateField,
    updateNestedField,
    resetForm,
  };
}