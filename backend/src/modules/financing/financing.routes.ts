import { Router } from "express";
import {
  adminApprove,
  create,
  getByCustomer,
  getPendingBySeller,
  adminFinancings,
  reject,
  payInicial,
  sellerApprove,
} from "./financing.controller";
import { financingLimiter } from "../../middlewares/rateLimit.middleware";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";

const router = Router();

router.use(protect);

router.post("/", financingLimiter, authorize("CUSTOMER", "ADMIN"), create);
router.get("/customer/:customerId", allowSelfOrAdmin("customerId"), getByCustomer);
router.get("/admin", authorize("ADMIN"), adminFinancings);
router.get(
  "/seller/:sellerId/pending",
  authorize("SELLER", "ADMIN"),
  allowSelfOrAdmin("sellerId"),
  getPendingBySeller,
);
router.patch("/:financingId/admin-approve", authorize("ADMIN"), adminApprove);
router.patch("/:financingId/admin-reject", authorize("ADMIN"), reject);
router.patch("/:financingId/seller-approve", authorize("SELLER", "ADMIN"), sellerApprove);
router.patch("/:financingId/approve", authorize("SELLER", "ADMIN"), sellerApprove);
router.patch("/:financingId/reject", authorize("SELLER", "ADMIN"), reject);
router.patch("/:financingId/pay-down-payment", authorize("CUSTOMER", "ADMIN"), payInicial);

export default router;
