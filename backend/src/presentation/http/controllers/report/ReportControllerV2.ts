import { Response } from "express";
import {
  GetFinancialReportExcelUseCase,
  GetFinancialReportPDFUseCase,
  GetFinancialReportUseCase,
} from "../../../../application/use-cases/report/ReportUseCases";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { LegacyReportRepository } from "../../../../infrastructure/repositories/LegacyReportRepository";
import { createAuditLog } from "../../../../infrastructure/external-services/audit.service";
import { handleControllerError } from "../../../../shared/utils/controllerError";

export class ReportControllerV2 {
  constructor(private readonly reportRepository = new LegacyReportRepository()) {}

  financialReport = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetFinancialReportUseCase(this.reportRepository);
      const report = await useCase.execute({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      res.json(report);
      await this.audit(req, "REPORT_VIEW", "Reporte financiero consultado");
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  financialReportPDF = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetFinancialReportPDFUseCase(this.reportRepository);
      const pdfBuffer = await useCase.execute({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=financial-report.pdf");
      res.send(pdfBuffer);
      await this.audit(req, "REPORT_DOWNLOAD_PDF", "Reporte financiero PDF descargado");
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  financialReportExcel = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetFinancialReportExcelUseCase(this.reportRepository);
      const excelBuffer = await useCase.execute({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=financial-report.xlsx");
      res.send(excelBuffer);
      await this.audit(req, "REPORT_DOWNLOAD_EXCEL", "Reporte financiero Excel descargado");
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  private audit(req: AuthRequest, action: string, description: string) {
    return createAuditLog({
      userId: req.user?.id,
      action,
      entity: "REPORT",
      entityId: "financial",
      description,
      ip: req.ip,
    });
  }
}



