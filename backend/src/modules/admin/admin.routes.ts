import { Router } from "express";
import {
  approveSellerController,
  getSellersController,
  metrics,
  rejectSellerController,
} from "./admin.controller";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { financialReport } from "./admin.controller";
import { getAllUsers } from "./admin.controller";
import { getAllFraudAlerts } from "./admin.controller";
import { blockUserController, unblockUserController } from "./admin.controller";

const router = Router();

router.use(protect);
router.use(authorize("ADMIN"));
router.get("/metrics", metrics);
router.get("/financial-report", financialReport);
router.get("/fraud-alerts", getAllFraudAlerts);
router.get("/users", getAllUsers);
router.patch("/users/:userId/block", blockUserController);
router.patch("/users/:userId/unblock", unblockUserController);
router.patch("/sellers/:userId/approve", approveSellerController);
router.patch("/sellers/:userId/reject", rejectSellerController);
router.get("/sellers", getSellersController);

export default router;
