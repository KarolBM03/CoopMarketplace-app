import { WalletRepository } from "../../domain/repositories/WalletRepository";
import { getWalletByUser, rechargeWallet } from "../external-services/wallet.service";

export class LegacyWalletRepository implements WalletRepository {
  findByUser(userId: string) {
    return getWalletByUser(userId);
  }

  recharge(userId: string, amount: number, idempotencyKey?: string) {
    return rechargeWallet(userId, amount, idempotencyKey);
  }
}



