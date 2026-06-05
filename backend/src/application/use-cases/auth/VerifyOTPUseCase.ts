import { OTPChannel } from "../../dto/auth/AuthDTO";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { sanitizeUser } from "../../../shared/utils/sanitizeUser";
import { verifyProviderOTP } from "../../../infrastructure/external-services/otp.provider.service";

export class VerifyOTPUseCase {
  constructor(private userRepository: UserRepository) {}

  private getDestination(
    user: {
      email: string;
      phone?: string | null;
    },
    channel: OTPChannel,
  ) {
    if (channel === "email") {
      return user.email;
    }

    if (!user.phone) {
      throw new Error("Usted no tiene telefono registrado");
    }

    return user.phone;
  }

  async execute(email: string, otpCode: string, channel: OTPChannel = "email") {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Usted no fue encontrado");
    }

    if (user.isVerified) {
      throw new Error("Esta cuenta ya está verificada");
    }

    const destination = this.getDestination(user, channel);

    const result = await verifyProviderOTP(channel, destination, otpCode);

    if (!result?.success || !result?.result?.verified) {
      throw new Error("OTP inválido o expirado");
    }

    await this.userRepository.update(user.id, {
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
    });

    const updatedUser = await this.userRepository.findById(user.id);

    return {
      message: "Ya su cuenta esta verificada correctamente",
      user: sanitizeUser(updatedUser!),
    };
  }
}



