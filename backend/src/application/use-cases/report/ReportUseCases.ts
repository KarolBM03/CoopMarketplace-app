import { ReportRepository } from "../../../domain/repositories/ReportRepository";

export class GetFinancialReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  execute(filters: { startDate?: string; endDate?: string }) {
    return this.reportRepository.generateFinancialReport(filters);
  }
}

export class GetFinancialReportPDFUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(filters: { startDate?: string; endDate?: string }) {
    const report = await this.reportRepository.generateFinancialReport(filters);
    return this.reportRepository.generateFinancialPDF(report);
  }
}

export class GetFinancialReportExcelUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(filters: { startDate?: string; endDate?: string }) {
    const report = await this.reportRepository.generateFinancialReport(filters);
    return this.reportRepository.generateFinancialExcel(report);
  }
}



