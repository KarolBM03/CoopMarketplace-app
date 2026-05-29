import { Router } from "express";
import { callback, process, retry } from "./payment.controller";
import { paymentLimiter } from "../../middlewares/rateLimit.middleware";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.post(
  "/process",
  protect,
  paymentLimiter,
  authorize("CUSTOMER", "ADMIN"),
  process,
);
router.post("/callback", callback);
router.post(
  "/:transactionId/retry",
  protect,
  authorize("CUSTOMER", "ADMIN"),
  retry,
);

export default router;
