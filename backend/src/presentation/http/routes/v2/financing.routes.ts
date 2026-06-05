import { Router } from "express";
import { FinancingControllerV2 } from "../../controllers/financing/FinancingControllerV2";
import { financingLimiter } from "../../middlewares/rateLimit.middleware";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";

const router = Router();
const controller = new FinancingControllerV2();

router.post("/cooperative/:financingId/confirm-payment", controller.confirmPayment);
router.use(protect);
router.post("/", financingLimiter, authorize("CUSTOMER", "ADMIN"), controller.create);
router.get("/customer/:customerId", allowSelfOrAdmin("customerId"), controller.getByCustomer);
router.get("/admin", authorize("ADMIN"), controller.adminFinancings);
router.patch("/:financingId/cooperative-approve", authorize("ADMIN"), controller.cooperativeApprove);
router.patch("/:financingId/cooperative-reject", authorize("ADMIN"), controller.cooperativeReject);
router.patch("/:financingId/counter-offer", authorize("ADMIN"), controller.counterOffer);
router.patch("/:financingId/accept-offer", authorize("CUSTOMER", "ADMIN"), controller.acceptOffer);
router.get("/:financingId/payment-link", authorize("CUSTOMER", "ADMIN"), controller.paymentLink);

export default router;



