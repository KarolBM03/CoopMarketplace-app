import { OrderStatus } from "@prisma/client";
import prisma from "../database/prisma";

interface ReportFilters {
  startDate?: string;
  endDate?: string;
}

const buildCreatedAtFilter = ({ startDate, endDate }: ReportFilters) => {
  if (!startDate && !endDate) return {};

  return {
    ...(startDate ? { gte: new Date(startDate) } : {}),
    ...(endDate ? { lte: new Date(endDate) } : {}),
  };
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const generateFinancialReport = async ({
  startDate,
  endDate,
}: ReportFilters) => {
  const createdAtFilter = buildCreatedAtFilter({ startDate, endDate });
  const dateFilter = Object.keys(createdAtFilter).length
    ? { createdAt: createdAtFilter }
    : {};
  const completedOrderStatuses: OrderStatus[] = [
    OrderStatus.COMPLETED,
    OrderStatus.DELIVERED,
  ];

  const [
    transactions,
    financings,
    fraudAlerts,
    completedOrders,
    productsSold,
    users,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: dateFilter,
    }),
    prisma.financing.findMany({
      where: dateFilter,
    }),
    prisma.fraudAlert.findMany({
      where: dateFilter,
    }),
    prisma.order.count({
      where: {
        ...dateFilter,
        status: {
          in: completedOrderStatuses,
        },
      },
    }),
    prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          ...dateFilter,
          status: {
            in: completedOrderStatuses,
          },
        },
      },
    }),
    prisma.user.count({
      where: dateFilter,
    }),
  ]);

  const payments = transactions
    .filter((transaction) => transaction.type === "PAYMENT")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const deposits = transactions
    .filter((transaction) => transaction.type === "DEPOSIT")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const financingTotal = financings.reduce(
    (sum, financing) => sum + Number(financing.totalAmount),
    0,
  );

  return {
    period: {
      startDate: startDate || "ALL",
      endDate: endDate || "ALL",
    },

    totals: {
      payments: roundMoney(payments),
      deposits: roundMoney(deposits),
      financingTotal: roundMoney(financingTotal),
    },

    counts: {
      transactions: transactions.length,
      financings: financings.length,
      fraudAlerts: fraudAlerts.length,
      completedOrders,
      productsSold: productsSold._sum?.quantity || 0,
      users,
    },
  };
};



