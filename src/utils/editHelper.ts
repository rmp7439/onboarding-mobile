import { formatDateForForm, mapBloodGroupFromBackend, mapEducationFromBackend } from "./dataMappers";
import { OnboardingData } from "../context/OnboardingContext";
import { Href, Router } from "expo-router";

export const startEditingApplication = (
  profile: any,
  updateData: (newData: Partial<OnboardingData>) => void,
  router: Router
) => {
  updateData({
    isEditMode: true,
    editEmployeeId: profile.id,
    employment: {
      joiningDate: formatDateForForm(profile.joiningDate),
      unit: profile.unit || "",
    },
    personal: {
      firstName: profile.firstName || "",
      surname: profile.surname || "",
      fatherName: profile.fatherName || "",
      husbandName: profile.husbandName || "",
      gender: profile.gender === "FEMALE" ? "Female" : profile.gender === "OTHER" ? "Other" : "Male",
      dob: formatDateForForm(profile.dateOfBirth || ""),
      mobile: profile.mobile || "",
      bloodGroup: mapBloodGroupFromBackend(profile.bloodGroup),
      highestEducation: mapEducationFromBackend(profile.education),
    },
    identity: {
      aadhaar: profile.aadhaar || "",
      pan: profile.pan || "",
      uan: profile.uan || "",
      esic: profile.esic || "",
      drivingLicence: profile.drivingLicence || "",
    },
    address: {
      permanent: profile.permanentAddress || "",
      current: profile.currentAddress || "",
      city: profile.city || "",
      state: profile.state || "",
      pinCode: profile.pinCode || "",
    },
    bank: {
      bankName: profile.bankName || "",
      accountNumber: profile.accountNumber || "",
      ifsc: profile.ifsc || "",
      branch: profile.branch || "",
      micr: profile.micr || "",
    },
    emergencyContact: {
      name: profile.emergencyName || "",
      relation: profile.emergencyRelation || "",
      mobile: profile.emergencyPhone || "",
    },
    selfieUri: profile.selfieUrl || profile.selfieFilename ? "EXISTING" : null,
    existingDocuments: profile.documents?.map((d: any) => d.type) || [],
  });

  router.push("/(onboarding)/new-guard/employee-details" as Href);
};