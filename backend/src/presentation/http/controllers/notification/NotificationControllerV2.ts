import { Request, Response } from "express";
import { GetUserNotificationsUseCase } from "../../../../application/use-cases/notification/NotificationUseCases";
import { LegacyNotificationRepository } from "../../../../infrastructure/repositories/LegacyNotificationRepository";
import { handleControllerError } from "../../../../shared/utils/controllerError";

export class NotificationControllerV2 {
  constructor(private readonly notificationRepository = new LegacyNotificationRepository()) {}

  getByUser = async (req: Request, res: Response) => {
    try {
      const useCase = new GetUserNotificationsUseCase(this.notificationRepository);
      return res.json(await useCase.execute(
        req.params.userId as string,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 10,
      ));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };
}



