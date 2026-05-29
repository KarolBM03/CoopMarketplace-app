import { Router } from "express";
import { getByUser, recharge, getMyWallet } from "./wallet.controller";
import { protect } from "../../middlewares/auth.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";

const router = Router();

router.use(protect);

router.get("/me", getMyWallet);
router.get("/:userId", allowSelfOrAdmin("userId"), getByUser);
router.post("/recharge", recharge);

export default router;
