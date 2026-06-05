import { OTPChannel } from "../../dto/auth/AuthDTO";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { requestOTP } from "../../../infrastructure/external-services/otp.provider.service";

export class ResendOTPUseCase {
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

  async execute(email: string, channel: OTPChannel = "email") {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Usted no fue encontrado");
    }

    if (user.isVerified) {
      throw new Error("Ya su cuenta está verificada");
    }

    const destination = this.getDestination(user, channel);

    await requestOTP(channel, destination);

    return {
      message: "Nuevo Codigo OTP Enviado",
    };
  }
}



