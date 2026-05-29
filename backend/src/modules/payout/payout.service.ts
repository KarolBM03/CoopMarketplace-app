import prisma from "../../config/prisma";
import { createLedgerEntry } from "../../services/ledger.service";
import { createTransaction } from "../../services/transaction.service";
import { createNotification } from "../../services/notification.service";
import { createAuditLog } from "../../services/audit.service";

export const requestPayout = async (
  sellerId: string,
  amount: number,
  idempotencyKey?: string,
) => {
  if (!sellerId) {
    throw new Error("Vendedor requerido");
  }

  if (idempotencyKey) {
    const existingPayout = await prisma.payout.findFirst({
      where: {
        idempotencyKey,
      },
    });

    if (existingPayout) {
      return existingPayout;
    }
  }

  if (amount <= 0) {
    throw new Error("Monto inválido");
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: sellerId },
  });

  if (!wallet) {
    throw new Error("Billetera no encontrada");
  }

  if (wallet.balance < amount) {
    throw new Error("Balance insuficiente");
  }

  const payout = await prisma.payout.create({
    data: {
      sellerId,
      amount,
      status: "PENDING",
      idempotencyKey,
    },
  });

  await createNotification(
    sellerId,
    "Retiro solicitado",
    `Tu solicitud de retiro por RD$${amount} fue creada`,
  );

  await createAuditLog({
    userId: sellerId,
    action: "PAYOUT_REQUEST",
    entity: "PAYOUT",
    entityId: payout.id,
    description: "Solicitud de retiro creada",
    metadata: { amount, idempotencyKey },
  });

  return payout;
};

export const approvePayout = async (payoutId: string, actorId?: string) => {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  });

  if (!payout) {
    throw new Error("Retiro no encontrado");
  }

  if (payout.status === "APPROVED") {
    return payout;
  }

  if (payout.status !== "PENDING") {
    throw new Error("Este retiro ya fue procesado");
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: payout.sellerId },
  });

  if (!wallet || wallet.balance < payout.amount) {
    throw new Error("Balance insuficiente");
  }

  await prisma.wallet.update({
    where: { userId: payout.sellerId },
    data: {
      balance: {
        decrement: payout.amount,
      },
    },
  });

  await createLedgerEntry({
    userId: payout.sellerId,
    type: "DEBIT",
    amount: payout.amount,
    reference: payout.id,
    description: "Retiro aprobado",
  });

  await createTransaction({
    userId: payout.sellerId,
    amount: payout.amount,
    type: "WITHDRAW",
    status: "SUCCESS",
    reference: payout.id,
    description: "Retiro aprobado",
  });

  await createNotification(
    payout.sellerId,
    "Retiro aprobado",
    `Tu retiro por RD$${payout.amount} fue aprobado`,
  );

  const updatedPayout = await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: "APPROVED",
    },
  });

  await createAuditLog({
    userId: actorId,
    action: "PAYOUT_APPROVE",
    entity: "PAYOUT",
    entityId: payout.id,
    description: "Retiro aprobado",
    metadata: { sellerId: payout.sellerId, amount: payout.amount },
  });

  return updatedPayout;
};

export const rejectPayout = async (
  payoutId: string,
  actorId?: string,
  reason = "Retiro rechazado",
) => {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  });

  if (!payout) {
    throw new Error("Retiro no encontrado");
  }

  if (payout.status === "REJECTED") {
    return payout;
  }

  if (payout.status !== "PENDING") {
    throw new Error("Este retiro ya fue procesado");
  }

  await createNotification(
    payout.sellerId,
    "Retiro rechazado",
    `Tu retiro por RD$${payout.amount} fue rechazado`,
  );

  const updatedPayout = await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: "REJECTED",
    },
  });

  await createAuditLog({
    userId: actorId,
    action: "PAYOUT_REJECT",
    entity: "PAYOUT",
    entityId: payout.id,
    description: reason,
    metadata: { sellerId: payout.sellerId, amount: payout.amount },
  });

  return updatedPayout;
};

export const getSellerPayouts = async (sellerId: string) => {
  return await prisma.payout.findMany({
    where: { sellerId },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPendingPayouts = async () => {
  return await prisma.payout.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      seller: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
