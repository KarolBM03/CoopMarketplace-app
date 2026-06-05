import { UserRepository } from "../../../domain/repositories/UserRepository";
import { sanitizeUser } from "../../../shared/utils/sanitizeUser";

export class GetUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return sanitizeUser(user);
  }
}



