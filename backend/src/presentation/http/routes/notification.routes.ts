import { Router } from "express";
import { NotificationControllerV2 } from "../controllers/notification/NotificationControllerV2";
import { protect } from "../middlewares/auth.middleware";
import { allowSelfOrAdmin } from "../middlewares/ownership.middleware";

const router = Router();
const controller = new NotificationControllerV2();

router.get(
  "/user/:userId",
  protect,
  allowSelfOrAdmin("userId"),
  controller.getByUser,
);

export default router;
