import { Linking } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://onboarding-backend-9uf0.onrender.com/api";

export const api = {
  // Existing functions omitted for brevity...
  registerEmployee: async (employeeData: any) => { /*...*/ },
  uploadSelfie: async (employeeId: string, photoUri: string) => { /*...*/ },
  employeeLogin: async (mobile: string, otp: string) => { /*...*/ },
  uploadDocument: async (employeeId: string, type: string, fileUri: string) => { /*...*/ },
  searchEmployees: async (query: string) => { /*...*/ },
  getEmployeeProfile: async (employeeId: string) => { /*...*/ },

  // --- NEW ISOLATED REPORTS API ---
  getReportResults: async (filters: any) => {
    const queryParams = new URLSearchParams();
    if (filters.month) queryParams.append("month", filters.month);
    if (filters.year) queryParams.append("year", filters.year);
    if (filters.joiningDate) queryParams.append("joiningDate", filters.joiningDate);

    const response = await fetch(`${API_URL}/reports/employees?${queryParams.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch report results");
    return result.data;
  },

  getReportEmployeeDetail: async (employeeId: string) => {
    const response = await fetch(`${API_URL}/reports/employee/${employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch report profile");
    return result.data;
  },

  exportReportExcel: (filters: any) => {
    const queryParams = new URLSearchParams();
    if (filters.month) queryParams.append("month", filters.month);
    if (filters.year) queryParams.append("year", filters.year);
    if (filters.joiningDate) queryParams.append("joiningDate", filters.joiningDate);
    
    // Opens the browser to natively handle file download
    const url = `${API_URL}/reports/export/excel?${queryParams.toString()}`;
    Linking.openURL(url).catch(err => {
      console.error("Failed to open export link", err);
    });
  }
};