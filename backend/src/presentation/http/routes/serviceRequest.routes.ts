import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { ServiceController } from "../controllers/servicerequest/ServiceController";

const router = Router();
const controller = new ServiceController();

router.use(protect);
router.post("/", authorize("CUSTOMER", "ADMIN"), controller.create);
router.get(
  "/customer/:customerId",
  authorize("CUSTOMER", "ADMIN"),
  controller.myRequests,
);
router.get("/admin", authorize("ADMIN"), controller.adminRequests);
router.patch("/:requestId/status", authorize("ADMIN"), controller.updateStatus);

export default router;
