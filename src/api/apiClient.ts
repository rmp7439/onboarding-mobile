import { Session } from '../utils/Session';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://onboarding-backend-9uf0.onrender.com/api";

async function safeRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const session = await Session.getEmployeeSession();
    const headers = new Headers(options.headers || {});
    
    if (session?.token) {
      headers.set('Authorization', `Bearer ${session.token}`);
    }
    
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
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
  } catch (error: unknown) {
    if (error instanceof Error && (error.message === "Network request failed" || error.name === "TypeError")) {
      throw new Error("Network unavailable. Please check your connection.");
    }
    throw error;
  }
}

export const api = {
  userLogin: (mobile: string, password: string) => {
    return safeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ mobile, password }),
    });
  },

  registerEmployee: (employeeData: any) => {
    return safeRequest("/employee/register", {
      method: "POST",
      body: JSON.stringify(employeeData),
    });
  },

  // NEW: Update existing employee via PUT
  updateEmployee: (id: string, employeeData: any) => {
    return safeRequest(`/employee/${id}`, {
      method: "PUT",
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
    return safeRequest(`/employees/search?q=${encodeURIComponent(query)}`, { method: "GET" });
  },

  getEmployeeProfile: (employeeId: string) => {
    return safeRequest(`/employee/profile/${employeeId}`, { method: "GET" });
  },

  getMyUnits: () => {
    return safeRequest("/user/my-units", { method: "GET" });
  },

  getMyApplications: () => {
    return safeRequest("/employee/my-applications", { method: "GET" });
  },

  getMyProfile: () => {
    return safeRequest("/user/me", { method: "GET" });
  },
};