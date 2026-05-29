import { Router } from "express";

import {
  create,
  getAll,
  search,
  update,
  remove,
  getById,
  getSeller,
} from "./product.controller";

import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", getAll);
router.get("/search", search);
router.get("/seller/:sellerId", getSeller);
router.get("/:id", getById);
router.post("/", protect, authorize("SELLER", "ADMIN"), create);
router.patch("/:id", protect, authorize("SELLER", "ADMIN"), update);
router.delete("/:id", protect, authorize("SELLER", "ADMIN"), remove);

export default router;
