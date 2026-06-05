import { Router } from "express";
import { ReportControllerV2 } from "../../controllers/report/ReportControllerV2";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();
const controller = new ReportControllerV2();

router.use(protect);
router.use(authorize("ADMIN"));
router.get("/financial", controller.financialReport);
router.get("/financial/pdf", controller.financialReportPDF);
router.get("/financial/excel", controller.financialReportExcel);

export default router;



