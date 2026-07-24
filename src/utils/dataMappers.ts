import { OnboardingData } from '../context/OnboardingContext';

export const mapBloodGroup = (bg: string): string => {
  const map: Record<string, string> = {
    "A+": "A_POSITIVE", "A-": "A_NEGATIVE", 
    "B+": "B_POSITIVE", "B-": "B_NEGATIVE",
    "AB+": "AB_POSITIVE", "AB-": "AB_NEGATIVE", 
    "O+": "O_POSITIVE", "O-": "O_NEGATIVE"
  };
  return map[bg] || "O_POSITIVE";
};

export const mapBloodGroupFromBackend = (bg: string): string => {
  const map: Record<string, string> = {
    "A_POSITIVE": "A+", "A_NEGATIVE": "A-", 
    "B_POSITIVE": "B+", "B_NEGATIVE": "B-",
    "AB_POSITIVE": "AB+", "AB_NEGATIVE": "AB-", 
    "O_POSITIVE": "O+", "O_NEGATIVE": "O-"
  };
  return map[bg] || bg;
};

export const mapEducationToBackend = (edu: string): string => {
  const map: Record<string, string> = {
    "Illiterate": "ILLITERATE", "Primary": "PRIMARY", "Secondary": "SECONDARY",
    "Higher Secondary": "HIGHER_SECONDARY", "ITI": "ITI", "Diploma": "DIPLOMA",
    "Graduate": "GRADUATE", "Post Graduate": "POST_GRADUATE", "Doctorate": "DOCTORATE",
    "Other": "OTHER"
  };
  return map[edu] || "OTHER";
};

export const mapEducationFromBackend = (edu: string): string => {
  const map: Record<string, string> = {
    "ILLITERATE": "Illiterate", "PRIMARY": "Primary", "SECONDARY": "Secondary",
    "HIGHER_SECONDARY": "Higher Secondary", "ITI": "ITI", "DIPLOMA": "Diploma",
    "GRADUATE": "Graduate", "POST_GRADUATE": "Post Graduate", "DOCTORATE": "Doctorate",
    "OTHER": "Other"
  };
  return map[edu] || "Other";
};

export const parseDateString = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
};

export const formatDateForForm = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const mapEmployeeData = (data: OnboardingData) => {
  return {
    unit: data.employment.unit, // FIX: Actually send the unit to the backend
    firstName: data.personal.firstName,
    surname: data.personal.surname,
    fatherName: data.personal.fatherName,
    husbandName: data.personal.husbandName || null,
    gender: data.personal.gender.toUpperCase(),
    bloodGroup: mapBloodGroup(data.personal.bloodGroup),
    education: mapEducationToBackend(data.personal.highestEducation),
    dateOfBirth: parseDateString(data.personal.dob),
    joiningDate: parseDateString(data.employment.joiningDate),
    mobile: data.personal.mobile,
    aadhaar: data.identity.aadhaar,
    pan: data.identity.pan || null,
    uan: data.identity.uan || null,
    esic: data.identity.esic || null,
    drivingLicence: data.identity.drivingLicence || null,
    permanentAddress: data.address.permanent,
    currentAddress: data.address.current,
    city: data.address.city,
    state: data.address.state,
    pinCode: data.address.pinCode,
    bankName: data.bank.bankName,
    accountNumber: data.bank.accountNumber,
    ifsc: data.bank.ifsc,
    branch: data.bank.branch,
    micr: data.bank.micr,
    emergencyName: data.emergencyContact.name,
    emergencyRelation: data.emergencyContact.relation,
    emergencyPhone: data.emergencyContact.mobile,
  };
};

export const mapDocumentType = (id: string): string => {
  const map: Record<string, string> = {
    aadhaar: 'AADHAAR',
    pan: 'PAN',
    driving: 'DRIVING_LICENSE',
    bank: 'BANK_PASSBOOK',
    education: 'EDUCATION',
    voter: 'VOTER_ID',
    discharge: 'DISCHARGE_BOOK'
  };
  return map[id] || 'AADHAAR';
};