import { Router } from "express";
import { pay } from "./installment.controller";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.patch("/pay/:installmentId", protect, authorize("CUSTOMER", "ADMIN"), pay);

export default router;
