import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import {
  createProductReviewController,
  getProductReviewsController,
} from "../controllers/review/ReviewController";

const router = Router();

router.get("/products/:productId", getProductReviewsController);

router.use(protect);

router.post(
  "/products/:productId",
  authorize("CUSTOMER", "ADMIN"),
  createProductReviewController,
);
export default router;
