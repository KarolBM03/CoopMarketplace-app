import { UserRepository } from "../../../domain/repositories/UserRepository";

export class ApproveSellerUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Ese usuario no fue encontrado");
    }

    await this.userRepository.update(user.id, {
      sellerStatus: "APPROVED",
    });

    return {
      message: "Este vendedor fue aprobado correctamente",
    };
  }
}
