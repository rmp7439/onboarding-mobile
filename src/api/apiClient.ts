import { Linking } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://onboarding-backend-9uf0.onrender.com/api";

// TASK 9 & 10: Extracted repeated fetch logic and added global network/timeout error handling
async function safeRequest(endpoint: string, options: RequestInit) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    let result;
    
    try {
      result = await response.json();
    } catch (e) {
      throw new Error("Invalid response from server. Please try again.");
    }
    
    if (!response.ok) {
      throw new Error(result.error || "An unexpected error occurred.");
    }
    
    return result.data;
  } catch (error: any) {
    if (error.message === "Network request failed" || error.name === "TypeError") {
      throw new Error("Network unavailable. Please check your connection.");
    }
    throw error;
  }
}

export const api = {
  registerEmployee: (employeeData: any) => {
    return safeRequest("/employee/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });
  },

  uploadSelfie: (employeeId: string, photoUri: string) => {
    const formData = new FormData();
    const filename = photoUri.split("/").pop() || "selfie.jpg";

    formData.append("selfie", {
      uri: photoUri,
      name: filename,
      type: "image/jpeg",
    } as any);

    return safeRequest(`/employee/${employeeId}/selfie`, {
      method: "POST",
      body: formData,
    });
  },

  employeeLogin: (mobile: string, otp: string) => {
    return safeRequest("/employee/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });
  },

  uploadDocument: (employeeId: string, type: string, fileUri: string) => {
    const formData = new FormData();
    const filename = fileUri.split("/").pop() || "document.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("document", {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);
    formData.append("type", type);

    return safeRequest(`/employee/${employeeId}/document`, {
      method: "POST",
      body: formData,
    });
  },

  searchEmployees: (query: string) => {
    return safeRequest(`/employees/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  },

  getEmployeeProfile: (employeeId: string) => {
    return safeRequest(`/employee/profile/${employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  },

  getReportResults: (filters: any) => {
    const queryParams = new URLSearchParams();
    if (filters.month) queryParams.append("month", filters.month);
    if (filters.year) queryParams.append("year", filters.year);
    if (filters.joiningDate) queryParams.append("joiningDate", filters.joiningDate);

    return safeRequest(`/reports/employees?${queryParams.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  },

  getReportEmployeeDetail: (employeeId: string) => {
    return safeRequest(`/reports/employee/${employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  },

  exportReportExcel: (filters: any) => {
    const queryParams = new URLSearchParams();
    if (filters.month) queryParams.append("month", filters.month);
    if (filters.year) queryParams.append("year", filters.year);
    if (filters.joiningDate) queryParams.append("joiningDate", filters.joiningDate);
    
    const url = `${API_URL}/reports/export/excel?${queryParams.toString()}`;
    Linking.openURL(url).catch(err => {
      console.error("Failed to open export link", err);
    });
  }
};