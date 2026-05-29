import { Request, Response } from "express";
import { generateFinancialReport } from "./report.service";
import { generateFinancialPDF } from "./report.pdf";
import { generateFinancialExcel } from "./report.excel";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { createAuditLog } from "../../services/audit.service";

export const financialReport = async (req: AuthRequest, res: Response) => {
  try {
    const report = await generateFinancialReport({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });

    res.json(report);
    await createAuditLog({
      userId: req.user?.id,
      action: "REPORT_VIEW",
      entity: "REPORT",
      entityId: "financial",
      description: "Reporte financiero consultado",
      ip: req.ip,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const financialReportPDF = async (req: AuthRequest, res: Response) => {
  try {
    const report = await generateFinancialReport({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });

    const pdfBuffer = await generateFinancialPDF(report);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=financial-report.pdf",
    );

    res.send(pdfBuffer);
    await createAuditLog({
      userId: req.user?.id,
      action: "REPORT_DOWNLOAD_PDF",
      entity: "REPORT",
      entityId: "financial",
      description: "Reporte financiero PDF descargado",
      ip: req.ip,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const financialReportExcel = async (req: AuthRequest, res: Response) => {
  try {
    const report = await generateFinancialReport({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });

    const excelBuffer = await generateFinancialExcel(report);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=financial-report.xlsx",
    );

    res.send(excelBuffer);
    await createAuditLog({
      userId: req.user?.id,
      action: "REPORT_DOWNLOAD_EXCEL",
      entity: "REPORT",
      entityId: "financial",
      description: "Reporte financiero Excel descargado",
      ip: req.ip,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
