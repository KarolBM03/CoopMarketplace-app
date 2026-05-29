import { Router } from "express";
import {
  register,
  login,
  verify,
  resend,
  forgot,
  reset,
  me,
  refresh,
} from "./auth.controller";
import { protect } from "../../middlewares/auth.middleware";
import { allowSelfOrAdmin } from "../../middlewares/ownership.middleware";
import {
  authLimiter,
  otpLimiter,
} from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/verify-otp", otpLimiter, verify);
router.post("/resend/otp", otpLimiter, resend);
router.post("/forgot-password", forgot);
router.post("/reset-password", reset);
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Ruta Protegida",
    user: (req as any).user,
  });
});
router.get("/me", protect, me);
router.get("/me/:userId", protect, allowSelfOrAdmin("userId"), me);

export default router;
