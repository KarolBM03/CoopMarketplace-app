import { UserRepository } from "../../../domain/repositories/UserRepository";

export class GetUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const {
      password,
      otpCode,
      refreshToken,
      resetPasswordToken,
      resetPasswordExpires,
      ...safeUser
    } = user;

    return safeUser;
  }
}
