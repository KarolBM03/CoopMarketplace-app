export interface ReportRepository {
  generateFinancialReport(filters: { startDate?: string; endDate?: string }): Promise<any>;
  generateFinancialPDF(report: any): Promise<Buffer>;
  generateFinancialExcel(report: any): Promise<Buffer>;
}



