import { UserRepository } from "../../../domain/repositories/UserRepository";

export class BlockUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Ese usuario no fue encontrado");
    }

    await this.userRepository.update(user.id, {
      isBlocked: true,
    });

    return {
      message: "Este usuario fue bloqueado correctamente",
    };
  }
}
