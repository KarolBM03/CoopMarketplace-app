import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { createPaymentLink } from "../../../infrastructure/external-services/cooperative.service";

export class GetOrderPaymentLinkUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Orden no encontrada");
    }

    return createPaymentLink({
      reference: order.id,
      type: "ORDER",
      amount: Number(order.totalAmount),
      currency: order.currency || "DOP",
    });
  }
}
