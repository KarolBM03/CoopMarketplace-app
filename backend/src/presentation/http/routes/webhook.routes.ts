import { Router } from "express";
import { cooperativeWebhookController } from "../controllers/webhook/CooperativeWebhookController";
import { validateBody } from "../middlewares/validateRequest";
import { webhookLimiter } from "../middlewares/rateLimit.middleware";
import { cooperativeWebhookSchema } from "../../../application/validators/cooperative/cooperative.validators";

const router = Router();

router.post(
  "/cooperative",
  webhookLimiter,
  validateBody(cooperativeWebhookSchema),
  cooperativeWebhookController,
);

export default router;
