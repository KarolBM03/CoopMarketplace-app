import prisma from "../database/prisma";

export const detectFraud = async (userId: string, amount: number) => {
  // ALERTA MONTO ALTO

  if (amount >= 100000) {
    await prisma.fraudAlert.create({
      data: {
        userId,
        reason: `Pago sospechoso de RD$${amount}`,
        riskLevel: "HIGH",
      },
    });
  }

  // MUCHAS TRANSACCIONES

  const recentTransactions = await prisma.transaction.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60 * 5),
      },
    },
  });

  if (recentTransactions >= 5) {
    await prisma.fraudAlert.create({
      data: {
        userId,
        reason: "Demasiadas transacciones recientes",
        riskLevel: "MEDIUM",
      },
    });
  }
};



