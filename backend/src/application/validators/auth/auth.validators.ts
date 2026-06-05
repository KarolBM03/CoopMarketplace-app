import { z } from "zod";

const emailSchema = z.string().email("Correo inválido").trim().toLowerCase();
const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");
const otpChannelSchema = z.enum(["email", "sms", "whatsapp"]).optional();

export const registerUserSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre es requerido"),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().optional(),
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es requerida"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token requerido"),
});

export const verifyOTPSchema = z.object({
  email: emailSchema,
  otpCode: z.string().trim().min(1, "El código OTP es requerido"),
  channel: otpChannelSchema,
});

export const resendOTPSchema = z.object({
  email: emailSchema,
  channel: otpChannelSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});



