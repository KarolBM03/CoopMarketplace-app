import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import prisma from "../../../infrastructure/database/prisma";
import { createShipmentsForPaidOrder } from "../../../infrastructure/external-services/shipment.service";

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string, status: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Esta orden no fue encontrada");
    }

    const updatedOrder = await this.orderRepository.update(orderId, {
      status,
    });

    if (status === "PAID") {
      await createShipmentsForPaidOrder({ orderId });

      for (const item of ((order as any).items || [])) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            salesCount: {
              increment: item.quantity,
            },
            rankingScore: {
              increment: item.quantity * 3,
            },
          },
        });
      }
    }

    return updatedOrder;
  }
}



