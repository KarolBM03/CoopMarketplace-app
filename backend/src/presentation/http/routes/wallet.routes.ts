import { Router } from "express";
import { WalletControllerV2 } from "../controllers/wallet/WalletControllerV2";
import { protect } from "../middlewares/auth.middleware";
import { allowSelfOrAdmin } from "../middlewares/ownership.middleware";

const router = Router();
const controller = new WalletControllerV2();

router.use(protect);
router.get("/me", controller.getMyWallet);
router.get("/:userId", allowSelfOrAdmin("userId"), controller.getByUser);
router.post("/recharge", controller.recharge);

export default router;



