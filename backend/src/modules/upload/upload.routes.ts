import { Router } from "express";
import multer from "multer";
import { uploadImage } from "./upload.controller";

const router = Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/image", upload.single("image"), uploadImage);

export default router;
