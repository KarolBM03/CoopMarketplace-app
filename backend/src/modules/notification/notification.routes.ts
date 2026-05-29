import { Router } from "express";
import { getByUser } from "./notification.controller";
import { protect } from "../../middlewares/auth.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";

const router = Router();

router.get("/user/:userId", protect, allowSelfOrAdmin("userId"), getByUser);

export default router;
