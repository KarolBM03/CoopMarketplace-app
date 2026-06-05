import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { SubmitShipmentProofUseCase } from "../../../../application/use-cases/shipment/SubmitShipmentProofUseCase";

export const submitShipmentProofController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new SubmitShipmentProofUseCase();

    const result = await useCase.execute({
      shipmentId: req.params.shipmentId as string,
      deliveredById: req.user?.id as string,
      photoUrl: req.body.photoUrl,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      notes: req.body.notes,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "No pude guardar la entrega",
    });
  }
};
