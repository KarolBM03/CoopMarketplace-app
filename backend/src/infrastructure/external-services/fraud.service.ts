import prisma from "../database/prisma";

const createFraudAlertIfNotExists = async (data: {
  userId: string;
  reason: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}) => {
  const exists = await prisma.fraudAlert.findFirst({
    where: {
      userId: data.userId,
      reason: data.reason,
      resolved: false,
    },
  });

  if (exists) return;

  await prisma.fraudAlert.create({
    data,
  });
};

export const detectFraud = async (userId: string, amount: number) => {
  if (amount >= 100000) {
    await createFraudAlertIfNotExists({
      userId,
      reason: `Pago sospechoso de RD$${amount}`,
      riskLevel: "HIGH",
    });
  }

  const recentTransactions = await prisma.transaction.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60 * 5),
      },
    },
  });

  if (recentTransactions >= 5) {
    await createFraudAlertIfNotExists({
      userId,
      reason: "Demasiadas transacciones recientes",
      riskLevel: "MEDIUM",
    });
  }
};

export const analyzeFinancingRisk = async (userId: string, amount: number) => {
  const activeFinancings = await prisma.financing.count({
    where: {
      customerId: userId,
      status: "ACTIVE",
    },
  });

  if (activeFinancings >= 3) {
    await createFraudAlertIfNotExists({
      userId,
      reason: "Usuario tiene varios financiamientos activos",
      riskLevel: "HIGH",
    });
  }

  const lateFinancings = await prisma.financing.count({
    where: {
      customerId: userId,
      status: "LATE",
    },
  });

  if (lateFinancings >= 2) {
    await createFraudAlertIfNotExists({
      userId,
      reason: "Usuario tiene financiamientos en mora",
      riskLevel: "HIGH",
    });
  }

  if (amount >= 500000) {
    await createFraudAlertIfNotExists({
      userId,
      reason: "Solicitud de financiamiento con monto muy alto",
      riskLevel: "MEDIUM",
    });
  }
};
