import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MediaData {
  selfieUri?: string | null;
  uploadedDocuments?: string[];
}

export interface OnboardingData extends MediaData {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  resetData: () => void;
}

const INITIAL_DATA: OnboardingData = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
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