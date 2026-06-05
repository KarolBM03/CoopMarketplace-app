export interface TransactionRepository {
  findByUser(userId: string): Promise<any>;
}



