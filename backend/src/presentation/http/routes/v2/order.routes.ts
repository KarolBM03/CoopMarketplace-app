import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";
import {
  cancelOrderController,
  createOrderController,
  customerOrdersController,
  sellerSalesController,
  updateOrderStatusController,
} from "../../controllers/OrderController";

const router = Router();

router.use(protect);
router.post("/", authorize("CUSTOMER", "ADMIN"), createOrderController);
router.get("/customer/me", authorize("CUSTOMER", "ADMIN"), customerOrdersController);
router.get("/customer/:customerId", authorize("CUSTOMER", "ADMIN"), allowSelfOrAdmin("customerId"), customerOrdersController);
router.get("/seller/me/sales", authorize("SELLER", "ADMIN"), sellerSalesController);
router.get("/seller/:sellerId/sales", authorize("ADMIN"), sellerSalesController);
router.patch("/:orderId/status", authorize("ADMIN", "SELLER"), updateOrderStatusController);
router.patch("/:orderId/cancel", authorize("CUSTOMER", "ADMIN"), cancelOrderController);

export default router;



