import { OrderRepository } from "../../../domain/repositories/OrderRepository";

export class GetSellerSalesUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(sellerId: string) {
    if (!sellerId) {
      throw new Error("Vendedor requerido");
    }

    return await this.orderRepository.getSellerSales(sellerId);
  }
}
