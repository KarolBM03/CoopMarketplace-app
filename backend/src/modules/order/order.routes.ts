import { Router } from "express";
import { create } from "./order.controller";
import { updateStatus } from "./order.controller";
import { cancel } from "./order.controller";
import { getCustomerOrders } from "./order.controller";
import { getSalesBySeller } from "./order.controller";
import {
  confirmCooperativePayment,
  cooperativePaymentLink,
  devConfirmPayment,
} from "./order.controller";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";

const router = Router();

router.post("/cooperative/:orderId/confirm-payment", confirmCooperativePayment);

router.use(protect);

router.post("/", authorize("CUSTOMER", "ADMIN"), create);
router.post(
  "/:orderId/cooperative-payment-link",
  authorize("CUSTOMER", "ADMIN"),
  cooperativePaymentLink,
);
router.get(
  "/customer/:customerId",
  allowSelfOrAdmin("customerId"),
  getCustomerOrders,
);
router.get(
  "/seller/:sellerId/sales",
  authorize("SELLER", "ADMIN"),
  allowSelfOrAdmin("sellerId"),
  getSalesBySeller,
);
router.patch("/:id/status", authorize("ADMIN"), updateStatus);
router.patch("/:id/cancel", authorize("CUSTOMER", "ADMIN"), cancel);
// simulador para ver si funciona el envio//

router.post(
  "/:orderId/dev-confirm-payment",
  protect,
  authorize("ADMIN"),
  devConfirmPayment,
);

export default router;
