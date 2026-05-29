import prisma from "../../config/prisma";
import { createWallet } from "../../services/wallet.service";
import { createLedgerEntry } from "../../services/ledger.service";
import { createTransaction } from "../../services/transaction.service";
import { createNotification } from "../../services/notification.service";

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

    const subtotal = product.price * item.quantity;

    totalAmount += subtotal;

    orderItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
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
export const completeOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  if (order.status !== "PAID") {
    throw new Error("Solo puedes completar una orden pagada");
  }

  for (const item of order.items) {
    const sellerId = item.product.sellerId;
    const amount = item.price * item.quantity;

    let sellerWallet = await prisma.wallet.findUnique({
      where: { userId: sellerId },
    });

    if (!sellerWallet) {
      sellerWallet = await createWallet(sellerId);
    }

    await prisma.wallet.update({
      where: { userId: sellerId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    await createLedgerEntry({
      userId: sellerId,
      type: "CREDIT",
      amount,
      reference: order.id,
      description: "Pago recibido por venta",
    });

    await createTransaction({
      userId: sellerId,
      amount,
      type: "DEPOSIT",
      status: "SUCCESS",
      reference: order.id,
      description: "Ingreso por venta completada",
    });

    await createNotification(
      sellerId,
      "Venta completada",
      `Recibiste RD$${amount} por una venta completada`,
    );
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
    },
  });
};

export const updateOrderStatus = async (
  orderId: string,
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED",
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
        status: "COMPLETED",
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
