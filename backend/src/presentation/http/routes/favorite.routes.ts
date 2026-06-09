import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import {
  addFavoriteController,
  getMyFavoritesController,
  removeFavoriteController,
} from "../controllers/FavoriteController";

const router = Router();

router.use(protect);
router.use(authorize("CUSTOMER", "ADMIN"));

router.post("/:productId", addFavoriteController);
router.get("/me", getMyFavoritesController);
router.delete("/:productId", removeFavoriteController);

export default router;
