import { Router } from "express";
import { apply, calculate, status, syncPayments } from "./loan.controller";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.post("/calculate", protect, calculate);
router.post("/apply", protect, authorize("CUSTOMER", "ADMIN"), apply);
router.get("/:loanId/status", protect, authorize("CUSTOMER", "ADMIN"), status);
router.post(
  "/:loanId/sync-payments",
  protect,
  authorize("ADMIN"),
  syncPayments,
);

export default router;
