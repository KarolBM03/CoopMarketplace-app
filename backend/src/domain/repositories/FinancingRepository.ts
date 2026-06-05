export interface FinancingRepository {
  create(data: any): Promise<any>;
  findByCustomer(customerId: string): Promise<any>;
  findForAdmin(page: number, limit: number): Promise<any>;
  approveByCooperative(financingId: string, actorId?: string): Promise<any>;
  rejectByCooperative(financingId: string, actorId?: string, reason?: string): Promise<any>;
  createCounterOffer(financingId: string, data: any, actorId?: string): Promise<any>;
  acceptCounterOffer(financingId: string, actorId?: string): Promise<any>;
  getPaymentLink(financingId: string): Promise<any>;
  confirmPayment(data: any): Promise<any>;
}



