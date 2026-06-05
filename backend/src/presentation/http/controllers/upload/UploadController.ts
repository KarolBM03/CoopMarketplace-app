import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import cloudinary from "../../../../infrastructure/external-services/cloudinary";

const getPublicUploadUrl = (req: Request, filePath: string) => {
  const fileName = path.basename(filePath);
  return `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
};

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No se envio ninguna imagen",
      });
    }

    if (!hasCloudinaryConfig()) {
      return res.json({
        imageUrl: getPublicUploadUrl(req, req.file.path),
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "marketplace-products",
    });

    fs.unlinkSync(req.file.path);

    return res.json({
      imageUrl: result.secure_url,
    });
  } catch (error: any) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      return res.json({
        imageUrl: getPublicUploadUrl(req, req.file.path),
        warning: "Cloudinary no pudo subir la imagen, se uso almacenamiento local",
      });
    }

    return res.status(400).json({
      message: error.message || "No se pudo subir la imagen",
    });
  }
};
