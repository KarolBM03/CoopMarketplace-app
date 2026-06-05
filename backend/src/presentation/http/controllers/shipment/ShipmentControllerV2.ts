import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  CreateShipmentUseCase,
  GetAdminShipmentsUseCase,
  GetCustomerShipmentsUseCase,
  GetSellerShipmentsUseCase,
  UpdateShipmentStatusUseCase,
} from "../../../../application/use-cases/shipment/ShipmentUseCases";
import { LegacyShipmentRepository } from "../../../../infrastructure/repositories/LegacyShipmentRepository";
import { handleControllerError } from "../../../../shared/utils/controllerError";

export class ShipmentControllerV2 {
  constructor(private readonly shipmentRepository = new LegacyShipmentRepository()) {}

  createShipment = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new CreateShipmentUseCase(this.shipmentRepository);
      const shipment = await useCase.execute({
        orderId: req.params.orderId,
        sellerId: req.user?.role === "ADMIN" && req.body.sellerId ? req.body.sellerId : req.user?.id,
        actorId: req.user?.id,
        data: req.body,
      });
      return res.status(201).json(shipment);
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new UpdateShipmentStatusUseCase(this.shipmentRepository);
      return res.json(await useCase.execute({
        shipmentId: req.params.shipmentId,
        status: req.body.status,
        actorId: req.user?.id,
        actorRole: req.user?.role,
      }));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  customerShipments = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetCustomerShipmentsUseCase(this.shipmentRepository);
      return res.json(await useCase.execute(req.params.customerId as string));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  sellerShipments = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetSellerShipmentsUseCase(this.shipmentRepository);
      return res.json(await useCase.execute(req.user?.id as string));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  adminShipments = async (_req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetAdminShipmentsUseCase(this.shipmentRepository);
      return res.json(await useCase.execute());
    } catch (error) {
      return handleControllerError(error, res);
    }
  };
}



