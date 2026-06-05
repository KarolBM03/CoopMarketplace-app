import { Response } from "express";
import { RegisterPushTokenUseCase } from "../../../../application/use-cases/push/PushUseCases";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { LegacyPushRepository } from "../../../../infrastructure/repositories/LegacyPushRepository";
import { handleControllerError } from "../../../../shared/utils/controllerError";

export class PushControllerV2 {
  constructor(private readonly pushRepository = new LegacyPushRepository()) {}

  registerPushToken = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new RegisterPushTokenUseCase(this.pushRepository);
      return res.status(201).json(await useCase.execute({
        userId: req.user?.id as string,
        token: req.body.token,
        platform: req.body.platform || "WEB",
      }));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };
}



