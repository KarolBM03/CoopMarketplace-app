import { Router } from "express";
import { loanQueue, payoutQueue, retryJobs } from "./queue.controller";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.use(protect);
router.use(authorize("ADMIN"));

router.post("/payouts/process", payoutQueue);
router.post("/loans/process", loanQueue);
router.post("/retry-failed", retryJobs);

export default router;
