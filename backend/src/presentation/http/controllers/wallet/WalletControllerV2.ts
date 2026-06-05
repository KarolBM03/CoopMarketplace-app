import { Request, Response } from "express";
import { GetWalletByUserUseCase, RechargeWalletUseCase } from "../../../../application/use-cases/wallet/WalletUseCases";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { LegacyWalletRepository } from "../../../../infrastructure/repositories/LegacyWalletRepository";
import { handleControllerError } from "../../../../shared/utils/controllerError";

export class WalletControllerV2 {
  constructor(private readonly walletRepository = new LegacyWalletRepository()) {}

  getByUser = async (req: Request, res: Response) => {
    try {
      const useCase = new GetWalletByUserUseCase(this.walletRepository);
      return res.json(await useCase.execute(req.params.userId as string));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  getMyWallet = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetWalletByUserUseCase(this.walletRepository);
      return res.json(await useCase.execute(req.user?.id as string));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  recharge = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.role === "ADMIN" && req.body.userId ? req.body.userId : req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "No autorizado" });
      }

      const useCase = new RechargeWalletUseCase(this.walletRepository);
      return res.json(await useCase.execute(
        userId,
        Number(req.body.amount),
        req.headers["idempotency-key"] as string | undefined,
      ));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };
}



