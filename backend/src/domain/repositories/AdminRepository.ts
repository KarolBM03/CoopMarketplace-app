export interface AdminRepository {
  getMetrics(): Promise<any>;
  getFinancialReport(): Promise<any>;
  getFraudAlerts(): Promise<any>;
  getUsers(): Promise<any>;
  getTopProducts(): Promise<any>;
  getTopSellers(): Promise<any>;
  getSalesChart(): Promise<any>;
  getFinancingChart(): Promise<any>;
  blockUser(userId: string, actorId?: string): Promise<any>;
  unblockUser(userId: string, actorId?: string): Promise<any>;
  approveSeller(userId: string, actorId?: string): Promise<any>;
  rejectSeller(userId: string, actorId?: string): Promise<any>;
  resolveFraudAlert(alertId: string): Promise<any>;
  getSellers(): Promise<any>;
}
