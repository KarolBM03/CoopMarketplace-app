import { Router } from "express";
import { ServiceController } from "../controllers/servicerequest/ServiceController";

const router = Router();
const controller = new ServiceController();

router.post("/", controller.create);
router.get("/customer/:customerId", controller.myRequests);
router.get("/admin", controller.adminRequests);
router.patch("/:requestId/status", controller.updateStatus);

export default router;
