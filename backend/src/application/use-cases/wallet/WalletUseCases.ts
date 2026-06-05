import { WalletRepository } from "../../../domain/repositories/WalletRepository";

export class GetWalletByUserUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  execute(userId: string) {
    return this.walletRepository.findByUser(userId);
  }
}

export class RechargeWalletUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  execute(userId: string, amount: number, idempotencyKey?: string) {
    return this.walletRepository.recharge(userId, amount, idempotencyKey);
  }
}



