import prisma from "../../../infrastructure/database/prisma";
import { OrderRepository } from "../../../domain/repositories/OrderRepository";

interface OrderItemData {
  productId: string;
  quantity: number;
}

export class CreateOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(data: { customerId: string; items: OrderItemData[] }) {
    if (!data.customerId) {
      throw new Error("Cliente requerido");
    }

    if (!data.items?.length) {
      throw new Error("La orden debe tener productos");
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: {
          id: item.productId,
        },
      });

      if (!product) {
        throw new Error("Este producto no fue encontrado");
      }

      if (product.stock < item.quantity) {
        throw new Error(`Unidades insuficiente para ${product.title}`);
      }

      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          stock: product.stock - item.quantity,
          rankingScore: {
            increment: 0.5,
          },
        },
      });

      const subtotal = Number(product.price) * item.quantity;

      totalAmount += subtotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: Number(product.price),
      });
    }

    const order = await this.orderRepository.create({
      data: {
        customerId: data.customerId,
        totalAmount,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  }
}



