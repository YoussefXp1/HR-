import axios from "axios";

// Base URL of your ASP.NET Core backend
const API_BASE_URL = "http://localhost:5122/api"; // Adjust if needed

// HR Login request
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/hr/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error during login:", {
      status: error.response?.status || "No status",
      message: error.response?.data?.message || error.message || "Unknown error",
    });
    throw error;
  }
};

// Company Signup request (Registers a company and inherits HR credentials)
export const signup = async (companyData: {
  businessEmail: string;
  password: string;
  companyName: string;
  companyAddress: string;
  numberOfEmployees: number;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/company/register`, companyData);
    return response.data;
  } catch (error: any) {
    console.error("Error during signup:", {
      status: error.response?.status || "No status",
      message: error.response?.data?.message || error.message || "Unknown error",
    });
    throw error;
  }
};
