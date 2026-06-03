import { UserRepository } from "../../../domain/repositories/UserRepository";

export class UnblockUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Este usuario no fue encontrado");
    }

    await this.userRepository.update(user.id, {
      isBlocked: false,
    });

    return {
      message: "Este usuario fue desbloqueado correctamente",
    };
  }
}
