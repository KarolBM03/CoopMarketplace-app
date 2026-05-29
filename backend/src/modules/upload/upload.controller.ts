import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary";
import fs from "fs";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No se envió ninguna imagen",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "marketplace-products",
    });

    fs.unlinkSync(req.file.path);

    res.json({
      imageUrl: result.secure_url,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
