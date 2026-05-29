import prisma from "../../config/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateToken } from "../../utils/generateToken";
import { createWallet } from "../../services/wallet.service";
import { sendResetPasswordEmail } from "../../services/email.service";
import {
  requestOTP,
  verifyProviderOTP,
} from "../../services/otp.provider.service";

type OTPChannel = "email" | "sms" | "whatsapp";

interface RegisterData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: "CUSTOMER" | "SELLER";
  acceptedTerms?: boolean;
  verificationChannel?: "EMAIL" | "SMS" | "WHATSAPP";

  storeName?: string;
  mainCategory?: string;
  city?: string;
  documentId?: string;
  bankAccount?: string;
  identityImageUrl?: string;
}

const getOTPDestination = (
  user: { email: string; phone?: string | null },
  channel: OTPChannel,
) => {
  if (channel === "email") {
    return user.email;
  }

  if (!user.phone) {
    throw new Error("Este usuario no tiene telefono registrado");
  }

  return user.phone;
};

export const registerUser = async ({
  fullName,
  email,
  phone,
  password,
  role = "CUSTOMER",
  acceptedTerms = false,
  verificationChannel = "EMAIL",

  storeName,
  mainCategory,
  city,
  documentId,
  bankAccount,
  identityImageUrl,
}: RegisterData) => {
  if (!acceptedTerms) {
    throw new Error("Debes aceptar los terminos y condiciones");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("User ya existe");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role === "SELLER" ? "SELLER" : "CUSTOMER",

      acceptedTerms,
      isVerified: false,
      otpCode: null,
      otpExpiresAt: null,

      storeName: role === "SELLER" ? storeName : null,
      mainCategory: role === "SELLER" ? mainCategory : null,
      city: role === "SELLER" ? city : null,
      documentId: role === "SELLER" ? documentId : null,
      bankAccount: role === "SELLER" ? bankAccount : null,
      identityImageUrl: role === "SELLER" ? identityImageUrl : null,
      sellerStatus: role === "SELLER" ? "PENDING" : "APPROVED",
    },
  });

  await requestOTP("email", email);

  if (phone) {
    await requestOTP("sms", phone);
    await requestOTP("whatsapp", phone);
  }

  await createWallet(user.id);

  const { password: _, otpCode: __, ...safeUser } = user;

  return {
    message: "Usuario registrado. Verifica tu cuenta con el codigo OTP.",
    user: safeUser,
  };
};

export const verifyOTP = async (
  email: string,
  otpCode: string,
  channel: OTPChannel = "email",
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.isVerified) {
    throw new Error("Esta cuenta ya está verificada");
  }

  const destination = getOTPDestination(user, channel);

  const result = await verifyProviderOTP(channel, destination, otpCode);

  if (!result?.success || !result?.result?.verified) {
    throw new Error("OTP inválido o expirado");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
    },
  });

  const {
    password: _,
    otpCode: __,
    refreshToken: ___,
    ...safeUser
  } = updatedUser;

  return {
    message: "Cuenta verificada correctamente",
    user: safeUser,
  };
};
export const resendOTP = async (
  email: string,
  channel: OTPChannel = "email",
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.isVerified) {
    throw new Error("Esta cuenta ya está verificada");
  }

  const destination = getOTPDestination(user, channel);

  await requestOTP(channel, destination);

  return {
    message: "Nuevo código OTP enviado",
  };
};
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Credenciales no validas");
  }

  if (user.isBlocked) {
    throw new Error("Tu cuenta esta bloqueada. Contacta al administrador.");
  }

  if (!user.isVerified) {
    throw new Error("Debes verificar tu cuenta antes de iniciar sesion");
  }

  if (user.role === "SELLER" && user.sellerStatus !== "APPROVED") {
    throw new Error("Tu perfil de vendedor aun no ha sido aprobado");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Contraseña no valida");
  }

  const accessToken = generateToken(user.id);
  const refreshToken = generateToken(user.id);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

  const { password: _, otpCode: __, refreshToken: ___, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("Refresh token requerido");
  }

  const user = await prisma.user.findFirst({
    where: {
      refreshToken,
    },
  });

  if (!user) {
    throw new Error("Refresh token no valido");
  }

  if (user.isBlocked) {
    throw new Error("Tu cuenta esta bloqueada");
  }

  const accessToken = generateToken(user.id);

  const { password: _, otpCode: __, refreshToken: ___, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return user;
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetPasswordExpires = new Date();
  resetPasswordExpires.setMinutes(resetPasswordExpires.getMinutes() + 5);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires,
    },
  });

  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  await sendResetPasswordEmail(user.email, user.fullName, resetLink);

  return {
    message: "Correo de recuperacion enviado",
  };
};
export const resetPassword = async (token: string, password: string) => {
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
    },
  });

  if (!user) {
    throw new Error("Token inválido");
  }

  if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    throw new Error("Token expirado");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return {
    message: "Contraseña actualizada correctamente",
  };
};
