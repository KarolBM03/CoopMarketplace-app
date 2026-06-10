import { Request, Response } from "express";
import {
  CreateServiceRequestUseCase,
  GetAdminServiceRequestsUseCase,
  GetMyServiceRequestsUseCase,
  UpdateServiceRequestStatusUseCase,
} from "../../../../application/use-cases/servicerequest/ServiceRequestUseCases";

export class ServiceController {
  create = async (req: Request, res: Response) => {
    try {
      const service = await new CreateServiceRequestUseCase().execute(req.body);

      return res.status(201).json(service);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  };

  myRequests = async (req: Request, res: Response) => {
    try {
      const data = await new GetMyServiceRequestsUseCase().execute(
        req.params.customerId as string,
      );

      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  };

  adminRequests = async (_req: Request, res: Response) => {
    try {
      const data = await new GetAdminServiceRequestsUseCase().execute();

      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const data = await new UpdateServiceRequestStatusUseCase().execute({
        requestId: req.params.requestId,
        ...req.body,
      });

      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  };
}
