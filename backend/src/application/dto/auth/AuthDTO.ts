export type OTPChannel = "email" | "sms" | "whatsapp";

export interface RegisterUserDTO {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginUserDTO {
  email: string;
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
  password: string;
}



