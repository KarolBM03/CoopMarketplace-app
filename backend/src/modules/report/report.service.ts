import prisma from "../../config/prisma";

interface ReportFilters {
  startDate?: string;
  endDate?: string;
}

export const generateFinancialReport = async ({
  startDate,
  endDate,
}: ReportFilters) => {
  const dateFilter =
    startDate && endDate
      ? {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
      : {};

  const transactions = await prisma.transaction.findMany({
    where: dateFilter,
  });

  const payouts = await prisma.payout.findMany({
    where: dateFilter,
  });

  const financings = await prisma.financing.findMany({
    where: dateFilter,
  });

  const fraudAlerts = await prisma.fraudAlert.findMany({
    where: dateFilter,
  });

  const payments = transactions
    .filter((transaction) => transaction.type === "PAYMENT")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const deposits = transactions
    .filter((transaction) => transaction.type === "DEPOSIT")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const withdrawals = transactions
    .filter((transaction) => transaction.type === "WITHDRAW")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const approvedPayouts = payouts
    .filter((payout) => payout.status === "APPROVED")
    .reduce((sum, payout) => sum + payout.amount, 0);

  const financingTotal = financings.reduce(
    (sum, financing) => sum + financing.totalAmount,
    0,
  );

  return {
    period: {
      startDate: startDate || "ALL",
      endDate: endDate || "ALL",
    },

    totals: {
      payments,
      deposits,
      withdrawals,
      approvedPayouts,
      financingTotal,
    },

    counts: {
      transactions: transactions.length,
      payouts: payouts.length,
      financings: financings.length,
      fraudAlerts: fraudAlerts.length,
    },
  };
};
