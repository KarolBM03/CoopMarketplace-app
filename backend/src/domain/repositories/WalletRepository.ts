export interface WalletRepository {
  findByUser(userId: string): Promise<any>;
  recharge(userId: string, amount: number, idempotencyKey?: string): Promise<any>;
}



