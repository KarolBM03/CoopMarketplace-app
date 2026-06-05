import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { PushControllerV2 } from "../controllers/push/PushControllerV2";

const router = Router();
const controller = new PushControllerV2();

router.use(protect);
router.post("/token", controller.registerPushToken);

export default router;
