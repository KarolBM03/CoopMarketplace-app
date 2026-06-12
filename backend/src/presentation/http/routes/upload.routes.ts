import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/upload/UploadController";

const router = Router();

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return cb(new Error("Solo se permiten imagenes JPG, PNG, WEBP o GIF"));
    }

    cb(null, true);
  },
});

const uploadSingleImage = (req: Request, res: Response, next: NextFunction) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    return res.status(400).json({
      message:
        error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
          ? "La imagen no puede pesar mas de 5MB"
          : error.message || "No se pudo procesar la imagen",
    });
  });
};

router.post("/image", uploadSingleImage, uploadImage);

export default router;
