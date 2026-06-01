import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";
import {
  adminShipments,
  createShipment,
  customerShipments,
  sellerShipments,
  updateStatus,
} from "./shipment.controller";

const router = Router();

router.use(protect);

router.get("/admin", authorize("ADMIN"), adminShipments);
router.get(
  "/customer/:customerId",
  authorize("CUSTOMER", "ADMIN"),
  allowSelfOrAdmin("customerId"),
  customerShipments,
);
router.get(
  "/seller/:sellerId",
  authorize("SELLER", "ADMIN"),
  allowSelfOrAdmin("sellerId"),
  sellerShipments,
);
router.post(
  "/order/:orderId",
  authorize("SELLER", "ADMIN"),
  createShipment,
);
router.patch(
  "/:shipmentId/status",
  authorize("SELLER", "ADMIN"),
  updateStatus,
);

export default router;
