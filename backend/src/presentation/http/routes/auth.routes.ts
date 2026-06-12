import { Router } from "express";
import { AuthControllerV2 } from "../controllers/auth/AuthControllerV2";
import {
  forgotPasswordSchema,
  loginUserSchema,
  refreshTokenSchema,
  registerUserSchema,
  resendOTPSchema,
  resetPasswordSchema,
  verifyOTPSchema,
} from "../../../application/validators/auth/auth.validators";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { allowSelfOrAdmin } from "../middlewares/ownership.middleware";
import { validateBody } from "../middlewares/validateRequest";
import { authLimiter, otpLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();
const authController = new AuthControllerV2();

router.post(
  "/register",
  authLimiter,
  validateBody(registerUserSchema),
  authController.register,
);
router.post("/login", authLimiter, validateBody(loginUserSchema), authController.login);
router.post(
  "/verify-otp",
  otpLimiter,
  validateBody(verifyOTPSchema),
  authController.verifyOTP,
);
router.post(
  "/resend-otp",
  otpLimiter,
  validateBody(resendOTPSchema),
  authController.resendOTP,
);
router.post(
  "/resend/otp",
  otpLimiter,
  validateBody(resendOTPSchema),
  authController.resendOTP,
);
router.post(
  "/refresh-token",
  validateBody(refreshTokenSchema),
  authController.refreshToken,
);
router.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  authController.refreshToken,
);
router.post(
  "/forgot-password",
  authLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password/:token",
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

router.patch(
  "/seller/:userId/approve",
  protect,
  authorize("ADMIN"),
  authController.approveSeller,
);

router.patch(
  "/seller/:userId/reject",
  protect,
  authorize("ADMIN"),
  authController.rejectSeller,
);

router.patch(
  "/users/:userId/block",
  protect,
  authorize("ADMIN"),
  authController.blockUser,
);

router.patch(
  "/users/:userId/unblock",
  protect,
  authorize("ADMIN"),
  authController.unblockUser,
);

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Ruta Protegida",
    user: (req as any).user,
  });
});

router.get("/me", protect, authController.me);
router.get(
  "/me/:userId",
  protect,
  allowSelfOrAdmin("userId"),
  authController.me,
);

export default router;
