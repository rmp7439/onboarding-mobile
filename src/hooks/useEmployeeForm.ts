import { useState, useCallback } from "react";
import { useOnboarding } from "../context/OnboardingContext";
import { EmployeeFormData } from "../types/EmployeeForm";

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
    maritalStatus: data.personal.maritalStatus,
    highestEducation: data.personal.highestEducation,
    aadhaarNumber: data.identity.aadhaar,
    panNumber: data.identity.pan,
    uanNumber: data.identity.uan,
    esicNumber: data.identity.esic,
    drivingLicence: data.identity.drivingLicence,
    permanentAddress: data.address.permanent,
    currentAddress: data.address.current,
    city: data.address.city,
    state: data.address.state,
    pinCode: data.address.pinCode,
    permanentPoliceStation: data.address.permanentPoliceStation,
    currentCity: data.address.currentCity,
    currentState: data.address.currentState,
    currentPinCode: data.address.currentPinCode,
    bankName: data.bank.bankName,
    accountNumber: data.bank.accountNumber,
    ifscCode: data.bank.ifsc,
    branch: data.bank.branch,
    micrCode: data.bank.micr,
    em1Name: data.emergencyContact.name,
    em1Relation: data.emergencyContact.relation,
    em1Mobile: data.emergencyContact.mobile,
  }));

  const [errors, setErrors] = useState<
    Partial<Record<keyof EmployeeFormData, string>>
  >({});

  const updateField = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => {
      if (prev[field] === value) return prev; // Performance: Bail out if the value hasn't changed

      const newData = { ...prev, [field]: value };

      // Enforce strict clearing of Husband's Name if Gender is not Female
      if (field === "gender" && value !== "Female") {
        newData.husbandName = "";
      }

      return newData;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // NEW: Reusable validation utility
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
      let isValid = true;

      const check = (
        field: keyof EmployeeFormData,
        condition: boolean,
        msg: string,
      ) => {
        if (!condition) {
          newErrors[field] = msg;
          isValid = false;
        }
      };

      if (step === 1) {
        check(
          "dateOfJoining",
          formData.dateOfJoining.length === 10,
          "Required",
        );
        check("unitSite", formData.unitSite.length > 0, "Required");
        check("firstName", formData.firstName.length > 0, "Required");
        check("surname", formData.surname.length > 0, "Required");
        check("fatherName", formData.fatherName.length > 0, "Required");
        check("gender", formData.gender.length > 0, "Required");
        check("dateOfBirth", formData.dateOfBirth.length === 10, "Required");
        check(
          "mobileNumber",
          formData.mobileNumber.length === 10,
          "Must be 10 digits",
        );
        check("bloodGroup", formData.bloodGroup.length > 0, "Required");
        check("maritalStatus", formData.maritalStatus.length > 0, "Required");
        check(
          "highestEducation",
          formData.highestEducation.length > 0,
          "Required",
        );
      } else if (step === 2) {
        check(
          "aadhaarNumber",
          formData.aadhaarNumber.trim().length > 0,
          "Required",
        );
      } else if (step === 3) {
        // Permanent Validation
        check(
          "permanentAddress",
          formData.permanentAddress.length > 0,
          "Required",
        );
        check("city", formData.city.length > 0, "Required");
        check("state", formData.state.length > 0, "Required");
        check("pinCode", formData.pinCode.length === 6, "Must be 6 digits");
        check(
          "permanentPoliceStation",
          formData.permanentPoliceStation.length > 0,
          "Required",
        ); 

        // Current Validation
        check("currentAddress", formData.currentAddress.length > 0, "Required");
        check("currentCity", formData.currentCity.length > 0, "Required"); 
        check("currentState", formData.currentState.length > 0, "Required"); 
        check(
          "currentPinCode",
          formData.currentPinCode.length === 6,
          "Must be 6 digits",
        ); 
    
        check("bankName", formData.bankName.length > 0, "Required");
        check(
          "accountNumber",
          formData.accountNumber.length === 16,
          "Must be 16 digits",
        );
        check(
          "ifscCode",
          formData.ifscCode.length === 11,
          "Must be 11 characters",
        );
        check("branch", formData.branch.length > 0, "Required");
        check("micrCode", formData.micrCode.length === 9, "Must be 9 digits");
      } else if (step === 4) {
        check("em1Name", formData.em1Name.length > 0, "Required");
        check("em1Relation", formData.em1Relation.length > 0, "Required");
        check(
          "em1Mobile",
          formData.em1Mobile.length === 10,
          "Must be 10 digits",
        );
      }

      setErrors(newErrors);
      return isValid;
    },
    [formData],
  );

  return {
    formData,
    updateField,
    errors,
    validateStep,
  };
}