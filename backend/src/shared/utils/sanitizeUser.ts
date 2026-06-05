import { User } from "../../domain/entities/User";

export type SafeUser = Omit<
  User,
  | "password"
  | "otpCode"
  | "refreshToken"
  | "resetPasswordToken"
  | "resetPasswordExpires"
>;

export const sanitizeUser = (user: User): SafeUser => {
  const {
    password,
    otpCode,
    refreshToken,
    resetPasswordToken,
    resetPasswordExpires,
    ...safeUser
  } = user;

  return safeUser;
};



