import prisma from "../database/prisma";
import { Order } from "../../domain/entities/Order";
import { OrderRepository } from "../../domain/repositories/OrderRepository";

export class PrismaOrderRepository implements OrderRepository {
  async create(data: any): Promise<Order> {
    return (await prisma.order.create(data)) as Order;
  }

  async findById(id: string): Promise<Order | null> {
    return (await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })) as any;
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return (await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as any;
  }

  async update(id: string, data: Partial<Order>): Promise<Order> {
    return (await prisma.order.update({
      where: { id },
      data: data as any,
    })) as Order;
  }

  async delete(id: string): Promise<void> {
    await prisma.order.delete({
      where: { id },
    });
  }

  async getSellerSales(sellerId: string) {
    return await prisma.orderItem.findMany({
      where: {
        order: {
          status: {
            in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED", "COMPLETED"],
          },
        },
        product: {
          sellerId,
        },
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
        product: true,
      },
      orderBy: {
        order: {
          createdAt: "desc",
        },
      },
    });
  }
}



