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
router.get(
  "/top-products",
  protect,
  authorize("ADMIN"),
  controller.topProducts,
);
router.get("/top-sellers", protect, authorize("ADMIN"), controller.topSellers);
router.get("/sales-chart", protect, authorize("ADMIN"), controller.salesChart);
router.get(
  "/financing-chart",
  protect,
  authorize("ADMIN"),
  controller.financingChart,
);
router.patch("/users/:userId/block", controller.blockUser);
router.patch("/users/:userId/unblock", controller.unblockUser);
router.patch("/sellers/:userId/approve", controller.approveSeller);
router.patch("/sellers/:userId/reject", controller.rejectSeller);
router.patch(
  "/fraud-alerts/:alertId/resolve",
  protect,
  authorize("ADMIN"),
  controller.resolveFraudAlert,
);
router.get("/sellers", controller.sellers);

export default router;
