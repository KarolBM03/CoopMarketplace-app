import { UserRepository } from "../../../domain/repositories/UserRepository";
import { generateToken } from "../../../utils/generateToken";

export class RefreshTokenUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("Refresh token requerido");
    }

    const user = await this.userRepository.findByRefreshToken(refreshToken);

    if (!user) {
      throw new Error("Refresh token no valido");
    }

    if (user.isBlocked) {
      throw new Error("Su cuenta esta bloqueada");
    }

    const accessToken = generateToken(user.id);

    const {
      password,
      otpCode,
      refreshToken: userRefreshToken,
      ...safeUser
    } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }
}
