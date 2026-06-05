import { Router } from "express";
import { TransactionControllerV2 } from "../controllers/transaction/TransactionControllerV2";
import { protect } from "../middlewares/auth.middleware";
import { allowSelfOrAdmin } from "../middlewares/ownership.middleware";

const router = Router();
const controller = new TransactionControllerV2();

router.get(
  "/user/:userId",
  protect,
  allowSelfOrAdmin("userId"),
  controller.getByUser,
);

export default router;
