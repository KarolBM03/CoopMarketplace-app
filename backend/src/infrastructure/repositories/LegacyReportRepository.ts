import { ReportRepository } from "../../domain/repositories/ReportRepository";
import { generateFinancialExcel } from "../external-services/report.excel";
import { generateFinancialPDF } from "../external-services/report.pdf";
import { generateFinancialReport } from "../external-services/report.service";

export class LegacyReportRepository implements ReportRepository {
  generateFinancialReport(filters: { startDate?: string; endDate?: string }) {
    return generateFinancialReport(filters);
  }

  generateFinancialPDF(report: any) {
    return generateFinancialPDF(report);
  }

  generateFinancialExcel(report: any) {
    return generateFinancialExcel(report);
  }
}



