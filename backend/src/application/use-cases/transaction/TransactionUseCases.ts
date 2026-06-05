import { TransactionRepository } from "../../../domain/repositories/TransactionRepository";

export class GetUserTransactionsUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute(userId: string) {
    return this.transactionRepository.findByUser(userId);
  }
}



