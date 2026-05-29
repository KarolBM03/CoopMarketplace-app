import prisma from "../../config/prisma";
import { createLedgerEntry } from "../../services/ledger.service";
import { createNotification } from "../../services/notification.service";
import { createAuditLog } from "../../services/audit.service";
import { detectFraud } from "../../services/fraud.service";

interface PaymentData {
  orderId: string;
  amount: number;
  idempotencyKey?: string;
  actorId?: string;
  actorRole?: string;
}

export const processPayment = async ({
  orderId,
  amount,
  idempotencyKey,
  actorId,
  actorRole,
}: PaymentData) => {
  const paymentAmount = Number(amount);

  const updatedOrder = await prisma.$transaction(async (tx) => {
    if (idempotencyKey) {
      const existingTransaction = await tx.transaction.findUnique({
        where: {
          idempotencyKey,
        },
      });

      if (existingTransaction) {
        const existingOrder = await tx.order.findUnique({
          where: {
            id: existingTransaction.reference || orderId,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        return existingOrder || existingTransaction;
      }
    }

    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },
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

    if (actorRole !== "ADMIN" && actorId !== order.customerId) {
      throw new Error("No puedes pagar esta orden");
    }

    if (order.status !== "PENDING") {
      throw new Error("La orden no puede ser pagada");
    }

    if (Math.abs(paymentAmount - order.totalAmount) > 0.01) {
      throw new Error("Monto incorrecto");
    }

    const customerWallet = await tx.wallet.upsert({
      where: {
        userId: order.customerId,
      },
      update: {},
      create: {
        userId: order.customerId,
      },
    });

    if (customerWallet.balance < paymentAmount) {
      throw new Error("Fondos insuficientes");
    }

    await tx.wallet.update({
      where: {
        userId: order.customerId,
      },
      data: {
        balance: {
          decrement: paymentAmount,
        },
      },
    });

    await tx.ledgerEntry.create({
      data: {
        userId: order.customerId,
        type: "DEBIT",
        amount: paymentAmount,
        reference: order.id,
        description: "Pago de orden",
      },
    });

    await tx.transaction.create({
      data: {
        userId: order.customerId,
        amount: paymentAmount,
        type: "PAYMENT",
        status: "SUCCESS",
        reference: order.id,
        description: "Pago de orden",
        idempotencyKey,
      },
    });

    for (const item of order.items) {
      const sellerId = item.product.sellerId;
      const sellerAmount = item.price * item.quantity;

      await tx.wallet.upsert({
        where: {
          userId: sellerId,
        },
        update: {
          balance: {
            increment: sellerAmount,
          },
        },
        create: {
          userId: sellerId,
          balance: sellerAmount,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          userId: sellerId,
          type: "CREDIT",
          amount: sellerAmount,
          reference: order.id,
          description: "Pago recibido por venta",
        },
      });

      await tx.transaction.create({
        data: {
          userId: sellerId,
          amount: sellerAmount,
          type: "DEPOSIT",
          status: "SUCCESS",
          reference: order.id,
          description: "Ingreso por venta completada",
        },
      });

      await tx.notification.create({
        data: {
          userId: sellerId,
          title: "Venta completada",
          message: `Recibiste RD$${sellerAmount} por una venta completada`,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: order.customerId,
        action: "PAYMENT",
        entity: "ORDER",
        entityId: order.id,
        description: `Pago procesado por RD$${paymentAmount}`,
        metadata: {
          amount: paymentAmount,
          idempotencyKey,
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: order.customerId,
        title: "Pago realizado",
        message: `Tu pago de RD$${paymentAmount} fue procesado correctamente`,
      },
    });

    return await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "COMPLETED",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  try {
    const fraudUserId =
      "customerId" in updatedOrder
        ? updatedOrder.customerId
        : "userId" in updatedOrder
          ? updatedOrder.userId
          : actorId;

    if (fraudUserId) {
      await detectFraud(fraudUserId, paymentAmount);
    }
  } catch (error) {
    console.error("No se pudo evaluar fraude del pago:", error);
  }

  return updatedOrder;
};

interface PaymentCallbackData {
  reference: string;

  status: "SUCCESS" | "FAILED" | "PENDING";

  providerReference?: string;
  idempotencyKey?: string;
}

export const handlePaymentCallback = async ({
  reference,
  status,
  providerReference,
  idempotencyKey,
}: PaymentCallbackData) => {
  if (idempotencyKey) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingTransaction?.status === status) {
      return existingTransaction;
    }
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      reference,
      type: "PAYMENT",
    },
  });

  if (!transaction) {
    throw new Error("Transacción no encontrada");
  }

  if (transaction.status === "SUCCESS") {
    return transaction;
  }

  if (providerReference) {
    const existingCallback = await prisma.transaction.findFirst({
      where: {
        providerReference,
      },
    });

    if (existingCallback && existingCallback.status === "SUCCESS") {
      return existingCallback;
    }
  }

  const updatedTransaction = await prisma.transaction.update({
    where: {
      id: transaction.id,
    },
    data: {
      status,
      providerReference,
    },
  });

  if (status === "FAILED") {
    await createNotification(
      transaction.userId,
      "Pago fallido",
      "Tu pago no pudo ser procesado",
    );

    await createAuditLog({
      userId: transaction.userId,
      action: "PAYMENT_FAILED",
      entity: "TRANSACTION",
      entityId: transaction.id,
      description: "Pago fallido desde callback",
    });

    return updatedTransaction;
  }

  if (status === "SUCCESS") {
    const order = await prisma.order.findFirst({
      where: {
        id: reference,
      },
    });

    if (order) {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PAID",
        },
      });
    }

    await createLedgerEntry({
      userId: transaction.userId,
      type: "DEBIT",
      amount: transaction.amount,
      reference,
      description: "Pago confirmado por callback",
    });

    await createNotification(
      transaction.userId,
      "Pago confirmado",
      `Tu pago de RD$${transaction.amount} fue confirmado`,
    );

    await createAuditLog({
      userId: transaction.userId,
      action: "PAYMENT_CONFIRMED",
      entity: "TRANSACTION",
      entityId: transaction.id,
      description: "Pago confirmado desde callback",
    });
  }

  return updatedTransaction;
};

export const retryFailedPayment = async (
  transactionId: string,
  actorId?: string,
  actorRole?: string,
) => {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
  });

  if (!transaction) {
    throw new Error("Transacción no encontrada");
  }

  if (actorRole !== "ADMIN" && actorId !== transaction.userId) {
    throw new Error("No puedes reintentar este pago");
  }

  if (transaction.status !== "FAILED") {
    throw new Error("Solo se pueden reintentar pagos fallidos");
  }

  // REINTENTAR PAGO

  const updatedTransaction = await prisma.transaction.update({
    where: {
      id: transaction.id,
    },
    data: {
      status: "PENDING",
    },
  });

  await createNotification(
    transaction.userId,
    "Reintentando pago",
    "Tu pago será procesado nuevamente",
  );

  await createAuditLog({
    userId: transaction.userId,
    action: "PAYMENT_RETRY",
    entity: "TRANSACTION",
    entityId: transaction.id,
    description: "Reintento de pago",
  });

  return updatedTransaction;
};
