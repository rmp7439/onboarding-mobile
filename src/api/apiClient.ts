import { Session } from '../utils/Session';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://onboarding-backend-9uf0.onrender.com/api";

// Helper function to attach the token to headers
const getAuthHeaders = async (customHeaders: Record<string, string> = {}) => {
  const session = await Session.getEmployeeSession();
  const headers: Record<string, string> = {
    ...customHeaders
  };
  
  if (session && session.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  
  return headers;
};

export const api = {
  registerEmployee: async (employeeData: any) => {
    const headers = await getAuthHeaders({ "Content-Type": "application/json" });
    const response = await fetch(`${API_URL}/employee/register`, {
      method: "POST",
      headers,
      body: JSON.stringify(employeeData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Registration failed");
    return result.data;
  },

  uploadSelfie: async (employeeId: string, photoUri: string) => {
    const formData = new FormData();
    const filename = photoUri.split("/").pop() || "selfie.jpg";

    formData.append("selfie", {
      uri: photoUri,
      name: filename,
      type: "image/jpeg",
    } as any);

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/employee/${employeeId}/selfie`, {
      method: "POST",
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Selfie upload failed");
    return result.data;
  },

  employeeLogin: async (mobile: string, otp: string) => {
    const response = await fetch(`${API_URL}/employee/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Login failed");
    return result.data;
  },

  uploadDocument: async (employeeId: string, type: string, fileUri: string) => {
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

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/employee/${employeeId}/document`, {
      method: "POST",
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Failed to upload ${type}`);
    return result.data;
  },

  searchEmployees: async (query: string) => {
    const headers = await getAuthHeaders({ "Content-Type": "application/json" });
    const response = await fetch(
      `${API_URL}/employees/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers,
      }
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Search failed");
    return result.data;
  },

  getEmployeeProfile: async (employeeId: string) => {
    const headers = await getAuthHeaders({ "Content-Type": "application/json" });
    const response = await fetch(`${API_URL}/employee/profile/${employeeId}`, {
      method: "GET",
      headers,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch profile");
    return result.data;
  },
};