import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { SubmitShipmentProofUseCase } from "../../../../application/use-cases/shipment/SubmitShipmentProofUseCase";
import { uploadImageToCloudinary } from "../../../../infrastructure/external-services/upload.service";

export const submitShipmentProofController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const files = req.files as {
      customerPhoto?: Express.Multer.File[];
      productPhoto?: Express.Multer.File[];
    };

    const customerPhoto = files?.customerPhoto?.[0];
    const productPhoto = files?.productPhoto?.[0];

    if (!customerPhoto) {
      throw new Error("Debes subir la foto del cliente con el producto");
    }

    if (!productPhoto) {
      throw new Error("Debes subir la foto del producto");
    }

    const customerPhotoUrl = await uploadImageToCloudinary(
      customerPhoto.buffer,
      "shipment-proofs/customers",
    );

    const productPhotoUrl = await uploadImageToCloudinary(
      productPhoto.buffer,
      "shipment-proofs/products",
    );

    const useCase = new SubmitShipmentProofUseCase();

    const result = await useCase.execute({
      shipmentId: req.params.shipmentId as string,
      deliveredById: req.user?.id as string,
      customerPhotoUrl,
      productPhotoUrl,
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      notes: req.body.notes,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "No pude guardar la entrega",
    });
  }
};
