export type OTPChannel = "email" | "sms" | "whatsapp";

export interface RegisterUserDTO {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: "CUSTOMER" | "SELLER" | "SERVICE_PROVIDER" | "ADMIN";
  acceptedTerms?: boolean;
  storeName?: string;
  mainCategory?: string;
  city?: string;
  documentId?: string;
  bankAccount?: string;
  identityImageUrl?: string;
}

export interface LoginUserDTO {
  email?: string;
  identifier?: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface VerifyOTPDTO {
  email: string;
  otpCode: string;
  channel?: OTPChannel;
}

export interface ResendOTPDTO {
  email: string;
  channel?: OTPChannel;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token?: string;
  password: string;
}



