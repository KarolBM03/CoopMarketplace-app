import crypto from "crypto";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { sendResetPasswordEmail } from "../../../infrastructure/external-services/email.service";

export class ForgotPasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Usted no fue encontrado");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetPasswordExpires = new Date();
    resetPasswordExpires.setMinutes(resetPasswordExpires.getMinutes() + 5);

    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires,
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await sendResetPasswordEmail(user.email, user.fullName, resetLink);

    return {
      message: "Correo de recuperacion enviado",
    };
  }
}



