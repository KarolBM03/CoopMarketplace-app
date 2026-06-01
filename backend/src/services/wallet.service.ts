import prisma from "../config/prisma";
import { createAuditLog } from "./audit.service";
import { createLedgerEntry } from "./ledger.service";
import { createNotification } from "./notification.service";
import { createTransaction } from "./transaction.service";

export const rechargeWallet = async (
  userId: string,
  amount: number,
  idempotencyKey?: string,
) => {
  if (amount <= 0) {
    throw new Error("Monto invalido");
  }

  if (idempotencyKey) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingTransaction) {
      return await prisma.wallet.findUnique({ where: { userId } });
    }
  }

  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  await prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  await createLedgerEntry({
    userId,
    type: "CREDIT",
    amount,
    reference: wallet.id,
    description: "Recarga de billetera",
  });

  await createTransaction({
    userId,
    amount,
    type: "DEPOSIT",
    status: "SUCCESS",
    reference: wallet.id,
    description: "Recarga de billetera",
    idempotencyKey,
  });

  await createAuditLog({
    userId,
    action: "WALLET_RECHARGE",
    entity: "WALLET",
    entityId: wallet.id,
    description: `Recarga de billetera por RD$${amount}`,
    metadata: { amount, idempotencyKey },
  });

  await createNotification(
    userId,
    "Billetera recargada",
    `Recargaste RD$${amount} correctamente`,
  );

  return await prisma.wallet.findUnique({
    where: { userId },
  });
};

export const createWallet = async (userId: string) => {
  return await prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
};

export const creditWallet = async (
  userId: string,
  amount: number,
  reference = "WALLET_CREDIT",
  description = "Credito a billetera",
) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new Error("Billetera no encontrada");
  }

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  await createLedgerEntry({
    userId,
    type: "CREDIT",
    amount,
    reference,
    description,
  });

  await createAuditLog({
    userId,
    action: "WALLET_CREDIT",
    entity: "WALLET",
    entityId: wallet.id,
    description,
    metadata: { amount, reference },
  });

  return updatedWallet;
};

export const debitWallet = async (
  userId: string,
  amount: number,
  reference = "WALLET_DEBIT",
  description = "Debito de billetera",
) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new Error("Billetera no encontrada");
  }

  if (Number(wallet.balance) < amount) {
    throw new Error("Fondos insuficientes");
  }

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  await createLedgerEntry({
    userId,
    type: "DEBIT",
    amount,
    reference,
    description,
  });

  await createAuditLog({
    userId,
    action: "WALLET_DEBIT",
    entity: "WALLET",
    entityId: wallet.id,
    description,
    metadata: { amount, reference },
  });

  return updatedWallet;
};

export const freezeFunds = async (
  userId: string,
  amount: number,
  reference = "FUNDS_FREEZE",
) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new Error("Billetera no encontrada");
  }

  if (Number(wallet.balance) < amount) {
    throw new Error("Fondos insuficientes");
  }

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        decrement: amount,
      },
      frozenBalance: {
        increment: amount,
      },
    },
  });

  await createLedgerEntry({
    userId,
    type: "DEBIT",
    amount,
    reference,
    description: "Fondos congelados en escrow",
  });

  await createAuditLog({
    userId,
    action: "FUNDS_FREEZE",
    entity: "WALLET",
    entityId: wallet.id,
    description: "Fondos congelados en escrow",
    metadata: { amount, reference },
  });

  return updatedWallet;
};

export const releaseFunds = async (
  userId: string,
  amount: number,
  reference = "FUNDS_RELEASE",
) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new Error("Billetera no encontrada");
  }

  if (Number(wallet.frozenBalance) < amount) {
    throw new Error("Fondos congelados insuficientes");
  }

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      frozenBalance: {
        decrement: amount,
      },
      balance: {
        increment: amount,
      },
    },
  });

  await createLedgerEntry({
    userId,
    type: "CREDIT",
    amount,
    reference,
    description: "Fondos liberados desde escrow",
  });

  await createAuditLog({
    userId,
    action: "FUNDS_RELEASE",
    entity: "WALLET",
    entityId: wallet.id,
    description: "Fondos liberados desde escrow",
    metadata: { amount, reference },
  });

  return updatedWallet;
};

export const getWalletByUser = async (userId: string) => {
  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return wallet;
};
