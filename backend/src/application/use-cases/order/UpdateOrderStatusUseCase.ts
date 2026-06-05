import { OrderRepository } from "../../../domain/repositories/OrderRepository";

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string, status: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Esta orden no fue encontrada");
    }

    return await this.orderRepository.update(orderId, {
      status,
    });
  }
}



