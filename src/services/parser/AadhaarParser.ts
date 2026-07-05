export interface AadhaarData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  aadhaarNumber: string;
  address: string;
}

export function parseAadhaar(text: string): AadhaarData {
  // TODO: Implement parsing logic (e.g., Regex patterns to extract fields from raw OCR text)
  return {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    aadhaarNumber: '',
    address: '',
  };
}