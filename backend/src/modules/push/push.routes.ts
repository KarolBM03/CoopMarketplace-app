import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { registerPushToken } from "./push.controller";

const router = Router();

router.use(protect);

router.post("/token", registerPushToken);

export default router;
