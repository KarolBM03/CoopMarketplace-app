import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import {
  createProductController,
  deleteProductController,
  getProductByIdController,
  getProductsController,
  getSellerProductsController,
  updateProductController,
} from "../controllers/ProductController";

const router = Router();

router.get("/", getProductsController);
router.post(
  "/",
  protect,
  authorize("SELLER", "ADMIN"),
  createProductController,
);
router.get(
  "/seller/my-products",
  protect,
  authorize("SELLER", "ADMIN"),
  getSellerProductsController,
);
router.get(
  "/seller/:sellerId",
  protect,
  authorize("ADMIN"),
  getSellerProductsController,
);
router.patch(
  "/:productId",
  protect,
  authorize("SELLER", "ADMIN"),
  updateProductController,
);
router.delete(
  "/:productId",
  protect,
  authorize("SELLER", "ADMIN"),
  deleteProductController,
);
router.get("/:productId", getProductByIdController);

export default router;
