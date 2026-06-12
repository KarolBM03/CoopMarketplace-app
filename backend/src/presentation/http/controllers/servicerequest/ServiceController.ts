import { Request, Response } from "express";
import {
  AcceptServiceRequestUseCase,
  CreateServiceOfferingUseCase,
  CreateServiceRequestUseCase,
  GetActiveServiceOfferingsUseCase,
  GetAdminServiceRequestsUseCase,
  GetMyServiceRequestsUseCase,
  GetProviderServiceOfferingsUseCase,
  GetProviderServiceRequestsUseCase,
  UpdateProviderServiceRequestStatusUseCase,
  UpdateServiceOfferingUseCase,
  UpdateServiceRequestStatusUseCase,
} from "../../../../application/use-cases/servicerequest/ServiceRequestUseCases";
import { AuthRequest } from "../../middlewares/auth.middleware";

export class ServiceController {
  catalog = async (_req: AuthRequest, res: Response) => {
    try {
      const data = await new GetActiveServiceOfferingsUseCase().execute();
      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const service = await new CreateServiceRequestUseCase().execute({
        ...req.body,
        customerId: req.user?.id,
      });

      return res.status(201).json(service);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  };

  createOffering = async (req: AuthRequest, res: Response) => {
    try {
      const providerId = req.user?.id;
      const service = await new CreateServiceOfferingUseCase().execute({
        ...req.body,
        providerId,
      });

      return res.status(201).json(service);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  providerOfferings = async (req: AuthRequest, res: Response) => {
    try {
      const data = await new GetProviderServiceOfferingsUseCase().execute(
        req.user?.id,
      );

      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  updateOffering = async (req: AuthRequest, res: Response) => {
    try {
      const data = await new UpdateServiceOfferingUseCase().execute({
        offeringId: req.params.offeringId,
        providerId: req.user?.id,
        isAdmin: req.user?.role === "ADMIN",
        ...req.body,
      });

      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  providerRequests = async (req: AuthRequest, res: Response) => {
    try {
      const data = await new GetProviderServiceRequestsUseCase().execute(
        req.user?.id,
      );

      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  acceptRequest = async (req: AuthRequest, res: Response) => {
    try {
      const data = await new AcceptServiceRequestUseCase().execute({
        requestId: String(req.params.requestId),
        providerId: req.user?.id,
        providerName: req.user?.fullName,
      });

      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  updateProviderRequestStatus = async (req: AuthRequest, res: Response) => {
    try {
      const data = await new UpdateProviderServiceRequestStatusUseCase().execute({
        requestId: String(req.params.requestId),
        providerId: req.user?.id,
        status: req.body.status,
        amount:
          req.body.amount === undefined || req.body.amount === ""
            ? undefined
            : Number(req.body.amount),
      });

      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  myRequests = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "ADMIN" && req.params.customerId !== req.user?.id) {
        return res.status(403).json({
          message: "No tienes permisos para ver estas solicitudes",
        });
      }

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
