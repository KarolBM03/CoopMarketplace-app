import { Router } from "express";
import {
  acceptOffer,
  adminFinancings,
  confirmPayment,
  cooperativeApprove,
  counterOffer,
  create,
  getByCustomer,
  paymentLink,
  reject,
} from "./financing.controller";
import { financingLimiter } from "../../middlewares/rateLimit.middleware";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";

const router = Router();

router.post("/cooperative/:financingId/confirm-payment", confirmPayment);

router.use(protect);

router.post("/", financingLimiter, authorize("CUSTOMER", "ADMIN"), create);

router.get(
  "/customer/:customerId",
  allowSelfOrAdmin("customerId"),
  getByCustomer,
);

router.get("/admin", authorize("ADMIN"), adminFinancings);

router.patch(
  "/:financingId/cooperative-approve",
  authorize("ADMIN"),
  cooperativeApprove,
);

router.patch("/:financingId/cooperative-reject", authorize("ADMIN"), reject);

router.patch("/:financingId/counter-offer", authorize("ADMIN"), counterOffer);

router.patch("/:financingId/accept-offer", authorize("CUSTOMER"), acceptOffer);

router.get(
  "/:financingId/payment-link",
  authorize("CUSTOMER", "ADMIN"),
  paymentLink,
);

export default router;
