import prisma from "../../config/prisma";
import { FinancingStatus } from "@prisma/client";
import { createNotification } from "../../services/notification.service";
import { createTransaction } from "../../services/transaction.service";
import { createLedgerEntry } from "../../services/ledger.service";
import { disburseLoan } from "../cooperative/cooperative.service";
import { createAuditLog } from "../../services/audit.service";
import { createWallet } from "../../services/wallet.service";

interface FinancingData {
  customerId: string;
  cedula?: string;
  income?: number;
  company?: string;
  phone?: string;
  address?: string;
  productId: string;
  downPayment: number;
  months: number;
}

export const createFinancing = async ({
  customerId,
  cedula,
  income,
  company,
  phone,
  address,
  productId,
  downPayment,
  months,
}: FinancingData) => {
  if (!customerId) {
    throw new Error("Cliente requerido");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  if (!product.isFinanced) {
    throw new Error("Este producto no permite financiamiento");
  }

  const remainingDebt = product.price - downPayment;
  const monthlyPayment = remainingDebt / months;

  const financing = await prisma.financing.create({
    data: {
      customerId,
      cedula,
      income,
      company,
      phone,
      address,
      productId,
      totalAmount: product.price,
      downPayment,
      remainingDebt,
      months,
      monthlyPayment,
      status: FinancingStatus.PENDING,
    },
    include: {
      product: true,
    },
  });

  await createAuditLog({
    userId: customerId,
    action: "FINANCING_REQUEST",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Solicitud de financiamiento creada",
    metadata: { productId, downPayment, months },
  });

  return financing;
};

export const getCustomerFinancing = async (customerId: string) => {
  return await prisma.financing.findMany({
    where: {
      customerId,
    },
    include: {
      product: true,
      installments: {
        orderBy: {
          number: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAdminFinancings = async (page = 1, limit = 10) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;

  const [financings, total] = await Promise.all([
    prisma.financing.findMany({
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            sellerId: true,
          },
        },
        installments: {
          orderBy: {
            number: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: safeLimit,
    }),
    prisma.financing.count(),
  ]);

  return {
    financings,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

export const adminApproveFinancing = async (
  financingId: string,
  actorId?: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: {
      id: financingId,
    },
    include: {
      customer: true,
      product: true,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (financing.status !== FinancingStatus.PENDING) {
    throw new Error("Solo puedes aprobar solicitudes pendientes");
  }

  const updatedFinancing = await prisma.financing.update({
    where: {
      id: financingId,
    },
    data: {
      status: FinancingStatus.WAITING_SELLER_APPROVAL,
      approvedAt: new Date(),
      externalStatus: "APPROVED_BY_COOPERATIVE",
    },
    include: {
      customer: true,
      product: true,
      installments: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  await createNotification(
    financing.product.sellerId,
    "Financiamiento aprobado por cooperativa",
    `La cooperativa aprobo el financiamiento de ${financing.customer.fullName} para ${financing.product.title}. Debes aprobarlo para que el cliente pague la inicial.`,
  );

  await createNotification(
    financing.customerId,
    "Solicitud aprobada por cooperativa",
    `La cooperativa aprobo tu solicitud para ${financing.product.title}. Falta la aprobacion del vendedor.`,
  );

  await createAuditLog({
    userId: actorId,
    action: "ADMIN_APPROVE_FINANCING",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Financiamiento aprobado por cooperativa",
    metadata: {
      previousStatus: financing.status,
      nextStatus: updatedFinancing.status,
    },
  });

  return updatedFinancing;
};

export const rejectFinancing = async (
  financingId: string,
  actorId?: string,
  actorRole?: string,
  reason = "Solicitud rechazada",
) => {
  const financing = await prisma.financing.findUnique({
    where: {
      id: financingId,
    },
    include: {
      customer: true,
      product: true,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (actorRole === "SELLER" && financing.product.sellerId !== actorId) {
    throw new Error("No puedes rechazar este financiamiento");
  }

  const updatedFinancing = await prisma.financing.update({
    where: {
      id: financingId,
    },
    data: {
      status: FinancingStatus.REJECTED,
      rejectedAt: new Date(),
      rejectionReason: reason,
      externalStatus:
        actorRole === "ADMIN"
          ? "REJECTED_BY_COOPERATIVE"
          : "REJECTED_BY_SELLER",
    },
    include: {
      customer: true,
      product: true,
    },
  });

  await createNotification(
    financing.customerId,
    "Financiamiento rechazado",
    `Tu solicitud de financiamiento para ${financing.product.title} fue rechazada.`,
  );

  await createAuditLog({
    userId: actorId,
    action:
      actorRole === "ADMIN"
        ? "ADMIN_REJECT_FINANCING"
        : "SELLER_REJECT_FINANCING",
    entity: "FINANCING",
    entityId: financing.id,
    description: reason,
    metadata: {
      previousStatus: financing.status,
      nextStatus: updatedFinancing.status,
    },
  });

  return updatedFinancing;
};

export const getSellerPendingFinancings = async (sellerId: string) => {
  return await prisma.financing.findMany({
    where: {
      status: FinancingStatus.WAITING_SELLER_APPROVAL,
      product: {
        sellerId,
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const approveFinancing = async (
  financingId: string,
  sellerId: string,
  actorId?: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: {
      id: financingId,
    },
    include: {
      customer: true,
      product: true,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (financing.product.sellerId !== sellerId) {
    throw new Error("No puedes aprobar este financiamiento");
  }

  if (financing.status !== FinancingStatus.WAITING_SELLER_APPROVAL) {
    throw new Error("La cooperativa debe aprobar primero esta solicitud");
  }

  const updatedFinancing = await prisma.financing.update({
    where: {
      id: financing.id,
    },
    data: {
      status: FinancingStatus.WAITING_DOWN_PAYMENT,
    },
    include: {
      product: true,
      installments: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  await createNotification(
    financing.customerId,
    "Financiamiento aprobado por vendedor",
    `Tu financiamiento para ${financing.product.title} fue aprobado por el vendedor. Ahora debes pagar la inicial.`,
  );

  await createNotification(
    sellerId,
    "Financiamiento aprobado",
    `Aprobaste el financiamiento de ${financing.customer.fullName} para ${financing.product.title}. Falta que el cliente pague la inicial.`,
  );

  await createAuditLog({
    userId: actorId || sellerId,
    action: "SELLER_APPROVE_FINANCING",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Financiamiento aprobado por vendedor",
    metadata: {
      sellerId,
      previousStatus: financing.status,
      nextStatus: updatedFinancing.status,
    },
  });

  return updatedFinancing;
};

export const payDownPayment = async (
  financingId: string,
  actorId?: string,
  idempotencyKey?: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: {
      id: financingId,
    },
    include: {
      customer: true,
      product: true,
      installments: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (actorId && actorId !== financing.customerId) {
    const actor = await prisma.user.findUnique({ where: { id: actorId } });
    if (actor?.role !== "ADMIN") {
      throw new Error("No puedes pagar la inicial de este financiamiento");
    }
  }

  if (financing.status !== FinancingStatus.WAITING_DOWN_PAYMENT) {
    if (idempotencyKey) {
      const existingTransaction = await prisma.transaction.findUnique({
        where: { idempotencyKey },
      });

      if (existingTransaction && financing.status === FinancingStatus.ACTIVE) {
        return financing;
      }
    }

    throw new Error("Este financiamiento no requiere inicial");
  }

  if (idempotencyKey) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingTransaction) {
      return await prisma.financing.findUnique({
        where: { id: financing.id },
        include: {
          product: true,
          installments: {
            orderBy: {
              number: "asc",
            },
          },
        },
      });
    }
  }

  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: financing.customerId,
    },
  });

  if (!wallet) {
    throw new Error("Wallet no encontrada");
  }

  if (wallet.balance < financing.downPayment) {
    throw new Error("Balance insuficiente para pagar inicial");
  }

  await prisma.wallet.update({
    where: {
      userId: financing.customerId,
    },
    data: {
      balance: {
        decrement: financing.downPayment,
      },
    },
  });

  await createTransaction({
    userId: financing.customerId,
    amount: financing.downPayment,
    type: "PAYMENT",
    status: "SUCCESS",
    reference: financing.id,
    description: "Pago inicial financiamiento",
    idempotencyKey,
  });

  await createLedgerEntry({
    userId: financing.customerId,
    type: "DEBIT",
    amount: financing.downPayment,
    reference: financing.id,
    description: "Pago inicial financiamiento",
  });

  let sellerWallet = await prisma.wallet.findUnique({
    where: {
      userId: financing.product.sellerId,
    },
  });

  if (!sellerWallet) {
    sellerWallet = await createWallet(financing.product.sellerId);
  }

  await prisma.wallet.update({
    where: {
      userId: financing.product.sellerId,
    },
    data: {
      balance: {
        increment: financing.downPayment,
      },
    },
  });

  await createTransaction({
    userId: financing.product.sellerId,
    amount: financing.downPayment,
    type: "DEPOSIT",
    status: "SUCCESS",
    reference: financing.id,
    description: "Inicial recibida por financiamiento",
    idempotencyKey: idempotencyKey ? `${idempotencyKey}-seller` : undefined,
  });

  await createLedgerEntry({
    userId: financing.product.sellerId,
    type: "CREDIT",
    amount: financing.downPayment,
    reference: financing.id,
    description: "Inicial recibida por financiamiento",
  });

  await createNotification(
    financing.customerId,
    "Inicial pagada",
    `Pagaste la inicial de RD$${financing.downPayment.toLocaleString()} para ${financing.product.title}.`,
  );

  await createNotification(
    financing.product.sellerId,
    "El cliente pago la inicial",
    `${financing.customer.fullName} pago la inicial del financiamiento para ${financing.product.title}.`,
  );

  const disbursement = await disburseLoan({
    loanId: financing.id,
    bankAccount: "PENDIENTE_COOPERATIVA",
  });

  const updatedFinancing = await prisma.financing.update({
    where: {
      id: financing.id,
    },
    data: {
      status: FinancingStatus.ACTIVE,
      externalReference: disbursement.transactionReference,
      externalStatus: disbursement.status,
      cooperativeResponse: disbursement,
    },
    include: {
      product: true,
      installments: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  await createAuditLog({
    userId: actorId || financing.customerId,
    action: "PAY_DOWN_PAYMENT",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Inicial pagada y financiamiento activado",
    metadata: {
      amount: financing.downPayment,
      idempotencyKey,
      disbursement,
      sellerId: financing.product.sellerId,
    },
  });

  return updatedFinancing;
};
