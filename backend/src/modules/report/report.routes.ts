import { Router } from "express";
import {
  financialReport,
  financialReportPDF,
  financialReportExcel,
} from "./report.controller";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.use(protect);
router.use(authorize("ADMIN"));
router.get("/financial", financialReport);
router.get("/financial/pdf", financialReportPDF);
router.get("/financial/excel", financialReportExcel);

export default router;
