import { OrderRepository } from "../../../domain/repositories/OrderRepository";

export class GetOrdersByCustomerUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(customerId: string) {
    if (!customerId) {
      throw new Error("Cliente requerido");
    }

    return await this.orderRepository.findByCustomer(customerId);
  }
}



