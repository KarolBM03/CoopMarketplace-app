import { Request, Response } from "express";
import { GetUserTransactionsUseCase } from "../../../../application/use-cases/transaction/TransactionUseCases";
import { LegacyTransactionRepository } from "../../../../infrastructure/repositories/LegacyTransactionRepository";
import { handleControllerError } from "../../../../shared/utils/controllerError";

export class TransactionControllerV2 {
  constructor(private readonly transactionRepository = new LegacyTransactionRepository()) {}

  getByUser = async (req: Request, res: Response) => {
    try {
      const useCase = new GetUserTransactionsUseCase(this.transactionRepository);
      return res.json(await useCase.execute(req.params.userId as string));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };
}



