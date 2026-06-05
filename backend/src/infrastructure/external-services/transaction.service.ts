import prisma from "../database/prisma";

interface TransactionData {
  userId: string;
  amount: number;
  type: "PAYMENT" | "REFUND" | "DEPOSIT";
  status: "PENDING" | "SUCCESS" | "FAILED";
  reference?: string;
  description?: string;
  idempotencyKey?: string;
}

export const createTransaction = async ({
  userId,
  amount,
  type,
  status,
  reference,
  description,
  idempotencyKey,
}: TransactionData) => {
  if (idempotencyKey) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingTransaction) {
      return existingTransaction;
    }
  }

  return await prisma.transaction.create({
    data: {
      userId,
      amount,
      type,
      status,
      reference,
      description,
      idempotencyKey,
    },
  });
};

export const getTransactionsByUser = async (userId: string) => {
  return await prisma.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};



