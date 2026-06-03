import prisma from "../../../config/prisma";
import { OrderRepository } from "../../../domain/repositories/OrderRepository";

export class CancelOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string) {
    const order: any = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Esta orden no fue encontrada");
    }

    if (order.status === "PAID") {
      throw new Error("No se puede cancelar una orden ya pagada");
    }

    for (const item of order.items || []) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock + item.quantity,
          },
        });
      }
    }

    return await this.orderRepository.update(orderId, {
      status: "CANCELLED",
    });
  }
}
