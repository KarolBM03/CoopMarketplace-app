import { PushRepository } from "../../../domain/repositories/PushRepository";

export class RegisterPushTokenUseCase {
  constructor(private readonly pushRepository: PushRepository) {}

  execute(data: { userId: string; token: string; platform?: string }) {
    return this.pushRepository.saveToken(data);
  }
}



