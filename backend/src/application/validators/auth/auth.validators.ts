import { z } from "zod";

const emailSchema = z.string().email("Correo invalido").trim().toLowerCase();
const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres");
const otpChannelSchema = z.enum(["email", "sms", "whatsapp"]).optional();
const documentSchema = z
  .string()
  .trim()
  .min(9, "La cedula es requerida")
  .regex(/^[0-9-]{9,13}$/, "Cedula/RNC invalido");

export const registerUserSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre es requerido"),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().optional(),
  role: z.enum(["CUSTOMER", "SELLER", "SERVICE_PROVIDER", "ADMIN"]).optional(),
  acceptedTerms: z.boolean().optional(),
  storeName: z.string().trim().optional(),
  mainCategory: z.string().trim().optional(),
  city: z.string().trim().optional(),
  documentId: documentSchema,
  bankAccount: z.string().trim().optional(),
  identityImageUrl: z.string().trim().optional(),
});

export const loginUserSchema = z
  .object({
    identifier: z.string().trim().optional(),
    email: z.string().trim().optional(),
    password: z.string().min(1, "La contrasena es requerida"),
  })
  .refine((data) => Boolean(data.identifier || data.email), {
    message: "La cedula o correo es requerido",
    path: ["identifier"],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token requerido"),
});

export const verifyOTPSchema = z.object({
  email: emailSchema,
  otpCode: z.string().trim().min(1, "El codigo OTP es requerido"),
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
  token: z.string().trim().optional(),
  password: passwordSchema,
});
