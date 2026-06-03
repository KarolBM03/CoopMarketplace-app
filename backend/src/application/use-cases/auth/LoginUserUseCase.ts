import bcrypt from "bcrypt";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { generateToken } from "../../../utils/generateToken";

export class LoginUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error("Sus credenciales son inválidas");
    }

    if (user.isBlocked) {
      throw new Error("Usted esta bloqueado");
    }

    if (!user.isVerified) {
      throw new Error("Debe verificar su cuenta antes de iniciar sesión");
    }

    if (user.role === "SELLER" && user.sellerStatus !== "APPROVED") {
      throw new Error(
        "Su perfil de vendedor aun no ha sido aprobado, espere a que se lo aprueben",
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Sus credenciales son inválidas");
    }

    const accessToken = generateToken(user.id);
    const refreshToken = generateToken(user.id);

    await this.userRepository.update(user.id, {
      refreshToken,
    });

    const {
      password,
      otpCode,
      refreshToken: _refreshToken,
      resetPasswordToken,
      resetPasswordExpires,
      ...safeUser
    } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }
}
