import { UserRepository } from "../../../domain/repositories/UserRepository";
import { sanitizeUser } from "../../../shared/utils/sanitizeUser";
import { generateToken } from "../../../shared/utils/generateToken";

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

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }
}



