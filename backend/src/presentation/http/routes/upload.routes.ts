import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/upload/UploadController";

const router = Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/image", upload.single("image"), uploadImage);

export default router;
