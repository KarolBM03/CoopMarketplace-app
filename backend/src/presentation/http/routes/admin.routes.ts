import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { AdminControllerV2 } from "../controllers/admin/AdminControllerV2";

const router = Router();
const controller = new AdminControllerV2();

router.use(protect);
router.use(authorize("ADMIN"));
router.get("/metrics", controller.metrics);
router.get("/financial-report", controller.financialReport);
router.get("/fraud-alerts", controller.fraudAlerts);
router.get("/users", controller.users);
router.patch("/users/:userId/block", controller.blockUser);
router.patch("/users/:userId/unblock", controller.unblockUser);
router.patch("/sellers/:userId/approve", controller.approveSeller);
router.patch("/sellers/:userId/reject", controller.rejectSeller);
router.get("/sellers", controller.sellers);

export default router;
