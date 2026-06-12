import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { ServiceController } from "../controllers/servicerequest/ServiceController";

const router = Router();
const controller = new ServiceController();

router.use(protect);
router.get("/catalog", controller.catalog);
router.post("/", authorize("CUSTOMER", "SELLER", "ADMIN"), controller.create);
router.post(
  "/provider/offerings",
  authorize("SERVICE_PROVIDER", "ADMIN"),
  controller.createOffering,
);
router.get(
  "/provider/offerings",
  authorize("SERVICE_PROVIDER", "ADMIN"),
  controller.providerOfferings,
);
router.patch(
  "/provider/offerings/:offeringId",
  authorize("SERVICE_PROVIDER", "ADMIN"),
  controller.updateOffering,
);
router.get(
  "/provider/requests",
  authorize("SERVICE_PROVIDER", "ADMIN"),
  controller.providerRequests,
);
router.post(
  "/provider/requests/:requestId/accept",
  authorize("SERVICE_PROVIDER", "ADMIN"),
  controller.acceptRequest,
);
router.patch(
  "/provider/requests/:requestId/status",
  authorize("SERVICE_PROVIDER", "ADMIN"),
  controller.updateProviderRequestStatus,
);
router.get(
  "/customer/:customerId",
  controller.myRequests,
);
router.get("/admin", authorize("ADMIN"), controller.adminRequests);
router.patch("/:requestId/status", authorize("ADMIN"), controller.updateStatus);

export default router;
