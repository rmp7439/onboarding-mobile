import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface EmergencyContact {
  name: string;
  relation: string;
  mobile: string;
}

export interface OnboardingData {
  employment: {
    joiningDate: string;
    unit: string;
  };
  personal: {
    firstName: string;
    surname: string;
    fatherName: string;
    husbandName: string;
    gender: string;
    dob: string;
    mobile: string;
    bloodGroup: string;
  };
  identity: {
    aadhaar: string;
    pan: string;
    uan: string;
    esic: string;
    pf: string;
  };
  address: {
    permanent: string;
    current: string;
    city: string;
    state: string;
    pinCode: string;
  };
  bank: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
    micr: string;
  };
  emergencyContacts: [EmergencyContact, EmergencyContact];
  
  selfieUri: string | null;
  uploadedDocuments: string[];
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  resetData: () => void;
}

const INITIAL_DATA: OnboardingData = {
  employment: { joiningDate: '', unit: '' },
  personal: { firstName: '', surname: '', fatherName: '', husbandName: '', gender: '', dob: '', mobile: '', bloodGroup: '' },
  identity: { aadhaar: '', pan: '', uan: '', esic: '', pf: '' },
  address: { permanent: '', current: '', city: '', state: '', pinCode: '' },
  bank: { bankName: '', accountNumber: '', ifsc: '', branch: '', micr: '' },
  emergencyContacts: [
    { name: '', relation: '', mobile: '' },
    { name: '', relation: '', mobile: '' }
  ],
  selfieUri: null,
  uploadedDocuments: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const resetData = () => {
    setData(INITIAL_DATA);
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}