import { Router } from "express";
import {
  loginController,
  registerController,
  verifyOTPController,
  resendOTPController,
  refreshTokenController,
  forgotPasswordController,
  resetPasswordController,
  approveSellerController,
  rejectSellerController,
  blockUserController,
  unblockUserController,
  meController,
} from "../controllers/AuthController";
import { protect } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../../../middlewares/ownership.middleware";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/verify-otp", verifyOTPController);
router.post("/resend-otp", resendOTPController);
router.post("/refresh-token", refreshTokenController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);
router.patch(
  "/seller/:userId/approve",
  protect,
  authorize("ADMIN"),
  approveSellerController,
);

router.patch(
  "/seller/:userId/reject",
  protect,
  authorize("ADMIN"),
  rejectSellerController,
);

router.patch(
  "/users/:userId/block",
  protect,
  authorize("ADMIN"),
  blockUserController,
);

router.patch(
  "/users/:userId/unblock",
  protect,
  authorize("ADMIN"),
  unblockUserController,
);
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Ruta Protegida",
    user: (req as any).user,
  });
});

router.get("/me", protect, meController);
router.get("/me/:userId", protect, allowSelfOrAdmin("userId"), meController);

export default router;
