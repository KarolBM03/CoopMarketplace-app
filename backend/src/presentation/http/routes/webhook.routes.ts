import { Router } from "express";
import { cooperativeWebhookController } from "../controllers/webhook/CooperativeWebhookController";

const router = Router();

router.post("/cooperative", cooperativeWebhookController);

export default router;
