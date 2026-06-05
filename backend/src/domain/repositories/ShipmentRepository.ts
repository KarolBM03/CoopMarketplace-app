export interface ShipmentRepository {
  createForOrder(data: any): Promise<any>;
  updateStatus(data: any): Promise<any>;
  findByCustomer(customerId: string): Promise<any>;
  findBySeller(sellerId: string): Promise<any>;
  findForAdmin(): Promise<any>;
}



