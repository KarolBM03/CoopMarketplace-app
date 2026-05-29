import prisma from "../../config/prisma";
import { createNotification } from "../../services/notification.service";
import { createTransaction } from "../../services/transaction.service";
import { createLedgerEntry } from "../../services/ledger.service";
import { createAuditLog } from "../../services/audit.service";

export const payInstallment = async (
  installmentId: string,
  actorId?: string,
  idempotencyKey?: string,
) => {
  const installment = await prisma.installment.findUnique({
    where: {
      id: installmentId,
    },
  });

  if (!installment) {
    throw new Error("Cuota no encontrada");
  }

  if (installment.paid) {
    throw new Error("Esta cuota ya fue pagada");
  }

  const financing = await prisma.financing.findUnique({
    where: {
      id: installment.financingId,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (actorId && actorId !== financing.customerId) {
    const actor = await prisma.user.findUnique({ where: { id: actorId } });
    if (actor?.role !== "ADMIN") {
      throw new Error("No puedes pagar esta cuota");
    }
  }

  if (idempotencyKey) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingTransaction) {
      return installment;
    }
  }

  const customerWallet = await prisma.wallet.findUnique({
    where: {
      userId: financing.customerId,
    },
  });

  if (!customerWallet) {
    throw new Error("Billetera del cliente no encontrada");
  }

  if (customerWallet.balance < installment.amount) {
    throw new Error("Balance insuficiente");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: financing.productId,
    },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  const sellerId = product.sellerId;

  let sellerWallet = await prisma.wallet.findUnique({
    where: {
      userId: sellerId,
    },
  });

  if (!sellerWallet) {
    sellerWallet = await prisma.wallet.create({
      data: {
        userId: sellerId,
      },
    });
  }

  await prisma.wallet.update({
    where: {
      userId: financing.customerId,
    },
    data: {
      balance: {
        decrement: installment.amount,
      },
    },
  });

  await prisma.wallet.update({
    where: {
      userId: sellerId,
    },
    data: {
      balance: {
        increment: installment.amount,
      },
    },
  });

  const updatedInstallment = await prisma.installment.update({
    where: {
      id: installmentId,
    },
    data: {
      paid: true,
      paidAt: new Date(),
      status: "PAID",
    },
  });

  const newRemainingDebt = financing.remainingDebt - installment.amount;

  await prisma.financing.update({
    where: {
      id: financing.id,
    },
    data: {
      remainingDebt: newRemainingDebt,
    },
  });

  await createLedgerEntry({
    userId: financing.customerId,
    type: "DEBIT",
    amount: installment.amount,
    reference: installment.id,
    description: "Pago de cuota financiada",
  });

  await createTransaction({
    userId: financing.customerId,
    amount: installment.amount,
    type: "PAYMENT",
    status: "SUCCESS",
    reference: installment.id,
    description: `Pago cuota #${installment.number}`,
    idempotencyKey,
  });

  await createLedgerEntry({
    userId: sellerId,
    type: "CREDIT",
    amount: installment.amount,
    reference: installment.id,
    description: "Pago recibido por cuota financiada",
  });

  await createTransaction({
    userId: sellerId,
    amount: installment.amount,
    type: "DEPOSIT",
    status: "SUCCESS",
    reference: installment.id,
    description: "Ingreso por Venta",
  });

  await createNotification(
    financing.customerId,
    "Pago recibido",
    `Tu pago de la cuota #${installment.number} por RD$${installment.amount} fue procesado correctamente`,
  );

  await createAuditLog({
    userId: actorId || financing.customerId,
    action: "INSTALLMENT_PAYMENT",
    entity: "INSTALLMENT",
    entityId: installment.id,
    description: `Pago cuota #${installment.number}`,
    metadata: {
      amount: installment.amount,
      financingId: financing.id,
      idempotencyKey,
    },
  });

  await createNotification(
    sellerId,
    "Pago de cuota recibido",
    `Recibiste RD$${installment.amount} por la cuota #${installment.number}`,
  );

  const pendingInstallments = await prisma.installment.count({
    where: {
      financingId: installment.financingId,
      paid: false,
    },
  });

  if (pendingInstallments === 0) {
    await prisma.financing.update({
      where: {
        id: installment.financingId,
      },
      data: {
        status: "COMPLETED",
        remainingDebt: 0,
      },
    });

    await createNotification(
      financing.customerId,
      "Financiamiento completado",
      "Has terminado de pagar tu financiamiento",
    );
  }

  return updatedInstallment;
};
