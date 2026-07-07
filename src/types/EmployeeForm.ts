export interface EmployeeFormData {
  // Employment Details
  dateOfJoining: string;
  unitSite: string;
  // Personal Details
  firstName: string;
  surname: string;
  fatherName: string;
  husbandName: string;
  gender: string;
  dateOfBirth: string;
  mobileNumber: string;
  bloodGroup: string;
  // Identity Details
  aadhaarNumber: string;
  panNumber: string;
  uanNumber: string;
  esicNumber: string;
  // Address
  permanentAddress: string;
  currentAddress: string;
  city: string;
  state: string;
  pinCode: string;
  // Bank Details
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  micrCode: string;
  // Emergency Contact 
  em1Name: string;
  em1Relation: string;
  em1Mobile: string;
}