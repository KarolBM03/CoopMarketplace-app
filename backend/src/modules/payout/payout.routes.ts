import { Router } from "express";
import {
  request,
  approve,
  reject,
  getBySeller,
  getPending,
} from "./payout.controller";
import { payoutLimiter } from "../../middlewares/rateLimit.middleware";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";

const router = Router();

router.use(protect);
router.post("/request", payoutLimiter, authorize("SELLER", "ADMIN"), request);
router.patch("/:payoutId/approve", authorize("ADMIN"), approve);
router.patch("/:payoutId/reject", authorize("ADMIN"), reject);
router.get("/seller/:sellerId", allowSelfOrAdmin("sellerId"), getBySeller);
router.get("/pending", authorize("ADMIN"), getPending);

export default router;
