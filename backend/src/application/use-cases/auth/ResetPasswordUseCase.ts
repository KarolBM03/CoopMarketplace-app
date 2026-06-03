import bcrypt from "bcrypt";
import { UserRepository } from "../../../domain/repositories/UserRepository";

export class ResetPasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(token: string, password: string) {
    if (password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const user = await this.userRepository.findByResetToken(token);

    if (!user) {
      throw new Error("Token inválido");
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new Error("Token expirado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return {
      message: "Contraseña actualizada correctamente",
    };
  }
}
