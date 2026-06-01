import prisma from "../../config/prisma";
import { createNotification } from "../../services/notification.service";
import { createAuditLog } from "../../services/audit.service";
import { createPaymentLink } from "../cooperative/cooperative.service";

interface OrderItemData {
  productId: string;
  quantity: number;
}

interface CreateOrderData {
  customerId: string;
  items: OrderItemData[];
}

export const createOrder = async ({ customerId, items }: CreateOrderData) => {
  if (!customerId) {
    throw new Error("Cliente requerido");
  }

  if (!items?.length) {
    throw new Error("La orden debe tener productos");
  }

  let totalAmount = 0;

  const orderItemsData = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    if (product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${product.title}`);
    }

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        stock: product.stock - item.quantity,
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

  const order = await prisma.order.create({
    data: {
      customerId,
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
};

export const getOrderCooperativePaymentLink = async (orderId: string, actorId?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  if (actorId && order.customerId !== actorId) {
    const actor = await prisma.user.findUnique({ where: { id: actorId } });
    if (actor?.role !== "ADMIN") {
      throw new Error("No puedes pagar esta orden");
    }
  }

  if (order.status !== "PENDING") {
    throw new Error("La orden no esta pendiente de pago");
  }

  const paymentLink = await createPaymentLink({
    reference: order.id,
    type: "ORDER",
    amount: Number(order.totalAmount),
    currency: order.currency,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      externalPaymentId: paymentLink.externalPaymentId,
      externalStatus: paymentLink.status || "PAYMENT_LINK_CREATED",
      cooperativeResponse: paymentLink,
    },
  });

  await createAuditLog({
    userId: actorId || order.customerId,
    action: "ORDER_PAYMENT_LINK_CREATED",
    entity: "ORDER",
    entityId: order.id,
    description: "Link de pago creado en CoopHispanica",
    metadata: paymentLink,
  });

  return paymentLink;
};

export const confirmCooperativeOrderPayment = async ({
  orderId,
  externalReference,
  cooperativeResponse,
}: {
  orderId: string;
  externalReference?: string;
  cooperativeResponse?: unknown;
}) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      shipments: true,
    },
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  if (order.status === "PAID" || order.status === "COMPLETED") {
    return order;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      externalReference,
      externalStatus: "PAYMENT_CONFIRMED",
      cooperativeResponse: cooperativeResponse as any,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  await createNotification(
    order.customerId,
    "Orden pagada",
    `CoopHispanica confirmo el pago de tu orden RD$${Number(order.totalAmount).toLocaleString()}.`,
  );

  const sellerIds = new Set(order.items.map((item) => item.product.sellerId));

  for (const sellerId of sellerIds) {
    await prisma.shipment.upsert({
      where: {
        id:
          order.shipments?.find((shipment) => shipment.sellerId === sellerId)
            ?.id || `${order.id}-${sellerId}`,
      },
      create: {
        id: `${order.id}-${sellerId}`,
        orderId: order.id,
        sellerId,
        customerId: order.customerId,
        status: "PENDING_PREPARATION",
      },
      update: {},
    });

    await createNotification(
      sellerId,
      "Nueva orden pagada",
      "CoopHispanica confirmo un pago. Puedes preparar y enviar el producto.",
    );
  }

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        salesCount: { increment: item.quantity },
        rankingScore: { increment: item.quantity * 2 },
      },
    });
  }

  await createAuditLog({
    userId: order.customerId,
    action: "ORDER_PAYMENT_CONFIRMED",
    entity: "ORDER",
    entityId: order.id,
    description: "Pago de orden confirmado por CoopHispanica",
    metadata: { externalReference, cooperativeResponse } as any,
  });

  return updatedOrder;
};

export const updateOrderStatus = async (
  orderId: string,
  status: "PENDING" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "COMPLETED",
) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
  });
};

export const cancelOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  // VALIDAR SI YA ESTÁ PAGADA

  if (order.status === "PAID") {
    throw new Error("No puedes cancelar una orden pagada");
  }

  // DEVOLVER INVENTARIO

  for (const item of order.items) {
    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    if (product) {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          stock: product.stock + item.quantity,
        },
      });
    }
  }

  // CANCELAR ORDEN

  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "CANCELLED",
    },
  });
};

export const getOrdersByCustomer = async (customerId: string) => {
  return await prisma.order.findMany({
    where: {
      customerId,
    },
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
  });
};

export const getSellerSales = async (sellerId: string) => {
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
};
