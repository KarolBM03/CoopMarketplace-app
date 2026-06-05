import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../middlewares/ownership.middleware";
import { ShipmentControllerV2 } from "../controllers/shipment/ShipmentControllerV2";

const router = Router();
const controller = new ShipmentControllerV2();

router.use(protect);
router.get("/admin", authorize("ADMIN"), controller.adminShipments);
router.get(
  "/customer/:customerId",
  authorize("CUSTOMER", "ADMIN"),
  allowSelfOrAdmin("customerId"),
  controller.customerShipments,
);
router.get(
  "/seller/me",
  authorize("SELLER", "ADMIN"),
  controller.sellerShipments,
);
router.post(
  "/order/:orderId",
  authorize("SELLER", "ADMIN"),
  controller.createShipment,
);
router.patch(
  "/:shipmentId/status",
  authorize("SELLER", "ADMIN"),
  controller.updateStatus,
);
router.patch(
  "/:shipmentId/tracking/start",
  authorize("SELLER", "ADMIN"),
  controller.startTracking,
);
router.patch(
  "/:shipmentId/tracking/location",
  authorize("SELLER", "ADMIN"),
  controller.updateLocation,
);
router.patch(
  "/:shipmentId/tracking/stop",
  authorize("SELLER", "ADMIN"),
  controller.stopTracking,
);

export default router;
