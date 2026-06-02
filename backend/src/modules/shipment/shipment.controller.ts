import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  createShipmentForOrder,
  getAdminShipments,
  getCustomerShipments,
  getSellerShipments,
  updateShipmentStatus,
} from "./shipment.service";

export const createShipment = async (req: AuthRequest, res: Response) => {
  try {
    const shipment = await createShipmentForOrder({
      orderId: req.params.orderId as string,
      sellerId:
        req.user?.role === "ADMIN" && req.body.sellerId
          ? req.body.sellerId
          : req.user?.id,
      actorId: req.user?.id,
      data: req.body,
    });

    res.status(201).json(shipment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const shipment = await updateShipmentStatus({
      shipmentId: req.params.shipmentId as string,
      status: req.body.status,
      actorId: req.user?.id,
      actorRole: req.user?.role,
    });

    res.json(shipment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const customerShipments = async (req: AuthRequest, res: Response) => {
  try {
    const shipments = await getCustomerShipments(
      req.params.customerId as string,
    );
    res.json(shipments);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const sellerShipments = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id as string;

    const shipments = await getSellerShipments(sellerId);
    res.json(shipments);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const adminShipments = async (_req: AuthRequest, res: Response) => {
  try {
    const shipments = await getAdminShipments();
    res.json(shipments);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
