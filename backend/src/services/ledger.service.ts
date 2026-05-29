import prisma from "../config/prisma";

interface LedgerData {
  userId: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  reference: string;
  description: string;
}

export const createLedgerEntry = async ({
  userId,
  type,
  amount,
  reference,
  description,
}: LedgerData) => {
  return await prisma.ledgerEntry.create({
    data: {
      userId,
      type,
      amount,
      reference,
      description,
    },
  });
};
