import { Order } from "../entities/Order";

export interface OrderRepository {
  create(data: any): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
  update(id: string, data: Partial<Order>): Promise<Order>;
  delete(id: string): Promise<void>;
  getSellerSales(sellerId: string): Promise<any[]>;
}



