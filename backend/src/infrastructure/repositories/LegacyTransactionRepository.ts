import { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { getTransactionsByUser } from "../external-services/transaction.service";

export class LegacyTransactionRepository implements TransactionRepository {
  findByUser(userId: string) {
    return getTransactionsByUser(userId);
  }
}



