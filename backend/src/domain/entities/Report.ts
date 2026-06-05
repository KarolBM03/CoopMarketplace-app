export interface FinancialReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totals: {
    payments: number;
    deposits: number;
    financingTotal: number;
  };
  counts: {
    transactions: number;
    financings: number;
    fraudAlerts: number;
  };
}



