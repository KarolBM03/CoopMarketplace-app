import api from "../api/axios";
import type { AuthResponse } from "../types/auth.types";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: "CUSTOMER" | "SELLER";
  acceptedTerms: boolean;

  storeName?: string;
  mainCategory?: string;
  city?: string;
  documentId?: string;
  bankAccount?: string;
  identityImageUrl?: string;
}

export type OTPChannel = "email" | "sms" | "whatsapp";

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (
  data: RegisterData,
): Promise<AuthResponse> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};
export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const verifyOTP = async (data: {
  email: string;
  otpCode: string;
  channel?: OTPChannel;
}) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};

export const resendOTP = async (email: string, channel: OTPChannel = "email") => {
  const response = await api.post("/auth/resend/otp", {
    email,
    channel,
  });

  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post("/auth/reset-password", {
    token,
    password,
  });

  return response.data;
};
